// backend/verifyFilters.js
// Verification script to check the dynamic attribute filter generation API.

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
  console.log('🔍 Starting Dynamic Attribute Filter Generation API Verification...');
  console.log('💡 Ensure your server (npm run dev) is running on port 5000 before proceeding!\n');

  try {
    // 1. Get filters for category slug "laptops-computers"
    console.log('📡 Testing Endpoint: /api/categories/laptops-computers/filters ...');
    const res1 = await getJSON('http://localhost:5000/api/categories/laptops-computers/filters');
    console.log(`   Status Code: ${res1.statusCode}`);
    if (res1.statusCode === 200 && res1.body.success) {
      console.log(`   Category: "${res1.body.data.category.name}" (Slug: ${res1.body.data.category.slug})`);
      console.log(`   Filters Found: ${res1.body.data.filters.length}`);
      res1.body.data.filters.forEach((f, idx) => {
        console.log(`     [${idx + 1}] Name: ${f.name}, Slug: ${f.slug}, Type: ${f.type}`);
      });
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed:', res1.body);
    }

    // 2. Get filters for category slug "laptops-computers" and subcategory slug "gaming-laptops"
    console.log('\n📡 Testing Endpoint: /api/categories/laptops-computers/filters?subcategory=gaming-laptops ...');
    const res2 = await getJSON('http://localhost:5000/api/categories/laptops-computers/filters?subcategory=gaming-laptops');
    console.log(`   Status Code: ${res2.statusCode}`);
    if (res2.statusCode === 200 && res2.body.success) {
      console.log(`   Category: "${res2.body.data.category.name}"`);
      console.log(`   Subcategory: "${res2.body.data.subcategory.name}"`);
      console.log(`   Filters Found: ${res2.body.data.filters.length}`);
      res2.body.data.filters.forEach((f, idx) => {
        console.log(`     [${idx + 1}] Name: ${f.name}, Slug: ${f.slug}, Type: ${f.type}, Options: [${f.options.join(', ')}]`);
      });
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed:', res2.body);
    }

    // 3. Error Case: Non-existent category
    console.log('\n📡 Testing Error Handling: /api/categories/non-existent-category/filters ...');
    const res3 = await getJSON('http://localhost:5000/api/categories/non-existent-category/filters');
    console.log(`   Status Code: ${res3.statusCode}`);
    if (res3.statusCode === 404) {
      console.log(`   Correct Error Received! Message: "${res3.body.message}"`);
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed. Expected 404 but got:', res3.statusCode, res3.body);
    }

    // 4. Error Case: Non-existent subcategory
    console.log('\n📡 Testing Error Handling: /api/categories/laptops-computers/filters?subcategory=non-existent-subcat ...');
    const res4 = await getJSON('http://localhost:5000/api/categories/laptops-computers/filters?subcategory=non-existent-subcat');
    console.log(`   Status Code: ${res4.statusCode}`);
    if (res4.statusCode === 404) {
      console.log(`   Correct Error Received! Message: "${res4.body.message}"`);
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed. Expected 404 but got:', res4.statusCode, res4.body);
    }

    // 5. Error Case: Subcategory not belonging to category
    console.log('\n📡 Testing Error Handling (Mismatched Hierarchy): /api/categories/laptops-computers/filters?subcategory=smartphones ...');
    const res5 = await getJSON('http://localhost:5000/api/categories/laptops-computers/filters?subcategory=smartphones');
    console.log(`   Status Code: ${res5.statusCode}`);
    if (res5.statusCode === 400) {
      console.log(`   Correct Error Received! Message: "${res5.body.message}"`);
      console.log('✅ Success!');
    } else {
      console.log('❌ Failed. Expected 400 but got:', res5.statusCode, res5.body);
    }

  } catch (error) {
    console.error('❌ Verification failed with error:', error);
  }
};

verify();
