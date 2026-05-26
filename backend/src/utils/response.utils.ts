import { Response } from "express";

export function sendSuccess(res: Response, data: any, message = "Success", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export interface PaginationMetadata {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function sendPaginatedSuccess(
  res: Response,
  data: any,
  meta: PaginationMetadata,
  message = "Success",
  status = 200
) {
  res.set("X-Total-Count", String(meta.total));
  res.set("X-Page", String(meta.page));
  res.set("X-Limit", String(meta.limit));
  res.set("X-Total-Pages", String(meta.totalPages));
  res.set("Access-Control-Expose-Headers", "X-Total-Count, X-Page, X-Limit, X-Total-Pages");

  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function sendError(res: Response, message = "Internal Server Error", status = 500, errors?: any) {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
}
