# 🧪 GUÍA DE TESTING - STELLAR BLOCKCHAIN

## 🚀 Método 1: Script Automatizado (Recomendado)

### Ejecutar Test Suite Completo

```bash
npx tsx scripts/test-stellar.ts
```

Este script prueba automáticamente:
- ✅ Creación de keypairs
- ✅ Funding con Friendbot
- ✅ Consulta de balances
- ✅ Almacenamiento de hash en blockchain
- ✅ Verificación de hash
- ✅ Creación de trustlines USDC
- ⚠️ Transferencia USDC (requiere fondos)

**Tiempo estimado**: 30-60 segundos

---

## 🔍 Método 2: Testing Manual (Paso a Paso)

### TEST 1: Verificar Login y Wallet Generation

**Pasos**:
1. Abre la app: `http://localhost:3000`
2. Click en "Login" → Selecciona "Contribuyente"
3. Login con Google via Web3Auth
4. Abre Console del navegador (F12)
5. Busca logs:
   ```
   Wallet generated from Web3Auth: GXXXXXX...
   ```

**✅ Verificación**:
- Deberías ver una wallet address que empieza con "G"
- La misma cuenta de Google genera la misma wallet siempre

**🔗 Verificar en Explorer**:
```
https://stellar.expert/explorer/testnet/account/[TU_WALLET_ADDRESS]
```

---

### TEST 2: Funding Automático

**Pasos**:
1. Después de login, ve al Dashboard
2. Copia tu wallet address
3. Abre en nueva pestaña:
   ```
   https://stellar.expert/explorer/testnet/account/[TU_WALLET]
   ```
4. Deberías ver "Account funded with 10,000 XLM"

**✅ Verificación**:
- Balance de XLM debería ser ~10,000 XLM
- Si es una cuenta nueva, habrá una transacción de Friendbot

---

### TEST 3: Almacenar Hash en Blockchain

**Pasos**:
1. Como contribuyente, completa historia clínica
2. Ve a "Subir Estudio"
3. Sube cualquier PDF (puede ser un documento de prueba)
4. **Abre Console** (F12)
5. Verás:
   ```
   Storing hash on Stellar blockchain...
   Transaction successful! {hash: "..."}
   ```

**✅ Verificación**:
1. Copia el Transaction ID del console
2. Abre:
   ```
   https://stellar.expert/explorer/testnet/tx/[TRANSACTION_ID]
   ```
3. Deberías ver:
   - Operation Type: `MANAGE_DATA`
   - Data Name: `biochain_hash`
   - Data Value: El hash de tu archivo

**🎯 Este es el momento WOW para la demo!**

---

### TEST 4: Crear USDC Trustline

**Pasos**:
1. En Dashboard de contribuyente
2. Busca la tarjeta "Stellar Wallet"
3. Click en botón "💵 Activar USDC Trustline"
4. **Abre Console** (F12)
5. Verás:
   ```
   Creating USDC trustline...
   Trustline created successfully! [TX_HASH]
   ```

**✅ Verificación**:
1. Copia transaction hash del alert
2. Abre Stellar Explorer con tu wallet
3. Ve a la pestaña "Balances"
4. Deberías ver:
   ```
   USDC - Balance: 0
   Issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
   Limit: 1000000
   ```

**📸 Screenshot para la presentación!**

---

### TEST 5: Verificar Todo en Blockchain Explorer

**Pasos**:
1. Abre: `https://stellar.expert/explorer/testnet`
2. Busca tu wallet address
3. Verás todas las operaciones:
   - ✅ Account Created (Friendbot)
   - ✅ Manage Data (Hash storage)
   - ✅ Change Trust (USDC trustline)

**✅ Verificación**:
- Todas las transacciones deberían tener estado "Successful"
- Cada una tiene un hash único
- Todo es público y verificable

---

## 📊 Checklist de Validación

### Funciones Core
- [ ] Login genera wallet Stellar determinística
- [ ] Wallet address visible en dashboard
- [ ] Friendbot fondea cuenta automáticamente con 10,000 XLM
- [ ] Hash de PDF se almacena en blockchain
- [ ] Transaction ID es real y verificable en Explorer
- [ ] Trustline USDC se crea correctamente
- [ ] Trustline visible en Explorer

### UI/UX
- [ ] Botón "View on Explorer" funciona
- [ ] Botón "Copy wallet address" funciona
- [ ] Botón "Activar USDC Trustline" funciona
- [ ] Loading states se muestran correctamente
- [ ] Success/error messages aparecen

