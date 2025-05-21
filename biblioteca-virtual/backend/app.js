const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const { User, Book, Loan, Notification } = require('./models/associations');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const loanRoutes = require('./routes/loanRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);

// Database sync
sequelize.sync({ force: true }).then(() => {
  console.log('Database synced');
  
  // Create admin user
  User.create({
    name: 'Admin',
    email: 'admin@library.com',
    password: 'admin123',
    isAdmin: true
  });
  
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
}).catch(err => {
  console.error('Unable to sync database:', err);
});

// Rota para verificar token
app.get('/api/auth/verify', authMiddleware, (req, res) => {
    res.json({ valid: true, isAdmin: req.user.isAdmin });
});

// Rota para notificações
app.get('/api/notifications', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.findAll({ 
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para empréstimos do usuário
app.get('/api/loans', authMiddleware, async (req, res) => {
    try {
        const loans = await Loan.findAll({ 
            where: { userId: req.user.id },
            include: [Book],
            order: [['loanDate', 'DESC']]
        });
        res.json(loans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});