import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

try {
  await mongoose.connect('mongodb://127.0.0.1:27017/nexcart', { serverSelectionTimeoutMS: 8000 });
  const user = await User.find({ email: 'admin@nexcart.test' }).select('+password').lean();
  console.log('USER:', JSON.stringify(user, null, 1));
  console.log('MATCH plain admin123:', await bcrypt.compare('admin123', user[0].password));
  console.log('MATCH hashed admin123:', await bcrypt.compare(await bcrypt.hash('admin123', 10), user[0].password));
} catch (err) {
  console.error('FAIL:', err.message);
} finally {
  await mongoose.disconnect();
  process.exit();
}