const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Create default admin user if not exists
    await createDefaultAdmin();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

const createDefaultAdmin = async () => {
  try {
    const User = require('../models/User');

    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: '123',
        role: 'admin',
        region: {
          state: 'System',
          district: 'System',
          constituency: 'System'
        }
      });
      console.log('✅ Default admin user created (username: admin, password: 123)');
    }
  } catch (error) {
    console.error('Error creating default admin:', error.message);
  }
};

module.exports = connectDB;
