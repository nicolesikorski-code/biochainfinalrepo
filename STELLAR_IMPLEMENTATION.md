# 🌟 BIOCHAIN - STELLAR BLOCKCHAIN IMPLEMENTATION

## 📋 Resumen Ejecutivo

BioChain utiliza **Stellar Blockchain** para garantizar:
- ✅ **Inmutabilidad** de datos hormonales
- ✅ **Trazabilidad** de transacciones USDC
- ✅ **Transparencia** en pagos a contribuyentes
- ✅ **Verificabilidad** pública de hashes

---

## 🔗 STELLAR TESTNET - Configuración Actual

### Network Details
- **Network**: Stellar Testnet
- **Horizon URL**: `https://horizon-testnet.stellar.org`
- **Explorer**: `https://stellar.expert/explorer/testnet`
- **Friendbot**: `https://friendbot.stellar.org` (para funding automático)

### USDC Asset Configuration
```typescript
Asset Code: USDC
Issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
Network: Testnet
```

---

## 🚀 Funcionalidades Implementadas

### 1. **Generación Determinística de Wallets** ✅

**Archivo**: `/lib/web3auth.ts`

**Cómo funciona**:
- Usuario hace login con Google OAuth via Web3Auth
- Web3Auth genera una private key determinística basada en la cuenta de Google
- La private key se usa para derivar un Stellar Keypair
- **Mismo Google = misma wallet siempre**

**Código**:
```typescript
const privateKeyHex = await provider.request({ method: "private_key" });
const buffer = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');
const seed = buffer.slice(0, 32);
const keypair = Keypair.fromRawEd25519Seed(seed);
const walletAddress = keypair.publicKey();
```

**Resultado**: Cada usuario tiene una wallet Stellar única y determinística.

---

### 2. **Almacenamiento de Hash en Blockchain** ✅

**Archivo**: `/lib/stellar.ts` - `storeHashOnBlockchain()`

**Flujo**:
1. Usuario sube PDF de estudio hormonal
2. Sistema calcula hash SHA-256 del archivo
3. Se crea transacción Stellar con operation `manageData`
4. Hash se almacena en blockchain bajo la key `biochain_hash`
5. Transacción se firma y envía a Stellar Testnet

**Código**:
```typescript
const transaction = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.manageData({
      name: 'biochain_hash',
      value: hash.substring(0, 64),
    })
  )
  .setTimeout(180)
  .build();

transaction.sign(keypair);
const result = await server.submitTransaction(transaction);
```

**Verificación**:
```
https://stellar.expert/explorer/testnet/tx/[TRANSACTION_ID]
```

---

### 3. **Funding Automático de Cuentas** ✅

**Archivo**: `/lib/stellar.ts` - `fundTestnetAccount()`

**Qué hace**:
- Detecta si una cuenta no existe en Stellar
- Llama a Friendbot para financiar la cuenta
- Otorga 10,000 XLM (testnet) gratis
- Permite realizar transacciones inmediatamente

**Código**:
```typescript
const response = await fetch(
  `https://friendbot.stellar.org?addr=${publicKey}`
);
```

**Automático**: Se ejecuta automáticamente cuando se intenta una transacción con cuenta nueva.

---

### 4. **Trustlines USDC** ✅

**Archivo**: `/lib/stellar.ts` - `createUSDCTrustline()`

**Por qué es necesario**:
- En Stellar, para recibir cualquier asset (excepto XLM nativo), la wallet receptora debe declarar que "confía" en el emisor
- Esto previene spam de tokens no deseados
- Es un requisito de seguridad de Stellar

**Flujo**:
1. Usuario hace clic en "Activar USDC Trustline" en su dashboard
2. Se crea una transacción con operation `changeTrust`
3. Se establece límite de 1,000,000 USDC máximo
4. Ahora la wallet puede recibir USDC

**Código**:
```typescript
const transaction = new TransactionBuilder(account, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.changeTrust({
      asset: USDC_ASSET,
      limit: '1000000',
    })
  )
  .setTimeout(180)
  .build();
