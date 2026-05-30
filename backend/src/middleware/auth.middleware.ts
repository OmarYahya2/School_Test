import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { verifyToken } from "../utils/jwt.utils";
import { sendError } from "../utils/response.utils";
import { prisma } from "../lib/prisma";

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

/** Alias for admin-only routes */
export function requireAdmin(req: RequestWithUser, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, "Authentication required.", 401);
  }
  if (req.user.role !== "admin") {
    return sendError(res, "Access denied. Admin only.", 403);
  }
  next();
}

/** Alias for teacher-only routes */
export function requireTeacher(req: RequestWithUser, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, "Authentication required.", 401);
  }
  if (req.user.role !== "teacher") {
    return sendError(res, "Access denied. Teacher only.", 403);
  }
  next();
}

/** Injects teacher profile into req.teacher for teacher users. Must run after authenticate. */
export async function injectTeacher(req: RequestWithUser, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, "Authentication required.", 401);
    }

    if (req.user.role === "teacher" && req.user.teacherId) {
      const teacher = await prisma.teacher.findUnique({
        where: { id: req.user.teacherId },
        select: { id: true, name: true, email: true, isActive: true, assignedSubjects: true },
      });

      if (!teacher) {
        return sendError(res, "Teacher profile not found.", 403);
      }

      if (!teacher.isActive) {
        return sendError(res, "Account deactivated. Contact your administrator.", 403);
      }

      req.teacher = teacher;
    }

    next();
  } catch (error) {
    next(error);
  }
}

/** Ensures the user is either an admin OR an active teacher with a linked profile */
export function requireAdminOrActiveTeacher(req: RequestWithUser, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, "Authentication required.", 401);
  }

  if (req.user.role === "admin") {
    return next();
  }

  if (req.user.role === "teacher") {
    if (!req.teacher) {
      return sendError(res, "Teacher profile not found.", 403);
    }
    if (!req.teacher.isActive) {
      return sendError(res, "Account deactivated. Contact your administrator.", 403);
    }
    return next();
  }

  return sendError(res, "Access denied. Insufficient permissions.", 403);
}
