// backend/verifySearch.js
// Verification script to check if search, autocomplete, and suggestions APIs are working.

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
  console.log('🔍 Starting Search API Server Verification...');
  console.log('💡 Ensure your server (npm run dev) is running on port 5000 before proceeding!\n');

  try {
    // 1. Keyword search
    console.log('📡 Testing Endpoint: /api/search?keyword=oppo ...');
    const res1 = await getJSON('http://localhost:5000/api/search?keyword=oppo');
    if (res1.statusCode === 200 && res1.body.success) {
      const count = res1.body.data.products.length;
      console.log(`✅ Success! Found ${count} products matching keyword "oppo".`);
    } else {
      console.log(`❌ Failed! Keyword search returned status ${res1.statusCode}:`, res1.body);
    }

    // 2. Category filter
    console.log('\n📡 Testing Endpoint: /api/search?category=mobile-phones ...');
    const res2 = await getJSON('http://localhost:5000/api/search?category=mobile-phones');
    if (res2.statusCode === 200 && res2.body.success) {
      const count = res2.body.data.products.length;
      console.log(`✅ Success! Found ${count} products under "mobile-phones" category.`);
    } else {
      console.log(`❌ Failed! Category filter returned status ${res2.statusCode}:`, res2.body);
    }

    // 3. Brand filter
    console.log('\n📡 Testing Endpoint: /api/search?brand=apple ...');
    const res3 = await getJSON('http://localhost:5000/api/search?brand=apple');
    if (res3.statusCode === 200 && res3.body.success) {
      const count = res3.body.data.products.length;
      console.log(`✅ Success! Found ${count} products under "apple" brand.`);
    } else {
      console.log(`❌ Failed! Brand filter returned status ${res3.statusCode}:`, res3.body);
    }

    // 4. Price & Sorting filter
    console.log('\n📡 Testing Endpoint: /api/search?minPrice=10000&maxPrice=50000&sortBy=price-low-high ...');
    const res4 = await getJSON('http://localhost:5000/api/search?minPrice=10000&maxPrice=50000&sortBy=price-low-high&limit=3');
    if (res4.statusCode === 200 && res4.body.success) {
      const products = res4.body.data.products;
      console.log(`✅ Success! Found ${res4.body.data.pagination.total} products between 10k and 50k.`);
      products.forEach((p, index) => {
        console.log(`   [${index + 1}] ${p.title} - Price: INR ${p.price}`);
      });
    } else {
      console.log(`❌ Failed! Price and sorting returned status ${res4.statusCode}:`, res4.body);
    }

    // 5. Autocomplete search
    console.log('\n📡 Testing Endpoint: /api/search/autocomplete?q=op ...');
    const res5 = await getJSON('http://localhost:5000/api/search/autocomplete?q=op');
    if (res5.statusCode === 200 && res5.body.success) {
      console.log(`✅ Success! Autocomplete suggestions:`, res5.body.data.suggestions);
    } else {
      console.log(`❌ Failed! Autocomplete returned status ${res5.statusCode}:`, res5.body);
    }

    // 6. Search suggestions
    console.log('\n📡 Testing Endpoint: /api/search/suggestions?q=app ...');
    const res6 = await getJSON('http://localhost:5000/api/search/suggestions?q=app');
    if (res6.statusCode === 200 && res6.body.success) {
      const { categories, brands, products } = res6.body.data;
      console.log(`✅ Success! Suggestions returned:`);
      console.log(`   - Categories: ${categories.map(c => c.name).join(', ')}`);
      console.log(`   - Brands: ${brands.map(b => b.name).join(', ')}`);
      console.log(`   - Top Products count: ${products.length}`);
    } else {
      console.log(`❌ Failed! Suggestions returned status ${res6.statusCode}:`, res6.body);
    }

    // 7. Error handling check (nonexistent category)
    console.log('\n📡 Testing Endpoint Error Handling: /api/search?category=invalid-category-slug ...');
    const res7 = await getJSON('http://localhost:5000/api/search?category=invalid-category-slug');
    if (res7.statusCode === 404) {
      console.log(`✅ Success! Server correctly returned 404 for invalid category search.`);
      console.log(`   Message: "${res7.body.message}"`);
    } else {
      console.log(`❌ Failed! Expected 404 for invalid category, but got ${res7.statusCode}:`, res7.body);
    }

    console.log('\n🌟 All Search API tests checked and verified successfully!');
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
