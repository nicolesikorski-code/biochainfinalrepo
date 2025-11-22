-- BioChain MVP - Schema SQL para Supabase
-- Copiar y pegar este archivo completo en el SQL Editor de Supabase

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla: users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('researcher', 'data_contributor')),
  wallet_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: medical_history
CREATE TABLE medical_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  age INTEGER,
  height DECIMAL,
  weight DECIMAL,
  uses_contraceptives BOOLEAN,
  contraceptive_type TEXT,
  contraceptive_duration TEXT,
  last_period_date DATE,
  regular_cycles BOOLEAN,
  has_been_pregnant BOOLEAN,
  hormonal_conditions TEXT[],
  chronic_conditions TEXT[],
  allergies TEXT[],
  current_medications TEXT[],
  smokes TEXT CHECK (smokes IN ('yes', 'no', 'ex_smoker')),
  alcohol_consumption TEXT CHECK (alcohol_consumption IN ('never', 'occasional', 'regular')),
  physical_activity TEXT CHECK (physical_activity IN ('sedentary', 'moderate', 'high')),
  consent_signed BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: blood_tests
CREATE TABLE blood_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_hash TEXT UNIQUE NOT NULL,
  blockchain_hash TEXT,
  stellar_transaction_id TEXT,
  lab_name TEXT,
  test_date DATE,
  extracted_data JSONB,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: researcher_credits
CREATE TABLE researcher_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  researcher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  biochain_balance INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  researcher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  report_data JSONB NOT NULL,
  blood_tests_used UUID[],
  cost_in_biochain INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: user_earnings
CREATE TABLE user_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  amount_usdc DECIMAL(10, 2),
  transaction_hash TEXT,
  stellar_transaction_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_blood_tests_user ON blood_tests(user_id);
CREATE INDEX idx_blood_tests_hash ON blood_tests(file_hash);
CREATE INDEX idx_reports_researcher ON reports(researcher_id);
CREATE INDEX idx_user_earnings_user ON user_earnings(user_id);

-- ============================================
-- DATOS DE PRUEBA
-- ============================================

-- Usuario investigador con 5 créditos
INSERT INTO users (email, role, wallet_address)
VALUES ('researcher@biochain.com', 'researcher', 'GATESTNR2WOFLCYIZKVLCQBVW2UYZMKYFEWZK4OXJHSXQJWM4J6EXAMPLE');

-- Asignar créditos al investigador
INSERT INTO researcher_credits (researcher_id, biochain_balance)
VALUES ((SELECT id FROM users WHERE email = 'researcher@biochain.com'), 5);

-- Usuarios contribuyentes de prueba
INSERT INTO users (email, role, wallet_address) VALUES
('user1@biochain.com', 'data_contributor', 'GATEST1WOF2CYIZKVLCQBVW2UYZMKYFEWZK4OXJHSXQJWM4J6EXAMPLE1'),
('user2@biochain.com', 'data_contributor', 'GATEST2WOF3CYIZKVLCQBVW2UYZMKYFEWZK4OXJHSXQJWM4J6EXAMPLE2'),
('user3@biochain.com', 'data_contributor', 'GATEST3WOF4CYIZKVLCQBVW2UYZMKYFEWZK4OXJHSXQJWM4J6EXAMPLE3');

-- Historias clínicas de prueba
INSERT INTO medical_history (
  user_id, age, height, weight, uses_contraceptives, contraceptive_type,
  contraceptive_duration, regular_cycles, has_been_pregnant,
  hormonal_conditions, chronic_conditions, allergies, current_medications,
  smokes, alcohol_consumption, physical_activity, consent_signed
) VALUES
(
  (SELECT id FROM users WHERE email = 'user1@biochain.com'),
  25, 165, 60, true, 'Píldora combinada', '2 años', true, false,
  ARRAY['Ninguna'], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
  'no', 'occasional', 'moderate', true
),
(
  (SELECT id FROM users WHERE email = 'user2@biochain.com'),
  30, 170, 65, true, 'DIU hormonal', '3 años', true, true,
  ARRAY['SOP (Síndrome de Ovario Poliquístico)'], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
  'no', 'never', 'high', true
),
(
  (SELECT id FROM users WHERE email = 'user3@biochain.com'),
  28, 162, 58, false, null, null, false, false,
  ARRAY['Ninguna'], ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[],
  'ex_smoker', 'occasional', 'moderate', true
);

