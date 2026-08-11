import dns from 'node:dns';
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (e) {}

async function fetchJson(url) {
  const r = await fetch(url);
  return { status: r.status, body: await r.json() };
}

async function run() {
  const BASE = 'http://localhost:5000/api/products';

  // Step 1: GET /api/products
  const listRes = await fetchJson(`${BASE}?limit=20`);
  const products = listRes.body?.data?.products || [];
  console.log(`GET /api/products => HTTP ${listRes.status}`);
  console.log(`Products returned: ${products.length}`);
  console.log(`Total in DB (from pagination): ${listRes.body?.data?.pagination?.total}`);

  // Check all returned are DummyJSON
  const allDummy = products.every(p => p.tags?.includes('dummyjson'));
  console.log(`All products are DummyJSON: ${allDummy}`);

  // Sample titles
  console.log('\nSample product titles:');
  products.slice(0, 5).forEach(p => console.log(`  - ${p.title} | image: ${p.image?.substring(0,60)}`));

  // Step 2: GET /api/products/:id
  if (products.length > 0) {
    const sampleId = products[0].id || products[0]._id;
    const detailRes = await fetchJson(`${BASE}/${sampleId}`);
    const p = detailRes.body?.data;
    console.log(`\nGET /api/products/${sampleId} => HTTP ${detailRes.status}`);
    console.log(`  title: ${p?.title}`);
    console.log(`  brand: ${p?.brand}`);
    console.log(`  category: ${p?.category}`);
    console.log(`  price: ${p?.price}`);
    console.log(`  mrp: ${p?.mrp}`);
    console.log(`  rating: ${p?.rating}`);
    console.log(`  stock: ${p?.stock}`);
    console.log(`  image: ${p?.image?.substring(0,70)}`);
    console.log(`  images count: ${p?.images?.length}`);
    console.log(`  tags: ${JSON.stringify(p?.tags)}`);
  }

  // Step 3: Check image validity — no via.placeholder.com
  const placeholderImages = products.filter(p => p.image?.includes('placeholder'));
  console.log(`\nProducts with placeholder images: ${placeholderImages.length}`);

  // Step 4: Check featured/trending
  const featRes = await fetchJson(`${BASE}/featured?limit=8`);
  console.log(`\nGET /api/products/featured => ${featRes.body?.data?.products?.length} products`);
  const trendRes = await fetchJson(`${BASE}/trending?limit=8`);
  console.log(`GET /api/products/trending => ${trendRes.body?.data?.products?.length} products`);
}

run().catch(console.error);
