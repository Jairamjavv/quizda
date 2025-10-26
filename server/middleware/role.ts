import { Request, Response, NextFunction } from "express";

function requireRole(role: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    if (!req.authenticatedUser || req.authenticatedUser.role !== role) {
      return res.sendStatus(403);
    }
    next();
  };
}

export default requireRole;
