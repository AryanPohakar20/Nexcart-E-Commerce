async function fetchRaw(url) {
  const r = await fetch(url);
  return await r.json();
}
async function run() {
  const res = await fetchRaw('http://localhost:5000/api/products/trending?limit=8');
  console.log("TRENDING LENGTH:", res.data?.products?.length);
  if (res.data?.products) {
    console.log("TRENDING TITLES:", res.data.products.map(p => p.title));
  }
}
run();
