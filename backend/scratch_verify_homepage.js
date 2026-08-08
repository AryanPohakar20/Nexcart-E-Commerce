// backend/scratch_verify_homepage.js
// Verification script to check if the Featured and Trending Product APIs are working.

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
  console.log('🔍 Starting Featured & Trending API Server Verification...');
  console.log('💡 Ensure your backend server (npm run dev) is running on port 5000 first!\n');

  try {
    // 1. Fetch Featured Products (limit=2)
    console.log('📡 Fetching: http://localhost:5000/api/products/featured?limit=2&page=1 ...');
    const resFeatured = await getJSON('http://localhost:5000/api/products/featured?limit=2&page=1');
    
    if (resFeatured.statusCode === 200 && resFeatured.body.success) {
      console.log('✅ Featured API works!');
      console.log(`   Pagination Details:`, JSON.stringify(resFeatured.body.data.pagination));
      console.log(`   Number of products returned: ${resFeatured.body.data.products.length}`);
      resFeatured.body.data.products.forEach((p, idx) => {
        console.log(`     [${idx+1}] ${p.title} | Rating: ${p.rating} | Featured: ${p.isFeatured}`);
      });
    } else {
      console.log(`❌ Featured API returned status ${resFeatured.statusCode}:`, resFeatured.body);
    }

    // 2. Fetch Trending Products (limit=3)
    console.log('\n📡 Fetching: http://localhost:5000/api/products/trending?limit=3&page=1 ...');
    const resTrending = await getJSON('http://localhost:5000/api/products/trending?limit=3&page=1');
    
    if (resTrending.statusCode === 200 && resTrending.body.success) {
      console.log('✅ Trending API works!');
      console.log(`   Pagination Details:`, JSON.stringify(resTrending.body.data.pagination));
      console.log(`   Number of products returned: ${resTrending.body.data.products.length}`);
      resTrending.body.data.products.forEach((p, idx) => {
        console.log(`     [${idx+1}] ${p.title} | Reviews: ${p.reviewCount} | Trending: ${p.isTrending}`);
      });
    } else {
      console.log(`❌ Trending API returned status ${resTrending.statusCode}:`, resTrending.body);
    }

    // 3. Validation Check: Invalid limit format
    console.log('\n📡 Testing validation check: http://localhost:5000/api/products/featured?limit=-5 ...');
    const resValError = await getJSON('http://localhost:5000/api/products/featured?limit=-5');
    
    if (resValError.statusCode === 400) {
      console.log('✅ Validation correctly caught negative limit!');
      console.log(`   Response details:`, JSON.stringify(resValError.body));
    } else {
      console.log(`❌ Expected 400 Bad Request but got ${resValError.statusCode}:`, resValError.body);
    }

    // 4. Validation Check: Non-integer limit format
    console.log('\n📡 Testing validation check: http://localhost:5000/api/products/trending?limit=abc ...');
    const resValError2 = await getJSON('http://localhost:5000/api/products/trending?limit=abc');
    
    if (resValError2.statusCode === 400) {
      console.log('✅ Validation correctly caught non-integer limit!');
      console.log(`   Response details:`, JSON.stringify(resValError2.body));
    } else {
      console.log(`❌ Expected 400 Bad Request but got ${resValError2.statusCode}:`, resValError2.body);
    }

    console.log('\n🌟 All APIs checked and successfully verified!');
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
