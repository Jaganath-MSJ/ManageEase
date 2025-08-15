const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   POST api/tasks
// @desc    Create a task
// @access  Private
router.post('/', [
  auth,
  [
    check('title', 'Title is required').not().isEmpty(),
    check('assignedUser', 'Assigned user is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, assignedUser, priority, status, dueDate } = req.body;

    // Check if assigned user exists
    const user = await User.findById(assignedUser);
    if (!user) {
      return res.status(404).json({ message: 'Assigned user not found' });
    }

    // Create new task
    const newTask = new Task({
      title,
      description,
      assignedUser,
      priority,
      status,
      dueDate
    });

    const task = await newTask.save();

    res.status(201).json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tasks
// @desc    Get all tasks
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let tasks;
    
    // If admin, get all tasks, otherwise get only tasks assigned to the user
    if (req.user.role === 'admin') {
      tasks = await Task.find().populate('assignedUser', ['name', 'email']);
    } else {
      tasks = await Task.find({ assignedUser: req.user.id }).populate('assignedUser', ['name', 'email']);
    }
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/tasks/:id
// @desc    Get task by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedUser', ['name', 'email']);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to view this task
    if (req.user.role !== 'admin' && task.assignedUser._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to update this task
    if (req.user.role !== 'admin' && task.assignedUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, description, assignedUser, priority, status, dueDate } = req.body;
    
    // Build task object
    const taskFields = {};
    if (title) taskFields.title = title;
    if (description) taskFields.description = description;
    if (priority) taskFields.priority = priority;
    if (status) taskFields.status = status;
    if (dueDate) taskFields.dueDate = dueDate;
    
    // Only admin can reassign tasks
    if (assignedUser && req.user.role === 'admin') {
      // Check if new assigned user exists
      const user = await User.findById(assignedUser);
      if (!user) {
        return res.status(404).json({ message: 'Assigned user not found' });
      }
      taskFields.assignedUser = assignedUser;
    }

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    ).populate('assignedUser', ['name', 'email']);

    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has permission to delete this task
    if (req.user.role !== 'admin' && task.assignedUser.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await Task.findByIdAndRemove(req.params.id);

    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;