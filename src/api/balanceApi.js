/**
 * Balance API Module
 * 
 * This module handles fetching SOL balance information and price data from external services.
 * It includes functions for:
 * - Getting a wallet's SOL balance from the blockchain
 * - Converting SOL to USD using CoinGecko API
 * - Getting 24h price change information
 */
export async function getSolBalance(publicKey) {
    try {
        const response = await fetch('https://mainnet.helius-rpc.com/?api-key=855c7550-3371-483e-b7e9-1debf57273af', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "jsonrpc": "2.0",
                "id": 1,
                "method": "getBalance",
                "params": [
                    publicKey
                ]
            })
        });
        const data = await response.json();
        const balance = data.result.value / 1e9; // Convert lamports to SOL
        return isNaN(balance) ? 0 : balance; // Ensure balance is not NaN
    } catch (error) {
        console.error("Error fetching SOL balance:", error);
        return 0;
    }
}

export async function getSolToUsd(solBalance) {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        const solToUsdRate = data.solana.usd;
        return solBalance * solToUsdRate;
    } catch (error) {
        console.error("Error fetching SOL/USD rate:", error);
        return 0;
    }
}

export async function getDailyChange() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        return data.solana.usd_24h_change;
    } catch (error) {
        console.error("Error fetching daily change:", error);
        return 0;
    }
}