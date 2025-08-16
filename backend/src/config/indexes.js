const mongoose = require('mongoose');

const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    
    // User indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    
    // Task indexes
    await db.collection('tasks').createIndex({ assignedUser: 1, status: 1 });
    await db.collection('tasks').createIndex({ dueDate: 1 });
    await db.collection('tasks').createIndex({ createdAt: -1 });
    await db.collection('tasks').createIndex({ priority: 1 });
    await db.collection('tasks').createIndex({ status: 1 });
    
    // Compound indexes for common queries
    await db.collection('tasks').createIndex({ 
      assignedUser: 1, 
      status: 1, 
      priority: 1 
    });
    
    // Text search index
    await db.collection('tasks').createIndex({ 
      title: 'text', 
      description: 'text' 
    });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = createIndexes;