import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Initialize Gemini server-side instance lazily/safely
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  };

  // API: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API: AI Career Coach Chat
  app.post("/api/gemini/coach", async (req, res) => {
    try {
      const { message, history, studentContext } = req.body;
      const ai = getAiClient();

      if (!ai) {
        // Fallback response if API key is not yet configured
        return res.json({
          reply: `[AI Career Coach Note]: As an engineering student (${studentContext?.year || "SY/TY"} in ${studentContext?.branch || "Computer Science"}), building a strong foundation in Data Structures, Core CS (DBMS/OS/CN), and shipping 2-3 impactful full-stack or AI projects is your fastest path to Tier-1 placements. Focus on LeetCode Mediums and hackathon team projects!`,
        });
      }

      const systemInstruction = `You are EnggNexus AI Career & Academic Coach, an expert engineering mentor and placement director for engineering students (Second Year SY, Third Year TY, and Final Year students across CSE, IT, ENTC, AI/DS, Mechanical, etc.).
Your job is to provide actionable, encouraging, precise advice on:
1. Academic balance vs Placement prep (handling 75% attendance while grinding DSA/Projects).
2. Semester-by-semester roadmaps for on-campus & off-campus hiring (Product companies, FinTech, Core MNCs).
3. Technical guidance on DSA, System Design, Web Dev, AI/ML, OS, DBMS, Computer Networks.
4. Resume optimization, hackathon strategies, and interview readiness.
Format your responses with clean Markdown, bullet points, and code snippets when relevant. Keep it clear, practical, and highly valuable.`;

      const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-8)) {
          contents.push({
            role: item.role === "assistant" ? "model" : "user",
            parts: [{ text: item.content }],
          });
        }
      }

      const userPromptWithContext = `Student Details:
- Year: ${studentContext?.year || "TY (Third Year)"}
- Branch: ${studentContext?.branch || "Computer Science"}
- Target Goal: ${studentContext?.targetGoal || "Product Company SDE / High-impact Placements"}
- Current CGPA / Target: ${studentContext?.cgpa || "8.5+"}

User Question: ${message}`;

      contents.push({
        role: "user",
        parts: [{ text: userPromptWithContext }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ reply: response.text || "I'm ready to guide your engineering career path!" });
    } catch (error: any) {
      console.error("Gemini Coach API error:", error);
      res.status(500).json({ error: error.message || "Failed to generate guidance." });
    }
  });

  // API: AI Resume Bullet Enhancer
  app.post("/api/gemini/enhance-resume-bullet", async (req, res) => {
    try {
      const { rawBullet, projectContext, role } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.json({
          enhanced: `Architected and deployed ${projectContext || "a full-stack web system"}, reducing response latency by 35% and supporting 1,000+ concurrent requests using optimized indexing and modern caching patterns.`,
          tips: ["Included strong action verb (Architected)", "Added quantified metric (35% latency reduction)", "Mentioned technical impact"],
        });
      }

      const prompt = `You are a Senior Technical Recruiter and ATS Resume Expert for top tech companies.
Transform this raw student resume bullet point into 3 high-impact, ATS-optimized bullet points following the Google X-Y-Z formula ("Accomplished [X] as measured by [Y], by doing [Z]").

Raw bullet: "${rawBullet}"
Context / Project / Tech Stack: "${projectContext || "Engineering software project"}"
Role: "${role || "Software Engineering Intern / Project Lead"}"

Return clean JSON with format:
{
  "options": [
    "High impact option 1",
    "High impact option 2",
    "High impact option 3"
  ],
  "keywordsAdded": ["Keyword 1", "Keyword 2"],
  "improvementReason": "Why these changes will boost ATS score"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Resume Enhancer error:", error);
      res.status(500).json({ error: error.message || "Failed to enhance resume bullet." });
    }
  });

  // API: AI Mock Interview Evaluation
  app.post("/api/gemini/mock-interview-eval", async (req, res) => {
    try {
      const { question, category, studentAnswer } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.json({
          score: 8,
          verdict: "Good Structure with Room for Quantifiable Detail",
          strengths: ["Clear logic flow", "Directly addressed the core question"],
          improvements: ["Mention time/space complexity tradeoffs", "Give a concrete edge-case example"],
          modelAnswer: "An exemplary answer starts by clarifying constraints, outlines brute-force vs optimal approaches with Big-O, and discusses concurrency or failure states.",
        });
      }

      const prompt = `You are an engineering hiring bar raiser at a top tech company. Evaluate the student's mock interview response.

Category: ${category}
Interview Question: "${question}"
Student's Answer: "${studentAnswer}"

Evaluate strictly on:
1. Technical correctness & depth
2. Structure (e.g. STAR method for behavioral, Tradeoff analysis & Big-O for technical)
3. Clarity and confidence

Return clean JSON:
{
  "score": 8, // number from 1 to 10
  "verdict": "Strong Hire / Hire / Leaning Hire / Needs Work",
  "strengths": ["string", "string"],
  "improvements": ["string", "string"],
  "modelAnswer": "Comprehensive ideal answer that an interviewer looks for",
  "followUpQuestion": "A natural follow up question to test deeper knowledge"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Mock Interview Eval error:", error);
      res.status(500).json({ error: error.message || "Failed to evaluate interview response." });
    }
  });

  // API: AI Notes Summarizer & Key Formula/Concept Extractor
  app.post("/api/gemini/summarize-notes", async (req, res) => {
    try {
      const { noteTitle, subject, content } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.json({
          summary: `Executive summary of ${noteTitle} (${subject}): Covers essential core definitions, primary theorem proofs, and standard university examination numericals.`,
          keyTakeaways: ["Key Definition and Architecture", "Standard Exam Questions", "Critical Formulae and Complexity Tables"],
          examTips: "Focus on 5-mark and 10-mark recurring derivations in university papers.",
        });
      }

      const prompt = `You are an engineering professor and university exam expert.
Summarize the following student notes and extract key examination formulas, definitions, and high-probability viva/exam questions.

Subject: ${subject}
Note Title: ${noteTitle}
Content: "${content}"

Return clean JSON:
{
  "summary": "Concise 2-3 sentence overview",
  "keyTakeaways": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"],
  "importantFormulasOrDefinitions": ["Formula / Definition 1", "Formula / Definition 2"],
  "frequentlyAskedQuestions": ["Expected Question 1", "Expected Question 2"],
  "quickRevisionMnemonic": "Memory trick or mnemonic if applicable"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (error: any) {
      console.error("Notes Summarize error:", error);
      res.status(500).json({ error: error.message || "Failed to summarize notes." });
    }
  });

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EnggNexus Server running on http://localhost:${PORT}`);
  });
}

startServer();
