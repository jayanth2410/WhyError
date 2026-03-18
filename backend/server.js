import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-flash-latest",
  systemInstruction:
    "You are a senior developer and a great teacher. Explain technical errors simply and clearly for beginners.",
});

app.get("/", (req, res) => {
  res.send("WhyError API running with Gemini 🚀");
});

app.post("/explain", async (req, res) => {
  const { error } = req.body;

  if (!error) {
    return res.status(400).json({ error: "Please provide an error message." });
  }

  try {
    const prompt = `
Explain this error in simple terms.

Error:
${error}

Respond ONLY in valid JSON format like this:

{
  "explanation": "simple explanation",
  "cause": "why this happens",
  "fix": "steps to fix",
  "example": "code example",
  "concept": "concept explanation"
}

Strictly return only JSON. No markdown. No extra text.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 🔥 Clean + Parse JSON
    let parsed;

    try {
      const cleanText = text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleanText);
    } catch (parseError) {
      console.log("⚠️ JSON parsing failed, returning raw text");
      return res.json({ response: text });
    }

    res.json(parsed);
  } catch (err) {
    console.error("❌ Gemini API Error:", err);

    if (err.message.includes("API key not valid")) {
      return res.status(401).json({
        error: "Invalid API Key. Check your .env file.",
      });
    }

    res.status(500).json({
      error: "Failed to connect to Gemini API",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});