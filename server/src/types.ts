import { Request } from 'express';

export interface User {
  id: string;
  name: string;
  email: string;
  is_active: boolean;
  is_whitelisted: boolean;
  created_at: string;
  created_by: 'self' | 'admin';
}

export interface ActSubmission {
  id: string;
  user_id: string;
  session_id: string;
  submitted_at: string;
  input_type: 'text' | 'image';
}

export interface AppConfig {
  key: string;
  value: Record<string, unknown>;
}

export interface RateLimitConfig {
  max_submissions: number;
  window_hours: number;
}

export interface AdminUser {
  id: string;
  auth_user_id: string;
  email: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface AdminRequest extends Request {
  adminUser?: AdminUser;
}
