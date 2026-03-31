export function matchWorkers(job = {}, workers = []) {
  if (!Array.isArray(workers)) return [];

  const jobSkill = (job.requiredSkill || "").toLowerCase();
  const jobLocation = (job.location || "").toLowerCase();
  const jobBudget = Number(job.budget) || 0;
  const isUrgent = (job.urgency || "").toLowerCase() === "urgent";

  return workers
    .map(worker => {
      let score = 0;

      const workerSkill = (worker.skill || "").toLowerCase();
      const workerLocation = (worker.location || "").toLowerCase();

      // ✅ Skill match
      if (workerSkill === jobSkill) {
        score += 30;
      }

      // ✅ Location match
      if (workerLocation === jobLocation) {
        score += 20;
      }

      // ✅ Experience
      score += (worker.experience || 0) * 2;

      // ✅ Budget compatibility
      if (jobBudget >= (worker.minBudget || 0)) {
        score += 15;
      }

      // ✅ Rating
      score += (worker.rating || 0) * 5;

      // ✅ Urgency boost
      if (isUrgent) {
        score += 20;
      }

      return { ...worker, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}