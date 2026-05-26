import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess } from "../utils/response.utils";
import { RequestWithUser } from "../types/express.types";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendSuccess(res, result, "User registered successfully", 201);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body);
      return sendSuccess(res, result, "Logged in successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  static async me(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }
      const user = await AuthService.getUserById(req.user.id);
      return sendSuccess(res, user, "User profile retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refresh(refreshToken);
      return sendSuccess(res, result, "Token refreshed successfully", 200);
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      return sendSuccess(res, null, "Logged out successfully", 200);
    } catch (error) {
      next(error);
    }
  }
}
