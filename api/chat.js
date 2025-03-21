import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { message } = req.body;
  const openai = new OpenAI({
    baseURL: "https://api.novita.ai/v3/openai",
    apiKey: process.env.API_KEY,
  });

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "You are a helpful AI assistant." },
        { role: "user", content: message },
      ],
      model: "meta-llama/llama-3.1-8b-instruct",
      stream: false,
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
