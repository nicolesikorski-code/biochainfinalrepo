'use client';

import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import { Keypair } from "@stellar/stellar-sdk";

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID!;

let web3auth: Web3Auth | null = null;

export async function getWeb3Auth() {
  if (web3auth) {
    return web3auth;
  }

  web3auth = new Web3Auth({
    clientId,
    web3AuthNetwork: "sapphire_devnet", // Match Web3Auth project environment
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.OTHER,
      chainId: "stellar:testnet",
      rpcTarget: "https://horizon-testnet.stellar.org",
    },
  });

  await web3auth.init();
  return web3auth;
}

export async function loginWithGoogle() {
  try {
    const web3authInstance = await getWeb3Auth();
    const provider = await web3authInstance.connect();

    if (!provider) {
      throw new Error('Failed to connect to Web3Auth');
    }

    const user = await web3authInstance.getUserInfo();

    // Get private key from Web3Auth provider
    // This is deterministic - same Google account = same private key
    const privateKeyHex = await provider.request({ method: "private_key" }) as string;

    // Convert Web3Auth private key to Stellar keypair
    // We'll use the private key as a seed
    const buffer = Buffer.from(privateKeyHex.replace('0x', ''), 'hex');

    // Stellar private keys are 32 bytes, Web3Auth might give us more
    const seed = buffer.slice(0, 32);
    const keypair = Keypair.fromRawEd25519Seed(seed);
    const walletAddress = keypair.publicKey();

    console.log('Wallet generated from Web3Auth:', walletAddress);

    return {
      email: user.email || '',
      name: user.name || '',
      walletAddress,
      privateKey: keypair.secret(), // This is the Stellar secret key
      provider,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function logout() {
  try {
    if (web3auth) {
      await web3auth.logout();
      web3auth = null;
    }
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

export async function getProvider(): Promise<IProvider | null> {
  try {
    if (!web3auth) {
      return null;
    }
    return web3auth.provider;
  } catch (error) {
    console.error('Get provider error:', error);
    return null;
  }
}

export async function isLoggedIn(): Promise<boolean> {
  try {
    if (!web3auth) {
      return false;
    }
    return web3auth.connected;
  } catch (error) {
    return false;
  }
}
