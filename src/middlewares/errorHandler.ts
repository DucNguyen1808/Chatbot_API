import { ErrorRequestHandler } from 'express';
import z from 'zod';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof z.ZodError) {
    const errors = err.errors.map((err) => {
      return { message: err.message, path: err.path };
    });
    res.status(422).json({
      status_code: 422,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
    return;
  }

  if (err)
    res.status(err.status || 500).json({
      status_code: err.status || 500,
      message: err.message || 'Internal Server Error'
    });
};
export default errorHandler;
