const { Book, User } = require('./models/associations');

async function seedDatabase() {
    // Criar alguns livros de exemplo
    await Book.bulkCreate([
        {
            title: 'Dom Casmurro',
            author: 'Machado de Assis',
            isbn: '9788535910663',
            genre: 'Literatura Brasileira',
            quantity: 5,
            description: 'Um clássico da literatura brasileira'
        },
        {
            title: '1984',
            author: 'George Orwell',
            isbn: '9788522106169',
            genre: 'Ficção Distópica',
            quantity: 3,
            description: 'Um romance sobre vigilância governamental e controle social'
        },
        {
            title: 'O Hobbit',
            author: 'J.R.R. Tolkien',
            isbn: '9788595084742',
            genre: 'Fantasia',
            quantity: 7,
            description: 'A aventura de Bilbo Bolseiro na Terra Média'
        }
    ]);

    // Criar um usuário normal
    await User.create({
        name: 'Usuário Teste',
        email: 'user@test.com',
        password: 'user123'
    });

    console.log('Database seeded successfully!');
}

const sequelize = require('./config/database');
sequelize.sync({ force: true }).then(() => {
    seedDatabase();
}).catch(err => {
    console.error('Unable to seed database:', err);
});