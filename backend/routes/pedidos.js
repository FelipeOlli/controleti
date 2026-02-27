const router = require('express').Router();
const db = require('../db');

// GET todos os pedidos com joins
router.get('/', async (req, res) => {
  const { empresa_id, status } = req.query;
  let sql = `SELECT p.*, e.nome as empresa_nome, e.cor as empresa_cor,
    c.banco, c.quatro_ultimos
    FROM pedidos p
    LEFT JOIN empresas e ON p.empresa_id = e.id
    LEFT JOIN cartoes c ON p.cartao_id = c.id
    WHERE 1=1`;
  const params = [];
  if (empresa_id) { sql += ' AND p.empresa_id = ?'; params.push(empresa_id); }
  if (status) { sql += ' AND p.status = ?'; params.push(status); }
  sql += ' ORDER BY p.created_at DESC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

// GET pedido por ID
router.get('/:id', async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.*, e.nome as empresa_nome FROM pedidos p
     LEFT JOIN empresas e ON p.empresa_id = e.id WHERE p.id = ?`,
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Pedido nao encontrado' });
  res.json(rows[0]);
});

// POST criar pedido
router.post('/', async (req, res) => {
  const { empresa_id, cartao_id, item, quantidade, valor_unitario, forma_pagamento, num_parcelas, status, data_compra, observacoes } = req.body;
  const [result] = await db.query(
    `INSERT INTO pedidos (empresa_id, cartao_id, item, quantidade, valor_unitario, forma_pagamento, num_parcelas, status, data_compra, observacoes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [empresa_id, cartao_id || null, item, quantidade || 1, valor_unitario || 0, forma_pagamento || 'Parcelado', num_parcelas || 1, status || 'Pendente', data_compra || null, observacoes || '']
  );
  res.status(201).json({ id: result.insertId, message: 'Pedido criado com sucesso' });
});

// PUT atualizar pedido
router.put('/:id', async (req, res) => {
  const { empresa_id, cartao_id, item, quantidade, valor_unitario, forma_pagamento, num_parcelas, status, data_compra, observacoes, nf_id } = req.body;
  await db.query(
    `UPDATE pedidos SET empresa_id=?, cartao_id=?, item=?, quantidade=?, valor_unitario=?,
     forma_pagamento=?, num_parcelas=?, status=?, data_compra=?, observacoes=?, nf_id=? WHERE id=?`,
    [empresa_id, cartao_id || null, item, quantidade, valor_unitario, forma_pagamento, num_parcelas, status, data_compra, observacoes, nf_id || null, req.params.id]
  );
  res.json({ message: 'Pedido atualizado com sucesso' });
});

// PATCH atualizar status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  await db.query('UPDATE pedidos SET status=? WHERE id=?', [status, req.params.id]);
  res.json({ message: 'Status atualizado com sucesso' });
});

// DELETE pedido
router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM pedidos WHERE id = ?', [req.params.id]);
  res.json({ message: 'Pedido removido com sucesso' });
});

module.exports = router;
