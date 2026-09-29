import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred. Please try again.';

  if (env.NODE_ENV !== 'production' && statusCode === 500) {
    console.error('Unhandled Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && env.NODE_ENV === 'production' 
      ? 'An unexpected internal server error occurred.' 
      : message,
    code
  });
};
