require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/paid-media');
    console.log('MongoDB Connected for Seeding');

    const demoEmail = 'demo@konvo.com';
    
    // Check if demo user already exists
    let demoUser = await User.findOne({ email: demoEmail });
    
    if (demoUser) {
      console.log('Demo user already exists. Updating wallet balance to 500 coins.');
      demoUser.walletBalance = 500;
      await demoUser.save();
    } else {
      console.log('Creating demo user...');
      demoUser = await User.create({
        name: 'Demo Evaluator',
        email: demoEmail,
        password: 'password123',
        walletBalance: 500,
      });
      console.log('Demo user created successfully!');
    }

    console.log('Seed complete! You can now log in with:');
    console.log(`Email: ${demoEmail}`);
    console.log('Password: password123');

  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
  } finally {
    mongoose.connection.close();
  }
};

seedDB();
