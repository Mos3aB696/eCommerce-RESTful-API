import httpStatusText from '../utils/httpStatusText.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import User from '../models/userModel.js';
import appError from '../utils/appError.js';

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

const getAllUsers = asyncWrapper(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    length: users.length,
    data: {
      users,
    },
  });
});

const getUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    const error = appError.create(404, httpStatusText.FAIL, 'No user found');
    return next(error);
  }
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user,
    },
  });
});

const updateUser = asyncWrapper(async (req, res, next) => {
  // 1) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(
    req.body,
    'firstName',
    'lastName',
    'userName',
    'email',
    'phoneNumber'
  );
  // 2) Update user document
  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      user,
    },
  });
});
const deleteUser = asyncWrapper(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(204).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});
export default { getAllUsers, getUser, updateUser, deleteUser };
