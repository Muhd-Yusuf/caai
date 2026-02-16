import { Response, NextFunction } from 'express';
import { supabase } from '../services/supabase';
import { AdminRequest } from '../types';

export async function authenticateAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = req.cookies?.caai_admin_token;

  if (!token) {
    res.status(401).json({ error: 'Admin authentication required' });
    return;
  }

  try {
    // Verify the Supabase session
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ error: 'Invalid admin session' });
      return;
    }

    // Verify user is in admin_users table
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (adminError || !adminUser) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }

    req.adminUser = adminUser;
    next();
  } catch {
    res.status(401).json({ error: 'Admin authentication failed' });
  }
}
