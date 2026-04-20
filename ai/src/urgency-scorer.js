import { generateAIResponse } from "./services/aiService.js";

/**
 * 1. Hybrid Check: Rule-based Classification (Fast & Deterministic)
 */
function getLocalUrgency(text) {
    const lower = text.toLowerCase();
    
    // Explicit list of highly urgent words
    const urgentKeywords = ["urgent", "asap", "emergency", "today", "now"];
    
    for (const word of urgentKeywords) {
        // Ensure it's matched safely, but includes is usually fine for these specific words
        if (lower.includes(word)) {
            return "urgent";
        }
    }
    
    return null; // Fallback to AI
}

/**
 * 2. Strict Prompt for TinyLlama
 * TinyLlama needs very constrained instructions to prevent hallucinations or stories.
 */
function createUrgencyPrompt(description) {
    return `You are a strict classifier. Classify the job description as "urgent" or "not urgent".
Respond with ONLY ONE valid value.
Do NOT write sentences. Do NOT explain. 

Job description: "${description}"
Format: urgent or not urgent
Output:`;
}

/**
 * 3. Safe Parsing Output
 */
function parseTinyLlamaResponse(rawText) {
    const text = (rawText || "").toLowerCase().trim();

    // Prioritize catching "not urgent" completely first
    if (text.includes("not urgent")) {
        return "not urgent";
    }
    if (text.includes("urgent")) {
        return "urgent";
    }

    return "unknown"; // Fallback if hallucinated or completely wrong output
}

/**
 * 4. Main Exported Function
 */
export async function classifyUrgency(description = "") {
    if (!description || typeof description !== "string") return { status: "normal", confidence: 0 };

    // ✅ Step 1: Fast Rule-based processing
    const localResult = getLocalUrgency(description);
    if (localResult) {
        console.log(`⚡ Urgency Rule Match: ${localResult}`);
        return { status: localResult, confidence: 1.0 };
    }

    // ✅ Step 2: TinyLlama Classification
    try {
        const prompt = createUrgencyPrompt(description);
        const aiResponse = await generateAIResponse(prompt, "urgency");

        if (aiResponse?.status === "success") {
            const urgency = parseTinyLlamaResponse(aiResponse.text);
            
            if (urgency === "unknown") {
               console.warn(`⚠️ TinyLlama Hallucination Detected.`);
               return { status: "normal", confidence: 0.3 };
            }
            
            console.log(`🔥 Final AI Decision: ${urgency} (Source: ${aiResponse.source})`);
            return { status: urgency, confidence: aiResponse.confidence || 0.85 };
        }

        return { status: "normal", confidence: 0.5 }; 
    } catch (error) {
        console.error("❌ Urgency Scoring Error:", error.message);
        return { status: "normal", confidence: 0 }; 
    }
}

// Preserve existing exports
export const scoreUrgency = classifyUrgency;