const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';

// Create a dummy PDF file for testing
const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
fs.writeFileSync(dummyPdfPath, 'Dummy PDF content for testing');

let studentToken = '';
let studentId = '';

const testPhase9 = async () => {
    console.log('--- STARTING PHASE 9 TESTS ---');
    let passed = 0;
    let failed = 0;

    const assert = (condition, message) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    };

    try {
        // 1. Auth as Student
        console.log('\\n[1] Authenticating as Student...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'aarav.student@skillnexa.com',
            password: 'SecurePassword123'
        });
        studentToken = loginRes.data.data.token;
        studentId = loginRes.data.data.user.id;
        assert(studentToken, 'Student login successful and token received');

        const headers = { Authorization: `Bearer ${studentToken}` };

        // 2. Get Initial Portfolio
        console.log('\\n[2] Fetching initial portfolio...');
        let portfolioRes = await axios.get(`${API_URL}/portfolio`, { headers });
        let portfolio = portfolioRes.data.data;
        assert(portfolio !== null, 'Portfolio retrieved');
        assert(portfolio.profileCompletionPercentage !== undefined, `Completion percentage is ${portfolio.profileCompletionPercentage}%`);

        // 3. Add Project
        console.log('\\n[3] Adding a new project...');
        const projRes = await axios.post(`${API_URL}/portfolio/projects`, {
            title: 'Test Portfolio Project',
            description: 'A test project',
            techStack: ['React', 'Node'],
            githubUrl: 'https://github.com/test/test'
        }, { headers });
        
        const newProjId = projRes.data.data._id;
        assert(newProjId, 'Project added successfully');

        // 4. Update Privacy Settings
        console.log('\\n[4] Updating Privacy Settings...');
        const privRes = await axios.put(`${API_URL}/portfolio/privacy`, {
            privacySettings: { publicPortfolio: true }
        }, { headers });
        assert(privRes.data.data.publicPortfolio === true, 'Privacy settings updated successfully');

        // 5. Upload Resume
        console.log('\\n[5] Uploading Resume...');
        const formData = new FormData();
        formData.append('resume', fs.createReadStream(dummyPdfPath));
        
        const resumeRes = await axios.post(`${API_URL}/portfolio/resume`, formData, {
            headers: {
                ...headers,
                ...formData.getHeaders()
            }
        });
        assert(resumeRes.data.data.resumeUrl.includes('/uploads/resumes/'), 'Resume uploaded successfully');

        // 6. Verify profile completion increased
        console.log('\\n[6] Verifying Profile Completion Increase...');
        portfolioRes = await axios.get(`${API_URL}/portfolio`, { headers });
        assert(portfolioRes.data.data.profileCompletionPercentage > portfolio.profileCompletionPercentage, 
            `Completion percentage increased from ${portfolio.profileCompletionPercentage}% to ${portfolioRes.data.data.profileCompletionPercentage}%`);

        // Clean up
        fs.unlinkSync(dummyPdfPath);

    } catch (err) {
        console.error('Test execution failed:', err.response?.data || err.message);
        failed++;
    }

    console.log(`\\n--- TEST RESULTS ---`);
    console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
    if (failed > 0) process.exit(1);
};

testPhase9();
