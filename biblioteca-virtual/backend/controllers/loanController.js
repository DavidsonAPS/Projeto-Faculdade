const { Book, Loan, User, Notification } = require('../models/associations');
const LoanObserver = require('../observers/LoanObserver');

exports.borrowBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.bookId);
    if (!book || book.quantity < 1) {
      return res.status(400).json({ message: 'Book not available' });
    }
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks loan
    
    const loan = await Loan.create({
      userId: req.user.id,
      bookId: req.params.bookId,
      dueDate
    });
    
    book.quantity -= 1;
    await book.save();
    
    // Observer pattern - notify user
    LoanObserver.notify(loan, 'loan_created');
    
    res.status(201).json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.returnBook = async (req, res) => {
  try {
    const loan = await Loan.findByPk(req.params.loanId);
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    const book = await Book.findByPk(loan.bookId);
    book.quantity += 1;
    await book.save();
    
    loan.returnDate = new Date();
    loan.status = 'returned';
    
    // Calculate fine if late
    if (loan.returnDate > loan.dueDate) {
      const daysLate = Math.ceil((loan.returnDate - loan.dueDate) / (1000 * 60 * 60 * 24));
      loan.fine = daysLate * 2; // $2 per day
    }
    
    await loan.save();
    
    // Observer pattern - notify user
    LoanObserver.notify(loan, 'loan_returned');
    
    res.json(loan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};