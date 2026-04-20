import "dotenv/config";
import express from "express";
import cors from "cors";

import { generateAIResponse } from "./services/aiService.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// 6. Debugging: Add middleware/logging to print incoming requests
app.use((req, res, next) => {
    console.log(`\n[${new Date().toISOString()}] ➡️ ${req.method} ${req.url}`);
    next();
});

// ✅ Health check
app.get("/", (req, res) => {
    res.send("AI Server running 🚀");
});

// ✅ AI API (process-job route)
app.post("/api/process-job", async (req, res) => {
    try {
        const { description } = req.body;
        console.log(`📥 Received /api/process-job request`);

        if (!description) {
            console.log("⚠️ No description provided in request body.");
            return res.json({ 
                urgency: "normal", 
                status: "unknown", 
                confidence: 0.5,
                message: "No description provided" 
            });
        }

        // Generating a prompt to accurately classify the job urgency
        const prompt = `Task: Classify the urgency of a job description.
Options: "urgent", "normal", "flexible"

Rules:
- "urgent": Needs immediate attention, emergency, or "ASAP".
- "normal": Needs to be done within a few days or a specific timeframe like "next week".
- "flexible": Can be done whenever, no rush, or "anytime".

Description: "${description}"
Response (exactly one word):`;

        // Using our new centralized AI Service
        const aiResponse = await generateAIResponse(prompt, "urgency");
        
        let urgency = "normal";
        if (aiResponse.status === "success") {
            const rawText = aiResponse.text.toLowerCase();
            if (rawText.includes("flexible")) urgency = "flexible";
            else if (rawText.includes("urgent")) urgency = "urgent";
            else urgency = "normal";
        }

        console.log(`🔥 Final AI Result: ${urgency} (Source: ${aiResponse.source})`);

        res.json({ 
            success: true,
            urgency,
            source: aiResponse.source,
            confidence: aiResponse.confidence,
            status: aiResponse.status
        });
    } catch (err) {
        console.error("❌ AI Server process-job error:", err.message);
        
        // 🔥 Robust fallback: Never send a 500
        res.json({ 
            success: false, 
            urgency: "normal", 
            status: "unknown", 
            confidence: 0.5,
            message: "AI unavailable, fallback used" 
        });
    }
});

// 🚀 Start AI server
const startServer = (port) => {
    app.listen(port, () => {
        console.log(`\n🤖 AI SERVER RUNNING`);
        console.log(`🔗 URL: http://localhost:${port}`);
        console.log(`📡 Status: Ready to process jobs\n`);
    }).on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.error(`❌ ERROR: AI Port ${port} is occupied!`);
            process.exit(1);
        } else {
            console.error("❌ AI Server Error:", err.message);
            process.exit(1);
        }
    });
};

startServer(PORT);