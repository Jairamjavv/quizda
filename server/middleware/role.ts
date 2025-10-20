import { Request, Response, NextFunction } from "express";

function requireRole(role: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    // req.user may be string or JwtPayload
    if (
      !req.user ||
      typeof req.user !== "object" ||
      (req.user as any).role !== role
    ) {
      return res.sendStatus(403);
    }
    next();
  };
}

export default requireRole;
