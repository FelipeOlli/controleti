const router = require('express').Router();
const db = require('../db');
const multer = require('multer');
const Minio = require('minio');

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'minio',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

const BUCKET = process.env.MINIO_BUCKET || 'notas-fiscais';
const upload = multer({ storage: multer.memoryStorage() });

// Garante que o bucket existe
async function ensureBucket() {
  const exists = await minioClient.bucketExists(BUCKET);
  if (!exists) await minioClient.makeBucket(BUCKET, 'us-east-1');
}
ensureBucket().catch(console.error);

router.get('/', async (req, res) => {
  const [rows] = await db.query(
    `SELECT nf.*, p.item as pedido_item, e.nome as empresa_nome
     FROM notas_fiscais nf
     LEFT JOIN pedidos p ON nf.pedido_id = p.id
     LEFT JOIN empresas e ON p.empresa_id = e.id
     ORDER BY nf.created_at DESC`
  );
  res.json(rows);
});

router.get('/:id', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM notas_fiscais WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'NF nao encontrada' });
  res.json(rows[0]);
});

router.post('/', upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'xml', maxCount: 1 }]), async (req, res) => {
  const { pedido_id, numero_nf, fornecedor, cnpj_fornecedor, data_emissao, valor_nf } = req.body;
  let arquivo_pdf = null, arquivo_xml = null;
  if (req.files?.pdf) {
    const file = req.files.pdf[0];
    const name = `pdf/${Date.now()}_${file.originalname}`;
    await minioClient.putObject(BUCKET, name, file.buffer, file.size);
    arquivo_pdf = name;
  }
  if (req.files?.xml) {
    const file = req.files.xml[0];
    const name = `xml/${Date.now()}_${file.originalname}`;
    await minioClient.putObject(BUCKET, name, file.buffer, file.size);
    arquivo_xml = name;
  }
  const [result] = await db.query(
    'INSERT INTO notas_fiscais (pedido_id, numero_nf, fornecedor, cnpj_fornecedor, data_emissao, valor_nf, arquivo_pdf, arquivo_xml) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [pedido_id || null, numero_nf, fornecedor, cnpj_fornecedor, data_emissao, valor_nf, arquivo_pdf, arquivo_xml]
  );
  if (pedido_id) {
    await db.query('UPDATE pedidos SET nf_id = ? WHERE id = ?', [result.insertId, pedido_id]);
  }
  res.status(201).json({ id: result.insertId, message: 'NF criada com sucesso' });
});

router.delete('/:id', async (req, res) => {
  await db.query('DELETE FROM notas_fiscais WHERE id = ?', [req.params.id]);
  res.json({ message: 'NF removida com sucesso' });
});

module.exports = router;
