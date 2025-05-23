const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/associations.js');
require('dotenv').config();

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        
        // Gera token com informação de admin
        const token = jwt.sign(
            { id: user.id, isAdmin: user.isAdmin }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        // Gera token com informação de admin
        const token = jwt.sign(
            { id: user.id, isAdmin: user.isAdmin }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};