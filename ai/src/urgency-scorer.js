import fetch from "node-fetch";

/**
 * 1. Rule-based Pre-check (Quick Local Decisions)
 * Returns a label if a strong keyword is found, else null.
 */
function getLocalUrgency(text) {
    const lower = text.toLowerCase();
    
    // Check for "week" which indicates a non-emergency but definite timeline
    if (lower.includes("week")) return "normal";
    
    // Check for "anytime" or extremely flexible terms
    if (lower.includes("anytime") || lower.includes("whenever") || lower.includes("someday")) return "flexible";
    
    // Check for strong emergency indicators
    if (lower.includes("urgent") || lower.includes("asap") || lower.includes("emergency") || lower.includes("immediately")) return "urgent";
    
    return null;
}

/**
 * 2. Prompt Creation
 * Formats a strict prompt for the Hugging Face AI.
 */
function createUrgencyPrompt(description) {
    return `Task: Classify the urgency of a job description.
Options: "urgent", "normal", "flexible"

Rules:
- "urgent": Needs immediate attention, emergency, or "ASAP".
- "normal": Needs to be done within a few days or a specific timeframe like "next week".
- "flexible": Can be done whenever, no rush, or "anytime".

Description: "${description}"
Response (exactly one word):`;
}

/**
 * 3. Response Parsing
 * Safely extracts the label from AI response with order-of-precedence logic.
 */
function parseAIResponse(rawText) {
    const text = rawText.toLowerCase().trim();
    console.log("🤖 Raw AI response:", rawText);

    // Negation guard: checks if a word is preceded by a negator within a small window (approx 2 words)
    const isNegated = (word) => {
        const negators = ["not", "no", "never", "n't"];
        const regex = new RegExp(`(?:\\b(?:${negators.join('|')})\\s+(?:\\w+\\s+)?\\b${word}\\b)`, "i");
        return regex.test(text);
    };

    // Whole-word matching with negation check
    const matches = (word) => {
        const wordRegex = new RegExp(`\\b${word}\\b`, "i");
        return wordRegex.test(text) && !isNegated(word);
    };

    // Order of precedence: flexible → normal → urgent
    if (matches("flexible")) return "flexible";
    if (matches("normal")) return "normal";
    if (matches("urgent")) return "urgent";
    
    return "normal"; // default fallback
}

/**
 * Main AI Urgency Scorer
 */
export async function scoreUrgency(description = "") {
    if (!description || typeof description !== "string") return "normal";

    // ✅ Step 1: Rule-based check
    const localResult = getLocalUrgency(description);
    if (localResult) {
        console.log(`⚡ Urgency Rule Match: ${localResult}`);
        return localResult;
    }

    // ✅ Step 2: AI Call (Hugging Face)
    try {
        const HF_KEY = process.env.HF_API_KEY?.trim();
        if (!HF_KEY) {
            console.warn("⚠️ No HF_API_KEY found, falling back to 'normal'");
            return "normal";
        }

        // Using a model likely available on the router
        const MODEL_URL = "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3";
        const prompt = createUrgencyPrompt(description);

        const response = await fetch(MODEL_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: { 
                    max_new_tokens: 10,
                    temperature: 0.1,
                    return_full_text: false 
                }
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`HF API status: ${response.status} - ${errorBody}`);
        }

        const data = await response.json();
        const aiText = (Array.isArray(data) && data.length > 0) 
            ? (data[0].generated_text || "") 
            : (data.generated_text || "");
        
        const urgency = parseAIResponse(aiText || "");
        console.log(`🔥 Final Urgency Decision: ${urgency} (based on AI)`);
        
        return urgency;

    } catch (error) {
        console.error("❌ Urgency Scoring Error:", error.message);
        return "normal"; // Robust fallback
    }
}