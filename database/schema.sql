-- ControleTI - Schema MariaDB
-- Charset: utf8mb4

CREATE DATABASE IF NOT EXISTS controleti CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE controleti;

-- Tabela: empresas
CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cnpj VARCHAR(18),
  responsavel VARCHAR(100),
  budget_total DECIMAL(15,2) DEFAULT 0.00,
  cor VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: cartoes
CREATE TABLE IF NOT EXISTS cartoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  banco VARCHAR(100),
  bandeira VARCHAR(50),
  quatro_ultimos CHAR(4),
  limite_total DECIMAL(15,2) DEFAULT 0.00,
  dia_vencimento INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: colaboradores
CREATE TABLE IF NOT EXISTS colaboradores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(150) NOT NULL,
  cargo VARCHAR(100),
  setor VARCHAR(100),
  empresa_id INT NOT NULL,
  data_entrada DATE,
  status ENUM('Aguardando Equipamento','Equipado') DEFAULT 'Aguardando Equipamento',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: notas_fiscais
CREATE TABLE IF NOT EXISTS notas_fiscais (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_nf VARCHAR(50),
  fornecedor VARCHAR(150),
  cnpj_fornecedor VARCHAR(18),
  data_emissao DATE,
  valor_nf DECIMAL(15,2),
  arquivo_pdf VARCHAR(500),
  arquivo_xml VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  cartao_id INT,
  nf_id INT,
  item VARCHAR(200) NOT NULL,
  quantidade INT DEFAULT 1,
  valor_unitario DECIMAL(15,2) DEFAULT 0.00,
  valor_total DECIMAL(15,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  forma_pagamento ENUM('Parcelado','A Vista') DEFAULT 'Parcelado',
  num_parcelas INT DEFAULT 1,
  status ENUM('Pendente','Comprado','Recebido','Distribuido') DEFAULT 'Pendente',
  data_compra DATE,
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (cartao_id) REFERENCES cartoes(id) ON DELETE SET NULL,
  FOREIGN KEY (nf_id) REFERENCES notas_fiscais(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabela: equipamentos
CREATE TABLE IF NOT EXISTS equipamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT,
  colaborador_id INT,
  tipo ENUM('Notebook','Monitor','Mouse','Headset','Memoria','Outros') NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(150),
  numero_serie VARCHAR(100),
  status ENUM('Estoque','Alocado','Manutencao','Baixado') DEFAULT 'Estoque',
  empresa_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE SET NULL,
  FOREIGN KEY (colaborador_id) REFERENCES colaboradores(id) ON DELETE SET NULL,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Dados iniciais: Empresas
INSERT INTO empresas (nome, cnpj, responsavel, budget_total, cor) VALUES
('Franquia', '', 'Felipe', 20000.00, '#3B82F6'),
('Smart', '', 'Felipe', 15000.00, '#10B981'),
('Onith', '', 'Felipe', 25000.00, '#F59E0B');

-- Dados iniciais: Pedidos Franquia
INSERT INTO pedidos (empresa_id, item, quantidade, valor_unitario, forma_pagamento, num_parcelas, status) VALUES
(1, 'Notebook', 4, 2389.00, 'Parcelado', 12, 'Pendente'),
(1, 'Monitor', 7, 498.99, 'Parcelado', 12, 'Pendente'),
(1, 'Mouse', 3, 34.99, 'Parcelado', 12, 'Pendente'),
(1, 'Headset', 5, 159.98, 'Parcelado', 12, 'Pendente'),
(1, 'Memoria RAM', 3, 180.00, 'A Vista', 1, 'Pendente');

-- Dados iniciais: Pedidos Smart
INSERT INTO pedidos (empresa_id, item, quantidade, valor_unitario, forma_pagamento, num_parcelas, status) VALUES
(2, 'Notebook', 3, 2389.00, 'Parcelado', 12, 'Pendente'),
(2, 'Monitor', 4, 498.99, 'Parcelado', 12, 'Pendente'),
(2, 'Headset', 4, 159.98, 'Parcelado', 12, 'Pendente');

-- Dados iniciais: Pedidos Onith
INSERT INTO pedidos (empresa_id, item, quantidade, valor_unitario, forma_pagamento, num_parcelas, status) VALUES
(3, 'Notebook', 5, 2389.00, 'Parcelado', 12, 'Pendente'),
(3, 'Monitor', 7, 498.99, 'Parcelado', 12, 'Pendente'),
(3, 'Mouse', 7, 34.99, 'Parcelado', 12, 'Pendente'),
(3, 'Headset', 7, 159.98, 'Parcelado', 12, 'Pendente'),
(3, 'Memoria RAM', 4, 180.00, 'A Vista', 1, 'Pendente');
