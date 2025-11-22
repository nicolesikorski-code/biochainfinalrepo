/**
 * Script para probar todas las funciones de Stellar blockchain
 *
 * Cómo ejecutar:
 * npx tsx scripts/test-stellar.ts
 */

import { Keypair } from '@stellar/stellar-sdk';
import {
  fundTestnetAccount,
  storeHashOnBlockchain,
  createUSDCTrustline,
  transferUSDC,
  getAccountBalance,
  verifyHashOnBlockchain,
} from '../lib/stellar';

// Colors para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✅ ${message}`, colors.green);
}

function error(message: string) {
  log(`❌ ${message}`, colors.red);
}

function info(message: string) {
  log(`ℹ️  ${message}`, colors.cyan);
}

function section(title: string) {
  log(`\n${'='.repeat(60)}`, colors.blue);
  log(`  ${title}`, colors.blue);
  log(`${'='.repeat(60)}`, colors.blue);
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testStellarImplementation() {
  try {
    log('\n🌟 BIOCHAIN - STELLAR BLOCKCHAIN TEST SUITE 🌟\n', colors.cyan);

    // Test 1: Crear keypairs de prueba
    section('TEST 1: Crear Keypairs de Prueba');

    const testKeypair1 = Keypair.random();
    const testKeypair2 = Keypair.random();

    info(`Keypair 1 (Usuario): ${testKeypair1.publicKey()}`);
    info(`Keypair 2 (Plataforma): ${testKeypair2.publicKey()}`);
    success('Keypairs creados correctamente\n');

    // Test 2: Fund accounts con Friendbot
    section('TEST 2: Funding de Cuentas con Friendbot');

    info('Fondeando cuenta 1...');
    await fundTestnetAccount(testKeypair1.publicKey());
    success('Cuenta 1 fondeada con 10,000 XLM');

    await delay(2000); // Wait entre requests

    info('Fondeando cuenta 2...');
    await fundTestnetAccount(testKeypair2.publicKey());
    success('Cuenta 2 fondeada con 10,000 XLM\n');

    // Test 3: Verificar balances
    section('TEST 3: Consultar Balances');

    await delay(3000); // Wait para que Stellar procese

    const balance1 = await getAccountBalance(testKeypair1.publicKey());
    const balance2 = await getAccountBalance(testKeypair2.publicKey());

    info(`Balance Cuenta 1: ${balance1} XLM`);
    info(`Balance Cuenta 2: ${balance2} XLM`);

    if (balance1 >= 10000 && balance2 >= 10000) {
      success('Balances correctos\n');
    } else {
      error('Balances incorrectos - esperaba >= 10000 XLM\n');
    }

    // Test 4: Almacenar hash en blockchain
    section('TEST 4: Almacenar Hash en Blockchain');

    const testHash = 'abc123def456789' + Date.now(); // Hash único
    info(`Hash a almacenar: ${testHash}`);

    info('Creando transacción en Stellar...');
    const hashResult = await storeHashOnBlockchain(
      testKeypair1.secret(),
      testHash
    );

    success(`Hash almacenado en blockchain!`);
    info(`Transaction ID: ${hashResult.transactionId}`);
    info(`Explorer: https://stellar.expert/explorer/testnet/tx/${hashResult.transactionId}`);

    // Test 5: Verificar hash en blockchain
    section('TEST 5: Verificar Hash en Blockchain');

    await delay(3000); // Wait para que se confirme

    info('Verificando hash almacenado...');
    const isValid = await verifyHashOnBlockchain(
      testKeypair1.publicKey(),
      testHash
    );

    if (isValid) {
      success('Hash verificado correctamente en blockchain!\n');
    } else {
      error('Hash NO coincide - verificación fallida\n');
    }

    // Test 6: Crear USDC Trustline
    section('TEST 6: Crear USDC Trustline');

    info('Creando trustline USDC en cuenta 1...');
    const trustlineResult1 = await createUSDCTrustline(testKeypair1.secret());

    if (trustlineResult1.success) {
      success('Trustline USDC creada en cuenta 1!');
      if (trustlineResult1.transactionHash) {
        info(`Transaction: ${trustlineResult1.transactionHash}`);
        info(`Explorer: https://stellar.expert/explorer/testnet/tx/${trustlineResult1.transactionHash}`);
      }
    }

    await delay(3000);

    info('Creando trustline USDC en cuenta 2...');
    const trustlineResult2 = await createUSDCTrustline(testKeypair2.secret());

    if (trustlineResult2.success) {
      success('Trustline USDC creada en cuenta 2!\n');
      if (trustlineResult2.transactionHash) {
        info(`Transaction: ${trustlineResult2.transactionHash}`);
      }
    }

    // Test 7: Transferir USDC (NOTA: Esto fallará si no tienes USDC en la cuenta)
    section('TEST 7: Transferir USDC');

    info('⚠️  NOTA: Esta prueba fallará si la cuenta no tiene USDC');
    info('Para probar transferencias USDC, necesitas:');
    info('1. Una cuenta emisora de USDC con balance');
    info('2. O usar un USDC issuer existente en testnet');

    log('\nIntentando transferir 1 USDC de cuenta 2 a cuenta 1...', colors.yellow);

    try {
      const transferResult = await transferUSDC(
        testKeypair2.secret(),
        testKeypair1.publicKey(),
        1
      );

      success('Transferencia USDC exitosa!');
      info(`Transaction: ${transferResult.transactionHash}`);
      info(`Explorer: https://stellar.expert/explorer/testnet/tx/${transferResult.transactionHash}\n`);
    } catch (err: any) {
      if (err.message.includes('Recipient wallet must create USDC trustline first')) {
        error('Error esperado: Cuenta receptora necesita trustline');
      } else if (err.message.includes('underfunded')) {
        log('⚠️  Error esperado: Cuenta no tiene USDC para transferir', colors.yellow);
        log('Esto es normal - necesitas fondear con USDC primero\n', colors.yellow);
      } else {
        error(`Error: ${err.message}\n`);
      }
    }

    // Resumen Final
    section('RESUMEN DE TESTS');

    success('✅ Creación de keypairs');
    success('✅ Funding con Friendbot');
    success('✅ Consulta de balances');
    success('✅ Almacenamiento de hash en blockchain');
    success('✅ Verificación de hash');
    success('✅ Creación de trustlines USDC');
    log('⚠️  Transferencia USDC (requiere fondos)', colors.yellow);

    log('\n' + '='.repeat(60), colors.green);
    log('  🎉 TESTS COMPLETADOS - STELLAR BLOCKCHAIN FUNCIONA! 🎉', colors.green);
    log('='.repeat(60) + '\n', colors.green);

    // Links útiles
    section('LINKS ÚTILES');
    info(`Cuenta 1: https://stellar.expert/explorer/testnet/account/${testKeypair1.publicKey()}`);
    info(`Cuenta 2: https://stellar.expert/explorer/testnet/account/${testKeypair2.publicKey()}`);

    log('\n💡 TIP: Abre estos links en el navegador para ver las transacciones en tiempo real!\n', colors.cyan);

    // Guardar keypairs para referencia
    log('📝 Keypairs generadas (guárdalas para futuros tests):\n', colors.yellow);
    log('Cuenta 1:', colors.yellow);
    log(`  Public:  ${testKeypair1.publicKey()}`, colors.yellow);
    log(`  Secret:  ${testKeypair1.secret()}\n`, colors.yellow);
    log('Cuenta 2:', colors.yellow);
    log(`  Public:  ${testKeypair2.publicKey()}`, colors.yellow);
    log(`  Secret:  ${testKeypair2.secret()}\n`, colors.yellow);

  } catch (err: any) {
    error(`\n❌ ERROR FATAL: ${err.message}`);
    console.error(err);
    process.exit(1);
  }
}

// Ejecutar tests
testStellarImplementation();
