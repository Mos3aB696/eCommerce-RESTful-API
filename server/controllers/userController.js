import httpStatusText from '../utils/httpStatusText.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import User from '../models/userModel.js';

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
const getUser = (req, res) => {
  res.status(500).json({
    status: httpStatusText.ERROR,
    data: {
      message: 'Not Created Yet 🫸',
    },
  });
};
const createUser = asyncWrapper((req, res, next) => {});
const updateUser = (req, res) => {
  res.status(500).json({
    status: httpStatusText.ERROR,
    data: {
      message: 'Not Created Yet 🫸',
    },
  });
};
const deleteUser = (req, res) => {
  res.status(500).json({
    status: httpStatusText.ERROR,
    data: {
      message: 'Not Created Yet 🫸',
    },
  });
};
export default { getAllUsers, getUser, createUser, updateUser, deleteUser };
