const http = require('http');

function makeRequest(path, method, data, token = null) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: path,
        method: method,
        headers: headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, body: body });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('--- TESTING 100% ASSESSMENT SCORE & VERIFIED SKILL BADGE ---');

  const loginRes = await makeRequest('/api/auth/login', 'POST', {
    email: 'aarav.student@skillnexa.com',
    password: 'SecurePassword123',
  });
  const token = loginRes.body?.data?.token;

  const listAssRes = await makeRequest('/api/assessments', 'GET', null, token);
  const javaAssessment = listAssRes.body?.data?.find((a) => a.skillName === 'Java');

  const qRes = await makeRequest(`/api/assessments/${javaAssessment._id}/take`, 'GET', null, token);
  const questions = qRes.body?.data?.questions || [];

  // Map answers dynamically based on question text
  const answersData = {
    answers: questions.map((q) => {
      let idx = 0;
      if (q.questionText.includes('HashMap')) idx = 2; // O(1)
      else if (q.questionText.includes('hiding internal object')) idx = 1; // Encapsulation
      else if (q.questionText.includes('prevent a method from being overridden')) idx = 1; // final
      return { questionId: q._id, selectedOptionIndex: idx };
    }),
  };

  const submitRes = await makeRequest(`/api/assessments/${javaAssessment._id}/submit`, 'POST', answersData, token);
  console.log('Evaluation Result (Target 100% Score):', JSON.stringify(submitRes.body?.data?.result, null, 2));

  const reProfileRes = await makeRequest('/api/students/profile', 'GET', null, token);
  console.log('\nUpdated Student Skills Array in Database:');
  console.log(JSON.stringify(reProfileRes.body?.data?.skills, null, 2));
}

runTests().catch(console.error);