```

---

### 5. **Transferencias USDC** ✅

**Archivo**: `/lib/stellar.ts` - `transferUSDC()`

**Cuándo se usa**:
- Cuando un investigador genera un reporte
- Se distribuyen $30 USD entre las contribuyentes
- Cada contribuyente recibe: `$30 / número_de_muestras`

**Código**:
```typescript
const transaction = new TransactionBuilder(senderAccount, {
  fee: BASE_FEE,
  networkPassphrase: Networks.TESTNET,
})
  .addOperation(
    Operation.payment({
      destination: recipientAddress,
      asset: USDC_ASSET,
      amount: amount.toFixed(7),
    })
  )
  .setTimeout(180)
  .build();
```

**Importante**: La cuenta receptora DEBE tener trustline USDC activa.

---

### 6. **Consulta de Balance** ✅

**Archivo**: `/lib/stellar.ts` - `getAccountBalance()`

**Qué hace**:
- Consulta balance XLM en tiempo real
- Se conecta directamente a Horizon API
- Útil para verificar funding de cuentas

---

### 7. **Verificación de Hash** ✅

**Archivo**: `/lib/stellar.ts` - `verifyHashOnBlockchain()`

**Qué hace**:
- Lee datos almacenados en una cuenta Stellar
- Verifica que el hash coincida con el esperado
- Útil para auditorías y verificación de integridad

**Código**:
```typescript
const account = await server.loadAccount(publicKey);
const storedHash = account.data_attr['biochain_hash'];
const decodedHash = Buffer.from(storedHash, 'base64').toString('utf-8');
return decodedHash === hash.substring(0, 64);
```

---

## 🎯 DEMO para Hackathon

### Demo 1: Almacenamiento de Hash en Blockchain

**Pasos**:
1. Login como contribuyente (data_contributor)
2. Completar historia clínica
3. Subir PDF de estudio hormonal
4. **Ver console**: `Storing hash on Stellar blockchain...`
5. **Ver console**: Transaction ID real
6. **Copiar TX ID**
7. **Abrir**: `https://stellar.expert/explorer/testnet/tx/[TX_ID]`
8. **Mostrar**: Operation `manageData` con hash almacenado

**WOW Factor**: Hash visible públicamente en blockchain ✨

---

### Demo 2: Trustline USDC

**Pasos**:
1. En dashboard de contribuyente
2. Ver wallet Stellar address
3. Click "View on Explorer" → mostrar cuenta en Stellar
4. Click "Activar USDC Trustline"
5. **Ver console**: Transaction hash
6. **Refrescar Explorer** → mostrar trustline en balances
7. **Explicar**: Ahora puede recibir USDC

**WOW Factor**: Transacción real en blockchain en segundos ✨

---

### Demo 3: Flujo Completo End-to-End

**Setup Inicial**:
1. 2 usuarios contribuyentes crean trustline USDC
2. Suben estudios hormonales (hash en blockchain)
3. 1 investigador compra créditos BIOCHAIN

**Demo**:
1. Investigador usa Chat IA para definir criterios
2. Genera reporte (cuesta 1 BIOCHAIN)
3. **Mostrar**: Sistema distribuye $30 USDC automáticamente
4. **Ver console**: Múltiples transacciones USDC
5. **Abrir Explorer**: Mostrar pagos reales
6. **Dashboard contribuyentes**: Balance USDC actualizado

**WOW Factor**: Pagos automáticos en blockchain en tiempo real ✨

---

## ⚠️ IMPORTANTE: Setup de USDC Issuer

Para que las transferencias USDC funcionen al 100%, necesitas:

### Opción 1: Usar USDC Existente en Testnet
```
Asset Code: USDC
Issuer: GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5
```

### Opción 2: Crear tu Propio USDC Asset

**Pasos**:
1. Crear cuenta emisora en testnet
2. Fund con Friendbot
3. Actualizar `USDC_ISSUER` en `/lib/stellar.ts`
4. Crear trustlines desde todas las wallets
5. Enviar USDC inicial a wallet de plataforma

**Código para crear issuer**:
```typescript
const issuerKeypair = Keypair.random();
const distributorKeypair = Keypair.random();

// Fund accounts
await fundTestnetAccount(issuerKeypair.publicKey());
await fundTestnetAccount(distributorKeypair.publicKey());

// Create trustline from distributor to issuer
const usdcAsset = new Asset('USDC', issuerKeypair.publicKey());

// Transfer USDC from issuer to distributor
// Now distributor can send USDC to users
```

