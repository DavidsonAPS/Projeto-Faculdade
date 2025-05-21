const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/:bookId/borrow', loanController.borrowBook);
router.post('/:loanId/return', loanController.returnBook);

module.exports = router;