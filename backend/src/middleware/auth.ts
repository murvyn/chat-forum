import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const auth =
  (roles: string[] = []) =>
  (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).send("Access denied. No token provided");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWTPrivateKey!
      ) as jwt.JwtPayload;
      req.user = decoded;

      if (roles.length && !roles.includes(req.user?.role)) {
        return res
          .status(403)
          .send("Access denied. You do not have the required permissions");
      }
      next();
    } catch (ex) {
      res.status(400).send("Invalid token");
    }
  };
