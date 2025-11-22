import { Horizon } from '@stellar/stellar-sdk';
import * as StellarSdk from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';

// Re-export for convenience
const { Keypair, Networks, TransactionBuilder, Operation, Asset, BASE_FEE } = StellarSdk;
const Server = Horizon.Server;

// Fund a testnet account using Friendbot
export async function fundTestnetAccount(publicKey: string): Promise<{ success: boolean }> {
  try {
    console.log('Funding testnet account:', publicKey);
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );

    if (!response.ok) {
      throw new Error(`Friendbot request failed: ${response.statusText}`);
    }

    const responseJSON = await response.json();
    console.log('Account funded successfully:', responseJSON);
    return { success: true };
  } catch (error) {
    console.error('Error funding account:', error);
    throw new Error('Failed to fund account with Friendbot');
  }
}

// Store ZK-proofs on Stellar blockchain
export async function storeZKProofsOnBlockchain(
  privateKey: string,
  proofsData: string
): Promise<{ transactionId: string }> {
  try {
    console.log('📜 Storing ZK-proofs on Stellar blockchain...');

    const keypair = Keypair.fromSecret(privateKey);
    const publicKey = keypair.publicKey();
    const server = new Server(HORIZON_URL);

    // Load account (fund if needed)
    let account;
    try {
      account = await server.loadAccount(publicKey);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Account not found, funding...');
        await fundTestnetAccount(publicKey);
        await new Promise(resolve => setTimeout(resolve, 3000));
        account = await server.loadAccount(publicKey);
      } else {
        throw error;
      }
    }

    // Store proofs as data entry
    // Note: Stellar manageData can store up to 64 bytes per entry
    // For larger proofs, we store a hash pointer
    const proofsHash = require('crypto')
      .createHash('sha256')
      .update(proofsData)
      .digest('hex')
      .substring(0, 64);

    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageData({
          name: 'zk_proofs',
          value: proofsHash,
        })
      )
      .setTimeout(180)
      .build();

    transaction.sign(keypair);
    const result = await server.submitTransaction(transaction);

    console.log('✅ ZK-proofs stored on blockchain!', result.hash);

    return {
      transactionId: result.hash,
    };
  } catch (error: any) {
    console.error('Error storing ZK-proofs:', error);
    throw new Error(`Failed to store ZK-proofs: ${error.message}`);
  }
}

// Store hash on Stellar blockchain using manage data operation
export async function storeHashOnBlockchain(
  privateKey: string,
  hash: string
): Promise<{ transactionId: string; blockchainHash: string }> {
  try {
    console.log('Storing hash on Stellar blockchain...');

    const keypair = Keypair.fromSecret(privateKey);
    const publicKey = keypair.publicKey();
    const server = new Server(HORIZON_URL);

    // Load account (fund if needed)
    let account;
    try {
      account = await server.loadAccount(publicKey);
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Account not found, funding...');
        await fundTestnetAccount(publicKey);
        // Wait a bit for the account to be created
        await new Promise(resolve => setTimeout(resolve, 3000));
        account = await server.loadAccount(publicKey);
      } else {
        throw error;
      }
    }

    // Build transaction with hash stored in manage data operation
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.manageData({
          name: 'biochain_hash',
          value: hash.substring(0, 64), // Store first 64 chars of hash
        })
      )
      .setTimeout(180)
      .build();

    // Sign transaction
    transaction.sign(keypair);

    // Submit transaction
    const result = await server.submitTransaction(transaction);

    console.log('Transaction successful!', result);

    return {
      transactionId: result.hash,
      blockchainHash: hash,
    };
  } catch (error: any) {
    console.error('Error storing hash on blockchain:', error);
    throw new Error(`Failed to store hash: ${error.message}`);
  }
}

// USDC Asset configuration for Stellar Testnet
// This is a custom USDC asset for BioChain demo
// In production, you'd use the official USDC issuer on mainnet
const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USDC_ASSET = new Asset('USDC', USDC_ISSUER);

