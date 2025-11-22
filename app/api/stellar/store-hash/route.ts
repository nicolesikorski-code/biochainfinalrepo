import { NextRequest, NextResponse } from 'next/server';
import {
  Keypair,
  Networks,
  TransactionBuilder,
  Operation,
  Asset,
  Server,
  BASE_FEE,
} from '@stellar/stellar-sdk';

const HORIZON_URL = 'https://horizon-testnet.stellar.org';
const server = new Server(HORIZON_URL);

export async function POST(request: NextRequest) {
  try {
    const { publicKey, hash } = await request.json();

    if (!publicKey || !hash) {
      return NextResponse.json(
        { error: 'publicKey and hash are required' },
        { status: 400 }
      );
    }

    // Load account from Stellar
    let account;
    try {
      account = await server.loadAccount(publicKey);
    } catch (error: any) {
      // If account doesn't exist, try to fund it first
      if (error.response?.status === 404) {
        console.log('Account not found, funding account...');
        await fundAccount(publicKey);
        account = await server.loadAccount(publicKey);
      } else {
        throw error;
      }
    }

    // Build transaction to store hash in memo
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: publicKey, // Self-payment to store hash
          asset: Asset.native(),
          amount: '0.0000001', // Minimal amount
        })
      )
      .addMemo(hash.substring(0, 28)) // Stellar memo limit is 28 bytes for text
      .setTimeout(180)
      .build();

    // Sign transaction
    // In production, the private key should be retrieved securely
    // For now, we'll return the unsigned transaction and let client sign it
    const transactionXDR = transaction.toXDR();

    return NextResponse.json({
      success: true,
      transactionXDR,
      message: 'Transaction built. Sign on client side.',
    });
  } catch (error: any) {
    console.error('Store hash error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to store hash on blockchain' },
      { status: 500 }
    );
  }
}

async function fundAccount(publicKey: string): Promise<void> {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const responseJSON = await response.json();
    console.log('Friendbot response:', responseJSON);
  } catch (error) {
    console.error('Error funding account:', error);
    throw new Error('Failed to fund account with Friendbot');
  }
}
