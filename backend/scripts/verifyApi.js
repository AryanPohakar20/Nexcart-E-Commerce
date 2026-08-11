const baseUrl = 'http://localhost:5000/api';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function runTests() {
  try {
    console.log('--- TESTING PRODUCTS LIST ---');
    // Fetch products, verify pagination
    const productsRes = await fetchJson(`${baseUrl}/products?limit=5&page=1`);
    console.log('API Response structure:', Object.keys(productsRes));
    
    // Fallbacks if data structure is nested
    const data = productsRes.data || productsRes;
    const products = data.products || data.data || (Array.isArray(data) ? data : []);
    
    console.log(`Pagination: page ${data.page || 1}/${data.pages || 1}, total: ${data.totalProducts || data.total}`);
    console.log(`Returned products length: ${products.length}`);
    
    const sampleProduct = products[0];
    console.log('Sample Product properties:', Object.keys(sampleProduct).join(', '));
    
    console.log('\n--- TESTING PRODUCT DETAILS ---');
    const detailsRes = await fetchJson(`${baseUrl}/products/${sampleProduct.id || sampleProduct._id}`);
    const detailsData = detailsRes.data || detailsRes;
    console.log(`Product Details fetched: ${detailsData.title}`);
    console.log(`Tags:`, detailsData.tags);

    console.log('\n--- TESTING CATEGORY FILTER ---');
    const catRes = await fetchJson(`${baseUrl}/products?category=Beauty&limit=5`);
    const catData = catRes.data || catRes;
    console.log(`Category "Beauty" total: ${catData.totalProducts || catData.total}`);
    
    console.log('\n--- TESTING SEARCH ---');
    const searchRes = await fetchJson(`${baseUrl}/products?search=Mascara`);
    const searchData = searchRes.data || searchRes;
    console.log(`Search "Mascara" total: ${searchData.totalProducts || searchData.total}`);
    const searchProducts = searchData.products || (Array.isArray(searchData) ? searchData : []);
    if (searchProducts.length > 0) {
      console.log(`Found: ${searchProducts[0].title}`);
    }

    console.log('\n--- TESTING SORTING ---');
    const sortRes = await fetchJson(`${baseUrl}/products?sort=price_desc&limit=2`);
    const sortData = sortRes.data || sortRes;
    const sortProducts = sortData.products || (Array.isArray(sortData) ? sortData : []);
    console.log(`Highest price products:`);
    sortProducts.forEach(p => console.log(`- ${p.title} ($${p.price})`));
    
    console.log('\nTests Complete.');
  } catch (err) {
    console.error('Test failed:', err.message);
  }
}

runTests();
