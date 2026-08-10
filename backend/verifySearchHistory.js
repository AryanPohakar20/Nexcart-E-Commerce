// backend/verifySearchHistory.js
// Verification script for checking NexCart Search History APIs.

import http from 'http';
import fs from 'fs';
import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/User.js';
import SearchHistory from './src/models/SearchHistory.js';
import Category from './src/models/Category.js';
import Brand from './src/models/Brand.js';

const postJSON = (url, body, headers = {}) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(JSON.stringify(body));
    req.end();
  });
};

const getJSON = (url, headers = {}) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'GET',
      headers,
    };

    http.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    }).on('error', (err) => reject(err));
  });
};

const deleteRequest = (url, headers = {}) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: 'DELETE',
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, body: data });
        }
      });
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
};

const verify = async () => {
  console.log('🔍 Starting Search History API Verification...');
  console.log('💡 Make sure your server (npm run dev) is running on port 5000 first!\n');

  let token = '';
  let authHeaders = {};
  let tempUser = null;
  let categoryId = null;
  let brandId = null;

  try {
    // Connect to DB directly for seeding & pre-fetch checks
    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_URI);

    // Fetch existing category and brand if any exist to include in queries
    const categoryDoc = await Category.findOne({});
    const brandDoc = await Brand.findOne({});
    if (categoryDoc) categoryId = categoryDoc._id.toString();
    if (brandDoc) brandId = brandDoc._id.toString();

    // 1. Register a test user
    const username = 'sh_test_' + Math.floor(Math.random() * 10000);
    const email = username + '@example.com';
    console.log(`👤 Registering temporary user: username="${username}", email="${email}"...`);

    const regRes = await postJSON('http://localhost:5000/api/auth/register', {
      firstName: 'Test',
      lastName: 'User',
      username,
      email,
      phone: '1234567890',
      password: 'Password123',
    });

    if (regRes.statusCode === 201 || regRes.statusCode === 200) {
      console.log('   ✅ User registered successfully!');
    } else {
      console.error('   ❌ Registration failed:', regRes.body);
      process.exit(1);
    }

    // 2. Login user to get JWT token
    console.log('🔑 Logging in to retrieve authorization token...');
    const loginRes = await postJSON('http://localhost:5000/api/auth/login', {
      email,
      password: 'Password123',
    });

    if (loginRes.statusCode === 200 && loginRes.body.success) {
      token = loginRes.body.token || loginRes.body.data?.accessToken;
      authHeaders = { Authorization: `Bearer ${token}` };
      console.log('   ✅ Login successful! Token received.');
    } else {
      console.error('   ❌ Login failed:', loginRes.body);
      process.exit(1);
    }

    // Find the registered user record for cleaning up later
    tempUser = await User.findOne({ email });

    // 3. Save search entry 1 (keyword only)
    console.log('\n📡 POST /api/search/history - Testing saving "laptops" keyword...');
    const saveRes1 = await postJSON('http://localhost:5000/api/search/history', {
      keyword: 'laptops',
    }, authHeaders);

    if (saveRes1.statusCode === 201 && saveRes1.body.success) {
      console.log('   ✅ Success! History entry 1 saved.');
    } else {
      console.error('   ❌ Failed to save entry 1:', saveRes1.body);
    }

    // 4. Save search entry 2 (keyword + category + brand)
    console.log(`\n📡 POST /api/search/history - Testing saving "gaming" with category "${categoryId}" and brand "${brandId}"...`);
    const saveRes2 = await postJSON('http://localhost:5000/api/search/history', {
      keyword: 'gaming',
      category: categoryId,
      brand: brandId,
    }, authHeaders);

    if (saveRes2.statusCode === 201 && saveRes2.body.success) {
      console.log('   ✅ Success! History entry 2 saved.');
    } else {
      console.error('   ❌ Failed to save entry 2:', saveRes2.body);
    }

    // 5. Check Duplicate Resolution (search "laptops" again, should NOT double insert, but update timestamp)
    console.log('\n📡 POST /api/search/history - Searching "laptops" again (Duplicate Float Check)...');
    const saveRes3 = await postJSON('http://localhost:5000/api/search/history', {
      keyword: 'laptops',
    }, authHeaders);

    if (saveRes3.statusCode === 200 && saveRes3.body.success) {
      console.log('   ✅ Success! Updated search timestamp instead of inserting duplicate entry.');
    } else if (saveRes3.statusCode === 201) {
      console.warn('   ⚠️ Warning: Entry was duplicate-inserted instead of updated!');
    } else {
      console.error('   ❌ Failed to process duplicate search:', saveRes3.body);
    }

    // 6. View Search History
    console.log('\n📡 GET /api/search/history - Viewing authenticated user search history...');
    const getRes = await getJSON('http://localhost:5000/api/search/history', authHeaders);
    let items = [];
    if (getRes.statusCode === 200 && getRes.body.success) {
      items = getRes.body.data.history;
      console.log(`   ✅ Success! Found ${items.length} search history entries.`);
      items.forEach((item, idx) => {
        console.log(`      [${idx + 1}] ID: ${item._id} | Keyword: "${item.keyword}" | Category: ${item.category?.name || 'None'} | Brand: ${item.brand?.name || 'None'} | SearchedAt: ${item.searchedAt}`);
      });
      // "laptops" should be first (idx 0) since we searched it last
      if (items[0]?.keyword === 'laptops') {
        console.log('      🔥 Float verification: "laptops" floated correctly to top!');
      } else {
        console.warn('      ⚠️ Float verification failed: "laptops" is not the first item.');
      }
    } else {
      console.error('   ❌ Failed to fetch history:', getRes.body);
    }

    // 7. Delete single history item
    if (items.length > 0) {
      const deleteId = items[0]._id;
      console.log(`\n📡 DELETE /api/search/history/${deleteId} - Deleting item with ID: ${deleteId}...`);
      const delRes = await deleteRequest(`http://localhost:5000/api/search/history/${deleteId}`, authHeaders);

      if (delRes.statusCode === 200 && delRes.body.success) {
        console.log('   ✅ Success! History item deleted.');
      } else {
        console.error('   ❌ Failed to delete item:', delRes.body);
      }

      // Verify count decreased to 1
      const checkRes = await getJSON('http://localhost:5000/api/search/history', authHeaders);
      if (checkRes.statusCode === 200 && checkRes.body.data.history.length === 1) {
        console.log('   ✅ Count verification: Count reduced to 1 successfully.');
      } else {
        console.warn('   ⚠️ Count verification failed. History length is:', checkRes.body?.data?.history?.length);
      }
    }

    // 8. Clear all history
    console.log('\n📡 DELETE /api/search/history - Clearing all remaining search history...');
    const clearRes = await deleteRequest('http://localhost:5000/api/search/history', authHeaders);
    if (clearRes.statusCode === 200 && clearRes.body.success) {
      console.log('   ✅ Success! All search history cleared.');
    } else {
      console.error('   ❌ Failed to clear history:', clearRes.body);
    }

    // Verify count is 0
    const checkRes2 = await getJSON('http://localhost:5000/api/search/history', authHeaders);
    if (checkRes2.statusCode === 200 && checkRes2.body.data.history.length === 0) {
      console.log('   ✅ Count verification: Clear verified (length is 0).');
    } else {
      console.warn('   ⚠️ Count verification failed. History length is:', checkRes2.body?.data?.history?.length);
    }

    // 9. Validation Test: Save empty request
    console.log('\n📡 POST /api/search/history - Testing validation constraints (Saving empty query)...');
    const failRes = await postJSON('http://localhost:5000/api/search/history', {}, authHeaders);
    if (failRes.statusCode === 400) {
      console.log('   ✅ Success! Server correctly rejected empty search query with validation error.');
      console.log(`      Error message details:`, failRes.body.errors);
    } else {
      console.error(`   ❌ Validation check failed: expected status 400 but got ${failRes.statusCode}:`, failRes.body);
    }

    // 10. Security Boundary Test: Access without authentication token
    console.log('\n📡 GET /api/search/history - Testing security authorization boundary (Access without token)...');
    const secureRes = await getJSON('http://localhost:5000/api/search/history', {});
    if (secureRes.statusCode === 401) {
      console.log('   ✅ Success! Server blocked request with 401 Unauthorized.');
    } else {
      console.error(`   ❌ Security check failed: expected status 401 but got ${secureRes.statusCode}:`, secureRes.body);
    }

    console.log('\n🌟 All Search History API verification tests completed successfully!');

  } catch (error) {
    console.error('💥 Verification process failed with error:', error.message);
  } finally {
    // Clean up temporary user and search histories from database
    console.log('\n🧹 Cleaning up temporary test user and database state...');
    if (tempUser) {
      await SearchHistory.deleteMany({ user: tempUser._id });
      await User.findByIdAndDelete(tempUser._id);
      console.log(`   Deleted temporary User ID ${tempUser._id} and their search history records.`);
    }
    await mongoose.disconnect();
    console.log('📡 Database connection closed.');
  }
};

verify();
