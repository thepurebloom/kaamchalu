import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// 🔥 Urgency logic
function scoreUrgency(description) {
    const text = description.toLowerCase();

    if (
        text.includes("leak") ||
        text.includes("urgent") ||
        text.includes("broken") ||
        text.includes("immediately")
    ) {
        return "urgent";
    }

    if (text.includes("later") || text.includes("whenever")) {
        return "flexible";
    }

    return "normal";
}

// ✅ Health check
app.get("/", (req, res) => {
    res.send("AI Server running 🚀");
});

// ✅ AI API
app.post("/api/ai/score-urgency", (req, res) => {
    const { description } = req.body;

    const urgency = scoreUrgency(description);

    res.json({ urgency });
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