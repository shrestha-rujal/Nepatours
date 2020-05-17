/* eslint-disable */
const AppError = require('../utils/AppError');

const CAST_ERROR = 'CastError';
const VALIDATION_ERROR = 'ValidationError';
const DUPLICATE_ERROR_CODE = 11000;

const handleCastErrorDB = (error) => {
  return new AppError(`Invalid input for ${error.path}: ${error.value}`, 400);
};

const handleDuplicateFieldErrorDB = (error) => {
  console.log
  return new AppError(`Duplicate ${Object.keys(error.keyValue)[0]}: ${error.keyValue.name}`,400);
};

const handleValdationErrorsDB = (error) => {
  const formattedErrors = Object.values(error.errors).map(err => err.message).join(' ');
  return new AppError(formattedErrors, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') sendErrorDev(err, res);
  else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (error.name === CAST_ERROR) error = handleCastErrorDB(error);
    if (error.code === DUPLICATE_ERROR_CODE) error = handleDuplicateFieldErrorDB(error);
    if (error.name === VALIDATION_ERROR) error = handleValdationErrorsDB(error);
    sendErrorProd(error, res);
  }
};