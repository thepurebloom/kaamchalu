/**
 * ai/src/fake-review-detector.js
 * 
 * New AI feature to identify potentially fake reviews based on patterns.
 */

/**
 * Checks if a review text is potentially fake or suspicious.
 * Detects patterns like excessive superlatives, repetitive keywords, or unnatural phrasing.
 */
/**
 * Checks if a review text is potentially fake or suspicious.
 * @param {string} text - The review text to analyze.
 * @returns {"real" | "fake" | "invalid"}
 */
export function detectFakeReview(text) {
  if (!text || typeof text !== "string") {
    console.warn("⚠️ detectFakeReview received invalid input:", text);
    return "invalid";
  }

  const lower = text.toLowerCase().trim();
  
  const fakePatterns = [
    "best ever", 
    "100% perfect", 
    "amazing amazing", 
    "unbelievably good", 
    "miracle worker", 
    "trust me", 
    "hire hire hire"
  ];

  // Rule-based logic: return "fake" if any suspicious pattern is found
  for (let pattern of fakePatterns) {
    if (lower.includes(pattern)) {
      console.log(`🤖 FAKE DETECTED: Found suspicious pattern "${pattern}" in review.`);
      return "fake";
    }
  }

  // Length check: extremely short reviews (less than 3 words) are often generic
  const words = lower.split(/\s+/).filter(w => w.length > 0);
  if (words.length < 3) {
    console.log("🤖 FAKE DETECTED: Review too short/generic.");
    return "fake";
  }

  return "real";
}

/**
 * Batch detector for filtering a list of reviews.
 * Normalizes input objects (e.g., {text, author}) into strings for detection.
 * @param {Array<string|Object>} reviews - List of review strings or objects with 'text' or 'body' properties.
 */
export function filterRealReviews(reviews = []) {
  console.log(`🔍 AI reviewing ${reviews.length} feedback posts...`);
  return reviews.filter(rev => {
    // Normalize input to string
    const text = (typeof rev === "string") 
      ? rev 
      : (rev?.text || rev?.body || String(rev || ""));
    
    return detectFakeReview(text) === "real";
  });
}
