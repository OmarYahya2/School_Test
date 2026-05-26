export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export function getPaginationParams(query: any): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(query.limit || "20", 10)));
  const skip = (page - 1) * limit;
  const take = limit;
  return { skip, take, page, limit };
}
