const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Adicione esta nova rota para verificar o token
router.get('/verify', (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ valid: false });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, isAdmin: decoded.isAdmin });
    } catch (error) {
        res.status(401).json({ valid: false });
    }
});

module.exports = router;