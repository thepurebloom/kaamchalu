import express from "express";
import cors from "cors";

import { scoreUrgency } from "./urgency-scorer.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// ✅ Health check
app.get("/", (req, res) => {
    res.send("AI Server running 🚀");
});

// ✅ AI API
app.post("/api/ai/score-urgency", async (req, res) => {
    try {
        const { description } = req.body;
        console.log("📥 AI Server: Received score-urgency request");

        const urgency = await scoreUrgency(description);

        res.json({ urgency });
    } catch (err) {
        console.error("❌ AI Server score-urgency error:", err);
        res.status(500).json({ error: 'Failed to score urgency', details: err.message });
    }
});

// 🚀 Start server with port fallback
const startServer = (port) => {
    app.listen(port, () => {
        console.log(`\n🤖 AI SERVER RUNNING`);
        console.log(`🔗 URL: http://localhost:${port}`);
        console.log(`📡 Status: Ready to score urgency\n`);
    }).on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.warn(`⚠️  AI Port ${port} is occupied. Trying port ${port + 1}...`);
            setTimeout(() => startServer(port + 1), 500);
        } else {
            console.error("❌ AI Server Error:", err.message);
            process.exit(1);
        }
    });
};

startServer(PORT);