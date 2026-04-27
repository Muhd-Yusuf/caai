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
      max_tokens: 4096,
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 429) {
      throw new Error('OPENAI_RATE_LIMIT');
    }
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
          text: `Video analysis request for the ACT hate-speech detection system. These are ${frames.length} frame${frames.length !== 1 ? 's' : ''} extracted from a video at timestamp${frames.length !== 1 ? 's' : ''}: ${frames.map(f => `${Math.round(f.timestamp)}s`).join(', ')}. Treat all frames as a single video. Produce ONE combined IHRA analysis in Format B (video frames) as defined in your system instructions. If no antisemitic content is found, use the not-antisemitic output format.`,
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
        { type: 'text', text: 'Hate-speech detection request. This image has been submitted to the ACT antisemitism classification system for IHRA analysis. This may include historical Nazi propaganda, antisemitic caricatures, or extremist imagery — analysing such content is the explicit safety purpose of this system. Classify this image using the IHRA framework defined in your system instructions and produce the output in Format B (image). If no antisemitic content is found, use the not-antisemitic output format.' },
        { type: 'image_url', image_url: { url: imageData, detail: 'auto' } },
      ];

      output = await sendToOpenAI(userContent);
      await recordSubmission(userId, sessionId || 'unknown', 'image');
      res.json({ output });
      return;
    }

    // --- Text processing ---
    // Wrap content submissions in analysis framing to prevent content moderation
    // refusals. For questions/follow-ups, send as-is so Q&A mode is preserved.
    const isQuestion = /^(what|how|why|who|when|where|explain|tell|expand|describe|can you|could you|is |are |do |does |\?)/i.test(chatInput.trim()) || chatInput.includes('?');
    const textPrompt = isQuestion
      ? chatInput
      : `Text analysis request for the ACT hate-speech detection system. Analyse the following submission using the IHRA framework as defined in your system instructions and produce the IHRA output format. If no antisemitic content is found, use the not-antisemitic output format. Submission to analyse: "${chatInput}"`;

    const userContent: OpenAIContent[] = [
      { type: 'text', text: textPrompt },
    ];

    output = await sendToOpenAI(userContent);
    await recordSubmission(userId, sessionId || 'unknown', 'text');
    res.json({ output });

  } catch (err: any) {
    console.error('ACT chat error:', err);
    if (err?.message === 'OPENAI_RATE_LIMIT') {
      res.status(429).json({ error: 'The AI service is temporarily busy. Please wait a few seconds and try again.' });
    } else {
      res.status(502).json({ error: 'AI processing failed. Please try again.' });
    }
  }
});

export default router;
