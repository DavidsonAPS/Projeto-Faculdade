const { Notification } = require('../models/associations');
const nodemailer = require('nodemailer');

class LoanObserver {
  static async notify(loan, eventType) {
    const user = await loan.getUser();
    const book = await loan.getBook();
    
    let message = '';
    switch(eventType) {
      case 'loan_created':
        message = `You have borrowed "${book.title}". Due date: ${loan.dueDate.toDateString()}`;
        break;
      case 'loan_returned':
        message = `You have returned "${book.title}". ${loan.fine > 0 ? `Fine: $${loan.fine}` : 'No fines'}`;
        break;
      case 'due_date_reminder':
        message = `Reminder: "${book.title}" is due tomorrow (${loan.dueDate.toDateString()})`;
        break;
    }
    
    // Save notification in DB
    await Notification.create({
      userId: user.id,
      message,
      type: eventType
    });
    
    // In a real app, you would send an email here
    console.log(`Notification sent to ${user.email}: ${message}`);
  }
}

module.exports = LoanObserver;