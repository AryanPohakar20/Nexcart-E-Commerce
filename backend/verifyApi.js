// backend/verifyApi.js
// Verification script to check if the category and subcategory APIs are working properly.

import http from 'http';

const getJSON = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

const verify = async () => {
  console.log('🔍 Starting API Server check...');

  try {
    // 1. Check Categories Endpoint
    console.log('📡 Fetching: http://localhost:5000/api/categories ...');
    const catRes = await getJSON('http://localhost:5000/api/categories');
    
    if (catRes.statusCode === 200) {
      const categories = catRes.body.data.categories;
      console.log(`✅ Category API works! Found ${categories.length} categories.`);
      console.log('   Categories list:', categories.map(c => c.name).join(', '));
    } else {
      console.log(`❌ Category API returned status ${catRes.statusCode}:`, catRes.body);
    }

    // 2. Check Subcategories Endpoint
    console.log('📡 Fetching: http://localhost:5000/api/subcategories ...');
    const subRes = await getJSON('http://localhost:5000/api/subcategories');
    
    if (subRes.statusCode === 200) {
      const subcategories = subRes.body.data.subcategories;
      console.log(`✅ Subcategory API works! Found ${subcategories.length} subcategories.`);
    } else {
      console.log(`❌ Subcategory API returned status ${subRes.statusCode}:`, subRes.body);
    }

    console.log('\n🌟 All APIs checked! Ensure your backend server (npm run dev) is running before running this.');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('\n❌ Connection Refused: Is your backend server running?');
      console.error('   Please run "npm run dev" in your backend folder first, then test again.');
    } else {
      console.error('❌ Verification failed with error:', error.message);
    }
  }
};

verify();
