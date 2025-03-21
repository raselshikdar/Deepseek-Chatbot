import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: "https://api.novita.ai/v3/openai",
  apiKey: process.env.DEEPSEEK_API_KEY, // Securely stored in Vercel
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { message } = req.body; // Expecting a message from the frontend

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Call OpenAI/Novita AI API with the message
    const completion = await openai.chat.completions.create({
      model: "meta-llama/llama-3.1-8b-instruct", // Use correct model here
      messages: [{ role: "user", content: message }]
    });

    // Check if the response is structured correctly
    if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      return res.status(500).json({ error: "Invalid API response" });
    }

    // Send the message back as a response
    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