### Blockchain
- [ ] Transacciones aparecen en Stellar Testnet
- [ ] Hashes son permanentes e inmutables
- [ ] Trustlines se crean sin errores
- [ ] Todo es verificable públicamente

---

## 🐛 Troubleshooting

### Error: "Account not found"
**Causa**: Cuenta no existe en Stellar
**Solución**: El sistema debería auto-fundear. Si no, ve a:
```
https://friendbot.stellar.org?addr=[TU_WALLET]
```

### Error: "Failed to store hash"
**Causa**: Probablemente la cuenta no tiene XLM suficiente
**Solución**: Verifica balance en Explorer, debería tener ~10,000 XLM

### Error: "Trustline already exists"
**Causa**: Ya creaste la trustline antes
**Solución**: Esto es OK! La trustline solo se crea una vez

### No veo transacciones en Explorer
**Causa**: Puede haber delay de ~5-10 segundos
**Solución**: Refresca la página después de esperar un poco

---

## 🎬 Script de Demo para Hackathon

### Demo Rápida (2 minutos)

```bash
# Terminal 1 - Servidor
npm run dev

# Terminal 2 - Abrir browser
open http://localhost:3000

# Pasos:
1. Login con Google (selecciona "Contribuyente")
2. Console debe mostrar: "Wallet generated from Web3Auth: G..."
3. Copia wallet address
4. Abre en nueva pestaña: stellar.expert con tu wallet
5. Muestra balance de 10,000 XLM

6. Completa historia clínica
7. Sube PDF de prueba
8. Console muestra: "Storing hash on Stellar blockchain..."
9. Copia Transaction ID
10. Abre en Explorer → Muestra hash almacenado

11. Click "Activar USDC Trustline"
12. Refresh Explorer → Muestra trustline en balances

🎤 "Todas estas operaciones son reales en Stellar Testnet blockchain"
```

---

## 🔬 Tests Avanzados (Opcional)

### Test de Múltiples Usuarios

**Setup**:
1. Crea 3 cuentas de Google diferentes
2. Login con cada una (selecciona "Contribuyente")
3. Cada una obtiene wallet Stellar única

**Validar**:
- Cada usuario tiene wallet diferente
- Cada usuario puede crear su trustline USDC
- Cada usuario puede subir PDFs con hashes únicos

### Test de Persistencia

**Validar**:
1. Login con Google
2. Anota tu wallet address
3. Logout
4. Login de nuevo con el mismo Google
5. **Verificar**: Es la misma wallet address

✅ Esto demuestra que las wallets son determinísticas

---

## 📸 Screenshots para Documentación

Captura estos momentos:

1. **Console log** mostrando wallet generation
2. **Stellar Explorer** mostrando cuenta fondeada
3. **Transaction en Explorer** con manage_data operation
4. **Trustline USDC** en balances
5. **Dashboard** con botón de trustline activa

---

## 🎯 Métricas de Performance

**Esperado**:
- Login + Wallet creation: < 5 segundos
- Hash storage transaction: 5-10 segundos
- Trustline creation: 5-10 segundos
- Confirmación en blockchain: < 5 segundos

**Si tarda más**:
- Verifica conexión a internet
- Stellar Testnet puede estar lento (es normal)
- Friendbot puede tener rate limiting

---

## ✅ Certificación Pre-Hackathon

Antes de la hackathon, valida:

- [ ] Script automatizado pasa todos los tests
- [ ] Puedes hacer demo manual en < 3 minutos
- [ ] Todas las transacciones aparecen en Explorer
- [ ] Tienes screenshots de evidencia
- [ ] Entiendes cada paso del proceso
- [ ] Puedes explicar qué es una trustline
- [ ] Puedes explicar por qué usamos Stellar

---

## 🆘 Contacto de Emergencia

Si algo falla durante la hackathon:

1. **Verifica Stellar Testnet status**:
   - https://status.stellar.org

2. **Verifica Friendbot**:
   - https://friendbot.stellar.org

3. **Logs del browser console**:
   - Siempre abre F12 para ver errores

4. **Fallback plan**:
   - Usa screenshots/videos pre-grabados
   - Explica con documentación
   - Muestra transacciones ya hechas en Explorer

---

**¡Éxito en la hackathon! 🚀**
