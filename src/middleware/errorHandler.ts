import { NextFunction, Request, Response } from 'express';

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
}

// Express identifies an error handler by its four arguments, so `next` must
// stay in the signature even though it is unused.
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const status = err instanceof HttpError ? err.status : 500;
  const message = status === 500 ? 'Internal Server Error' : err.message;

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}
