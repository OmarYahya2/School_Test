import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { sendError } from "../utils/response.utils";

export function validate(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, "Validation failed.", 400, errors.array());
  }
  next();
}
