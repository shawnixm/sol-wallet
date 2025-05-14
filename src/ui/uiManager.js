/**
 * UI Manager Module
 * 
 * This module handles all UI-related operations including:
 * - Setting up and accessing UI elements
 * - Updating the UI based on wallet status
 * - Displaying balances, addresses, and transaction outputs
 * - Managing visibility of UI components
 */
import { getWalletStatus, getStoredPublicKey } from "../wallet/walletManager";
import { getSolBalance, getSolToUsd, getDailyChange } from "../api/balanceApi";

export function setupUIElements() {
    return {
        create_wallet_button: document.getElementById('create_wallet_button'),
        remove_wallet_button: document.getElementById('remove_wallet_button'),
        private_key_button: document.getElementById('private_key_button'),
        public_key_button: document.getElementById('public_key_button'),
        wallet_uncreated_page: document.getElementById('wallet_uncreated_page'),
        wallet_created_page: document.getElementById('wallet_created_page'),
        sol_amount: document.getElementById('sol_amount'),
        dollar_value: document.getElementById('dollar_value'),
        send_sol_button: document.getElementById('send_sol_button'),
        send_form: document.getElementById('send_form'),
        no_send_form: document.getElementById('no_send_form'),
        public_key_displayed: document.getElementById('public_key_displayed'),
        dollar_pnl: document.getElementById('dollar_pnl'),
        percent_pnl: document.getElementById('percent_pnl')
    };
}

export async function checkWalletDivVisibility() {
    const keysExist = await getWalletStatus();
    updateWalletDivVisibility(keysExist);
    await updateDailyChangeAndGain(keysExist);
    toggleSendForm(keysExist);
    await updateDisplayAddress(keysExist);
}

export function updateWalletDivVisibility(keysExist) {
    const elements = setupUIElements();
    if (keysExist) {
        elements.wallet_created_page.style.display = 'flex';
        elements.wallet_uncreated_page.style.display = 'none';
    } else {
        elements.wallet_created_page.style.display = 'none';
        elements.wallet_uncreated_page.style.display = 'flex';
    }
}

export function toggleSendForm(keysExist) {
    const elements = setupUIElements();
    elements.send_form.style.display = keysExist ? 'flex' : 'none';
    elements.no_send_form.style.display = keysExist ? 'none': 'flex';
}

export async function updateDisplayAddress(keysExist) {
    const elements = setupUIElements();
    if (keysExist) {
        try {
            const publicKey = await getStoredPublicKey();
            elements.public_key_displayed.textContent = `${publicKey}`;
        } catch (error) {
            elements.public_key_displayed.textContent = 'Error retrieving address.';
        }
    } else {
        elements.public_key_displayed.textContent = 'No address was found.';
    }
}

export async function updateBalanceAndUsdValue() {
    const elements = setupUIElements();
    try {
        const keysExist = await getWalletStatus();
        if (keysExist) {
            const publicKey = await getStoredPublicKey();
            const solBalance = await getSolBalance(publicKey);
            const usdValue = await getSolToUsd(solBalance);
            elements.sol_amount.textContent = `${solBalance.toFixed(2)} SOL`;
            elements.dollar_value.textContent = `$${usdValue.toFixed(2)}`;
        } else {
            elements.sol_amount.textContent = '0.00 SOL';
            elements.dollar_value.textContent = '$0.00';
        }
    } catch (error) {
        elements.sol_amount.textContent = '0.00 SOL';
        elements.dollar_value.textContent = '$0.00';
    }
}

export async function updateDailyChangeAndGain(keysExist) {
    const elements = setupUIElements();
    if (keysExist) {
        try {
            const publicKey = await getStoredPublicKey();
            const solBalance = await getSolBalance(publicKey);
            const dollarBalance = await getSolToUsd(solBalance);
            const dailyChange = await getDailyChange();
            const dailyGain = dollarBalance * (dailyChange / 100);
            if (dailyChange >= 0) {
                elements.percent_pnl.textContent = `${dailyChange.toFixed(2)}%`;
                elements.dollar_pnl.textContent = `+$${Math.abs(dailyGain).toFixed(2)}`;
            } else {
                elements.percent_pnl.textContent = `${dailyChange.toFixed(2)}%`;
                elements.dollar_pnl.textContent = `-$${Math.abs(dailyGain).toFixed(2)}`;
            }
        } catch (error) {
            elements.percent_pnl.textContent = '+0.00%';
            elements.dollar_pnl.textContent = '+$0.00';
        }
    } else {
        elements.percent_pnl.textContent = '+0.00%';
        elements.dollar_pnl.textContent = '+$0.00';
    }
}

export function showSendingOutput(message) {
    document.getElementById('sending_output').textContent = message;
}

export function showSettingsOutput(message) {
    document.getElementById('settings_output').textContent = message;
}

export function showCopyPrivateOutput(message) {
    document.getElementById('copy_private_output').textContent = message;
}

export function showCopyPublicOutput(message) {
    document.getElementById('copy_public_output').textContent = message;
}