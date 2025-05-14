import { Keypair, Connection, Transaction, SystemProgram, PublicKey, sendAndConfirmTransaction} from "@solana/web3.js"; 
import base58 from "bs58";
import { initializeNavigation } from "./navigation/navigation";
// Configuration
const HELIUS_RPC_URL = ''

initializeNavigation();

document.addEventListener('DOMContentLoaded',function() {
    const create_wallet_button = document.getElementById('create_wallet_button')
    const remove_wallet_button = document.getElementById('remove_wallet_button')
    const private_key_button = document.getElementById('private_key_button')
    const public_key_button = document.getElementById('public_key_button')
    const wallet_uncreated_page = document.getElementById('wallet_uncreated_page')
    const wallet_created_page = document.getElementById('wallet_created_page')
    const sol_amount = document.getElementById('sol_amount')
    const dollar_value = document.getElementById('dollar_value')
    const send_sol_button = document.getElementById('send_sol_button')
    const send_form = document.getElementById('send_form')
    const no_send_form = document.getElementById('no_send_form')
    const public_key_displayed = document.getElementById('public_key_displayed')
    const dollar_pnl = document.getElementById('dollar_pnl')
    const percent_pnl = document.getElementById('percent_pnl')

    checkWalletDivVisibility();
    updateBalanceAndUsdValue();

    const connection = new Connection(HELIUS_RPC_URL, 'confirmed');

    create_wallet_button.addEventListener('click', async function() {
        try {
            await createWallet();
            document.getElementById('settings_output').textContent = `Wallet Created.`;
            checkWalletDivVisibility();
            updateBalanceAndUsdValue();
        } catch (error) {
            document.getElementById('settings_output').textContent = `${error}`;
        }
    });

    remove_wallet_button.addEventListener('click', async function() {
        try {
            await removeWallet();
            document.getElementById('settings_output').textContent = 'Wallet Removed';
            checkWalletDivVisibility(); 
            updateBalanceAndUsdValue();
        } catch (error) {
            document.getElementById('settings_output').textContent = `${error}`;
        }
    });

    private_key_button.addEventListener('click', async function() {
        try {
            await copyPrivateKeyToClipboard();
            document.getElementById('copy_private_output').textContent = 'Private Key copied to clipboard';
        } catch (error) {
            document.getElementById('copy_private_output').textContent = `${error}`;
        }
    });

    public_key_button.addEventListener('click', async function() {
        try {
            await copyPublicKeyToClipboard();
            document.getElementById('copy_public_output').textContent = 'Public Key copied to clipboard';
        } catch (error) {
            document.getElementById('copy_public_output').textContent = `${error}`;
        }
    });

    send_sol_button.addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent default form submission
        const recipientAddress = document.getElementById('recipientAddress').value;
        const amount = parseFloat(document.getElementById('send_to_recipient_amount').value);
        if (isNaN(amount) || amount <= 0) {
            document.getElementById('sending_output').textContent = 'Please enter a valid amount.';
            return;
        }
        try {
            document.getElementById('sending_output').textContent = 'Transaction in progress...'; // Set textContent before sending the transaction
            await sendSol(recipientAddress, amount);
            document.getElementById('sending_output').textContent = `Transaction sent successfully. SOL sent: ${amount} Recipient Address: ${recipientAddress}`
            updateBalanceAndUsdValue(); // Update balance and USD value after sending transaction
        } catch (error) {
            document.getElementById('sending_output').textContent = `${error}`;
        }
    });

    async function checkWalletDivVisibility() {
        chrome.storage.local.get('keysExist', function(result) {
            const keysExist = result.keysExist;
            updateWalletDivVisibility(keysExist);
            updateDailyChangeAndGain(keysExist);
            toggleSendForm(keysExist);
            updateDisplayAddress(keysExist);
        });
    }

    function updateWalletDivVisibility(keysExist) {
        if (keysExist) {
            wallet_created_page.style.display = 'flex';
            wallet_uncreated_page.style.display = 'none';
        } else {
            wallet_created_page.style.display = 'none';
            wallet_uncreated_page.style.display = 'flex';
        }
    }

    function toggleSendForm(keysExist) {
        send_form.style.display = keysExist ? 'flex' : 'none';
        no_send_form.style.display = keysExist ? 'none': 'flex';
    }

    async function updateDisplayAddress(keysExist) {
        if (keysExist) {
            const publicKey = await getStoredPublicKey();
            public_key_displayed.textContent = `${publicKey}`;
        } else {
            public_key_displayed.textContent = 'No address was found.';
        }
    }

    async function updateBalanceAndUsdValue() {
        try {
        const publicKey = await getStoredPublicKey();
        if (publicKey) {
            const solBalance = await getSolBalance(publicKey);
            const usdValue = await getSolToUsd(solBalance);
            sol_amount.textContent = `${solBalance.toFixed(2)} SOL`;
            dollar_value.textContent = `$${usdValue.toFixed(2)}`;
        }
        } catch(error) {
            sol_amount.textContent = '0.00 SOL';
            dollar_value.textContent = '$0.00';
        }
    }

    async function updateDailyChangeAndGain(keysExist) {
        if (keysExist) {
            const publicKey = await getStoredPublicKey();
            const solBalance = await getSolBalance(publicKey);
            const dollarBalance = await getSolToUsd(solBalance);
            const dailyChange = await getDailyChange();
            const dailyGain = dollarBalance * (dailyChange / 100);
            if (dailyChange >= 0) {
                percent_pnl.textContent = `${dailyChange.toFixed(2)}%`;
                dollar_pnl.textContent = `+$${Math.abs(dailyGain).toFixed(2)}`;
            } else {
                percent_pnl.textContent = `${dailyChange.toFixed(2)}%`;
                dollar_pnl.textContent = `-$${Math.abs(dailyGain).toFixed(2)}`;
            }
        } else {
            percent_pnl.textContent = '+0.00%';
            dollar_pnl.textContent = '+$0.00';
        }
    }

    async function getDailyChange() {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true');
        const data = await response.json();
        return data.solana.usd_24h_change;
    }

    async function createWallet() {
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey.toBase58();
        const secretKey = Array.from(keypair.secretKey);

        await chrome.storage.local.set({ publicKey, secretKey, keysExist: true });
    }

    async function removeWallet() {
        await chrome.storage.local.remove(['publicKey', 'secretKey']);
        await chrome.storage.local.set({ keysExist: false });
    }

    async function copyPrivateKeyToClipboard() {
        const secretKey = await getStoredSecretKey();
        const secretKeyUint8Array = new Uint8Array(secretKey);
        const base58EncodedPrivateKey = base58.encode(secretKeyUint8Array);

        await navigator.clipboard.writeText(base58EncodedPrivateKey);
    }

    async function copyPublicKeyToClipboard() {
        const publicKey = await getStoredPublicKey();
        await navigator.clipboard.writeText(publicKey);
    }

    async function getStoredSecretKey() {
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

    async function getStoredPublicKey() {
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

    async function getSolBalance(publicKey) {
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
            document.getElementById('dollar_value').textContent = `${error}`;
        }
    }

    async function getSolToUsd(solBalance) {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await response.json();
        const solToUsdRate = data.solana.usd;
        return solBalance * solToUsdRate;
    }

    async function sendSol(recipientAddress, amount) {
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
});