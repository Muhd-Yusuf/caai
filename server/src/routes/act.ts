import { Router, Response } from 'express';
import { config } from '../config';
import { optionalAuth } from '../middleware/auth';
import { checkRateLimit, recordSubmission } from '../services/rateLimiter';
import { AuthenticatedRequest } from '../types';
import { extractFrames } from '../services/videoProcessor';

const router = Router();

/**
 * Sends a payload to the n8n webhook and returns the parsed response.
 */
async function sendToN8n(payload: Record<string, unknown>): Promise<unknown> {
  const response = await fetch(config.n8nWebhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([payload]),
  });

  if (!response.ok) {
    throw new Error(`n8n responded with status ${response.status}`);
  }

  return response.json();
}

// POST /api/act/chat — Proxy to n8n webhook with rate limiting
router.post('/chat', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.userId;

    // Check rate limit
    const rateCheck = await checkRateLimit(userId);

    if (!rateCheck.allowed) {
      const hours = Math.floor(rateCheck.resetInMinutes / 60);
      const mins = rateCheck.resetInMinutes % 60;
      const timeStr = hours > 0
        ? `${hours} hour${hours !== 1 ? 's' : ''}${mins > 0 ? ` ${mins} minute${mins !== 1 ? 's' : ''}` : ''}`
        : `${mins} minute${mins !== 1 ? 's' : ''}`;

      res.status(429).json({
        error: `You've reached your usage limit. Please try again in ${timeStr}.`,
        resetInMinutes: rateCheck.resetInMinutes,
      });
      return;
    }

    const { chatInput, sessionId, imageData, videoData } = req.body;

    if (!chatInput && !imageData && !videoData) {
      res.status(400).json({ error: 'Message, image, or video is required' });
      return;
    }

    // --- Video processing ---
    if (videoData) {
      const frames = await extractFrames(videoData);

      if (frames.length === 0) {
        res.status(400).json({ error: 'Could not extract frames from video. Please try a different file.' });
        return;
      }

      // Send all frames in a single n8n request for one consolidated analysis
      const videoPayload: Record<string, unknown> = {
        action: 'sendMessage',
        sessionId: sessionId || 'unknown',
        chatInput: `Analyze this video for antisemitic content. I am providing ${frames.length} frames sampled from the video at timestamps: ${frames.map(f => `${Math.round(f.timestamp)}s`).join(', ')}. Treat all frames as a single video and produce ONE combined IHRA analysis covering all antisemitic content found across the entire video. Do not give a separate analysis per frame — give a single response in the standard IHRA output format.`,
        files: frames.map((frame, i) => ({
          fileName: `frame_${i + 1}_at_${Math.round(frame.timestamp)}s.jpg`,
          fileSize: `${Math.round(frame.base64.length * 0.75 / 1024)} KB`,
          fileType: 'image',
          mimeType: 'image/jpeg',
          fileExtension: 'jpeg',
          binaryKey: frame.base64,
        })),
      };

      const videoData_ = await sendToN8n(videoPayload) as { output?: string };
      const output = videoData_?.output || 'Could not analyze the video.';

      await recordSubmission(userId, sessionId || 'unknown', 'video');
      res.json({ output });
      return;
    }

    // --- Image or text processing ---
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

    const data = await sendToN8n(n8nPayload);

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