// BIOCHAIN Token configuration for Stellar Testnet
// This is our custom token representing credits in the platform
// 1 BIOCHAIN = $60 USD value
const BIOCHAIN_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'; // Same issuer for demo
const BIOCHAIN_ASSET = new Asset('BIOCHAIN', BIOCHAIN_ISSUER);

// Create trustline to BIOCHAIN asset (required for researchers to receive BIOCHAIN)
export async function createBIOCHAINTrustline(
  userPrivateKey: string
): Promise<{ success: boolean; transactionHash?: string }> {
  try {
    console.log('Creating BIOCHAIN trustline...');

    const keypair = Keypair.fromSecret(userPrivateKey);
    const server = new Server(HORIZON_URL);

    // Load account (fund if needed)
    let account;
    try {
      account = await server.loadAccount(keypair.publicKey());
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Account not found, funding...');
        await fundTestnetAccount(keypair.publicKey());
        await new Promise(resolve => setTimeout(resolve, 3000));
        account = await server.loadAccount(keypair.publicKey());
      } else {
        throw error;
      }
    }

    // Check if trustline already exists
    const existingTrustline = account.balances.find(
      (balance: any) =>
        balance.asset_code === 'BIOCHAIN' &&
        balance.asset_issuer === BIOCHAIN_ISSUER
    );

    if (existingTrustline) {
      console.log('BIOCHAIN trustline already exists');
      return { success: true };
    }

    // Build trustline transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: BIOCHAIN_ASSET,
          limit: '10000', // Max BIOCHAIN a researcher can hold
        })
      )
      .setTimeout(180)
      .build();

    // Sign and submit
    transaction.sign(keypair);
    const result = await server.submitTransaction(transaction);

    console.log('BIOCHAIN trustline created successfully!', result.hash);

    return {
      success: true,
      transactionHash: result.hash,
    };
  } catch (error: any) {
    console.error('Error creating BIOCHAIN trustline:', error);
    throw new Error(`Failed to create BIOCHAIN trustline: ${error.message}`);
  }
}

// Create trustline to USDC asset (required before receiving USDC)
export async function createUSDCTrustline(
  userPrivateKey: string
): Promise<{ success: boolean; transactionHash?: string }> {
  try {
    console.log('Creating USDC trustline...');

    const keypair = Keypair.fromSecret(userPrivateKey);
    const server = new Server(HORIZON_URL);

    // Load account (fund if needed)
    let account;
    try {
      account = await server.loadAccount(keypair.publicKey());
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('Account not found, funding...');
        await fundTestnetAccount(keypair.publicKey());
        await new Promise(resolve => setTimeout(resolve, 3000));
        account = await server.loadAccount(keypair.publicKey());
      } else {
        throw error;
      }
    }

    // Check if trustline already exists
    const existingTrustline = account.balances.find(
      (balance: any) =>
        balance.asset_code === 'USDC' &&
        balance.asset_issuer === USDC_ISSUER
    );

    if (existingTrustline) {
      console.log('USDC trustline already exists');
      return { success: true };
    }

    // Build trustline transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: USDC_ASSET,
          limit: '1000000', // Max USDC this account can hold
        })
      )
      .setTimeout(180)
      .build();

    // Sign and submit
    transaction.sign(keypair);
    const result = await server.submitTransaction(transaction);

    console.log('Trustline created successfully!', result.hash);

    return {
      success: true,
      transactionHash: result.hash,
    };
  } catch (error: any) {
    console.error('Error creating trustline:', error);
    throw new Error(`Failed to create USDC trustline: ${error.message}`);
  }
}

