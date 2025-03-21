import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.novita.ai/v3/openai",
  apiKey: process.env.OPENAI_API_KEY, // Securely stored in Vercel
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { messages } = req.body;

    const completion = await openai.chat.completions.create({
      messages,
      model: "meta-llama/llama-3.1-8b-instruct",
    });

    res.status(200).json(completion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
