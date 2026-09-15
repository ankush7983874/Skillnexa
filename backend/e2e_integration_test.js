const axios = require('axios');
const mongoose = require('mongoose');

const API_BASE = 'http://localhost:5000/api';

async function runTest() {
  console.log('--- STARTING COMPLETE E2E INTEGRATION TEST ---');
  let studentToken, companyToken, studentId, companyId, jobId, applicationId, interviewId;

  try {
    // 1. Register Student
    const ts = Date.now();
    console.log('[1] Registering Student...');
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: `Test Student ${ts}`,
      email: `student${ts}@test.com`,
      password: 'password123',
      role: 'STUDENT'
    });
    studentToken = regRes.data.data.token;
    console.log('    -> Student Registered. Token received.');

    // 2. Register Company
    console.log('[2] Registering Company...');
    const compRes = await axios.post(`${API_BASE}/auth/register`, {
      name: `Test Company ${ts}`,
      email: `company${ts}@test.com`,
      password: 'password123',
      role: 'COMPANY'
    });
    companyToken = compRes.data.data.token;
    console.log('    -> Company Registered. Token received.');

    // 3. Complete Company Profile
    console.log('[3] Completing Company Profile...');
    await axios.put(`${API_BASE}/companies/profile`, {
      companyName: `Test Company ${ts}`,
      industry: 'IT',
      description: 'Test description',
      location: 'New York',
      website: 'http://test.com'
    }, { headers: { Authorization: `Bearer ${companyToken}` } });
    console.log('    -> Company Profile updated.');

    // 3.5 Force verify company user
    console.log('[3.5] Force verifying company user in DB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/skillnexa');
    let cUserId = compRes.data.data.id || compRes.data.data._id;
    if(compRes.data.data.user) cUserId = compRes.data.data.user._id || compRes.data.data.user.id;
    
    await mongoose.connection.collection('users').updateOne(
        { _id: new mongoose.Types.ObjectId(cUserId) },
        { $set: { companyVerificationStatus: 'VERIFIED' } }
    );
    console.log('    -> Company User VERIFIED.');

    // 4. Create Job
    console.log('[4] Creating Job...');
    const jobRes = await axios.post(`${API_BASE}/jobs`, {
      title: 'Software Engineer',
      description: 'Build web apps',
      type: 'FULL_TIME',
      location: 'Remote',
      salaryRange: '$100k - $120k',
      requiredSkills: ['JavaScript', 'React', 'Node.js'],
      status: 'PUBLISHED',
      deadline: '2026-12-31'
    }, { headers: { Authorization: `Bearer ${companyToken}` } });
    jobId = jobRes.data.data._id;
    console.log(`    -> Job Created. ID: ${jobId}`);

    // 5. Complete Student Profile
    console.log('[5] Completing Student Profile...');
    const studRes = await axios.put(`${API_BASE}/students/profile`, {
      phone: '1234567890',
      college: 'Test University',
      degree: 'B.Tech',
      graduationYear: 2026,
      skills: [{ name: 'JavaScript' }, { name: 'React' }, { name: 'Node.js' }]
    }, { headers: { Authorization: `Bearer ${studentToken}` } });
    studentId = studRes.data.data._id;
    console.log('    -> Student Profile updated.');

    // 6. Student Applies for Job
    console.log('[6] Student Applying for Job...');
    const appRes = await axios.post(`${API_BASE}/applications/apply`, {
      jobId: jobId
    }, { headers: { Authorization: `Bearer ${studentToken}` } });
    applicationId = appRes.data.data._id;
    console.log(`    -> Application Created. ID: ${applicationId}`);

    // 7. Company Shortlists Application
    console.log('[7] Company Shortlisting Application...');
    await axios.patch(`${API_BASE}/applications/${applicationId}/status`, {
      status: 'SHORTLISTED'
    }, { headers: { Authorization: `Bearer ${companyToken}` } });
    console.log('    -> Application status changed to SHORTLISTED.');

    // 8. Company Schedules Interview
    console.log('[8] Company Scheduling Interview...');
    const intRes = await axios.post(`${API_BASE}/interviews/schedule`, {
      applicationId: applicationId,
      type: 'ONLINE',
      date: '2026-09-01',
      time: '10:00',
      locationLink: 'http://zoom.us/test',
      instructions: 'Be on time'
    }, { headers: { Authorization: `Bearer ${companyToken}` } });
    interviewId = intRes.data.data._id;
    console.log(`    -> Interview Scheduled. ID: ${interviewId}`);

    // 9. Company Completes Interview
    console.log('[9] Company Completing Interview...');
    await axios.patch(`${API_BASE}/interviews/${interviewId}`, {
      action: 'COMPLETE',
      data: {
        feedbackScore: 8,
        feedbackRemarks: 'Good'
      }
    }, { headers: { Authorization: `Bearer ${companyToken}` } });
    console.log('    -> Interview Completed.');

    // 10. Company Selects Candidate
    console.log('[10] Company Selecting Candidate...');
    await axios.patch(`${API_BASE}/applications/${applicationId}/status`, {
      status: 'SELECTED'
    }, { headers: { Authorization: `Bearer ${companyToken}` } });
    console.log('    -> Candidate SELECTED.');

    // 11. Student Checks Portfolio
    console.log('[11] Testing Portfolio Routes (Phase 9)...');
    await axios.post(`${API_BASE}/portfolio/projects`, {
      title: 'E2E Test Project',
      description: 'Works fine',
      techStack: 'Node'
    }, { headers: { Authorization: `Bearer ${studentToken}` } });
    console.log('    -> Portfolio project added.');

    console.log('\n✅ ALL E2E STEPS COMPLETED SUCCESSFULLY.');

  } catch (err) {
    console.error('\n❌ E2E TEST FAILED!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error(err.message);
    }
  } finally {
    await mongoose.disconnect();
  }
}

runTest();
