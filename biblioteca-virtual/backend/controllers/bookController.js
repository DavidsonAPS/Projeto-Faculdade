const { Book, Loan } = require('../models/associations');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { query } = req.query;
    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${query}%` } },
          { author: { [Op.like]: `%${query}%` } },
          { genre: { [Op.like]: `%${query}%` } },
          { isbn: { [Op.like]: `%${query}%` } }
        ]
      }
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookDetails = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};