import asyncWrapper from '../middlewares/asyncWrapper.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import appError from '../utils/appError.js';
import httpStatusText from '../utils/httpStatusText.js';
import { promisify } from 'util';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';
import createToken from '../utils/createToken.js';

const signUp = asyncWrapper(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    phoneNumber: req.body.phoneNumber,
    changedPasswordAt: req.body.changedPasswordAt,
  });

  const token = createToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

const login = asyncWrapper(async (req, res, next) => {
  const { email, password } = req.body;
  // 1) Check if email and password exist
  if (!email || !password) {
    const error = appError.create(
      400,
      httpStatusText.FAIL,
      'Please provide email and password'
    );
    return next(error);
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    const error = appError.create(
      401,
      httpStatusText.FAIL,
      'Incorrect email or password'
    );
    return next(error);
  }
  // 3) If everything is ok, send token to client
  const token = createToken(user._id);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    token,
  });
});

const protect = asyncWrapper(async (req, res, next) => {
  //? 1) Getting token and check if it's there

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    const error = appError.create(
      401,
      httpStatusText.FAIL,
      'Login to get access..🤓'
    );
    return next(error);
  }
  //? 2) Verification token

  // * Use promisify to convert callback function to promise 🤓
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //? 3) Check if user still exists in the database => if the user is deleted after the token was issued 🤓

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    const error = appError.create(
      401,
      httpStatusText.FAIL,
      'User does not exist'
    );
    return next(error);
  }

  //? 4) Check if user changed password after the token was issued

  if (currentUser.isChanged(decoded.iat)) {
    const error = appError.create(
      401,
      'User recently changed password! Please login again',
      httpStatusText.FAIL
    );
    return next(error);
  }

  //? Grant access to protected route
  req.user = currentUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      const error = appError.create(
        403,
        httpStatusText.FORBIDDEN,
        httpStatusText.NOTALLOWED
      );
      return next(error);
    }
    next();
  };
};

const forgotPassword = asyncWrapper(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const error = appError.create(
      404,
      httpStatusText.NOTFOUND,
      'There is no user with email address'
    );
    return next(error);
  }
  // 2) Generate the random reset token
  const resetToken = user.resetPasswordToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Reset it here: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const error = appError.create(500, httpStatusText.ERROR, err.message);
    return next(error);
  }
});
const resetPassword = asyncWrapper(async (req, res, next) => {
  // 1) Get user based on the token
  //? Hashing the token to compare it with the hashed one on the database
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    const error = appError.create(
      400,
      httpStatusText.FAIL,
      'Token is invalid or has expired..!'
    );
    return next(error);
  }
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3) Update changedPasswordAt property for the user

  // 4) Log the user in, send JWT
  const token = createToken(user._id);
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    token,
  });
});

export default {
  signUp,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
};
