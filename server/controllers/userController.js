import httpStatusText from '../utils/httpStatusText.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';
import User from '../models/userModel.js';
import appError from '../utils/appError.js';

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

const updateUser = (req, res) => {
  res.status(500).json({
    status: httpStatusText.ERROR,
    data: {
      message: 'Not Created Yet 🫸',
    },
  });
};
const deleteUser = asyncWrapper(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    const error = appError.create(404, httpStatusText.FAIL, 'No user found');
    return next(error);
  }
  res.status(204).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});
export default { getAllUsers, getUser, updateUser, deleteUser };
