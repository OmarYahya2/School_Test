import { Request, Response, NextFunction } from "express";
import { RequestWithUser } from "../types/express.types";
import { generateQRToken, verifyQRToken } from "../utils/qr-token.utils";
import { sendSuccess, sendError } from "../utils/response.utils";

const VALID_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export class QRController {
  static async generate(req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const gradeId = parseInt(req.body.gradeId as string, 10);

      if (isNaN(gradeId) || !VALID_GRADES.includes(gradeId)) {
        return sendError(res, "Invalid gradeId. Must be an integer between 1 and 9.", 400);
      }

      const token = generateQRToken(gradeId);

      return sendSuccess(
        res,
        { token, gradeId },
        "QR token generated successfully"
      );
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string" || token.trim() === "") {
        return sendError(res, "Token query parameter is required.", 400);
      }

      const payload = verifyQRToken(token.trim());

      if (!payload) {
        return sendError(res, "Invalid or expired QR token.", 401);
      }

      return sendSuccess(
        res,
        { gradeId: payload.gradeId },
        "Token verified successfully"
      );
    } catch (error) {
      next(error);
    }
  }
}
