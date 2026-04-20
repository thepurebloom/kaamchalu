import fetch from "node-fetch";
import aiConfig from "../config/aiConfig.js";

const delay = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * Makes an AI inference call using local Ollama.
 */
export async function generateAIResponse(prompt, taskType = "classification") {
    const { baseUrl, defaultModel, maxRetries } = aiConfig.ollama;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🚀 [Ollama Attempt ${attempt}] Calling local AI model ${defaultModel}...`);
            
            const response = await fetch(baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: defaultModel,
                    prompt: prompt,
                    stream: false,
                    options: { temperature: 0.1 } // low temperature for deterministic classification
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Ollama HTTP Error: ${response.status} ${response.statusText} - ${errText}`);
            }

            const data = await response.json();
            const aiText = data.response;

            console.log(`🟢 [Ollama] Success response received.`);
            
            return {
                source: "ollama",
                text: aiText.trim(),
                confidence: 0.9,
                status: "success"
            };

        } catch (error) {
            console.error(`⚠️ [Ollama Attempt ${attempt}] Error:`, error.message);
            
            // Immediately break and return fallback if Ollama isn't running to save time
            if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
                 console.error("🛑 Ollama service is not running. Please start Ollama on localhost:11434.");
                 break; 
            }
            // If model is missing, inform the user to pull it
            if (error.message.includes("model") && error.message.includes("not found")) {
                 console.error(`🛑 Model '${defaultModel}' not found in local Ollama. Run: ollama pull ${defaultModel}`);
                 break;
            }

            if (attempt < maxRetries) {
                const sleepTime = attempt * 2000;
                console.log(`⏱️ Retrying in ${sleepTime}ms...`);
                await delay(sleepTime);
            }
        }
    }

    console.warn("🛡️ Ollama unavailable or exhausted retries. Using completely safe fallback response.");
    return fallbackResponse(taskType, "Local AI completely unavailable");
}

/**
 * Standardized fallback response
 */
function fallbackResponse(taskType, reason) {
    return {
        source: "fallback",
        text: taskType === 'urgency' ? "normal" : "fallback",
        status: "unknown",
        confidence: 0.5,
        message: reason
    };
}
