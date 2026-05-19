import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { supabase, supabaseAuth } from '../services/supabase';
import { authenticateUser } from '../middleware/auth';
import { authenticateAdmin } from '../middleware/adminAuth';
import { AuthenticatedRequest, AdminRequest } from '../types';

const router = Router();

// POST /api/auth/register — Register user (name + email), set JWT cookie.
// Doubles as login for existing users: if the email already exists and the
// account is active, the JWT cookie is re-issued so the user can use the tool
// on the new device. Lookups are case-insensitive and whitespace-trimmed so
// records created via admin or different casing still resolve correctly.
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, mode } = req.body;
    const isLogin = mode === 'login';

    // Name is only required when creating a new account; sign-in mode resolves
    // the user by email alone.
    if (!email || (!isLogin && !name)) {
      res.status(400).json({ error: isLogin ? 'Email is required' : 'Name and email are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = String(email).trim().toLowerCase();
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Case-insensitive lookup so a record stored with different casing still
    // resolves (defensive against direct DB edits or admin tooling).
    const { data: existing, error: lookupError } = await supabase
      .from('users')
      .select('id, name, email, is_active')
      .ilike('email', normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      console.error('Existing user lookup error:', lookupError);
    }

    if (existing) {
      if (!existing.is_active) {
        res.status(403).json({ error: 'This account has been suspended. Please contact CAAI support.' });
        return;
      }

      // User exists and is active — sign them in
      const token = jwt.sign(
        { userId: existing.id, email: existing.email },
        config.jwtSecret,
        { expiresIn: '30d' }
      );

      res.cookie('caai_token', token, {
        httpOnly: true,
        secure: config.nodeEnv === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      console.log(`Existing user signed in: ${existing.email}`);
      res.json({
        user: { id: existing.id, name: existing.name, email: existing.email },
        isReturning: true,
      });
      return;
    }

    // Sign-in mode but no matching account — direct the user to register
    // rather than silently creating an account they didn't ask for.
    if (isLogin) {
      res.status(404).json({ error: 'No account found for this email. Please register first.' });
      return;
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name: String(name).trim(),
        email: normalizedEmail,
        created_by: 'self',
      })
      .select('id, name, email')
      .single();

    if (error) {
      console.error('User creation error:', error);
      // 23505 = unique violation: the email exists but our lookup missed it
      // (race or unexpected casing). Surface a clearer message rather than 500.
      if ((error as { code?: string }).code === '23505') {
        res.status(409).json({ error: 'An account with this email already exists. Please use the same email address you registered with.' });
        return;
      }
      res.status(500).json({ error: 'Failed to create account' });
      return;
    }

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.cookie('caai_token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    console.log(`New user registered: ${newUser.email}`);
    res.status(201).json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
      isReturning: false,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/auth/me — Check current session
router.get('/me', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, is_active, is_whitelisted')
      .eq('id', req.user!.userId)
      .single();

    if (error || !user) {
      // User was deleted from admin panel — clear the cookie so the JWT
      // can't be replayed and the client treats the session as ended.
      res.clearCookie('caai_token');
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (!user.is_active) {
      // Suspended: report 403 so the frontend treats the session as logged
      // out, but DO NOT clear the cookie. If the admin reactivates the
      // account later, the same cookie still works and the user can return
      // to the tool without re-registering or signing in again.
      res.status(403).json({ error: 'Account suspended' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ error: 'Failed to verify session' });
  }
});

// POST /api/auth/logout — Clear user session cookie
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('caai_token');
  res.json({ message: 'Logged out' });
});

// POST /api/auth/admin-login — Admin login via Supabase Auth
router.post('/admin-login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify user is in admin_users table (use service_role client)
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('auth_user_id', data.user.id)
      .single();

    if (adminError || !adminUser) {
      res.status(403).json({ error: 'Not authorized as admin' });
      return;
    }

    res.cookie('caai_admin_token', data.session.access_token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({ admin: { email: adminUser.email } });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// POST /api/auth/admin-logout — Clear admin session
router.post('/admin-logout', authenticateAdmin, (_req: AdminRequest, res: Response) => {
  res.clearCookie('caai_admin_token');
  res.json({ message: 'Logged out' });
});

// PUT /api/auth/admin-password — Change admin password
router.put('/admin-password', authenticateAdmin, async (req: AdminRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    // Verify current password by re-authenticating
    const { error: verifyError } = await supabaseAuth.auth.signInWithPassword({
      email: req.adminUser!.email,
      password: currentPassword,
    });

    if (verifyError) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    // Update password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      req.adminUser!.auth_user_id,
      { password: newPassword }
    );

    if (updateError) {
      res.status(500).json({ error: 'Failed to update password' });
      return;
    }

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
