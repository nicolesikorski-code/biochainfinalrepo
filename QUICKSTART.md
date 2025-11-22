# Quick Start - BioChain MVP

## 📋 Checklist de Configuración

### ✅ Paso 1: Supabase (5 minutos)

1. **Ir a Supabase**
   - URL: https://supabase.com
   - Login o crear cuenta

2. **Crear proyecto**
   - Click "New Project"
   - Name: `biochain-mvp`
   - Generate password (guardar!)
   - Region: Tu región más cercana
   - Click "Create new project"
   - ⏳ Esperar ~2 minutos

3. **Ejecutar SQL**
   - Ir a "SQL Editor" (menú izquierdo)
   - Click "New Query"
   - Abrir el archivo `supabase-schema.sql`
   - Copiar TODO el contenido
   - Pegar en el editor
   - Click "Run" (o Ctrl+Enter)
   - ✅ Verificar mensaje "Success"

4. **Crear Storage Bucket**
   - Ir a "Storage" (menú izquierdo)
   - Click "Create a new bucket"
   - Name: `blood-tests`
   - Public: **NO** (dejar desmarcado)
   - Click "Create bucket"

5. **Copiar credenciales**
   - Ir a "Settings" → "API"
   - Copiar:
     - `Project URL` → Guardar para `.env.local`
     - `anon public` key → Guardar para `.env.local`

---

### ✅ Paso 2: Web3Auth (3 minutos)

1. **Ir a Web3Auth**
   - URL: https://dashboard.web3auth.io
   - Login con Google

2. **Crear proyecto**
   - Click "Create Project"
   - Project Name: `BioChain`
   - Product: "Plug and Play"
   - Platform: "Web"
   - Network: **"Sapphire Devnet"**
   - Click "Create"

3. **Configurar Whitelist**
   - En tu proyecto, ir a "Whitelist"
   - Agregar: `http://localhost:3000`
   - Click "Save"

4. **Copiar Client ID**
   - En la página principal del proyecto
   - Copiar el **Client ID** → Guardar para `.env.local`

---

### ✅ Paso 3: Configurar Variables de Entorno (1 minuto)

1. **Abrir archivo `.env.local`** en la raíz del proyecto

2. **Pegar tus credenciales**:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...

# Web3Auth
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=BPi5PB_UiIZ-cPz1GtV5i1I2iOSOH...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Guardar el archivo**

---

### ✅ Paso 4: Ejecutar la Aplicación (2 minutos)

1. **Instalar dependencias** (solo la primera vez):
```bash
npm install
```

2. **Ejecutar en desarrollo**:
```bash
npm run dev
```

3. **Abrir en el navegador**:
   - URL: http://localhost:3000
   - ✅ Deberías ver la landing page de BioChain

4. **Probar login**:
   - Click "Iniciar Sesión"
   - Login con Google
   - Seleccionar rol (Investigador o Contribuyente)
   - ✅ Deberías ser redirigido al dashboard

---

## 🧪 Probar con Datos de Ejemplo

### Opción 1: Crear tu propio usuario
- Login con tu cuenta de Google
- Selecciona un rol
- Completa el onboarding

### Opción 2: Usar usuarios de prueba
Los siguientes usuarios ya están en la base de datos con datos completos:

**Investigador:**
- Email: `researcher@biochain.com`
- Créditos: 5 BIOCHAIN

**Contribuyentes:**
- `user1@biochain.com` - 25 años, usa píldora
- `user2@biochain.com` - 30 años, DIU, tiene SOP
- `user3@biochain.com` - 28 años, no usa anticonceptivos

Cada uno tiene estudios hormonales completos.

---

## 🐛 Solución de Problemas

### Error: "Invalid Supabase URL"
- ✅ Verificar que el URL empiece con `https://` y termine en `.supabase.co`
- ✅ Sin espacios al inicio o final

### Error: "Invalid API Key"
- ✅ Usar la clave **anon public**, NO la service_role
- ✅ La clave es larga (>100 caracteres)

### Error: Web3Auth no carga
- ✅ Verificar que `http://localhost:3000` esté en la whitelist
- ✅ Verificar que el Client ID esté correcto
- ✅ Intentar en modo incógnito

### Error: Tablas no existen
- ✅ Ir a Supabase → Table Editor
- ✅ Verificar que veas las tablas: users, medical_history, blood_tests, etc.
- ✅ Si no existen, ejecutar el SQL nuevamente

---

## ✅ Checklist de Verificación

Marca cuando completes cada paso:

- [ ] Proyecto Supabase creado
- [ ] SQL ejecutado correctamente
- [ ] Bucket "blood-tests" creado
- [ ] Credenciales de Supabase copiadas
- [ ] Proyecto Web3Auth creado
- [ ] Whitelist configurada en Web3Auth
- [ ] Client ID de Web3Auth copiado
- [ ] Archivo `.env.local` actualizado
- [ ] `npm install` ejecutado
- [ ] `npm run dev` ejecutado
- [ ] Landing page carga en localhost:3000
- [ ] Login con Google funciona
- [ ] Puedo acceder al dashboard

---

## 📝 Siguiente Paso

Una vez que todo esté funcionando:

1. **Explora la aplicación**:
   - Prueba el flujo de investigador
   - Prueba el flujo de contribuyente
   - Completa una historia clínica

2. **Avísame cuando esté listo** y continuaré con:
   - Upload de PDFs
   - Chat con IA
   - Generación de reportes
   - Y todas las páginas faltantes

---

## 📞 ¿Necesitas Ayuda?

Si tienes algún problema durante la configuración, avísame y te ayudo a resolverlo.

**Tiempo total estimado: ~10 minutos**
