import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './src/models/User.js';
import { ROLES } from './src/constants/roles.constants.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@identiqal.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user found! Updating password to match the one in .env...');
      existingAdmin.passwordHash = passwordHash;
      existingAdmin.role = ROLES.ADMIN;
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      console.log('Admin password updated successfully!');
    } else {
      console.log('Creating new Admin user...');
      const adminUser = new User({
        email: adminEmail,
        username: 'identiqal_admin',
        passwordHash: passwordHash,
        name: 'Super Admin',
        role: ROLES.ADMIN,
        isVerified: true,
        onboardingCompleted: true,
      });

      await adminUser.save();
      console.log('Admin user created successfully!');
    }

    console.log('--- Credentials ---');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('-------------------');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
};

seedAdmin();
