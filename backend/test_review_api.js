// test_review_api.js
// A quick script to verify that the new reviews API is reachable and responding.

console.log('🔗 Connecting to Reviews API on http://localhost:5000...');

fetch('http://localhost:5000/api/product-reviews/product/60c72b2f9b1d8a001c888888')
  .then((res) => {
    console.log(`📡 HTTP Status Code received: ${res.status}`);
    return res.json();
  })
  .then((data) => {
    console.log('\n✅ Connection Successful! The API responded with:');
    console.log(JSON.stringify(data, null, 2));
  })
  .catch((err) => {
    console.error('\n❌ Could not connect to the API. Make sure your server is running!');
    console.error(err.message);
  });
