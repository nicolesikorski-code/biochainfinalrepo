/**
 * Setup BIOCHAIN Token Issuer on Stellar Testnet
 *
 * Este script:
 * 1. Crea cuenta ISSUER de BIOCHAIN
 * 2. Crea cuenta PLATFORM (distributor)
 * 3. Platform crea trustline a BIOCHAIN
 * 4. Issuer emite 1,000,000 BIOCHAIN a Platform
 * 5. Guarda credenciales en .env.local
 *
 * Ejecutar: npx tsx scripts/setup-biochain-issuer.ts
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

async function setupBIOCHAINIssuer() {
  try {
    log('\n🪙 BIOCHAIN TOKEN ISSUER SETUP 🪙\n', colors.cyan);

    // STEP 1: Create Issuer Account
    section('STEP 1: Create BIOCHAIN Issuer Account');

    const issuerKeypair = Keypair.random();
    info(`Issuer Public:  ${issuerKeypair.publicKey()}`);
    info(`Issuer Secret:  ${issuerKeypair.secret()}`);

    info('Funding issuer account with Friendbot...');
    await fundTestnetAccount(issuerKeypair.publicKey());
    success('Issuer funded with 10,000 XLM\n');

    await delay(3000);

    // STEP 2: Create Platform Distribution Account
    section('STEP 2: Create Platform Distribution Account');

    const platformKeypair = Keypair.random();
    info(`Platform Public: ${platformKeypair.publicKey()}`);
    info(`Platform Secret: ${platformKeypair.secret()}`);

    info('Funding platform account with Friendbot...');
    await fundTestnetAccount(platformKeypair.publicKey());
    success('Platform funded with 10,000 XLM\n');

    await delay(3000);

    // STEP 3: Define BIOCHAIN Asset
    section('STEP 3: Define BIOCHAIN Asset');

    const BIOCHAIN = new Asset('BIOCHAIN', issuerKeypair.publicKey());
    info(`Asset Code:   BIOCHAIN`);
    info(`Issuer:       ${issuerKeypair.publicKey()}`);
    success('BIOCHAIN asset defined\n');

    // STEP 4: Platform creates trustline to BIOCHAIN
    section('STEP 4: Platform Creates Trustline to BIOCHAIN');

    const server = new Server(HORIZON_URL);
    const platformAccount = await server.loadAccount(platformKeypair.publicKey());

    const trustlineTx = new TransactionBuilder(platformAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: BIOCHAIN,
          limit: '10000000', // Platform can hold max 10M BIOCHAIN
        })
      )
      .setTimeout(180)
      .build();

    trustlineTx.sign(platformKeypair);

    info('Submitting trustline transaction...');
    const trustlineResult = await server.submitTransaction(trustlineTx);
    success(`Trustline created!`);
    info(`TX Hash: ${trustlineResult.hash}`);
    info(`Explorer: https://stellar.expert/explorer/testnet/tx/${trustlineResult.hash}\n`);

    await delay(5000); // Wait for ledger to close

    // STEP 5: Issue 1,000,000 BIOCHAIN tokens to Platform
    section('STEP 5: Issue 1,000,000 BIOCHAIN to Platform');

    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

    const issuanceTx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: platformKeypair.publicKey(),
          asset: BIOCHAIN,
          amount: '1000000.0000000', // 1M BIOCHAIN
        })
      )
      .setTimeout(180)
      .build();

    issuanceTx.sign(issuerKeypair);

    info('Issuing 1,000,000 BIOCHAIN tokens...');
    const issuanceResult = await server.submitTransaction(issuanceTx);
    success(`BIOCHAIN tokens issued!`);
    info(`TX Hash: ${issuanceResult.hash}`);
    info(`Explorer: https://stellar.expert/explorer/testnet/tx/${issuanceResult.hash}\n`);

    await delay(5000);

    // STEP 6: Verify Platform Balance
    section('STEP 6: Verify Platform BIOCHAIN Balance');

    const updatedPlatform = await server.loadAccount(platformKeypair.publicKey());
    const biochainBalance = updatedPlatform.balances.find(
      (b: any) => b.asset_code === 'BIOCHAIN' && b.asset_issuer === issuerKeypair.publicKey()
    );

    if (biochainBalance) {
      success(`Platform BIOCHAIN Balance: ${biochainBalance.balance} BIOCHAIN`);
      info(`Limit: ${biochainBalance.limit}`);
    } else {
      log('⚠️  Warning: BIOCHAIN balance not found', colors.yellow);
    }

    // STEP 7: Also create USDC trustline for platform
    section('STEP 7: Create USDC Trustline for Platform');

    const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    const USDC = new Asset('USDC', USDC_ISSUER);

    const platformAccount2 = await server.loadAccount(platformKeypair.publicKey());

    const usdcTrustlineTx = new TransactionBuilder(platformAccount2, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: USDC,
          limit: '10000000', // Platform can hold max 10M USDC
        })
      )
      .setTimeout(180)
      .build();

    usdcTrustlineTx.sign(platformKeypair);

    info('Creating USDC trustline for platform...');
    const usdcResult = await server.submitTransaction(usdcTrustlineTx);
    success(`USDC trustline created!`);
    info(`TX Hash: ${usdcResult.hash}\n`);

    // STEP 8: Save to .env.local
    section('STEP 8: Save Credentials to .env.local');

    const envContent = `
# BIOCHAIN Token Configuration (Stellar Testnet)
# Generated: ${new Date().toISOString()}

# BIOCHAIN Issuer (creates tokens)
BIOCHAIN_ISSUER_PUBLIC=${issuerKeypair.publicKey()}
BIOCHAIN_ISSUER_SECRET=${issuerKeypair.secret()}

# Platform Wallet (distributes tokens and USDC)
PLATFORM_WALLET_PUBLIC=${platformKeypair.publicKey()}
PLATFORM_WALLET_SECRET=${platformKeypair.secret()}

# Asset Details
# BIOCHAIN Asset: ${issuerKeypair.publicKey()}
# Platform Balance: 1,000,000 BIOCHAIN
# Platform can distribute BIOCHAIN to researchers
# Platform can distribute USDC to contributors
`;

    // Check if .env.local exists
    let existingEnv = '';
    try {
      existingEnv = fs.readFileSync('.env.local', 'utf-8');
    } catch (e) {
      // File doesn't exist, that's fine
    }

    // Append or create
    if (existingEnv) {
      fs.writeFileSync('.env.local', existingEnv + '\n' + envContent);
      info('Appended to existing .env.local');
    } else {
      fs.writeFileSync('.env.local', envContent.trim());
      info('Created new .env.local');
    }

    success('Credentials saved!\n');

    // FINAL SUMMARY
    section('🎉 SETUP COMPLETED SUCCESSFULLY 🎉');

    success('✅ BIOCHAIN issuer account created');
    success('✅ Platform account created');
    success('✅ Trustline BIOCHAIN established');
    success('✅ Trustline USDC established');
    success('✅ 1,000,000 BIOCHAIN issued to platform');
    success('✅ Credentials saved to .env.local');

    log('\n' + '='.repeat(60), colors.green);
    log('  BIOCHAIN TOKEN IS LIVE ON STELLAR TESTNET!', colors.green);
    log('='.repeat(60) + '\n', colors.green);

    // Useful Links
    section('USEFUL LINKS');
    info(`Issuer Account:\n   https://stellar.expert/explorer/testnet/account/${issuerKeypair.publicKey()}`);
    info(`Platform Account:\n   https://stellar.expert/explorer/testnet/account/${platformKeypair.publicKey()}`);
    info(`BIOCHAIN Asset:\n   https://stellar.expert/explorer/testnet/asset/BIOCHAIN-${issuerKeypair.publicKey()}`);

    log('\n💡 Next Steps:', colors.cyan);
    log('1. Restart your dev server to load new .env.local', colors.cyan);
    log('2. Researchers can now receive REAL BIOCHAIN tokens', colors.cyan);
    log('3. Platform can distribute REAL USDC to contributors\n', colors.cyan);

  } catch (error: any) {
    log(`\n❌ ERROR: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

// Run setup
setupBIOCHAINIssuer();
