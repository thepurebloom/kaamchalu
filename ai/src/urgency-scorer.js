import fetch from "node-fetch";

export async function scoreUrgency(description = "") {
  try {
    if (!description || typeof description !== "string") {
      return "normal";
    }

    const API_URL = "http://localhost:5000/api/ai/score-urgency";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ description })
    });

    const data = await response.json();

    if (data.urgency && ["urgent", "normal", "flexible"].includes(data.urgency)) {
      return data.urgency;
    }

    return "normal";

  } catch (error) {
    console.error("❌ Local AI Server error:", error.message);
    return "normal"; // fallback
  }
}