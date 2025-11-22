# Guía de Configuración - BioChain MVP

## Paso 1: Configurar Supabase

### 1.1 Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Si ya tienes cuenta, haz login. Si no, crea una cuenta
3. Click en "New Project"
4. Completa los datos:
   - **Organization**: Selecciona o crea una organización
   - **Name**: `biochain-mvp`
   - **Database Password**: Genera una contraseña segura y **guárdala**
   - **Region**: Selecciona la más cercana a ti (ej: South America para LATAM)
   - **Pricing Plan**: Free
5. Click "Create new project"
6. Espera ~2 minutos mientras se aprovisiona

### 1.2 Ejecutar el Schema SQL

1. Una vez creado el proyecto, ve a **SQL Editor** en el menú lateral izquierdo
2. Click en "New Query"
3. Copia y pega el siguiente SQL completo:

```sql
-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- Índices para mejorar performance
CREATE INDEX idx_blood_tests_user ON blood_tests(user_id);
CREATE INDEX idx_blood_tests_hash ON blood_tests(file_hash);
CREATE INDEX idx_reports_researcher ON reports(researcher_id);
CREATE INDEX idx_user_earnings_user ON user_earnings(user_id);

-- Insertar datos de prueba
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
);
```

4. Click en **"Run"** o presiona `Ctrl+Enter` (Windows/Linux) o `Cmd+Enter` (Mac)
5. Verifica que veas el mensaje "Success. No rows returned"

### 1.3 Configurar Storage Bucket

1. Ve a **Storage** en el menú lateral
2. Click en "Create a new bucket"
3. Completa:
   - **Name**: `blood-tests`
   - **Public bucket**: **NO** (dejar desmarcado)
   - **File size limit**: 10 MB
4. Click "Create bucket"

### 1.4 Obtener las Credenciales

1. Ve a **Settings** → **API** en el menú lateral
2. En la sección "Project API keys", copia:
   - **Project URL** → Lo necesitarás para `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Lo necesitarás para `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **IMPORTANTE**: Guarda estos valores, los necesitarás en el siguiente paso

---

## Paso 2: Configurar Web3Auth

### 2.1 Crear Cuenta y Proyecto

1. Ve a [https://dashboard.web3auth.io](https://dashboard.web3auth.io)
2. Click en "Get Started" o "Sign Up"
3. Inicia sesión con Google (recomendado)
4. Una vez dentro del dashboard, click en "Create Project"

### 2.2 Configurar el Proyecto

1. **Project Name**: `BioChain`
2. **Product**: Selecciona "Plug and Play"
3. **Platform**: Selecciona "Web"
4. **Network**: Selecciona **"Sapphire Devnet"** (para desarrollo)
5. Click "Create"

### 2.3 Configurar Verifier (Google Login)

1. En tu proyecto creado, ve a la pestaña **"Verifiers"**
2. Ya debería haber un verifier de Google por defecto
3. Si no existe, haz click en "Create Verifier":
   - **Verifier Type**: Social Login
   - **Social Provider**: Google
   - Click "Create"

### 2.4 Configurar Whitelist de Dominios

1. Ve a la pestaña **"Whitelist"**
2. En "Whitelist URLs", agrega:
   ```
   http://localhost:3000
   ```
3. Click "Save"

### 2.5 Obtener el Client ID

1. En la página principal de tu proyecto, busca la sección **"Client ID"**
2. Copia el **Client ID** → Lo necesitarás para `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`

---

## Paso 3: Configurar Variables de Entorno

1. Abre el archivo `.env.local` en la raíz del proyecto
2. Reemplaza los valores con tus credenciales:

```env
# Supabase (reemplazar con tus valores reales)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...

# Web3Auth (reemplazar con tu Client ID real)
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BPi5PB_UiIZ-cPz1GtV5i1I2iOSOH...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Guarda el archivo

---

## Paso 4: Probar la Configuración

### 4.1 Instalar Dependencias (si aún no lo hiciste)

```bash
npm install
```

### 4.2 Ejecutar en Desarrollo

```bash
npm run dev
```

### 4.3 Verificar que Todo Funciona

1. Abre tu navegador en [http://localhost:3000](http://localhost:3000)
2. Deberías ver la landing page de BioChain
3. Click en "Iniciar Sesión"
4. Intenta hacer login con Google
5. Si todo está bien configurado:
   - Web3Auth abrirá un modal de login con Google
   - Tras autenticarte, verás el modal de selección de rol
   - Al elegir un rol, serás redirigido al dashboard correspondiente

### 4.4 Verificar Datos en Supabase

1. Ve al dashboard de Supabase
2. Click en **Table Editor**
3. Selecciona la tabla **"users"**
4. Deberías ver los usuarios de prueba + tu nuevo usuario creado al hacer login

---

## Problemas Comunes y Soluciones

### Error: "Invalid Project URL"
- Verifica que copiaste correctamente el `NEXT_PUBLIC_SUPABASE_URL`
- Debe empezar con `https://` y terminar en `.supabase.co`

### Error: "Invalid API Key"
- Verifica que copiaste la **anon public** key, NO la **service_role** key
- La anon key es más larga y empieza con `eyJhbG...`

### Error: Web3Auth no carga
- Verifica que agregaste `http://localhost:3000` a la whitelist en Web3Auth
- Verifica que el Client ID esté correcto en `.env.local`

### Error: "Cannot read properties of undefined"
- Asegúrate de haber ejecutado TODO el SQL en Supabase
- Verifica que las tablas se crearon correctamente en Table Editor

---

## Siguiente Paso

Una vez que todo esté configurado y funcionando:

1. **Prueba el flujo completo**:
   - Regístrate como investigador
   - Regístrate como contribuyente (con otro email)
   - Completa la historia clínica como contribuyente

2. **Revisa los datos de prueba**:
   - En Supabase, verás 3 usuarios de prueba con datos hormonales
   - Estos datos serán usados para generar reportes

3. **Continúa con el desarrollo**:
   - Una vez que confirmes que todo funciona, puedo continuar implementando las páginas faltantes (Upload, Chat, Reportes, etc.)

---

## Credenciales de Prueba

Puedes usar estos usuarios de prueba para testing (ya están en la base de datos):

**Investigador:**
- Email: `researcher@biochain.com`
- Tiene 5 créditos BIOCHAIN

**Contribuyentes:**
- `user1@biochain.com`
- `user2@biochain.com`
- `user3@biochain.com`

Todos tienen estudios hormonales y historias clínicas completas.

---

¿Todo claro? Una vez que hayas completado estos pasos, avísame y continuaré con la implementación de las páginas faltantes.
