import { Router, Response } from 'express';
import { config } from '../config';
import { authenticateUser } from '../middleware/auth';
import { checkRateLimit, recordSubmission } from '../services/rateLimiter';
import { AuthenticatedRequest } from '../types';

const router = Router();

// POST /api/act/chat — Proxy to n8n webhook with rate limiting
router.post('/chat', authenticateUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Check rate limit
    const rateCheck = await checkRateLimit(userId);

    if (!rateCheck.allowed) {
      res.status(429).json({
        error: `You've reached your usage limit. Please try again in ${rateCheck.resetInHours} hours.`,
        resetInHours: rateCheck.resetInHours,
      });
      return;
    }

    const { chatInput, sessionId, imageData } = req.body;

    if (!chatInput && !imageData) {
      res.status(400).json({ error: 'Message or image is required' });
      return;
    }

    // Build payload for n8n
    const payload: Record<string, unknown> = {
      chatInput,
      sessionId: sessionId || 'unknown',
    };

    if (imageData) {
      payload.imageData = imageData;
    }

    // Proxy to n8n
    const n8nResponse = await fetch(config.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!n8nResponse.ok) {
      throw new Error(`n8n responded with status ${n8nResponse.status}`);
    }

    const data = await n8nResponse.json();

    // Record the submission for rate limiting
    const inputType = imageData ? 'image' : 'text';
    await recordSubmission(userId, sessionId || 'unknown', inputType);

    res.json(data);
  } catch (err) {
    console.error('ACT chat error:', err);
    res.status(502).json({ error: 'AI processing failed. Please try again.' });
  }
});

export default router;
