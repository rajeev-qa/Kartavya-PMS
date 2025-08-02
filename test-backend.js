const axios = require('axios');

async function testBackend(baseUrl) {
  console.log(`🔍 Testing backend at: ${baseUrl}`);
  console.log('=' .repeat(50));

  const tests = [
    { name: 'Health Check', url: `${baseUrl}/health` },
    { name: 'API Health', url: `${baseUrl}/api/health` },
    { name: 'Auth Endpoint', url: `${baseUrl}/api/auth/profile` },
    { name: 'Root Path', url: `${baseUrl}/` }
  ];

  for (const test of tests) {
    try {
      console.log(`\n📡 Testing: ${test.name}`);
      const response = await axios.get(test.url, { timeout: 5000 });
      console.log(`✅ Status: ${response.status}`);
      console.log(`📄 Response:`, JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log(`❌ Failed: ${test.name}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data?.error || error.response.statusText}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`   Error: Connection refused - Backend not running`);
      } else if (error.code === 'ENOTFOUND') {
        console.log(`   Error: Host not found - Check URL`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
  }
}

// Test different URLs
const testUrls = [
  'http://localhost:5000',
  'https://kartavya-pms-production.up.railway.app'
];

async function runTests() {
  for (const url of testUrls) {
    await testBackend(url);
    console.log('\n' + '='.repeat(50));
  }
}

runTests();