import { generateAIResponse } from "./services/aiService.js";

/**
 * 1. Rule-based Pre-check (Quick Local Decisions)
 * Returns "fake" if a strong pattern is found, else null.
 */
function getLocalFakeStatus(text) {
  const lower = text.toLowerCase().trim();
  
  const fakePatterns = [
    "best ever", "100% perfect", "amazing amazing", 
    "unbelievably good", "miracle worker", "trust me", "hire hire hire"
  ];

  for (let pattern of fakePatterns) {
    if (lower.includes(pattern)) return "fake";
  }

  const words = lower.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 3) return "fake";

  return null;
}

/**
 * 2. Strict Prompt for Fake Detection (Optimized for TinyLlama)
 */
function createFakeDetectionPrompt(text) {
    return `You are a strict classifier. Classify if a job request is "real" or "fake".
Wait! A "real" job describes a clear task, need, or problem (like plumbing, wiring, cleaning).
A "fake" job is spam, generic robotic praise, or suspicious.

Respond with ONLY ONE valid value: "real" or "fake".
Do NOT write sentences. Do NOT explain.

Description: "${text}"
Format: real or fake
Output:`;
}

/**
 * 3. Safe Parsing Output
 */
function parseTinyLlamaFakeResponse(rawText) {
    const text = (rawText || "").toLowerCase().trim();

    // Prioritize "real" if model outputs something like "This is real"
    if (text.includes("real") && !text.includes("not real")) return "real";
    
    // Check for fake
    if (text.includes("fake")) return "fake";

    return "unknown"; 
}

/**
 * Main AI Fake Review Detector
 */
export async function detectFakeReview(text) {
  if (!text || typeof text !== "string") {
    console.warn("⚠️ detectFakeReview received invalid input:", text);
    return { status: "invalid", confidence: 0 };
  }

  // ✅ Step 1: Rule-based check (fast)
  const localResult = getLocalFakeStatus(text);
  if (localResult) {
    console.log(`⚡ Fake Check Rule Match: ${localResult}`);
    return { status: localResult, confidence: 1.0 };
  }

  // ✅ Step 2: AI Call
  try {
    const prompt = createFakeDetectionPrompt(text);
    const aiResponse = await generateAIResponse(prompt, "fake-detection");
    
    if (aiResponse?.status === "success") {
        const parsed = parseTinyLlamaFakeResponse(aiResponse.text);
        
        // Default to real if the AI hallucinated so we don't accidentally block normal users
        const finalStatus = parsed === "unknown" ? "real" : parsed;
        
        if (parsed === "unknown") {
            console.warn(`⚠️ TinyLlama Hallucination Detected on Fake Check. Defaulting to 'real'. Raw Output: "${aiResponse.text}"`);
        } else {
             console.log(`🔍 AI Review status: ${finalStatus} (Source: ${aiResponse.source})`);
        }

        return { status: finalStatus, confidence: 0.9 };
    }

    return { status: "real", confidence: 0.5, message: "AI unavailable, fallback used safely" }; // fallback safely to real

  } catch (error) {
    console.error("❌ AI Fake Detection pipeline failed:", error.message);
    return {
        status: "real", // Assume real if pipeline completely fails
        confidence: 0.5,
        message: "AI pipeline completely unavailable"
    };
  }
}

/**
 * Batch detector for filtering a list of reviews.
 */
export async function filterRealReviews(reviews = []) {
  console.log(`🔍 AI reviewing ${reviews.length} feedback posts...`);
  
  const results = await Promise.all(reviews.map(async rev => {
    const text = (typeof rev === "string") ? rev : (rev?.text || rev?.body || String(rev || ""));
    try {
        const check = await detectFakeReview(text);
        return { rev, status: check.status };
    } catch (err) {
        return { rev, status: "unknown" };
    }
  }));

  return results.filter(r => r.status !== "fake").map(r => r.rev);
}
