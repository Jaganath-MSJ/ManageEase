const { validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const { sanitizeInput } = require('../utils/sanitize');

const getTasks = async (req, res) => {
  try {
    const { status, priority, assignedUser, search, page = 1, limit = 10 } = req.query;
    
    // Build filter based on user role
    const filter = {};
    
    // Regular users can only see their own tasks
    if (req.user.role !== 'admin') {
      filter.assignedUser = req.user._id;
    }
    
    // Apply additional filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedUser && req.user.role === 'admin') filter.assignedUser = assignedUser;
    
    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter)
      .populate('assignedUser', 'name email')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(filter);

    res.json({
      tasks,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: tasks.length,
        totalTasks: total
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedUser', 'name email')
      .populate('createdBy', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user can access this task
    if (req.user.role !== 'admin' && task.assignedUser._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ task });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    }

    const { title, description, assignedUser, priority, status, dueDate } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      title: sanitizeInput(title),
      description: description ? sanitizeInput(description) : undefined,
      assignedUser: assignedUser || req.user._id,
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: req.user._id
    };

    // Validate assigned user exists
    const userExists = await User.findById(sanitizedData.assignedUser);
    if (!userExists) {
      return res.status(400).json({ message: 'Assigned user does not exist' });
    }

    // Regular users can only assign tasks to themselves
    if (req.user.role !== 'admin' && sanitizedData.assignedUser !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only assign tasks to yourself' });
    }

    const task = new Task(sanitizedData);
    await task.save();

    await task.populate('assignedUser', 'name email');
    await task.populate('createdBy', 'name');

    res.status(201).json({
      message: 'Task created successfully',
      task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user can update this task
    if (req.user.role !== 'admin' && task.assignedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, assignedUser, priority, status, dueDate } = req.body;

    // Sanitize inputs
    const updates = {};
    if (title) updates.title = sanitizeInput(title);
    if (description !== undefined) updates.description = description ? sanitizeInput(description) : '';
    if (priority) updates.priority = priority;
    if (status) updates.status = status;
    if (dueDate !== undefined) updates.dueDate = dueDate ? new Date(dueDate) : null;

    // Handle assignedUser update (admin only)
    if (assignedUser && req.user.role === 'admin') {
      const userExists = await User.findById(assignedUser);
      if (!userExists) {
        return res.status(400).json({ message: 'Assigned user does not exist' });
      }
      updates.assignedUser = assignedUser;
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignedUser', 'name email')
      .populate('createdBy', 'name');

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user can delete this task
    if (req.user.role !== 'admin' && task.assignedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask
};