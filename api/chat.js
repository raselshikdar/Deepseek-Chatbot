// api/chat.js
import { OpenAI } from 'openai';
import { z } from 'zod';

// Validation Schema
const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1),
    })
  ).min(1),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  max_tokens: z.number().int().positive().optional().default(500),
});

const openai = new OpenAI({
  baseURL: process.env.API_BASE_URL || 'https://api.novita.ai/v3/openai',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Validate request body
    const validation = ChatRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: validation.error.flatten()
      });
    }

    // Create chat completion
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'meta-llama/llama-3.1-8b-instruct',
      messages: validation.data.messages,
      temperature: validation.data.temperature,
      max_tokens: validation.data.max_tokens,
    });

    // Validate API response
    if (!completion?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response structure');
    }

    // Return standardized response
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      id: completion.id,
      object: completion.object,
      created: completion.created,
      model: completion.model,
      usage: completion.usage,
      choices: completion.choices,
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // Handle different error types
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Internal Server Error';

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(statusCode).json({
      error: 'AI Service Error',
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
}
