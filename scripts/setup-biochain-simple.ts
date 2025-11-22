/**
 * Simple BIOCHAIN Setup - Using Manual Keypairs
 *
 * INSTRUCTIONS:
 * 1. Generate 2 keypairs manually en stellar laboratory
 * 2. Fund ambas con Friendbot
 * 3. Pega las keys en este script
 * 4. Ejecuta: npx tsx scripts/setup-biochain-simple.ts
 */

import { Keypair, Horizon, Networks, TransactionBuilder, Operation, Asset, BASE_FEE } from '@stellar/stellar-sdk';
import * as fs from 'fs';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const Server = Horizon.Server;

// 🔧 CONFIGURACIÓN: Pega tus keypairs aquí
// Genera en: https://laboratory.stellar.org/#account-creator?network=test

const ISSUER_SECRET = 'SCZOMEJ2PHLAEUE5KAHSIQFTQAELOX522HYWO26LIP5RPKYDI62HGCFZ';
const PLATFORM_SECRET = 'SA5SLKJ6VRNHDFGCZKWQMNUFXC2YLTV4QPYWKVBKRATI5564CRTR2RQY';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function setupBIOCHAIN() {
  try {
    log('\n🪙 BIOCHAIN SETUP (QUICK METHOD) 🪙\n', colors.cyan);

    // Validate inputs
    if (!ISSUER_SECRET || !PLATFORM_SECRET) {
      log('❌ ERROR: Please set ISSUER_SECRET and PLATFORM_SECRET in the script', colors.red);
      log('', colors.reset);
      log('Instructions:', colors.yellow);
      log('1. Go to: https://laboratory.stellar.org/#account-creator?network=test', colors.cyan);
      log('2. Click "Generate keypair" TWICE (for issuer and platform)', colors.cyan);
      log('3. Click "Fund account with Friendbot" for BOTH', colors.cyan);
      log('4. Copy the Secret Keys into this script', colors.cyan);
      log('5. Run again: npx tsx scripts/setup-biochain-simple.ts\n', colors.cyan);
      process.exit(1);
    }

    const issuerKeypair = Keypair.fromSecret(ISSUER_SECRET);
    const platformKeypair = Keypair.fromSecret(PLATFORM_SECRET);

    log(`Issuer Public:   ${issuerKeypair.publicKey()}`, colors.cyan);
    log(`Platform Public: ${platformKeypair.publicKey()}\n`, colors.cyan);

    const server = new Server(HORIZON_URL);

    // Define BIOCHAIN asset
    const BIOCHAIN = new Asset('BIOCHAIN', issuerKeypair.publicKey());
    log(`✅ BIOCHAIN asset defined`, colors.green);
    log(`   Issuer: ${issuerKeypair.publicKey()}\n`, colors.cyan);

    // Pre-load issuer account to avoid sequence issues
    log('Loading accounts from Stellar...', colors.cyan);
    const issuerAccountPreload = await server.loadAccount(issuerKeypair.publicKey());
    log(`✅ Issuer loaded (sequence: ${issuerAccountPreload.sequence})`, colors.green);

    //STEP 1: Platform creates trustline to BIOCHAIN
    log('\nSTEP 1: Creating BIOCHAIN trustline for platform...', colors.blue);

    const platformAccount = await server.loadAccount(platformKeypair.publicKey());

    const trustlineTx = new TransactionBuilder(platformAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: BIOCHAIN,
          limit: '10000000',
        })
      )
      .setTimeout(180)
      .build();

    trustlineTx.sign(platformKeypair);
    const trustlineResult = await server.submitTransaction(trustlineTx);

    log(`✅ Trustline created!`, colors.green);
    log(`   TX: https://stellar.expert/explorer/testnet/tx/${trustlineResult.hash}\n`, colors.cyan);

    log('⏳ Waiting for ledger to close...', colors.yellow);
    await delay(10000); // Wait longer for ledger

    // STEP 2: Issue 1M BIOCHAIN to platform
    log('STEP 2: Issuing 1,000,000 BIOCHAIN tokens...', colors.blue);

    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

    const issuanceTx = new TransactionBuilder(issuerAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: platformKeypair.publicKey(),
          asset: BIOCHAIN,
          amount: '1000000.0000000',
        })
      )
      .setTimeout(180)
      .build();

    issuanceTx.sign(issuerKeypair);
    const issuanceResult = await server.submitTransaction(issuanceTx);

    log(`✅ BIOCHAIN issued!`, colors.green);
    log(`   TX: https://stellar.expert/explorer/testnet/tx/${issuanceResult.hash}\n`, colors.cyan);

    await delay(5000);

    // STEP 3: Create USDC trustline for platform
    log('STEP 3: Creating USDC trustline for platform...', colors.blue);

    const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    const USDC = new Asset('USDC', USDC_ISSUER);

    const platformAccount2 = await server.loadAccount(platformKeypair.publicKey());

    const usdcTx = new TransactionBuilder(platformAccount2, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: USDC,
          limit: '10000000',
        })
      )
      .setTimeout(180)
      .build();

    usdcTx.sign(platformKeypair);
    const usdcResult = await server.submitTransaction(usdcTx);

    log(`✅ USDC trustline created!`, colors.green);
    log(`   TX: https://stellar.expert/explorer/testnet/tx/${usdcResult.hash}\n`, colors.cyan);

    await delay(3000);

    // STEP 4: Verify balances
    log('STEP 4: Verifying balances...', colors.blue);

    const finalPlatform = await server.loadAccount(platformKeypair.publicKey());
    const biochainBalance = finalPlatform.balances.find(
      (b: any) => b.asset_code === 'BIOCHAIN'
    );

    if (biochainBalance) {
      log(`✅ Platform BIOCHAIN Balance: ${biochainBalance.balance}\n`, colors.green);
    }

    // STEP 5: Save to .env.local
    log('STEP 5: Saving to .env.local...', colors.blue);

    const envContent = `
# BIOCHAIN Token Configuration (Stellar Testnet)
# Generated: ${new Date().toISOString()}

BIOCHAIN_ISSUER_PUBLIC=${issuerKeypair.publicKey()}
BIOCHAIN_ISSUER_SECRET=${issuerKeypair.secret()}

PLATFORM_WALLET_PUBLIC=${platformKeypair.publicKey()}
PLATFORM_WALLET_SECRET=${platformKeypair.secret()}
`;

    let existingEnv = '';
    try {
      existingEnv = fs.readFileSync('.env.local', 'utf-8');
    } catch (e) {
      // File doesn't exist
    }

    if (existingEnv) {
      fs.writeFileSync('.env.local', existingEnv + '\n' + envContent);
    } else {
      fs.writeFileSync('.env.local', envContent.trim());
    }

    log(`✅ Credentials saved to .env.local\n`, colors.green);

    // Final summary
    log('='.repeat(60), colors.green);
    log('  🎉 BIOCHAIN SETUP COMPLETED! 🎉', colors.green);
    log('='.repeat(60), colors.green);
    log('', colors.reset);
    log('✅ BIOCHAIN issuer created', colors.green);
    log('✅ Platform account configured', colors.green);
    log('✅ 1,000,000 BIOCHAIN issued', colors.green);
    log('✅ USDC trustline created', colors.green);
    log('✅ Ready to distribute tokens!\n', colors.green);

    log('Useful Links:', colors.cyan);
    log(`Platform: https://stellar.expert/explorer/testnet/account/${platformKeypair.publicKey()}`, colors.cyan);
    log(`BIOCHAIN Asset: https://stellar.expert/explorer/testnet/asset/BIOCHAIN-${issuerKeypair.publicKey()}\n`, colors.cyan);

    log('Next Steps:', colors.yellow);
    log('1. Restart dev server: npm run dev', colors.yellow);
    log('2. System can now distribute REAL BIOCHAIN tokens!', colors.yellow);
    log('3. Researchers will receive REAL tokens on purchase\n', colors.yellow);

  } catch (error: any) {
    log(`\n❌ ERROR: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  }
}

setupBIOCHAIN();
