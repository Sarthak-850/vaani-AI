import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

const router = Router();

router.post('/diagnose', async (req: Request, res: Response): Promise<void> => {
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'AI API key not configured' });
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    });

    const answer = response.choices[0]?.message?.content || '';
    res.json({ answer });
  } catch (err) {
    console.error('AI API error', err);
    res.status(500).json({ error: 'Failed to communicate with AI API' });
  }
});

export default router;
