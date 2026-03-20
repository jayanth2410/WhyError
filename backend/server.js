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
    "You are a senior MERN stack developer and a mentor. You explain technical errors to beginners by breaking them down into logical sections: Summary, Fix, Learning, and Resources.",
});

// --- HELPER FUNCTION FOR LINKS ---
const generateResources = (errorTitle) => {
  const query = encodeURIComponent(errorTitle);
  return {
    youtube_link: `https://www.youtube.com/results?search_query=${query}+tutorial`,
    blog_link: `https://www.google.com/search?q=${query}+fix+blog+post`,
  };
};

app.get("/", (req, res) => {
  res.send("WhyError API is live 🚀");
});

// 🔥 MAIN API: Real-time AI Explanation
app.post("/explain", async (req, res) => {
  const { error } = req.body;

  if (!error) {
    return res.status(400).json({ error: "Please provide an error message." });
  }

  try {
    const prompt = `
      Analyze this error: "${error}"
      Return ONLY a valid JSON object with the following structure. 
      Do NOT include markdown formatting or backticks.

      Structure:
      {
        "error_name": "Short technical name",
        "summary": {
          "root_cause": "The core reason it broke",
          "simple_explanation": "Plain English for a beginner"
        },
        "solution": {
          "how_to_fix": "Primary fix steps",
          "wrong_vs_correct": "Show code comparison using \\n for new lines",
          "step_by_step_fix": ["Step 1", "Step 2"]
        },
        "learning": {
          "real_world_analogy": "A daily life example of this concept",
          "concept_explanation": "The technical theory behind it",
          "common_mistakes": ["Mistake 1", "Mistake 2"],
          "debugging_tips": "How to catch this next time"
        },
        "search_keywords": "Specific keywords for YouTube search"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean JSON string
    const cleanText = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    // Add dynamic links before sending to frontend
    const finalResponse = {
      ...parsed,
      resources: generateResources(parsed.error_name || error),
    };

    console.log("✅ AI Response Generated");
    res.json(finalResponse);
  } catch (err) {
    console.error("❌ Gemini Error:", err);
    res.status(500).json({ error: "Failed to connect to AI" });
  }
});

// 🧪 TESTING API: Hard-coded Response
app.post("/get", async (req, res) => {
  // Simulating the structured response for frontend development
  const dummyData = {
    error_name: "Mongoose Selection Timeout",
    summary: {
      root_cause: "Your Node.js app cannot reach the MongoDB database.",
      simple_explanation: "It's like trying to call a friend, but your phone has no signal. The app is waiting for the database to answer, but the connection never happens.",
    },
    solution: {
      how_to_fix: "Check your MongoDB Atlas IP Whitelist and your .env connection string.",
      wrong_vs_correct: "// Wrong:\\nconst URI = 'mongodb://localhost/wrong'\\n\\n// Correct:\\nconst URI = process.env.MONGO_URI",
      step_by_step_fix: [
        "Go to MongoDB Atlas",
        "Network Access -> Add IP Address -> Allow Access from Anywhere",
        "Restart your Node server",
      ],
    },
    learning: {
      real_world_analogy: "Imagine a waiter (Node) trying to enter the kitchen (Database), but the door is locked from the inside.",
      concept_explanation: "Database connectivity depends on networking rules. If the IP isn't allowed, the request 'buffers' until it eventually times out.",
      common_mistakes: [
        "Forgetting to whitelist the current IP",
        "Typos in the username or password",
        "Not starting the local mongod service",
      ],
      debugging_tips: "Use 'ping' in your terminal to see if the DB host is reachable, or try connecting via MongoDB Compass first.",
    },
    resources: generateResources("Mongoose Connection Timeout"),
  };

  res.json(dummyData);
});




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});