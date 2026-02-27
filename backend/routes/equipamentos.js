const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const { empresa_id, status } = req.query;
  let sql = `SELECT eq.*, e.nome as empresa_nome, col.nome as colaborador_nome
    FROM equipamentos eq
    LEFT JOIN empresas e ON eq.empresa_id = e.id
    LEFT JOIN colaboradores col ON eq.colaborador_id = col.id
    WHERE 1=1`;
  const params = [];
  if (empresa_id) { sql += ' AND eq.empresa_id = ?'; params.push(empresa_id); }
  if (status) { sql += ' AND eq.status = ?'; params.push(status); }
  sql += ' ORDER BY eq.tipo, e.nome';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT eq.*, e.nome as empresa_nome FROM equipamentos eq LEFT JOIN empresas e ON eq.empresa_id = e.id WHERE eq.id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Equipamento nao encontrado' });
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const { pedido_id, empresa_id, tipo, marca, modelo, numero_serie } = req.body;
  const [result] = await db.query(
    'INSERT INTO equipamentos (pedido_id, empresa_id, tipo, marca, modelo, numero_serie) VALUES (?, ?, ?, ?, ?, ?)',
    [pedido_id || null, empresa_id, tipo, marca, modelo, numero_serie]
  );
  res.status(201).json({ id: result.insertId, message: 'Equipamento criado com sucesso' });
});

router.put('/:id', async (req, res) => {
  const { pedido_id, empresa_id, colaborador_id, tipo, marca, modelo, numero_serie, status } = req.body;
  await db.query(
    'UPDATE equipamentos SET pedido_id=?, empresa_id=?, colaborador_id=?, tipo=?, marca=?, modelo=?, numero_serie=?, status=? WHERE id=?',
    [pedido_id || null, empresa_id, colaborador_id || null, tipo, marca, modelo, numero_serie, status, req.params.id]
  );
  if (colaborador_id) {
    await db.query('UPDATE colaboradores SET status=? WHERE id=?', ['Equipado', colaborador_id]);
  }
  res.json({ message: 'Equipamento atualizado com sucesso' });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM equipamentos WHERE id = ?', [req.params.id]);
  res.json({ message: 'Equipamento removido com sucesso' });
});

module.exports = router;
