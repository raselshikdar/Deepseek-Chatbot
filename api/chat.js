import { OpenAI } from 'openai';

const openai = new OpenAI({
  baseURL: process.env.API_BASE_URL || 'https://api.novita.ai/v3/openai',
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'meta-llama/llama-3.1-8b-instruct',
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    res.status(200).json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: error.message || 'Internal Server Error' 
    });
  }
}
