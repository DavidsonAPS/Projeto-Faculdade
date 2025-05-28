const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Desativa logs SQL em produção
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Testar a conexão
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexão com MySQL estabelecida com sucesso!');
  } catch (error) {
    console.error('Falha ao conectar ao MySQL:', error);
  }
}

testConnection();

module.exports = sequelize;