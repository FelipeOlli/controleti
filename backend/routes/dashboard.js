const router = require('express').Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [[kpis]] = await db.query(`
    SELECT
      (SELECT COALESCE(SUM(valor_total),0) FROM pedidos) as total_orcamento,
      (SELECT COALESCE(SUM(valor_total),0) FROM pedidos WHERE status != 'Pendente') as total_comprado,
      (SELECT COUNT(*) FROM pedidos WHERE status = 'Recebido' OR status = 'Distribuido') as itens_recebidos,
      (SELECT COUNT(*) FROM colaboradores WHERE status = 'Aguardando Equipamento') as aguardando_equip,
      (SELECT COUNT(*) FROM pedidos WHERE status = 'Pendente') as pendentes,
      (SELECT COUNT(*) FROM pedidos WHERE status = 'Comprado') as comprados,
      (SELECT COUNT(*) FROM pedidos WHERE status = 'Recebido') as recebidos,
      (SELECT COUNT(*) FROM pedidos WHERE status = 'Distribuido') as distribuidos
  `);

  const [por_empresa] = await db.query(`
    SELECT e.nome, e.cor,
      COALESCE(SUM(p.valor_total),0) as total,
      COALESCE(SUM(CASE WHEN p.forma_pagamento='Parcelado' THEN p.valor_total ELSE 0 END),0) as parcelado,
      COALESCE(SUM(CASE WHEN p.forma_pagamento='A Vista' THEN p.valor_total ELSE 0 END),0) as a_vista,
      COUNT(p.id) as total_pedidos
    FROM empresas e
    LEFT JOIN pedidos p ON p.empresa_id = e.id
    GROUP BY e.id ORDER BY e.nome
  `);

  const [pipeline] = await db.query(`
    SELECT p.status, e.nome as empresa_nome, e.cor, p.item, p.quantidade, p.valor_total
    FROM pedidos p
    LEFT JOIN empresas e ON p.empresa_id = e.id
    ORDER BY p.status, e.nome
  `);

  res.json({ kpis, por_empresa, pipeline });
});

module.exports = router;
