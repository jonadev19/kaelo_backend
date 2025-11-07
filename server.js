const express = require('express');
const sequelize = require('./src/config/database');
require('dotenv').config();

const app = express();

// Conectar a la base de datos
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL conectado...');
    // Sincronizar modelos
    await sequelize.sync();
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    process.exit(1);
  }
};

connectDB();

// Middlewares
app.use(express.json({ extended: false }));

// CORS
const cors = require('cors');
app.use(cors());

app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Definir Rutas
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/routes', require('./src/routes/routes'));
app.use('/api/stores', require('./src/routes/stores'));
app.use('/api/transactions', require('./src/routes/transactions'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Servidor iniciado en el puerto ${PORT}`));
