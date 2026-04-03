
import dotenv from "dotenv";
dotenv.config();

import { scoreUrgency } from "./src/urgency-scorer.js";

async function test() {
    console.log("Testing AI fallback...");
    try {
        // This description has no local keywords (urgent, asap, week, anytime, etc.)
        const desc = "Could someone help me fix my wooden door lock, it is getting slightly loose and hard to close properly.";
        const result = await scoreUrgency(desc);
        console.log(`Input: "${desc}"`);
        console.log(`Urgency Result: ${result}`);
    } catch (err) {
        console.error("❌ Error during urgency test:", err.message);
    }
}

test();
