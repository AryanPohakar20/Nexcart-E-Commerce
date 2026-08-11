async function fetchRaw(url) {
  const r = await fetch(url);
  return await r.json();
}
async function run() {
  const p = await fetchRaw('http://localhost:5000/api/products?limit=1');
  console.log("GET /api/products keys:", Object.keys(p));
  console.log("data keys:", p.data ? Object.keys(p.data) : "No data field");
  console.log("Is data an array?", Array.isArray(p.data));
  if (!Array.isArray(p.data)) {
    console.log("If data is object, keys:", Object.keys(p.data));
    if (p.data.products) {
      console.log("Is data.products an array?", Array.isArray(p.data.products));
    }
  }

  const f = await fetchRaw('http://localhost:5000/api/products/featured');
  console.log("GET /api/products/featured keys:", Object.keys(f));
  console.log("data keys:", f.data ? Object.keys(f.data) : "No data field");
  console.log("Is data an array?", Array.isArray(f.data));
}
run();
