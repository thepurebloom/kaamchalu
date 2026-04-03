import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import workers from "./jobs.js";
import { matchWorkers } from "./matching.js";
import { scoreUrgency } from "./urgency-scorer.js";
import { detectFakeReview } from "./fake-review-detector.js";
import { saveJob, getJobs, deleteJob } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ 1. Proper CORS Configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173"], // Allow frontend
  methods: ["GET", "POST", "OPTIONS", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// ✅ 2. Enable express.json middleware
app.use(express.json());

// ✅ Root route test
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// ✅ 3. Ensure route exists and logs data
app.post("/api/process-job", async (req, res) => {
  console.log("📥 Received request at /api/process-job");
  
  try {
    const { job } = req.body;
    console.log("📦 Job Payload:", job);

    if (!job || Object.keys(job).length === 0) {
      console.error("❌ Job data missing in request payload");
      return res.status(400).json({ error: "Job data missing" });
    }

    // Urgency AI
    console.log("🤖 Scoring urgency...");
    const urgency = await scoreUrgency(job.description || "");
    console.log("🔥 Urgency Score:", urgency);

    job.urgency = urgency;

    // Matching
    console.log("👷 Selecting top workers...");
    const topWorkers = matchWorkers(job, workers);
    console.log("👷 Matches Found:", topWorkers.length);

    // ✅ Response
    res.status(200).json({
      message: "Job processed successfully",
      job,
      topWorkers,
    });

    // 💾 Save to history in the background (don't block response)
    saveJob({
      description: job.description,
      skill: job.requiredSkill,
      location: job.location,
      budget: job.budget,
      urgency: job.urgency,
      is_fake: "real", // This branch only runs if not fake
      matched_workers: topWorkers
    }).catch(err => {
      console.error("❌ Background saveJob failed:", err.message);
    });
    
  } catch (error) {
    console.error("❌ ERROR Processing Job:", error);
    res.status(500).json({
      error: "Something went wrong on the server",
      details: error.message,
    });
  }
});

// ✅ 4. AI Urgency Endpoint (Legacy support for tests)
app.post("/api/ai/score-urgency", async (req, res) => {
  try {
    const { description } = req.body;
    const urgency = await scoreUrgency(description);
    res.json({ urgency });
  } catch (err) {
    console.error("❌ AI score-urgency legacy error:", err.message);
    res.status(500).json({ error: 'Failed to score urgency', details: err.message });
  }
});

// ✅ 5. AI Fake Review Detection
app.post("/api/ai/detect-fake-review", (req, res) => {
  try {
    const { text, skill, location, budget } = req.body;
    const status = detectFakeReview(text);
    console.log(`🔍 Review status: ${status}`);
    
    // If fake, we still want to log it in the history
    if (status === "fake") {
      saveJob({
        description: text,
        skill: skill || "n/a",
        location: location || "n/a",
        budget: budget || 0,
        urgency: "flexible", // Default for fake
        is_fake: "fake",
        matched_workers: []
      }).catch(err => {
        console.error("❌ Background saveJob (fake) failed:", err.message);
      });
    }

    res.json({ status });
  } catch (error) {
    console.error("❌ Fake Detection Error:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ✅ 6. Fetch Job History (with optional filter)
app.get("/api/jobs", async (req, res) => {
  try {
    const { skill } = req.query;
    const jobs = await getJobs(skill);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: "Unable to fetch history" });
  }
});

// ✅ 7. Delete Job History Item
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await deleteJob(id);
    res.json({ success: true, message: "History item deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete item" });
  }
});

let currentServer = null;

// Graceful shutdown - moved to module scope
process.on("SIGINT", () => {
  if (currentServer) {
    console.log("\n🛑 Stopping server...");
    currentServer.close(() => {
      console.log("✅ Server stopped cleanly.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// ✅ 5. Start server safely with automatic port fallback
const startServer = (port) => {
  const server = app.listen(port, () => {
    currentServer = server;
    console.log(`\n🚀 MAIN BACKEND RUNNING`);
    console.log(`🔗 URL: http://localhost:${port}`);
    console.log(`✅ CORS: Allowed from http://localhost:3000\n`);
  }).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`⚠️  Port ${port} is already in use. Trying port ${port + 1}...`);
      setTimeout(() => startServer(port + 1), 500); // Small delay to prevent tight loop
    } else {
      console.error("❌ Fatal Server Error:", err.message);
      process.exit(1);
    }
  });
};

startServer(parseInt(PORT));