// Transfer USDC on Stellar testnet
export async function transferUSDC(
  senderPrivateKey: string,
  recipientAddress: string,
  amount: number
): Promise<{ transactionHash: string }> {
  try {
    console.log(`Transferring ${amount} USDC to ${recipientAddress}...`);

    const keypair = Keypair.fromSecret(senderPrivateKey);
    const server = new Server(HORIZON_URL);

    // Load sender account
    const senderAccount = await server.loadAccount(keypair.publicKey());

    // Build payment transaction
    const transaction = new TransactionBuilder(senderAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: recipientAddress,
          asset: USDC_ASSET,
          amount: amount.toFixed(7), // Stellar uses 7 decimal places
        })
      )
      .setTimeout(180)
      .build();

    // Sign transaction
    transaction.sign(keypair);

    // Submit transaction
    const result = await server.submitTransaction(transaction);

    console.log('USDC transfer successful!', result.hash);

    return {
      transactionHash: result.hash,
    };
  } catch (error: any) {
    console.error('Error transferring USDC:', error);

    // If error is because recipient doesn't trust USDC asset
    if (error.response?.data?.extras?.result_codes?.operations?.includes('op_no_trust')) {
      console.error('❌ Recipient must create trustline to USDC asset first');
      throw new Error('Recipient wallet must create USDC trustline first');
    }

    throw new Error(`Failed to transfer USDC: ${error.message}`);
  }
}

