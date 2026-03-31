import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import workers from "./jobs.js";
import { matchWorkers } from "./matching.js";
import { scoreUrgency } from "./urgency-scorer.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ 1. Proper CORS Configuration
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"], // Allow frontend
  methods: ["GET", "POST", "OPTIONS"],
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
    
  } catch (error) {
    console.error("❌ ERROR Processing Job:", error);
    res.status(500).json({
      error: "Something went wrong on the server",
      details: error.message,
    });
  }
});

// ✅ 4. Start server safely with automatic port fallback
const startServer = (port) => {
  const server = app.listen(port, () => {
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

  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping server...");
    server.close(() => {
      console.log("✅ Server stopped cleanly.");
      process.exit(0);
    });
  });
};

startServer(parseInt(PORT));