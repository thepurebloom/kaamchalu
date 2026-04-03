/**
 * test-urgency.js
 * Run:  node test-urgency.js
 * ─────────────────────────────────────────────
 * Requires the server to be running on port 4000
 */

const BASE = "http://localhost:4000/api/ai/score-urgency";

const TEST_CASES = [
  {
    label: "🚨 Emergency  → urgent",
    body: { description: "pipe leaking urgently", preferred_date: "today" },
    expected: "urgent",
  },
  {
    label: "🔧 Routine    → normal",
    body: { description: "AC service next week", preferred_date: "next week" },
    expected: "normal",
  },
  {
    label: "🎨 Future     → flexible",
    body: { description: "paint house someday", preferred_date: "no rush" },
    expected: "flexible",
  },
];

async function runTests() {
  console.log("\n====  Urgency Scorer — Integration Tests  ====\n");
  let passed = 0;

  for (const tc of TEST_CASES) {
    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tc.body),
      });

      const { urgency } = await res.json();
      const ok = urgency === tc.expected;

      console.log(`${ok ? "✅ PASS" : "❌ FAIL"}  ${tc.label}`);
      console.log(`         Got: "${urgency}"  |  Expected: "${tc.expected}"\n`);

      if (ok) passed++;
    } catch (err) {
      console.error(`❌ ERROR  ${tc.label}\n         ${err.message}\n`);
    }
  }

  console.log(`\n====  ${passed}/${TEST_CASES.length} tests passed  ====\n`);
}

runTests();
