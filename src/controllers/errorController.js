const AppError = require('../utils/appError');

const ENV = process.env.NODE_ENV ?? 'development'

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  //Programming or other unknown error: dont leak error details
  else {
    //Log the error
    console.error('Error!', err);

    //Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500; //internal server error
  err.status = err.status || 'error';

  if (ENV === 'development') {
    sendErrorDev(err, res);
  } else if (ENV === 'production') {
    sendErrorProd(err, res);
  }
};