/**
 * ai/src/matching.js
 * 
 * Production-level intelligent worker matching.
 * Uses weighted scoring and urgency-based prioritization.
 */

/**
 * Calculates a match score (0-100+) for a worker against a job.
 * Weights: Skill (40), Location (25), Budget (20), Rating (15).
 * Boost: Urgency (+10).
 */
export function calculateScore(worker, job) {
  let score = 0;
  const reasons = [];

  // 1. Skill Match (40%)
  // Support both worker.skill (string) and worker.skills (array). 
  // Normalize and filter to avoid matching empty strings or non-string values.
  const jobSkill = (job.requiredSkill || "").toString().trim().toLowerCase();
  
  const workerSkillsRaw = Array.isArray(worker.skills) 
    ? worker.skills 
    : [(worker.skill || "")];

  const workerSkills = workerSkillsRaw
    .map(s => (s || "").toString().trim().toLowerCase())
    .filter(s => s !== "");

  if (jobSkill !== "" && workerSkills.includes(jobSkill)) {
    score += 40;
    reasons.push("Skill matched");
  }

  // 2. Location Match (25%)
  if ((worker.location || "").toLowerCase() === jobLocation) {
    score += 25;
    reasons.push("Nearby location");
  }

  // 3. Budget Match (20%)
  // Assuming worker.minBudget exists or default to 0
  const workerMinBudget = Number(worker.minBudget) || 0;
  if (jobBudget >= workerMinBudget) {
    score += 20;
    reasons.push("Fits your budget");
  }

  // 4. Rating (15%) - Base on 5-star scale
  const ratingScore = ((worker.rating || 0) / 5) * 15;
  score += ratingScore;
  if ((worker.rating || 0) >= 4.5) {
    reasons.push("Top-rated professional");
  }

  // 5. Urgency Boost (+10)
  if (jobUrgency === "urgent") {
    score += 10;
  }

  return {
    score: Math.round(score),
    reason: reasons.length > 0 ? reasons.join(" • ") : "General profile match"
  };
}

/**
 * Main matching engine.
 * Filters, scores, and sorts workers based on the job requirements.
 */
export function matchWorkers(job = {}, workers = []) {
  if (!Array.isArray(workers)) return [];

  console.log("👷 Starting matching for job:", job.requiredSkill, "in", job.location);

  const matched = workers.map(worker => {
    const { score, reason } = calculateScore(worker, job);
    return {
      ...worker,
      score,
      reason
    };
  });

  // Sort by score descending and return top 3
  const topWorkers = matched
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  console.log(`✅ Found ${topWorkers.length} top matches.`);
  return topWorkers;
}