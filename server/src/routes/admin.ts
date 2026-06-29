import { Router, Response } from 'express';
import { authenticateAdmin } from '../middleware/adminAuth';
import { supabase } from '../services/supabase';
import { invalidateCache } from '../services/rateLimiter';
import { AdminRequest } from '../types';

const router = Router();

// All admin routes require admin auth
router.use(authenticateAdmin);

// GET /api/admin/users — List users with search, filter, pagination
router.get('/users', async (req: AdminRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const filter = (req.query.filter as string) || 'all'; // all | active | suspended
    const offset = (page - 1) * limit;

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (filter === 'active') {
      query = query.eq('is_active', true);
    } else if (filter === 'suspended') {
      query = query.eq('is_active', false);
    }

    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
      return;
    }

    res.json({
      users: users || [],
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// POST /api/admin/users — Manually create user
router.post('/users', async (req: AdminRequest, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        created_by: 'admin',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        res.status(409).json({ error: 'A user with this email already exists' });
        return;
      }
      res.status(500).json({ error: 'Failed to create user' });
      return;
    }

    res.status(201).json({ user });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/admin/users/:id — Suspend/reactivate user
router.patch('/users/:id', async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      res.status(400).json({ error: 'is_active must be a boolean' });
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update user' });
      return;
    }

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/admin/users/:id — Delete user
router.delete('/users/:id', async (req: AdminRequest, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(500).json({ error: 'Failed to delete user' });
      return;
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// GET /api/admin/config — Get rate limit settings
router.get('/config', async (req: AdminRequest, res: Response) => {
  try {
    // Surface the signed-in admin's email so the client can populate the hidden
    // username field on the Change Password form — browsers need it to match and
    // update the saved credential after a password change.
    const email = req.adminUser?.email ?? null;

    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('key', 'rate_limit')
      .single();

    if (error || !data) {
      res.json({ config: { max_submissions: 10, window_hours: 8 }, email });
      return;
    }

    res.json({ config: data.value, email });
  } catch (err) {
    console.error('Get config error:', err);
    res.status(500).json({ error: 'Failed to get config' });
  }
});

// PUT /api/admin/config — Update rate limit settings
router.put('/config', async (req: AdminRequest, res: Response) => {
  try {
    const { max_submissions, window_hours } = req.body;

    if (typeof max_submissions !== 'number' || typeof window_hours !== 'number') {
      res.status(400).json({ error: 'max_submissions and window_hours must be numbers' });
      return;
    }

    if (max_submissions < 1 || window_hours < 1) {
      res.status(400).json({ error: 'Values must be at least 1' });
      return;
    }

    const { error } = await supabase
      .from('app_config')
      .upsert({
        key: 'rate_limit',
        value: { max_submissions, window_hours },
      });

    if (error) {
      res.status(500).json({ error: 'Failed to update config' });
      return;
    }

    // Invalidate cached rate limit config
    invalidateCache();

    res.json({ config: { max_submissions, window_hours } });
  } catch (err) {
    console.error('Update config error:', err);
    res.status(500).json({ error: 'Failed to update config' });
  }
});

// POST /api/admin/whitelist/:userId — Add user to whitelist
router.post('/whitelist/:userId', async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .update({ is_whitelisted: true })
      .eq('id', userId)
      .select()
      .single();

    if (error || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('Whitelist add error:', err);
    res.status(500).json({ error: 'Failed to add to whitelist' });
  }
});

// DELETE /api/admin/whitelist/:userId — Remove from whitelist
router.delete('/whitelist/:userId', async (req: AdminRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabase
      .from('users')
      .update({ is_whitelisted: false })
      .eq('id', userId)
      .select()
      .single();

    if (error || !user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('Whitelist remove error:', err);
    res.status(500).json({ error: 'Failed to remove from whitelist' });
  }
});

export default router;
