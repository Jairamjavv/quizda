import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { logger } from "../logger.js";
dotenv.config();

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
    }
  }
}

function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.warn("Authentication failed: no token provided", {
      path: req.path,
      method: req.method,
    });
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) {
      logger.warn("Authentication failed: invalid token", {
        path: req.path,
        method: req.method,
        error: err.message,
      });
      return res.sendStatus(403);
    }

    logger.debug("Token verified successfully", {
      userId: (user as any)?.id,
      role: (user as any)?.role,
    });

    req.user = user;
    next();
  });
}

export default authenticateToken;
