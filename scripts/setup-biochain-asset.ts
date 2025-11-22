/**
 * Script para crear el asset BIOCHAIN en Stellar Testnet
 *
 * Este script:
 * 1. Crea cuenta emisora de BIOCHAIN
 * 2. Crea cuenta distribuidora (plataforma)
 * 3. Establece trustline de distribuidor a emisor
 * 4. Emite BIOCHAIN tokens iniciales al distribuidor
 * 5. Guarda las credenciales para uso en producción
 *
 * Ejecutar: npx tsx scripts/setup-biochain-asset.ts
 */

import { Keypair, Horizon, Networks, TransactionBuilder, Operation, Asset, BASE_FEE } from '@stellar/stellar-sdk';
import { fundTestnetAccount } from '../lib/stellar';
import * as fs from 'fs';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const Server = Horizon.Server;

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

async function setupBioChainAsset() {
  try {
    log('\n🌟 BIOCHAIN ASSET SETUP - STELLAR TESTNET 🌟\n', colors.cyan);

    // Step 1: Create Issuer Account
    section('STEP 1: Crear Cuenta Emisora de BIOCHAIN');

    const issuerKeypair = Keypair.random();
    info(`Issuer Public Key: ${issuerKeypair.publicKey()}`);
    info(`Issuer Secret Key: ${issuerKeypair.secret()}`);

    info('Funding issuer account with Friendbot...');
    await fundTestnetAccount(issuerKeypair.publicKey());
    success('Issuer account funded with 10,000 XLM\n');

    await delay(3000);

    // Step 2: Create Platform Distributor Account
    section('STEP 2: Crear Cuenta Distribuidora (Plataforma)');

    const platformKeypair = Keypair.random();
    info(`Platform Public Key: ${platformKeypair.publicKey()}`);
    info(`Platform Secret Key: ${platformKeypair.secret()}`);

    info('Funding platform account with Friendbot...');
    await fundTestnetAccount(platformKeypair.publicKey());
    success('Platform account funded with 10,000 XLM\n');

    await delay(3000);

    // Step 3: Define BIOCHAIN Asset
    section('STEP 3: Definir Asset BIOCHAIN');

    const BIOCHAIN = new Asset('BIOCHAIN', issuerKeypair.publicKey());
    info(`Asset Code: BIOCHAIN`);
    info(`Asset Issuer: ${issuerKeypair.publicKey()}`);
    success('BIOCHAIN asset defined\n');

    // Step 4: Create Trustline from Platform to Issuer
    section('STEP 4: Crear Trustline de Plataforma a Emisor');

    const server = new Server(HORIZON_URL);
    const platformAccount = await server.loadAccount(platformKeypair.publicKey());

    const trustlineTx = new TransactionBuilder(platformAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: BIOCHAIN,
          limit: '1000000', // Platform can hold max 1M BIOCHAIN
        })
      )
      .setTimeout(180)
      .build();

    trustlineTx.sign(platformKeypair);

    info('Submitting trustline transaction...');
    const trustlineResult = await server.submitTransaction(trustlineTx);
    success(`Trustline created! TX: ${trustlineResult.hash}`);
    info(`Explorer: https://stellar.expert/explorer/testnet/tx/${trustlineResult.hash}\n`);

    await delay(3000);

    // Step 5: Issue BIOCHAIN tokens to Platform
    section('STEP 5: Emitir BIOCHAIN tokens a Plataforma');

    // Reload issuer account to get latest sequence number
    await delay(3000);
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

    const issuanceTx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: platformKeypair.publicKey(),
          asset: BIOCHAIN,
          amount: '100000', // Issue 100,000 BIOCHAIN to platform
        })
      )
      .setTimeout(180)
      .build();

    issuanceTx.sign(issuerKeypair);

    info('Issuing 100,000 BIOCHAIN to platform...');
    const issuanceResult = await server.submitTransaction(issuanceTx);
    success(`BIOCHAIN issued! TX: ${issuanceResult.hash}`);
    info(`Explorer: https://stellar.expert/explorer/testnet/tx/${issuanceResult.hash}\n`);

    await delay(3000);

    // Step 6: Verify Balances
    section('STEP 6: Verificar Balances');

    const updatedPlatformAccount = await server.loadAccount(platformKeypair.publicKey());
    const biochainBalance = updatedPlatformAccount.balances.find(
      (b: any) => b.asset_code === 'BIOCHAIN'
    );

    if (biochainBalance) {
      success(`Platform BIOCHAIN Balance: ${biochainBalance.balance} BIOCHAIN`);
    } else {
      log('⚠️  No BIOCHAIN balance found', colors.red);
    }

    // Step 7: Save credentials to .env.local
    section('STEP 7: Guardar Credenciales');

    const envConfig = `
# BIOCHAIN Asset Configuration (Stellar Testnet)
# Generated: ${new Date().toISOString()}

BIOCHAIN_ISSUER_PUBLIC=${issuerKeypair.publicKey()}
BIOCHAIN_ISSUER_SECRET=${issuerKeypair.secret()}

PLATFORM_WALLET_PUBLIC=${platformKeypair.publicKey()}
PLATFORM_WALLET_SECRET=${platformKeypair.secret()}

# Asset Details
# Asset Code: BIOCHAIN
# Issuer: ${issuerKeypair.publicKey()}
# Platform holds: 100,000 BIOCHAIN
`;

    fs.writeFileSync('.env.local', envConfig.trim());
    success('Credentials saved to .env.local\n');

    // Final Summary
    section('🎉 SETUP COMPLETADO 🎉');

    success('✅ Issuer account created and funded');
    success('✅ Platform account created and funded');
    success('✅ BIOCHAIN asset defined');
    success('✅ Trustline established');
    success('✅ 100,000 BIOCHAIN issued to platform');
    success('✅ Credentials saved to .env.local');

    log('\n' + '='.repeat(60), colors.green);
    log('  BIOCHAIN ASSET IS LIVE ON STELLAR TESTNET!', colors.green);
    log('='.repeat(60) + '\n', colors.green);

    // Useful links
    section('LINKS ÚTILES');
    info(`Issuer Account: https://stellar.expert/explorer/testnet/account/${issuerKeypair.publicKey()}`);
    info(`Platform Account: https://stellar.expert/explorer/testnet/account/${platformKeypair.publicKey()}`);
    info(`BIOCHAIN Asset: https://stellar.expert/explorer/testnet/asset/BIOCHAIN-${issuerKeypair.publicKey()}`);

    log('\n💡 Próximo paso: Actualizar lib/stellar.ts para usar estas credenciales\n', colors.cyan);

  } catch (error: any) {
    log(`\n❌ ERROR: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run setup
setupBioChainAsset();