-- Estudios de sangre de prueba con datos hormonales
INSERT INTO blood_tests (
  user_id, file_url, file_hash, blockchain_hash, stellar_transaction_id,
  lab_name, test_date, extracted_data, processed
) VALUES
(
  (SELECT id FROM users WHERE email = 'user1@biochain.com'),
  'mock-url-1', 'hash123abc001', 'blockchain_hash_1', 'stellar_tx_1',
  'Laboratorio Central', '2024-10-15',
  '{"hormones": {"progesterone": "14.2 ng/mL", "estrogen": "145 pg/mL", "testosterone": "0.5 ng/mL", "fsh": "6.2 mIU/mL", "lh": "8.5 mIU/mL"}, "patient_data_removed": true, "processed_with_cvm": true}'::jsonb,
  true
),
(
  (SELECT id FROM users WHERE email = 'user2@biochain.com'),
  'mock-url-2', 'hash456def002', 'blockchain_hash_2', 'stellar_tx_2',
  'Lab Consulmed', '2024-10-20',
  '{"hormones": {"progesterone": "12.8 ng/mL", "estrogen": "160 pg/mL", "testosterone": "0.7 ng/mL", "fsh": "5.8 mIU/mL", "lh": "9.2 mIU/mL"}, "patient_data_removed": true, "processed_with_cvm": true}'::jsonb,
  true
),
(
  (SELECT id FROM users WHERE email = 'user3@biochain.com'),
  'mock-url-3', 'hash789ghi003', 'blockchain_hash_3', 'stellar_tx_3',
  'Diagnóstico Integral', '2024-11-01',
  '{"hormones": {"progesterone": "11.5 ng/mL", "estrogen": "140 pg/mL", "testosterone": "0.4 ng/mL", "fsh": "7.1 mIU/mL", "lh": "7.8 mIU/mL"}, "patient_data_removed": true, "processed_with_cvm": true}'::jsonb,
  true
),
(
  (SELECT id FROM users WHERE email = 'user1@biochain.com'),
  'mock-url-4', 'hash123abc004', 'blockchain_hash_4', 'stellar_tx_4',
  'Laboratorio Central', '2024-09-15',
  '{"hormones": {"progesterone": "13.8 ng/mL", "estrogen": "138 pg/mL", "testosterone": "0.45 ng/mL", "fsh": "6.5 mIU/mL", "lh": "8.2 mIU/mL"}, "patient_data_removed": true, "processed_with_cvm": true}'::jsonb,
  true
),
(
  (SELECT id FROM users WHERE email = 'user2@biochain.com'),
  'mock-url-5', 'hash456def005', 'blockchain_hash_5', 'stellar_tx_5',
  'Lab Consulmed', '2024-09-20',
  '{"hormones": {"progesterone": "13.2 ng/mL", "estrogen": "155 pg/mL", "testosterone": "0.65 ng/mL", "fsh": "5.5 mIU/mL", "lh": "9.5 mIU/mL"}, "patient_data_removed": true, "processed_with_cvm": true}'::jsonb,
  true
);

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Verificar que todo se creó correctamente
SELECT 'Users:', COUNT(*) FROM users;
SELECT 'Medical History:', COUNT(*) FROM medical_history;
SELECT 'Blood Tests:', COUNT(*) FROM blood_tests;
SELECT 'Researcher Credits:', COUNT(*) FROM researcher_credits;
