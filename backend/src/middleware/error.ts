import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { logger } from "../startup/logger";

export const error = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(`${err.message} - ${req.method} ${req.url}`);
  logger.error(err.stack);

  res.status(500).json({
    message: "Something failed on the server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
