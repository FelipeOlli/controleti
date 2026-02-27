const router = require('express').Router();
const db = require('../db');

// GET todas as empresas
router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM empresas ORDER BY nome');
  res.json(rows);
});

// GET empresa por ID
router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM empresas WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Empresa nao encontrada' });
  res.json(rows[0]);
});

// POST criar empresa
router.post('/', async (req, res) => {
  const { nome, cnpj, responsavel, budget_total, cor } = req.body;
  const [result] = await db.query(
    'INSERT INTO empresas (nome, cnpj, responsavel, budget_total, cor) VALUES (?, ?, ?, ?, ?)',
    [nome, cnpj, responsavel, budget_total || 0, cor || '#3B82F6']
  );
  res.status(201).json({ id: result.insertId, message: 'Empresa criada com sucesso' });
});

// PUT atualizar empresa
router.put('/:id', async (req, res) => {
  const { nome, cnpj, responsavel, budget_total, cor } = req.body;
  await db.query(
    'UPDATE empresas SET nome=?, cnpj=?, responsavel=?, budget_total=?, cor=? WHERE id=?',
    [nome, cnpj, responsavel, budget_total, cor, req.params.id]
  );
  res.json({ message: 'Empresa atualizada com sucesso' });
});

// DELETE empresa
router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM empresas WHERE id = ?', [req.params.id]);
  res.json({ message: 'Empresa removida com sucesso' });
});

module.exports = router;
