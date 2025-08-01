const axios = require('axios');

async function testRolesAPI() {
  try {
    console.log('Testing roles API...');
    
    // Test without authentication first
    try {
      const response = await axios.get('http://localhost:5000/api/roles');
      console.log('✅ Roles API accessible:', response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('⚠️  Roles API requires authentication (expected)');
        
        // Test with a mock token
        try {
          const mockResponse = await axios.get('http://localhost:5000/api/roles', {
            headers: {
              'Authorization': 'Bearer mock-token'
            }
          });
          console.log('✅ Roles API with token:', mockResponse.data);
        } catch (authError) {
          console.log('❌ Auth error (expected):', authError.response?.data?.error || authError.message);
        }
      } else {
        console.log('❌ API Error:', error.message);
      }
    }
    
    // Test health endpoint
    try {
      const healthResponse = await axios.get('http://localhost:5000/health');
      console.log('✅ Server health:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server not running:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRolesAPI();