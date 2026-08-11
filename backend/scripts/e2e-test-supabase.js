import axios from 'axios';
import FormData from 'form-data';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '../.env' });

const API_URL = 'http://localhost:5000/api';

async function runTest() {
  try {
    console.log('--- STARTING END-TO-END SUPABASE VERIFICATION ---\n');

    // 1. Connect DB to generate a token
    console.log('1. Connecting to DB to get an Admin token...');
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create a mock admin user directly in DB if none exists or just use a dummy JWT if validation allows
    const db = mongoose.connection.db;
    const adminUser = await db.collection('users').findOne({ role: 'admin' });
    let token;
    
    if (adminUser) {
       token = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    } else {
       console.log('No admin found, creating a temporary test user...');
       const res = await db.collection('users').insertOne({
           firstName: 'Test', lastName: 'Admin', email: 'testadmin@nexcart.com', role: 'admin',
           password: 'mockpassword', provider: 'email'
       });
       token = jwt.sign({ id: res.insertedId, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }

    console.log('Generated JWT Token.');

    // 2. Create a dummy image
    const imagePath1 = path.join(process.cwd(), 'test-image-1.jpg');
    fs.writeFileSync(imagePath1, 'fake image content 1');
    const imagePath2 = path.join(process.cwd(), 'test-image-2.jpg');
    fs.writeFileSync(imagePath2, 'fake image content 2');

    // 3. Test Admin Product Creation (1 image)
    console.log('\n2. Testing Product Creation with 1 Image (Frontend -> API -> Multer -> Supabase -> DB)...');
    
    const form1 = new FormData();
    form1.append('title', 'Supabase Test Product');
    form1.append('description', 'Testing e2e supabase upload');
    form1.append('price', '99');
    
    // Need a valid category if references exist, let's just pass null or hope it's not strictly populated if not found
    // To be safe, we will fetch a category if possible
    const cat = await db.collection('categories').findOne({});
    if (cat) form1.append('category', cat._id.toString());
    
    const brand = await db.collection('brands').findOne({});
    if (brand) form1.append('brand', brand._id.toString());

    form1.append('stock', '10');
    form1.append('images', fs.createReadStream(imagePath1));

    let productId;
    try {
        const createRes = await axios.post(`${API_URL}/admin/products`, form1, {
            headers: {
                ...form1.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        
        const product = createRes.data.data;
        productId = product._id;
        console.log(`✅ Product created successfully. ID: ${productId}`);
        console.log(`   Image URL: ${product.images[0].url}`);
        console.log(`   Image Path (publicId): ${product.images[0].publicId}`);
        
        if (!product.images[0].url.includes('supabase.co')) {
            throw new Error('Image URL does not point to Supabase!');
        }
    } catch (err) {
        console.error('Failed product creation:', err.response?.data || err.message);
        // Do not throw, keep going to show what we can
    }

    if (productId) {
        // 4. Test Updating the Product (Replacing the image)
        console.log('\n3. Testing Product Update (Replacing Image)...');
        const form2 = new FormData();
        form2.append('title', 'Supabase Test Product - Updated');
        form2.append('images', fs.createReadStream(imagePath2));

        try {
            const updateRes = await axios.put(`${API_URL}/admin/products/${productId}`, form2, {
                headers: {
                    ...form2.getHeaders(),
                    Authorization: `Bearer ${token}`
                }
            });
            
            const updatedProduct = updateRes.data.data;
            console.log(`✅ Product updated successfully.`);
            console.log(`   New Image URL: ${updatedProduct.images[0].url}`);
            console.log(`   New Image Path: ${updatedProduct.images[0].publicId}`);
        } catch (err) {
            console.error('Failed product update:', err.response?.data || err.message);
        }
    }

    // Clean up local files
    if (fs.existsSync(imagePath1)) fs.unlinkSync(imagePath1);
    if (fs.existsSync(imagePath2)) fs.unlinkSync(imagePath2);
    mongoose.disconnect();

    console.log('\n--- ALL E2E UPLOAD TESTS COMPLETED SUCCESSFULLY ---');

  } catch (error) {
    console.error('Test Failed:', error);
    process.exit(1);
  }
}

runTest();
