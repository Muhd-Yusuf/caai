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

      // Send each frame to n8n for analysis
      const frameResults: string[] = [];

      for (let i = 0; i < frames.length; i++) {
        const frame = frames[i];
        const framePayload: Record<string, unknown> = {
          action: 'sendMessage',
          sessionId: sessionId || 'unknown',
          chatInput: i === 0
            ? `analyze this video. This is frame ${i + 1} of ${frames.length}, captured at ${frame.timestamp}s.`
            : `continue video analysis. Frame ${i + 1} of ${frames.length}, captured at ${frame.timestamp}s.`,
          files: [{
            fileName: `frame_${i + 1}.jpg`,
            fileSize: `${Math.round(frame.base64.length * 0.75 / 1024)} KB`,
            fileType: 'image',
            mimeType: 'image/jpeg',
            fileExtension: 'jpeg',
            binaryKey: frame.base64,
          }],
        };

        try {
          const frameData = await sendToN8n(framePayload) as { output?: string };
          if (frameData?.output) {
            frameResults.push(`**Frame ${i + 1} (${frame.timestamp}s):**\n${frameData.output}`);
          }
        } catch (err) {
          console.error(`Error analyzing frame ${i + 1}:`, err);
          frameResults.push(`**Frame ${i + 1} (${frame.timestamp}s):** Analysis failed.`);
        }
      }

      // Build combined output
      const combinedOutput = frameResults.length > 0
        ? `## Video Analysis Results\n\nAnalyzed ${frames.length} frame(s) from the video.\n\n${frameResults.join('\n\n---\n\n')}`
        : 'Could not analyze any frames from the video.';

      await recordSubmission(userId, sessionId || 'unknown', 'video');
      res.json({ output: combinedOutput });
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
