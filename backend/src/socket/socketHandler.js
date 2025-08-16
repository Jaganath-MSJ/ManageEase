const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketHandler {
  constructor(io) {
    this.io = io;
    this.connectedUsers = new Map();
    this.setupSocketAuth();
    this.setupEventHandlers();
  }

  setupSocketAuth() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user._id.toString();
        socket.userRole = user.role;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User ${socket.userId} connected`);
      this.connectedUsers.set(socket.userId, socket.id);

      // Join user-specific room
      socket.join(`user_${socket.userId}`);
      
      // Admin users join admin room
      if (socket.userRole === 'admin') {
        socket.join('admin');
      }

      socket.on('disconnect', () => {
        console.log(`User ${socket.userId} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });

      // Task-specific events
      socket.on('join_task', (taskId) => {
        socket.join(`task_${taskId}`);
      });

      socket.on('leave_task', (taskId) => {
        socket.leave(`task_${taskId}`);
      });
    });
  }

  // Emit task updates
  emitTaskUpdate(task, action) {
    // Notify assigned user
    this.io.to(`user_${task.assignedUser}`).emit('task_updated', {
      task,
      action,
      timestamp: new Date()
    });

    // Notify admins
    this.io.to('admin').emit('task_updated', {
      task,
      action,
      timestamp: new Date()
    });

    // Notify users in task room
    this.io.to(`task_${task._id}`).emit('task_updated', {
      task,
      action,
      timestamp: new Date()
    });
  }

  // Emit user updates
  emitUserUpdate(user, action) {
    this.io.to('admin').emit('user_updated', {
      user,
      action,
      timestamp: new Date()
    });
  }

  // Send notifications
  sendNotification(userId, notification) {
    this.io.to(`user_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date()
    });
  }
}

module.exports = SocketHandler;