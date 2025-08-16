const nodemailer = require('nodemailer');
const User = require('../models/User');
const Task = require('../models/Task');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendTaskAssignmentEmail(task) {
    try {
      const assignedUser = await User.findById(task.assignedUser);
      const createdByUser = await User.findById(task.createdBy);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: assignedUser.email,
        subject: `New Task Assigned: ${task.title}`,
        html: this.generateTaskAssignmentTemplate(task, assignedUser, createdByUser)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Assignment email sent to ${assignedUser.email}`);
    } catch (error) {
      console.error('Error sending assignment email:', error);
    }
  }

  async sendDueDateReminderEmail(task) {
    try {
      const assignedUser = await User.findById(task.assignedUser);

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: assignedUser.email,
        subject: `Task Due Soon: ${task.title}`,
        html: this.generateDueDateReminderTemplate(task, assignedUser)
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`Reminder email sent to ${assignedUser.email}`);
    } catch (error) {
      console.error('Error sending reminder email:', error);
    }
  }

  generateTaskAssignmentTemplate(task, assignedUser, createdByUser) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #3B82F6; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .task-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .priority-high { border-left: 4px solid #EF4444; }
          .priority-medium { border-left: 4px solid #F59E0B; }
          .priority-low { border-left: 4px solid #10B981; }
          .button { display: inline-block; background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ManageEase - New Task Assignment</h1>
          </div>
          <div class="content">
            <p>Hello ${assignedUser.name},</p>
            <p>You have been assigned a new task by ${createdByUser.name}:</p>
            
            <div class="task-details priority-${task.priority}">
              <h3>${task.title}</h3>
              <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
              <p><strong>Priority:</strong> ${task.priority.toUpperCase()}</p>
              <p><strong>Status:</strong> ${task.status.replace('-', ' ').toUpperCase()}</p>
              ${task.dueDate ? `<p><strong>Due Date:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
            </div>
            
            <p>Please log in to ManageEase to view and manage your tasks.</p>
            <a href="${process.env.FRONTEND_URL}/tasks" class="button">View Tasks</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateDueDateReminderTemplate(task, assignedUser) {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 20px; }
          .task-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #F59E0B; }
          .urgent { background: #FEE2E2; border-left-color: #EF4444; }
          .button { display: inline-block; background: #F59E0B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Task Due Soon</h1>
          </div>
          <div class="content">
            <p>Hello ${assignedUser.name},</p>
            <p>This is a reminder that you have a task due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue === 1 ? '' : 's'}`}:</p>
            
            <div class="task-details ${daysUntilDue <= 1 ? 'urgent' : ''}">
              <h3>${task.title}</h3>
              <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
              <p><strong>Due Date:</strong> ${dueDate.toLocaleDateString()}</p>
              <p><strong>Current Status:</strong> ${task.status.replace('-', ' ').toUpperCase()}</p>
            </div>
            
            <p>Please review and update your task status if needed.</p>
            <a href="${process.env.FRONTEND_URL}/tasks" class="button">Update Task</a>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new EmailService();