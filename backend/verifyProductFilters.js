// backend/verifyProductFilters.js
// Verification script to check the dynamic product attribute filtering inside the search API.

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
  console.log('🔍 Starting Dynamic Product Attribute Filtering API Verification...');
  console.log('💡 Ensure your server (npm run dev) is running on port 5000 before proceeding!\n');

  try {
    // Test Case 1: Core Search Category + Brand
    console.log('📡 [Test 1] Testing Category + Brand: /api/search?category=laptops-computers&brand=asus ...');
    const res1 = await getJSON('http://localhost:5000/api/search?category=laptops-computers&brand=asus&limit=3');
    console.log(`   Status Code: ${res1.statusCode}`);
    if (res1.statusCode === 200 && res1.body.success) {
      console.log(`   Total Products Found: ${res1.body.data.pagination.total}`);
      if (res1.body.data.products.length > 0) {
        console.log(`   Sample Product: "${res1.body.data.products[0].title}"`);
      }
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed:', res1.body);
    }

    // Test Case 2: Category + Dynamic Attribute Filter (RAM = 16GB)
    console.log('\n📡 [Test 2] Testing Category + RAM Attribute: /api/search?category=laptops-computers&ram=16GB ...');
    const res2 = await getJSON('http://localhost:5000/api/search?category=laptops-computers&ram=16GB&limit=3');
    console.log(`   Status Code: ${res2.statusCode}`);
    if (res2.statusCode === 200 && res2.body.success) {
      console.log(`   Total Products Found: ${res2.body.data.pagination.total}`);
      if (res2.body.data.products.length > 0) {
        console.log(`   Sample Product Specs Match:`);
        res2.body.data.products.forEach((p, idx) => {
          const specMap = p.specifications || {};
          console.log(`     [${idx + 1}] Title: ${p.title.slice(0, 50)}...`);
          console.log(`         Specs:`, JSON.stringify(specMap));
        });
      }
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed:', res2.body);
    }

    // Test Case 3: Multiple Attribute Filters (RAM = 16GB & Graphics Card = RTX 4060)
    console.log('\n📡 [Test 3] Testing Category + Subcategory + Multiple Attributes: /api/search?category=laptops-computers&subcategory=gaming-laptops&ram=16GB&graphics-card=RTX 4060 ...');
    const url3 = 'http://localhost:5000/api/search?category=laptops-computers&subcategory=gaming-laptops&ram=16GB&graphics-card=RTX+4060&limit=3';
    const res3 = await getJSON(url3);
    console.log(`   Status Code: ${res3.statusCode}`);
    if (res3.statusCode === 200 && res3.body.success) {
      console.log(`   Total Products Found: ${res3.body.data.pagination.total}`);
      if (res3.body.data.products.length > 0) {
        res3.body.data.products.forEach((p, idx) => {
          console.log(`     [${idx + 1}] Title: ${p.title.slice(0, 60)}...`);
          console.log(`         GPU: ${p.specifications?.['Graphics Card'] || p.specifications?.['graphics-card'] || 'N/A'}`);
          console.log(`         RAM: ${p.specifications?.['RAM Memory Installed Size'] || p.specifications?.['RAM'] || 'N/A'}`);
        });
      }
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed:', res3.body);
    }

    // Test Case 4: Mismatched Subcategory Hierarchy Error
    console.log('\n📡 [Test 4] Testing Hierarchy Error: /api/search?category=laptops-computers&subcategory=smartphones ...');
    const res4 = await getJSON('http://localhost:5000/api/search?category=laptops-computers&subcategory=smartphones');
    console.log(`   Status Code: ${res4.statusCode}`);
    if (res4.statusCode === 400) {
      console.log(`   Correct Error Received! Message: "${res4.body.message}"`);
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed. Expected 400 but got:', res4.statusCode, res4.body);
    }

    // Test Case 5: Non-existent Category Error
    console.log('\n📡 [Test 5] Testing Non-existent Category: /api/search?category=invalid-category-slug ...');
    const res5 = await getJSON('http://localhost:5000/api/search?category=invalid-category-slug');
    console.log(`   Status Code: ${res5.statusCode}`);
    if (res5.statusCode === 404) {
      console.log(`   Correct Error Received! Message: "${res5.body.message}"`);
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed. Expected 404 but got:', res5.statusCode, res5.body);
    }

  } catch (error) {
    console.error('❌ Verification failed with error:', error);
  }
};

verify();
