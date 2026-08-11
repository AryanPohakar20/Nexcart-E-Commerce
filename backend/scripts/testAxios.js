import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
});

async function run() {
  const response = await axiosInstance.get('/products?limit=1');
  const prodRes = response.data;
  
  console.log("prodRes keys:", Object.keys(prodRes));
  if (prodRes.data) {
    console.log("prodRes.data keys:", Object.keys(prodRes.data));
    console.log("Is prodRes.data.products an array?", Array.isArray(prodRes.data.products));
    console.log("prodRes.data.products length:", prodRes.data.products.length);
  }
}

run();