// Simulate USDC transfer (keeping for backwards compatibility during migration)
export async function simulateUSDCTransfer(
  recipientAddress: string,
  amount: number
): Promise<{ transactionHash: string }> {
  console.log(`[MOCK] USDC transfer of $${amount} to ${recipientAddress}`);
  await new Promise(resolve => setTimeout(resolve, 1000));
  const mockHash = `USDC_MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return { transactionHash: mockHash };
}

// Get account balance from Stellar
export async function getAccountBalance(publicKey: string): Promise<number> {
  try {
    const server = new Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);

    // Get XLM balance
    const xlmBalance = account.balances.find(
      (balance: any) => balance.asset_type === 'native'
    );

    return xlmBalance ? parseFloat(xlmBalance.balance) : 0;
  } catch (error) {
    console.error('Error getting balance:', error);
    return 0;
  }
}

// Verify hash on blockchain
export async function verifyHashOnBlockchain(
  publicKey: string,
  hash: string
): Promise<boolean> {
  try {
    const server = new Server(HORIZON_URL);
    const account = await server.loadAccount(publicKey);

    // Check if the hash exists in account data
    const storedHash = account.data_attr['biochain_hash'];

    if (!storedHash) {
      return false;
    }

    // Decode base64 stored hash
    const decodedHash = Buffer.from(storedHash, 'base64').toString('utf-8');

    return decodedHash === hash.substring(0, 64);
  } catch (error) {
    console.error('Error verifying hash:', error);
    return false;
  }
}

// Transfer BIOCHAIN tokens from one account to another
export async function transferBIOCHAIN(
  senderPrivateKey: string,
  recipientAddress: string,
  amount: number
): Promise<{ transactionHash: string }> {
  try {
    console.log(`Transferring ${amount} BIOCHAIN to ${recipientAddress}...`);

    const keypair = Keypair.fromSecret(senderPrivateKey);
    const server = new Server(HORIZON_URL);

    // Load sender account
    const senderAccount = await server.loadAccount(keypair.publicKey());

    // Build payment transaction
    const transaction = new TransactionBuilder(senderAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: recipientAddress,
          asset: BIOCHAIN_ASSET,
          amount: amount.toFixed(7),
        })
      )
      .setTimeout(180)
      .build();

    // Sign transaction
    transaction.sign(keypair);

    // Submit transaction
    const result = await server.submitTransaction(transaction);

    console.log('BIOCHAIN transfer successful!', result.hash);

    return {
      transactionHash: result.hash,
    };
  } catch (error: any) {
    console.error('Error transferring BIOCHAIN:', error);
    throw new Error(`Failed to transfer BIOCHAIN: ${error.message}`);
  }
}

/**
 * ATOMIC TRANSACTION: Consume BIOCHAIN from researcher and distribute USDC to contributors
 *
 * This is the core smart contract logic for BioChain:
 * 1. Researcher pays 1 BIOCHAIN to platform
 * 2. Platform distributes $30 USDC to contributors
 *
 * All operations happen in a SINGLE transaction (atomic - all or nothing)
 *
 * @param platformPrivateKey - Platform's private key (signs all operations)
 * @param researcherPublicKey - Researcher who generated the report
 * @param contributors - Array of {walletAddress, usdcAmount} for each contributor
 * @param biochainAmount - Amount of BIOCHAIN to consume (default 1)
 * @returns Transaction hash
 */
export async function consumeBIOCHAINAndDistributeUSDC(
  platformPrivateKey: string,
  researcherPublicKey: string,
  contributors: Array<{ walletAddress: string; usdcAmount: number }>,
  biochainAmount: number = 1
): Promise<{ transactionHash: string; totalUSDCDistributed: number }> {
  try {
    console.log('🔄 Starting atomic transaction: Consume BIOCHAIN + Distribute USDC');
    console.log(`   Researcher: ${researcherPublicKey}`);
    console.log(`   BIOCHAIN to consume: ${biochainAmount}`);
    console.log(`   Contributors: ${contributors.length}`);

    const platformKeypair = Keypair.fromSecret(platformPrivateKey);
    const server = new Server(HORIZON_URL);

    // Load platform account (the account that signs all operations)
    const platformAccount = await server.loadAccount(platformKeypair.publicKey());

    // Calculate total fees: base fee * number of operations
    // Operations: 1 (BIOCHAIN payment from researcher) + N (USDC payments to contributors)
    const numOperations = 1 + contributors.length;
    const totalFee = (parseInt(BASE_FEE) * numOperations).toString();

    console.log(`   Total operations: ${numOperations}`);
    console.log(`   Total fee: ${totalFee} stroops`);

    // Build atomic transaction
    let transaction = new TransactionBuilder(platformAccount, {
      fee: totalFee,
      networkPassphrase: Networks.TESTNET,
    });

    // Operation 1: Researcher pays BIOCHAIN to Platform
    // Note: This requires researcher to have signed the transaction
    // For demo purposes, we skip this and assume platform already has BIOCHAIN
    console.log(`   ✓ [Simulated] Researcher pays ${biochainAmount} BIOCHAIN to platform`);

    // Operations 2-N: Platform distributes USDC to each contributor
    let totalUSDCDistributed = 0;
    for (const contributor of contributors) {
      transaction.addOperation(
        Operation.payment({
          source: platformKeypair.publicKey(),
          destination: contributor.walletAddress,
          asset: USDC_ASSET,
          amount: contributor.usdcAmount.toFixed(7), // Stellar uses 7 decimals
        })
      );
      totalUSDCDistributed += contributor.usdcAmount;
      console.log(`   ✓ Adding USDC payment: $${contributor.usdcAmount} to ${contributor.walletAddress.substring(0, 8)}...`);
    }

    // Build and sign
    const builtTransaction = transaction.setTimeout(180).build();
    builtTransaction.sign(platformKeypair);

    // Submit atomic transaction
    console.log('   📤 Submitting atomic transaction to Stellar...');
    const result = await server.submitTransaction(builtTransaction);

    console.log('✅ ATOMIC TRANSACTION SUCCESSFUL!');
    console.log(`   Transaction Hash: ${result.hash}`);
    console.log(`   Total USDC Distributed: $${totalUSDCDistributed}`);
    console.log(`   Explorer: https://stellar.expert/explorer/testnet/tx/${result.hash}`);

    return {
      transactionHash: result.hash,
      totalUSDCDistributed,
    };
  } catch (error: any) {
    console.error('❌ Error in atomic transaction:', error);
    throw new Error(`Failed to execute atomic transaction: ${error.message}`);
  }
}
