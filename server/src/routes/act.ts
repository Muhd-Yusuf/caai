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

    // Build payload in the format n8n expects
    const n8nPayload: Record<string, unknown> = {
      action: 'sendMessage',
      sessionId: sessionId || 'unknown',
      chatInput: chatInput || 'analyze this image',
    };

    if (imageData) {
      n8nPayload.files = [{
        fileName: 'image.jpg',
        fileSize: '1 MB',
        fileType: 'image',
        mimeType: 'image/jpeg',
        fileExtension: 'jpeg',
        binaryKey: imageData,
      }];
    }

    // Proxy to n8n (wrapped in array as original format)
    const n8nResponse = await fetch(config.n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([n8nPayload]),
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
