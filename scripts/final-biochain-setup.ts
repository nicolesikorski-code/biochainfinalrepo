/**
 * Final BIOCHAIN Setup - Simple approach
 *
 * Strategy: Use BIOCHAIN token architecture with simplified demo
 */

import { Keypair, Horizon, Networks, TransactionBuilder, Operation, Asset, BASE_FEE } from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const Server = Horizon.Server;

// Use the same issuer as USDC for demo (simplifies setup)
const BIOCHAIN_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const PLATFORM_SECRET = 'SA5SLKJ6VRNHDFGCZKWQMNUFXC2YLTV4QPYWKVBKRATI5564CRTR2RQY';

async function setup() {
  try {
    console.log('🚀 BIOCHAIN Final Setup\n');

    const platformKeypair = Keypair.fromSecret(PLATFORM_SECRET);
    const server = new Server(HORIZON_URL);

    // Define BIOCHAIN asset
    const BIOCHAIN = new Asset('BIOCHAIN', BIOCHAIN_ISSUER);
    console.log('✅ BIOCHAIN asset:', BIOCHAIN.getCode());
    console.log('   Issuer:', BIOCHAIN.getIssuer());
    console.log('   Platform:', platformKeypair.publicKey());
    console.log('');

    // Check if platform already has BIOCHAIN trustline
    const platformAccount = await server.loadAccount(platformKeypair.publicKey());
    const hasBiochainTrustline = platformAccount.balances.some(
      (b: any) => b.asset_code === 'BIOCHAIN' && b.asset_issuer === BIOCHAIN_ISSUER
    );

    if (hasBiochainTrustline) {
      console.log('✅ Platform already has BIOCHAIN trustline');
      const balance = platformAccount.balances.find(
        (b: any) => b.asset_code === 'BIOCHAIN'
      );
      console.log(`   Balance: ${balance.balance} BIOCHAIN\n`);
    } else {
      console.log('Creating BIOCHAIN trustline for platform...');

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
      const result = await server.submitTransaction(trustlineTx);

      console.log('✅ BIOCHAIN trustline created!');
      console.log(`   TX: https://stellar.expert/explorer/testnet/tx/${result.hash}\n`);
    }

    console.log('='.repeat(60));
    console.log('  ✅ SETUP COMPLETE!');
    console.log('='.repeat(60));
    console.log('');
    console.log('Platform account ready to:');
    console.log('  - Distribute BIOCHAIN tokens to researchers');
    console.log('  - Distribute USDC to contributors');
    console.log('');
    console.log('Explorer: https://stellar.expert/explorer/testnet/account/' + platformKeypair.publicKey());
    console.log('');
    console.log('⚠️  NOTE: For demo, BIOCHAIN uses same issuer as USDC');
    console.log('   In production, you would use separate issuer account');
    console.log('');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  }
}

setup();
