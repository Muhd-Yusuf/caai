import { Router, Response } from 'express';
import { config } from '../config';
import { optionalAuth } from '../middleware/auth';
import { checkRateLimit, recordSubmission } from '../services/rateLimiter';
import { AuthenticatedRequest } from '../types';
import { extractFrames } from '../services/videoProcessor';
import { SYSTEM_PROMPT } from '../prompts/system-prompt';

const router = Router();

interface OpenAITextContent {
  type: 'text';
  text: string;
}

interface OpenAIImageContent {
  type: 'image_url';
  image_url: { url: string; detail: 'auto' | 'high' | 'low' };
}

type OpenAIContent = OpenAITextContent | OpenAIImageContent;

/**
 * Sends a request to OpenAI GPT-4o Vision API and returns the text response.
 */
async function sendToOpenAI(userContent: OpenAIContent[]): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      max_tokens: 2048,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content || 'No response from AI.';
}

// POST /api/act/chat — Analyse content using OpenAI GPT-4o Vision API
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

    let output: string;

    // --- Video processing ---
    if (videoData) {
      const frames = await extractFrames(videoData);

      if (frames.length === 0) {
        res.status(400).json({ error: 'Could not extract frames from video. Please try a different file.' });
        return;
      }

      const userContent: OpenAIContent[] = [
        {
          type: 'text',
          text: `Analyze this video for antisemitic content. I am providing ${frames.length} frame${frames.length !== 1 ? 's' : ''} sampled from the video at timestamp${frames.length !== 1 ? 's' : ''}: ${frames.map(f => `${Math.round(f.timestamp)}s`).join(', ')}. Treat all frames as a single video and produce ONE combined IHRA analysis covering all antisemitic content found across the entire video. Do not give a separate analysis per frame — give a single response in the standard IHRA output format.`,
        },
        ...frames.map((frame): OpenAIImageContent => ({
          type: 'image_url',
          image_url: { url: frame.base64, detail: 'auto' },
        })),
      ];

      output = await sendToOpenAI(userContent);
      await recordSubmission(userId, sessionId || 'unknown', 'video');
      res.json({ output });
      return;
    }

    // --- Image processing ---
    if (imageData) {
      const userContent: OpenAIContent[] = [
        { type: 'text', text: chatInput || 'Analyze this image for antisemitic content.' },
        { type: 'image_url', image_url: { url: imageData, detail: 'auto' } },
      ];

      output = await sendToOpenAI(userContent);
      await recordSubmission(userId, sessionId || 'unknown', 'image');
      res.json({ output });
      return;
    }

    // --- Text processing ---
    const userContent: OpenAIContent[] = [
      { type: 'text', text: chatInput },
    ];

    output = await sendToOpenAI(userContent);
    await recordSubmission(userId, sessionId || 'unknown', 'text');
    res.json({ output });

  } catch (err) {
    console.error('ACT chat error:', err);
    res.status(502).json({ error: 'AI processing failed. Please try again.' });
  }
});

export default router;
