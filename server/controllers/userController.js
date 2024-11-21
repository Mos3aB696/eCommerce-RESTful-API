import httpStatusText from '../utils/httpStatusText.js';

const getAllUsers = (req, res) => {
  res.status(500).json({
    status: httpStatusText.ERROR,
    data: {
      message: 'Not Created Yet 🫸',
    },
  });
};
const getUser = (req, res) => {
  res.status(500).json({
    status: httpStatusText.ERROR,
    data: {
      message: 'Not Created Yet 🫸',
    },
  });
};
const createUser = (req, res) => {
  res.status(500).json({
    status: httpStatusText.ERROR,
    data: {
      message: 'Not Created Yet 🫸',
    },
  });
};
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
export { getAllUsers, getUser, createUser, updateUser, deleteUser };
