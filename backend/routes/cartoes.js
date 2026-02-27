const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query(
    `SELECT c.*, e.nome as empresa_nome, e.cor as empresa_cor,
     COALESCE(SUM(p.valor_total),0) as total_gasto
     FROM cartoes c
     LEFT JOIN empresas e ON c.empresa_id = e.id
     LEFT JOIN pedidos p ON p.cartao_id = c.id
     GROUP BY c.id ORDER BY e.nome`
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT c.*, e.nome as empresa_nome FROM cartoes c LEFT JOIN empresas e ON c.empresa_id = e.id WHERE c.id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Cartao nao encontrado' });
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const { empresa_id, banco, bandeira, quatro_ultimos, limite_total, dia_vencimento } = req.body;
  const [result] = await db.query(
    'INSERT INTO cartoes (empresa_id, banco, bandeira, quatro_ultimos, limite_total, dia_vencimento) VALUES (?, ?, ?, ?, ?, ?)',
    [empresa_id, banco, bandeira, quatro_ultimos, limite_total || 0, dia_vencimento || null]
  );
  res.status(201).json({ id: result.insertId, message: 'Cartao criado com sucesso' });
});

router.put('/:id', async (req, res) => {
  const { empresa_id, banco, bandeira, quatro_ultimos, limite_total, dia_vencimento } = req.body;
  await db.query(
    'UPDATE cartoes SET empresa_id=?, banco=?, bandeira=?, quatro_ultimos=?, limite_total=?, dia_vencimento=? WHERE id=?',
    [empresa_id, banco, bandeira, quatro_ultimos, limite_total, dia_vencimento, req.params.id]
  );
  res.json({ message: 'Cartao atualizado com sucesso' });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM cartoes WHERE id = ?', [req.params.id]);
  res.json({ message: 'Cartao removido com sucesso' });
});

module.exports = router;
