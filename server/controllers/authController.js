import asyncWrapper from '../middlewares/asyncWrapper.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import appError from '../utils/appError.js';
import httpStatusText from '../utils/httpStatusText.js';
import { promisify } from 'util';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';
import createToken from '../utils/createToken.js';

/**
 * Generates a JWT for a user, sets it as an HTTP-only cookie, and sends it in the response.
 * @param {Object} user - The user object for whom the token is generated.
 * @param {number} statusCode - The HTTP status code for the response.
 * @param {Object} res - The Express.js response object.
 * @param {boolean} [signUp=false] - Indicates if the function is being used after a successful signup to include a specific message.
 */
const createSendToken = (user, statusCode, res, signUp = null) => {
  const token = createToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000 // 30 days
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax', // Protect against CSRF
  };

  res.cookie('jwt', token, cookieOptions);

  if (signUp) {
    res.status(statusCode).json({
      status: 'success',
      message:
        'Your account has been successfully created. Please check your email and verify your email address.',
      token,
      data: {
        user,
      },
    });
  } else {
    res.status(statusCode).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  }
};

/**
 * Registers a new user, generates an email verification token, and sends it to the user's email.
 * @param {Object} req - The Express.js request object containing user details in the body.
 * @param {Object} res - The Express.js response object.
 * @param {Function} next - The Express.js next middleware function for error handling.
 */

const signUp = asyncWrapper(async (req, res, next) => {
  //? 1) Create a new user and send token to confirm email
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    phoneNumber: req.body.phoneNumber,
  });
  const confirmeToken = newUser.resetAndConfirmTokene('emailVerification');
  await newUser.save({ validateBeforeSave: false });

  //? 2) Send the token to the user's email
  const verificationURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/verifyEmail/${confirmeToken}`;
  const message = `Please verify your email address by clicking the link below: ${verificationURL}`;

  try {
    await sendEmail({
      email: newUser.email,
      subject: 'Email verification token (valid for 10 min)',
      message,
    });
    createSendToken(newUser, 201, res, true);
  } catch (err) {
    newUser.emailVerificationToken = undefined;
    newUser.emailVerificationExpires = undefined;
    await newUser.save({ validateBeforeSave: false });
    const error = appError.create(500, httpStatusText.ERROR, err.message);
    return next(error);
  }
});

/**
 * Generates a new email verification token for a user whose email is not yet verified and sends it to the user's email.
 * @param {Object} req - The Express.js request object containing the user's email in `req.user`.
 * @param {Object} res - The Express.js response object.
 * @param {Function} next - The Express.js next middleware function for error handling.
 */

const regenerateEmailToken = asyncWrapper(async (req, res, next) => {
  const user = await User.findOne({
    email: req.user.email,
    emailVerified: false,
  });
  const confirmeToken = user.resetAndConfirmTokene('emailVerification');
  await user.save({ validateBeforeSave: false });
  const verificationURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/verifyEmail/${confirmeToken}`;
  const message = `Please verify your email address by clicking the link below: ${verificationURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Email verification token (valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: httpStatusText.SUCCESS,
      message: 'Token sent to email!',
    });
  } catch (err) {
    const error = appError.create(500, httpStatusText.ERROR, err.message);
    return next(error);
  }
});

/**
 * Verifies a user's email using the token sent to their email address.
 * @param {Object} req - The Express.js request object containing the token in the URL parameters.
 * @param {Object} res - The Express.js response object.
 * @param {Function} next - The Express.js next middleware function for error handling.
 */

const verifyEmail = asyncWrapper(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    const error = appError.create(
      400,
      httpStatusText.FAIL,
      'Token is invalid or has expired..!'
    );
    return next(error);
  }

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res);
});

/**
 * Logs in a user by validating their email and password, and sends a JWT in the response.
 * @param {Object} req - The Express.js request object containing email and password in the body.
 * @param {Object} res - The Express.js response object.
 * @param {Function} next - The Express.js next middleware function for error handling.
 */

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
  createSendToken(user, 200, res);
});

/**
 * Middleware to protect routes by verifying the user's JWT and ensuring their account is valid.
 * @param {Object} req - The Express.js request object containing the token in headers.
 * @param {Object} res - The Express.js response object.
 * @param {Function} next - The Express.js next middleware function to grant access to the protected route.
 */

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

  //? Check if email is verified
  // if (!currentUser.emailVerified) {
  //   const error = appError.create(
  //     401,
  //     httpStatusText.FAIL,
  //     'Please verify your email first 😒'
  //   );
  //   return next(error);
  // }

  //? Grant access to protected route
  req.user = currentUser;
  next();
});

/**
 * Middleware to restrict access to specific routes based on the user's role.
 * @param {...string} roles - The roles that are allowed to access the route.
 * @returns {Function} - Middleware function that checks the user's role and grants or denies access.
 */

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

/**
 * Generates a password reset token for a user and sends it to their email.
 * @param {Object} req - The Express.js request object containing the user's email in the body.
 * @param {Object} res - The Express.js response object.
 * @param {Function} next - The Express.js next middleware function for error handling.
 */

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
  const resetToken = user.resetAndConfirmTokene('passwordReset');
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

/**
 * Resets a user's password using the token sent to their email.
 * @param {Object} req - The Express.js request object containing the token in the URL parameters and the new password in the body.
 * @param {Object} res - The Express.js response object.
 * @param {Function} next - The Express.js next middleware function for error handling.
 */

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
  createSendToken(user, 200, res);
});

/**
 * Allows an authenticated user to update their password after verifying the current password.
 * @param {Object} req - The Express.js request object containing the current and new passwords in the body.
 * @param {Object} res - The Express.js response object.
 * @param {Function} next - The Express.js next middleware function for error handling.
 */

const updatePassword = asyncWrapper(async (req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword) {
    const error = appError.create(
      400,
      httpStatusText.FAIL,
      'Please provide the current password'
    );
    return next(error);
  }
  if (!(await user.correctPassword(currentPassword, user.password))) {
    const error = appError.create(
      401,
      httpStatusText.FAIL,
      'Your current password is wrong 💥'
    );
    return next(error);
  }
  // 3) If so, update password => after confirming the new password
  user.password = newPassword;
  user.confirmPassword = confirmPassword;
  await user.save();
  // ! User.findByIdAndUpdate will NOT work, BECAUSE the pre save middleware will not work, and the password not CONFIRMED 🤓

  // 4) Log user in, send JWT
  createSendToken(user, 200, res);
});

export default {
  signUp,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyEmail,
  regenerateEmailToken,
};
