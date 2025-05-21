const User = require('./User');
const Book = require('./Book');
const Loan = require('./Loan');
const Notification = require('./Notification');

User.hasMany(Loan);
Loan.belongsTo(User);

Book.hasMany(Loan);
Loan.belongsTo(Book);

User.hasMany(Notification);
Notification.belongsTo(User);

module.exports = { User, Book, Loan, Notification };