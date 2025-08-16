const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { validateTask, validateTaskUpdate } = require('../middleware/validation');
const { authenticateToken, requireAdmin } = require('../utils/jwt');

// Apply authentication to all routes
router.use(authenticateToken);

// Create new task
router.post('/', validateTask, async (req, res) => {
  try {
    const { title, description, priority = 'medium', status = 'pending', assignedUser, dueDate } = req.body;
    
    // If user is not admin, they can only assign tasks to themselves
    let finalAssignedUser = assignedUser;
    if (req.user.role !== 'admin') {
      finalAssignedUser = req.user.userId;
    } else if (assignedUser) {
      // Verify the assigned user exists
      const userExists = await User.findById(assignedUser);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not exist'
        });
      }
    }

    const task = new Task({
      title,
      description,
      priority,
      status,
      assignedUser: finalAssignedUser,
      createdBy: req.user.userId,
      dueDate
    });

    const savedTask = await task.save();
    
    // Populate assigned user details
    await savedTask.populate('assignedUser', 'name email');
    await savedTask.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: savedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
});

// Get all tasks with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const priority = req.query.priority || '';
    const assignedUser = req.query.assignedUser || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // Build query based on user role
    let query = {};
    
    // Regular users can only see their own tasks
    if (req.user.role !== 'admin') {
      query.assignedUser = req.user.userId;
    }

    // Apply filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedUser && req.user.role === 'admin') {
      query.assignedUser = assignedUser;
    }

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder;

    // Get tasks and total count
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedUser', 'name email')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        tasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTasks: total,
          limit
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
});

// Get task by ID
router.get('/:id', async (req, res) => {
  try {
    const taskId = req.params.id;
    
    let query = { _id: taskId };
    
    // Regular users can only see their own tasks
    if (req.user.role !== 'admin') {
      query.assignedUser = req.user.userId;
    }

    const task = await Task.findOne(query)
      .populate('assignedUser', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
});

// Update task
router.put('/:id', validateTaskUpdate, async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;

    // Find the task first
    let query = { _id: taskId };
    
    // Regular users can only update their own tasks
    if (req.user.role !== 'admin') {
      query.assignedUser = req.user.userId;
      // Regular users cannot change assignment
      delete updates.assignedUser;
    } else if (updates.assignedUser) {
      // Verify the assigned user exists
      const userExists = await User.findById(updates.assignedUser);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not exist'
        });
      }
    }

    const updatedTask = await Task.findOneAndUpdate(
      query,
      updates,
      { new: true, runValidators: true }
    )
      .populate('assignedUser', 'name email')
      .populate('createdBy', 'name email');

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating task',
    });
  }
});