---

## 🔐 Seguridad y Mejores Prácticas

### Para Hackathon (Actual)
- ✅ Private keys guardadas en Supabase (texto plano)
- ✅ Funding automático con Friendbot
- ✅ Testnet para todas las operaciones

### Para Producción (Futuro)
- 🔒 Encriptar private keys con KMS (AWS, Google Cloud)
- 🔒 Usar Stellar Mainnet
- 🔒 Implementar firma de transacciones server-side
- 🔒 Rate limiting en API endpoints
- 🔒 Multi-signature para cuenta de plataforma

---

## 📊 Costos en Producción (Mainnet)

### Costos por Transacción
- **Almacenar Hash**: ~0.00001 XLM (~$0.000001)
- **Crear Trustline**: ~0.00001 XLM (~$0.000001)
- **Transferir USDC**: ~0.00001 XLM (~$0.000001)

**Total por usuario completo**: ~$0.000003 USD

### Ventajas vs Ethereum
- ✅ 1000x más barato que Ethereum
- ✅ Confirmación en 5 segundos
- ✅ Built-in USDC support
- ✅ No gas fees fluctuantes

---

## 🐛 Troubleshooting

### Error: "op_no_trust"
**Causa**: Wallet receptora no tiene trustline USDC
**Solución**: Usuario debe crear trustline primero

### Error: "Account not found"
**Causa**: Cuenta no existe en Stellar
**Solución**: Sistema auto-fund con Friendbot

### Error: "Insufficient balance"
**Causa**: Cuenta no tiene suficiente XLM para fees
**Solución**: Friendbot da 10,000 XLM gratis en testnet

---

## 📚 Recursos Adicionales

- **Stellar Docs**: https://developers.stellar.org
- **Stellar SDK**: https://github.com/stellar/js-stellar-sdk
- **Horizon API**: https://horizon-testnet.stellar.org
- **Stellar Expert**: https://stellar.expert
- **Friendbot**: https://friendbot.stellar.org

---

## ✅ Checklist para Hackathon

- [x] Wallets determinísticas con Web3Auth
- [x] Almacenamiento de hash en blockchain
- [x] Funding automático de cuentas
- [x] Sistema de trustlines USDC
- [x] Transferencias USDC reales
- [x] UI para crear trustlines
- [x] Verificación en Stellar Explorer
- [x] Console logs para debugging
- [x] Error handling robusto
- [x] Documentación completa

---

## 🎤 Talking Points para Presentación

1. **"Cada estudio hormonal tiene su hash almacenado permanentemente en Stellar blockchain"**
   - Mostrar transacción real en Explorer
   - Explicar inmutabilidad

2. **"Los pagos a contribuyentes son automáticos y verificables públicamente"**
   - Mostrar transferencia USDC en tiempo real
   - Mostrar balance actualizado

3. **"Zero trust: todo es verificable en blockchain"**
   - Cualquiera puede verificar transacciones
   - Transparencia total

4. **"Costos mínimos gracias a Stellar"**
   - $0.000001 por transacción
   - Comparar con Ethereum

5. **"Compliance ready"**
   - Trazabilidad completa
   - Auditable por reguladores
   - GDPR-friendly (datos anonimizados)

---

## 🚀 Próximos Pasos (Post-Hackathon)

1. **Migrar a Mainnet**
   - Cambiar network a MAINNET
   - Usar USDC oficial (Circle)
   - KMS para private keys

2. **Smart Contracts (Soroban)**
   - Automated escrow para pagos
   - Royalties automáticos
   - Governance on-chain

3. **DeFi Integration**
   - Staking de BIOCHAIN tokens
   - Liquidity pools
   - Yield farming para contribuyentes

4. **NFTs para Reportes**
   - Cada reporte = NFT único
   - Transferible entre investigadores
   - Royalties a contribuyentes

---

**¿Preguntas? Contacto**: biochain@hackathon.com

🌟 **Built with Stellar - Powering the future of medical data** 🌟
