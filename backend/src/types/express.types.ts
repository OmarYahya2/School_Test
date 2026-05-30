import { Request } from "express";

export interface TokenUser {
  id: string;
  email: string;
  role: string;
  name: string;
  teacherId?: string;
}

export interface RequestWithUser extends Request {
  user?: TokenUser;
  teacher?: {
    id: string;
    name: string;
    email: string | null;
    isActive: boolean;
    assignedSubjects: string[];
  };
}
