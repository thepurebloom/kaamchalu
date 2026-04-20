const fs = require('fs');
const baseUrl = 'http://localhost:3000/api/auth';

async function runTests() {
  let results = {};
  const signupEmail = `test${Date.now()}@example.com`;

  try {
    const signupRes = await fetch(`${baseUrl}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupEmail, password: 'testpassword123' })
    });
    results.signup = { status: signupRes.status, data: await signupRes.json() };

    const loginRes = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signupEmail, password: 'testpassword123' })
    });
    results.login = { status: loginRes.status, data: await loginRes.json() };

  } catch (error) {
    results.error = error.message;
  }
  
  fs.writeFileSync('test_out.json', JSON.stringify(results, null, 2), 'utf8');
}

runTests();
