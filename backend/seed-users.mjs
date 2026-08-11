import mongoose from 'mongoose';
import User from './src/models/User.js';

const MONGO_URI = 'mongodb://127.0.0.1:27017/nexcart';

const seedUsers = [
  { firstName: 'Test', lastName: 'Admin', email: 'admin@nexcart.test', password: 'admin123', role: 'admin', username: 'testadmin', phone: '9000000001' },
  { firstName: 'Test', lastName: 'CustA', email: 'custa@nexcart.test', password: 'cust123', role: 'customer', username: 'testcusta', phone: '9000000002' },
  { firstName: 'Test', lastName: 'CustB', email: 'custb@nexcart.test', password: 'cust123', role: 'customer', username: 'testcustb', phone: '9000000003' },
  { firstName: 'Test', lastName: 'Seller', email: 'seller@nexcart.test', password: 'seller123', role: 'marketplace_seller', username: 'testseller', phone: '9000000004' },
];

try {
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  await User.deleteMany({ email: { $in: seedUsers.map((u) => u.email) } });
  for (const u of seedUsers) {
    // Plain password — the User model's pre('save') hook hashes it.
    await User.create({ ...u, isVerified: true, status: 'Active' });
    console.log(`RECREATED ${u.email} role=${u.role}`);
  }
} catch (err) {
  console.error('SEED FAIL:', err.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
  process.exit();
}