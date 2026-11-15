import type { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
  email: string;
  createdAt: Date;
}

export type AuthenticatedRequest = Request & {
  user: AuthenticatedUser;
};