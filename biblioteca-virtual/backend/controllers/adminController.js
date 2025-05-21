const { Book, User } = require('../models/associations');

exports.addBook = async (req, res) => {
  try {
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({ where: { isAdmin: false } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};