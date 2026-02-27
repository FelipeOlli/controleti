const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const { empresa_id } = req.query;
  let sql = `SELECT col.*, e.nome as empresa_nome, e.cor as empresa_cor,
    eq.tipo as equipamento_tipo, eq.modelo as equipamento_modelo
    FROM colaboradores col
    LEFT JOIN empresas e ON col.empresa_id = e.id
    LEFT JOIN equipamentos eq ON eq.colaborador_id = col.id
    WHERE 1=1`;
  const params = [];
  if (empresa_id) { sql += ' AND col.empresa_id = ?'; params.push(empresa_id); }
  sql += ' ORDER BY e.nome, col.nome';
  const [rows] = await db.query(sql, params);
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query(
    'SELECT col.*, e.nome as empresa_nome FROM colaboradores col LEFT JOIN empresas e ON col.empresa_id = e.id WHERE col.id = ?',
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Colaborador nao encontrado' });
  res.json(rows[0]);
});

router.post('/', async (req, res) => {
  const { nome, cargo, setor, empresa_id, data_entrada } = req.body;
  const [result] = await db.query(
    'INSERT INTO colaboradores (nome, cargo, setor, empresa_id, data_entrada) VALUES (?, ?, ?, ?, ?)',
    [nome, cargo, setor, empresa_id, data_entrada || null]
  );
  res.status(201).json({ id: result.insertId, message: 'Colaborador criado com sucesso' });
});

router.put('/:id', async (req, res) => {
  const { nome, cargo, setor, empresa_id, data_entrada, status } = req.body;
  await db.query(
    'UPDATE colaboradores SET nome=?, cargo=?, setor=?, empresa_id=?, data_entrada=?, status=? WHERE id=?',
    [nome, cargo, setor, empresa_id, data_entrada, status, req.params.id]
  );
  res.json({ message: 'Colaborador atualizado com sucesso' });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM colaboradores WHERE id = ?', [req.params.id]);
  res.json({ message: 'Colaborador removido com sucesso' });
});

module.exports = router;
