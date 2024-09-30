// src/types/express/index.d.ts
import 'express';
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: jwt.JwtPayload;
      session?: {
        token?: string;
      };
    }
  }
}
