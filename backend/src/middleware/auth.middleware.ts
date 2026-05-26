import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { verifyToken } from "../utils/jwt.utils";
import { sendError } from "../utils/response.utils";

export function authenticate(req: RequestWithUser, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(res, "Access denied. No token provided.", 401);
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return sendError(res, "Invalid or expired token.", 401);
  }

  req.user = decoded;
  next();
}

export function authorize(roles: string[]) {
  return (req: RequestWithUser, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "Authentication required.", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, "Access denied. Insufficient permissions.", 403);
    }

    next();
  };
}
