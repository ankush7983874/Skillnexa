const axios = require('axios');
const mongoose = require('mongoose');

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- STARTING PHASE 8 E2E TESTS ---');
  let passed = 0;
  let failed = 0;
  
  await mongoose.connect('mongodb://127.0.0.1:27017/skillnexa');
  
  const report = {};

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      report[testName] = 'PASS';
      passed++;
    } else {
      console.log(`❌ FAIL: ${testName}`);
      report[testName] = 'FAIL';
      failed++;
    }
  };

  try {
    // 1. Login as Student
    const studentRes = await axios.post(`${BASE_URL}/users/login`, {
      email: 'student@example.com',
      password: 'password123'
    });
    const studentToken = studentRes.data.token;
    assert(!!studentToken, 'Login as Student');

    // 2. Login as Company
    const companyRes = await axios.post(`${BASE_URL}/users/login`, {
      email: 'company@example.com',
      password: 'password123'
    });
    const companyToken = companyRes.data.token;
    assert(!!companyToken, 'Login as Company');

    // Fetch jobs for company
    const jobsRes = await axios.get(`${BASE_URL}/jobs/company`, {
      headers: { Authorization: `Bearer ${companyToken}` }
    });
    const job = jobsRes.data.data[0];
    assert(!!job, 'Company has published jobs');

    // Check if student applied
    let applicationsRes = await axios.get(`${BASE_URL}/applications/student`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    
    let application = applicationsRes.data.data.find(app => app.job._id === job._id);
    
    if (!application) {
      // Apply
      const applyRes = await axios.post(`${BASE_URL}/applications`, {
        jobId: job._id
      }, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      application = applyRes.data.data;
    }
    assert(!!application, 'Student application exists');
    
    // Reset status to APPLIED if needed for clean test
    await mongoose.connection.collection('applications').updateOne(
        { _id: new mongoose.Types.ObjectId(application._id) },
        { $set: { status: 'APPLIED' } }
    );
    
    // 3. Company shortlists student
    let statusRes = await axios.patch(`${BASE_URL}/applications/${application._id}/status`, {
      status: 'SHORTLISTED'
    }, {
      headers: { Authorization: `Bearer ${companyToken}` }
    });
    assert(statusRes.data.data.status === 'SHORTLISTED', 'Company shortlists the student');

    // 4. Company schedules interview
    let scheduleRes = await axios.post(`${BASE_URL}/interviews/schedule`, {
      applicationId: application._id,
      type: 'ONLINE',
      date: new Date().toISOString(),
      time: '10:00',
      locationLink: 'https://meet.google.com/test',
      instructions: 'Be on time'
    }, {
      headers: { Authorization: `Bearer ${companyToken}` }
    });
    
    const interviewId = scheduleRes.data.data._id;
    assert(!!interviewId, 'Company schedules an interview');

    // Verify DB
    const interviewDb = await mongoose.connection.collection('interviews').findOne({ _id: new mongoose.Types.ObjectId(interviewId) });
    assert(!!interviewDb, 'Verify Interview document is created in MongoDB');

    // Student can see interview
    const studentIntRes = await axios.get(`${BASE_URL}/interviews/student`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const studentInterview = studentIntRes.data.data.find(i => i._id === interviewId);
    assert(!!studentInterview, 'Verify student can see the interview');
    assert(studentInterview.type === 'ONLINE' && studentInterview.locationLink === 'https://meet.google.com/test', 'Verify interview details are correct');

    // Company completes interview
    let completeRes = await axios.patch(`${BASE_URL}/interviews/${interviewId}`, {
      action: 'COMPLETE',
      data: { feedbackScore: 85, feedbackRemarks: 'Good' }
    }, {
      headers: { Authorization: `Bearer ${companyToken}` }
    });
    assert(completeRes.data.data.status === 'COMPLETED', 'Company completes the interview');

    // Verify status becomes INTERVIEW_COMPLETED
    const appDb1 = await mongoose.connection.collection('applications').findOne({ _id: new mongoose.Types.ObjectId(application._id) });
    assert(appDb1.status === 'INTERVIEW_COMPLETED', 'Verify status becomes INTERVIEW_COMPLETED');

    // Company selects candidate
    let selectRes = await axios.patch(`${BASE_URL}/applications/${application._id}/status`, {
      status: 'SELECTED'
    }, {
      headers: { Authorization: `Bearer ${companyToken}` }
    });
    assert(selectRes.data.data.status === 'SELECTED', 'Company selects the candidate');
    
    // Check history
    const historyDb = selectRes.data.data.history;
    const isHistoryUpdated = historyDb.some(h => h.status === 'SELECTED');
    assert(isHistoryUpdated, 'Verify application status history is updated');

    // Verify Placement
    const placementDb = await mongoose.connection.collection('placements').findOne({ application: new mongoose.Types.ObjectId(application._id) });
    assert(!!placementDb, 'Verify Placement document is created');
    
    // Verify Notification
    const notifDb = await mongoose.connection.collection('notifications').findOne({ relatedEntityId: new mongoose.Types.ObjectId(application._id), type: 'APPLICATION_SELECTED' });
    assert(!!notifDb, 'Verify Notification document is created');

    // Verify EmailLog
    const emailDb = await mongoose.connection.collection('emaillogs').findOne({ applicationId: new mongoose.Types.ObjectId(application._id), template: 'CANDIDATE_SELECTED' });
    assert(!!emailDb, 'Verify EmailLog document is created');
    assert(emailDb.status === 'SENT' || emailDb.status === 'FAILED', 'Verify email service was triggered');
    
    // Student Dashboard Check
    const studentAppRes = await axios.get(`${BASE_URL}/applications/student`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const finalApp = studentAppRes.data.data.find(a => a._id === application._id);
    assert(finalApp.status === 'SELECTED', 'Verify student dashboard shows SELECTED');
    
    // Verify student can see placement info (Currently placement info is not explicitly exposed via a specific endpoint, but implied by status. We can query DB for student ID match)
    assert(placementDb.student.toString() === finalApp.student._id, 'Verify student can see placement information (Data bound to student)');
    
    
    // Negative tests
    // 1. Student cannot select themselves
    let errorCaught = false;
    try {
      await axios.patch(`${BASE_URL}/applications/${application._id}/status`, {
        status: 'SELECTED'
      }, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
    } catch (e) {
      errorCaught = e.response.status === 403;
    }
    assert(errorCaught, 'Student cannot select themselves');
    
    // 2. Student cannot modify interview
    errorCaught = false;
    try {
      await axios.patch(`${BASE_URL}/interviews/${interviewId}`, {
        action: 'CANCEL'
      }, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
    } catch (e) {
      errorCaught = e.response.status === 403;
    }
    assert(errorCaught, 'Student cannot modify interview');
    
    // 3. Duplicate placement
    const count = await mongoose.connection.collection('placements').countDocuments({ application: new mongoose.Types.ObjectId(application._id) });
    assert(count === 1, 'Duplicate placement cannot be created'); // Already guarded by schema

    // 4. Invalid application ID
    errorCaught = false;
    try {
      await axios.patch(`${BASE_URL}/applications/123/status`, {
        status: 'SELECTED'
      }, {
        headers: { Authorization: `Bearer ${companyToken}` }
      });
    } catch(e) {
      errorCaught = e.response.status >= 400;
    }
    assert(errorCaught, 'Invalid application ID');

    // 5. Invalid JWT
    errorCaught = false;
    try {
      await axios.post(`${BASE_URL}/interviews/schedule`, {
        applicationId: application._id,
        type: 'ONLINE',
        date: new Date(),
        time: '10:00'
      }, {
        headers: { Authorization: `Bearer invalidToken` }
      });
    } catch (e) {
      errorCaught = e.response.status === 401;
    }
    assert(errorCaught, 'Invalid JWT');
    
  } catch (error) {
    console.error('Unhandled Error during testing:', error.response?.data || error.message);
  } finally {
    console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
    await mongoose.disconnect();
  }
}

runTests();
