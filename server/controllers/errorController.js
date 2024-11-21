import httpStatusText from '../utils/httpStatusText.js';
import AppError from '../utils/appError.js';

const genralError = (err, req, res, next) => {
  res.status(err.statusCode || 400).json({
    status: err.statusMsg,
    data: null,
    message: err.message,
    code: err.statusCode,
  });
};

const notFoundPage = (req, res, next) => {
  const error = AppError.create(
    404,
    httpStatusText.NOTFOUND,
    `Can't find ${req.originalUrl} on this server!`
  );
  return next(error);
};

export default {
  genralError,
  notFoundPage,
};
