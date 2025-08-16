const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Task = require('./src/models/Task');
require('dotenv').config();

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/managease');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const admin = new User({
      name: 'Admin User',
      email: 'admin@managease.com',
      password: 'Admin123!',
      role: 'admin',
      contact: '+1-555-0100'
    });
    await admin.save();

    // Create regular users
    const user1 = new User({
      name: 'John Doe',
      email: 'john@managease.com',
      password: 'User123!',
      role: 'user',
      contact: '+1-555-0101'
    });
    await user1.save();

    const user2 = new User({
      name: 'Jane Smith',
      email: 'jane@managease.com',
      password: 'User123!',
      role: 'user',
      contact: '+1-555-0102'
    });
    await user2.save();

    // Create sample tasks
    const tasks = [
      {
        title: 'Setup project repository',
        description: 'Initialize Git repository and setup basic project structure',
        assignedUser: user1._id,
        priority: 'high',
        status: 'completed',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      },
      {
        title: 'Design user interface mockups',
        description: 'Create wireframes and mockups for the main user interface',
        assignedUser: user2._id,
        priority: 'medium',
        status: 'in-progress',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      },
      {
        title: 'Implement authentication system',
        description: 'Build secure login/logout functionality with JWT',
        assignedUser: user1._id,
        priority: 'high',
        status: 'todo',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      },
      {
        title: 'Write unit tests',
        description: 'Create comprehensive test suite for core functionality',
        assignedUser: user2._id,
        priority: 'medium',
        status: 'todo',
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      },
      {
        title: 'Deploy to production',
        description: 'Setup production environment and deploy application',
        assignedUser: admin._id,
        priority: 'low',
        status: 'todo',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: admin._id
      }
    ];

    await Task.insertMany(tasks);

    console.log('Sample data created successfully!');
    console.log('Default accounts:');
    console.log('Admin: admin@managease.com / Admin123!');
    console.log('User1: john@managease.com / User123!');
    console.log('User2: jane@managease.com / User123!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();