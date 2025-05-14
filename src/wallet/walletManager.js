/**
 * Wallet Manager Module
 * 
 * This module handles all wallet management operations including:
 * - Creating and removing wallets
 * - Storing and retrieving keys from Chrome storage
 * - Copying keys to clipboard
 * - Managing wallet status
 */
import { Keypair } from "@solana/web3.js";
import base58 from "bs58";

export async function createWallet() {
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    const secretKey = Array.from(keypair.secretKey);

    await chrome.storage.local.set({ publicKey, secretKey, keysExist: true });
}

export async function removeWallet() {
    await chrome.storage.local.remove(['publicKey', 'secretKey']);
    await chrome.storage.local.set({ keysExist: false });
}

export async function getStoredSecretKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['secretKey'], function(result) {
            if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError));
            }
            const storedKey = result.secretKey;
            if (!storedKey) {
                return reject(new Error('No secret key found in storage.'));
            }
            resolve(storedKey);
        });
    });
}

export async function getStoredPublicKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['publicKey'], function(result) {
            if (chrome.runtime.lastError) {
                return reject(new Error(chrome.runtime.lastError));
            }
            const publicKey = result.publicKey;
            if (!publicKey) {
                return reject(new Error('No public key found in storage.'));
            }
            resolve(publicKey);
        });
    });
}

export async function getWalletStatus() {
    return new Promise((resolve) => {
        chrome.storage.local.get('keysExist', function(result) {
            resolve(result.keysExist || false);
        });
    });
}

export async function copyPrivateKeyToClipboard() {
    const secretKey = await getStoredSecretKey();
    const secretKeyUint8Array = new Uint8Array(secretKey);
    const base58EncodedPrivateKey = base58.encode(secretKeyUint8Array);

    await navigator.clipboard.writeText(base58EncodedPrivateKey);
}

export async function copyPublicKeyToClipboard() {
    const publicKey = await getStoredPublicKey();
    await navigator.clipboard.writeText(publicKey);
}