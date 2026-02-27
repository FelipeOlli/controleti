require('dotenv').config();
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir frontend estatico
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Rotas API
app.use('/api/empresas', require('./routes/empresas'));
app.use('/api/cartoes', require('./routes/cartoes'));
app.use('/api/colaboradores', require('./routes/colaboradores'));
app.use('/api/pedidos', require('./routes/pedidos'));
app.use('/api/equipamentos', require('./routes/equipamentos'));
app.use('/api/notas-fiscais', require('./routes/notas_fiscais'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Rota fallback - serve o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// Handler de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`ControleTI rodando na porta ${PORT}`);
});

module.exports = app;
