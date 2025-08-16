const cron = require('node-cron');
const Task = require('../models/Task');
const emailService = require('../services/emailService');

class EmailJobs {
  static startScheduledJobs() {
    // Daily reminder check at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily due date reminder check...');
      await this.sendDueDateReminders();
    });

    // Weekly overdue check on Mondays at 10 AM
    cron.schedule('0 10 * * 1', async () => {
      console.log('Running weekly overdue task check...');
      await this.sendOverdueTaskReminders();
    });
  }

  static async sendDueDateReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      // Find tasks due tomorrow
      const tasksDueSoon = await Task.find({
        dueDate: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        },
        status: { $ne: 'completed' }
      }).populate('assignedUser');

      for (const task of tasksDueSoon) {
        await emailService.sendDueDateReminderEmail(task);
      }

      console.log(`Sent ${tasksDueSoon.length} due date reminder emails`);
    } catch (error) {
      console.error('Error sending due date reminders:', error);
    }
  }

  static async sendOverdueTaskReminders() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdueTasks = await Task.find({
        dueDate: { $lt: today },
        status: { $ne: 'completed' }
      }).populate('assignedUser');

      for (const task of overdueTasks) {
        await emailService.sendOverdueTaskReminderEmail(task);
      }

      console.log(`Sent ${overdueTasks.length} overdue task reminder emails`);
    } catch (error) {
      console.error('Error sending overdue task reminders:', error);
    }
  }
}

module.exports = EmailJobs;