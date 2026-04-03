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

// 🚀 Start server
app.listen(PORT, () => {
    console.log(`AI Server running on http://localhost:${PORT}`);
});