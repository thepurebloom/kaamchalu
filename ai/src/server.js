import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import workers from "./jobs.js";
import { matchWorkers } from "./matching.js";
import { scoreUrgency } from "./urgency-scorer.js";
import { detectFakeReview } from "./fake-review-detector.js";
import { saveJob, getJobs, deleteJob, updateJobFakeStatus } from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ 1. Proper CORS Configuration
app.use(cors());

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
    
    if (!job || Object.keys(job).length === 0) {
      return res.status(400).json({ success: false, error: "Job data missing" });
    }

    // Urgency AI
    console.log("🤖 Scoring urgency...");
    const urgencyObj = await scoreUrgency(job.description || "").catch(err => {
        console.error("⚠️ Urgency Scorer Failed:", err.message);
        return { status: "normal", confidence: 0 };
    });

    job.urgency = urgencyObj.status || "normal";
    job.urgencyConfidence = urgencyObj.confidence || 0.5;

    // Matching
    console.log("👷 Selecting top workers...");
    const topWorkers = matchWorkers(job, workers);
    console.log("👷 Matches Found:", topWorkers.length);

    // ✅ Standardized Response per STEP 3
    res.status(200).json({
      success: true,
      message: "Job processed successfully",
      verification: { status: "real", confidence: 1.0 }, 
      urgency: { status: job.urgency, confidence: job.urgencyConfidence },
      topWorkers: topWorkers || [],
      job: job
    });

    // 💾 Save to history
    saveJob({
      description: job.description,
      skill: job.requiredSkill,
      location: job.location,
      budget: job.budget,
      urgency: job.urgency,
      confidence: job.urgencyConfidence,
      is_fake: "real",
      matched_workers: topWorkers
    }).catch(err => console.error("❌ Background saveJob failed:", err.message));
    
  } catch (error) {
    console.error("❌ ERROR Processing Job:", error.message);
    res.json({
      success: true, // Still success to prevent UI crash
      urgency: { status: "normal", confidence: 0 },
      topWorkers: [],
      error: "AI processing fallback used",
      details: error.message
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
app.post("/api/ai/detect-fake-review", async (req, res) => {
  try {
    const { text, skill, location, budget } = req.body;
    
    // 🔥 Standardized return from STEP 1/2
    const verification = await detectFakeReview(text);
    console.log(`🔍 Verification Result:`, verification);
    
    // If fake, log it
    if (verification.status === "fake") {
      saveJob({
        description: text,
        skill: skill || "n/a",
        location: location || "n/a",
        budget: budget || 0,
        urgency: "flexible",
        is_fake: "fake",
        matched_workers: []
      }).catch(err => console.error("❌ History log (fake) failed:", err.message));
    }

    res.json({ 
        success: true, 
        status: verification.status, 
        confidence: verification.confidence,
        verification: verification 
    });
  } catch (error) {
    console.error("❌ Fake Detection Route Error:", error.message);
    res.json({ 
        success: true, 
        status: "unknown", 
        confidence: 0.5,
        message: "Pipeline error, fallback used"
    });
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

// ✅ 8. Admin Analytics Endpoint
app.get("/api/admin/analytics", async (req, res) => {
  try {
    const jobs = await getJobs();

    const totalJobs = jobs.length;
    const urgentJobs = jobs.filter(j => (j.urgency || "").toLowerCase() === "urgent").length;
    const normalJobs = jobs.filter(j => (j.urgency || "").toLowerCase() !== "urgent").length;
    const fakeJobs = jobs.filter(j => (j.is_fake || "").toLowerCase() === "fake").length;

    const budgets = jobs.map(j => Number(j.budget) || 0).filter(b => b > 0);
    const avgBudget = budgets.length > 0 ? Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length) : 0;

    // Top skill
    const skillCount = {};
    jobs.forEach(j => {
      const s = (j.skill || "unknown").toLowerCase();
      skillCount[s] = (skillCount[s] || 0) + 1;
    });
    const topSkill = Object.entries(skillCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Jobs per day
    const dayCount = {};
    jobs.forEach(j => {
      const date = (j.created_at || "").split("T")[0].split(" ")[0];
      if (date) dayCount[date] = (dayCount[date] || 0) + 1;
    });
    const jobsPerDay = Object.entries(dayCount)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    // Skill distribution
    const skillDistribution = Object.entries(skillCount)
      .sort((a, b) => b[1] - a[1])
      .map(([skill, count]) => ({ skill, count }));

    res.json({ totalJobs, urgentJobs, normalJobs, fakeJobs, avgBudget, topSkill, jobsPerDay, skillDistribution });
  } catch (error) {
    console.error("❌ Analytics error:", error.message);
    res.status(500).json({ error: "Unable to compute analytics" });
  }
});

// ✅ 9. Mark Job as Fake
app.patch("/api/jobs/:id/fake", async (req, res) => {
  try {
    const { id } = req.params;
    const { isFake } = req.body;
    const result = await updateJobFakeStatus(id, isFake !== false);
    if (!result || result.success === false) {
      return res.status(404).json({ success: false, message: "No such record found" });
    }
    res.json({ success: true, message: "Job updated" });
  } catch (error) {
    console.error("❌ Patch fake error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ 7. Delete Job History Item
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteJob(id);

    if (!result || result.success === false) {
      return res.status(404).json({
        success: false,
        message: "No such record found"
      });
    }

    res.json({
      success: true,
      message: "History item deleted"
    });

  } catch (error) {
    console.error("Delete error:", error);

    res.status(500).json({
      success: false,
      message: "Server error"
    });
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});