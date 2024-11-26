import asyncWrapper from '../middlewares/asyncWrapper.js';
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import appError from '../utils/appError.js';
import httpStatusText from '../utils/httpStatusText.js';

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signUp = asyncWrapper(async (req, res, next) => {
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    phoneNumber: req.body.phoneNumber,
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

export default { signUp, login };
