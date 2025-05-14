/**
 * Transaction API Module
 * 
 * This module handles all Solana blockchain transaction operations including
 * establishing connections and sending SOL to other addresses.
 * It uses the Solana Web3.js library for blockchain interactions.
 */
import { Connection, Transaction, SystemProgram, PublicKey, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { getStoredPublicKey, getStoredSecretKey } from "../wallet/walletManager";
import { getSolBalance } from "./balanceApi";

// Configuration
const HELIUS_RPC_URL = ''; // Set your RPC URL here

export function getConnection() {
    return new Connection(HELIUS_RPC_URL, 'confirmed');
}

export async function sendSol(recipientAddress, amount) {
    const connection = getConnection();
    const publicKey = await getStoredPublicKey();
    const secretKey = await getStoredSecretKey();
    const senderKeypair = Keypair.fromSecretKey(new Uint8Array(secretKey));

    const senderBalance = await getSolBalance(publicKey);
    if (amount > senderBalance) {
        throw new Error('Insufficient funds.');
    }

    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: senderKeypair.publicKey,
            toPubkey: new PublicKey(recipientAddress),
            lamports: amount * 1e9, // Convert SOL to lamports
        })
    );

    await sendAndConfirmTransaction(connection, transaction, [senderKeypair]);
}