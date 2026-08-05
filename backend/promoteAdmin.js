import 'dotenv/config';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

const promote = async () => {
  try {
    await connectDB();
    const result = await User.updateOne(
      { email: 'manjuadmin@example.com' },
      { $set: { role: 'admin' } }
    );
    console.log('Update result:', result);
    console.log('✅ User manjuadmin@example.com promoted to admin role!');
  } catch (error) {
    console.error('Promotion failed:', error);
  } finally {
    process.exit(0);
  }
};

promote();
