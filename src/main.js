/**
 * Main Backend Entry Point
 * 
 * This is the main JavaScript file that coordinates all functionality of the Solana wallet.
 * It initializes the UI, sets up event listeners, and orchestrates interactions
 * between the wallet logic, API calls, and user interface components.
 */

import { initializeNavigation } from "./navigation/navigation";
import { createWallet, removeWallet, copyPrivateKeyToClipboard, copyPublicKeyToClipboard } from "./wallet/walletManager";
import { sendSol } from "./api/transactionApi";
import { 
    setupUIElements, 
    checkWalletDivVisibility, 
    updateBalanceAndUsdValue, 
    showSendingOutput,
    showSettingsOutput,
    showCopyPrivateOutput,
    showCopyPublicOutput
} from "./ui/uiManager";

// Initialize the application
initializeNavigation();

document.addEventListener('DOMContentLoaded', function() {
    // Set up UI elements
    const elements = setupUIElements();
    
    // Initialize the UI based on wallet status
    checkWalletDivVisibility();
    updateBalanceAndUsdValue();

    // Event handlers for wallet management
    elements.create_wallet_button.addEventListener('click', async function() {
        try {
            await createWallet();
            showSettingsOutput('Wallet Created.');
            checkWalletDivVisibility();
            updateBalanceAndUsdValue();
        } catch (error) {
            showSettingsOutput(`${error}`);
        }
    });

    elements.remove_wallet_button.addEventListener('click', async function() {
        try {
            await removeWallet();
            showSettingsOutput('Wallet Removed');
            checkWalletDivVisibility(); 
            updateBalanceAndUsdValue();
        } catch (error) {
            showSettingsOutput(`${error}`);
        }
    });

    // Event handlers for key management
    elements.private_key_button.addEventListener('click', async function() {
        try {
            await copyPrivateKeyToClipboard();
            showCopyPrivateOutput('Private Key copied to clipboard');
        } catch (error) {
            showCopyPrivateOutput(`${error}`);
        }
    });

    elements.public_key_button.addEventListener('click', async function() {
        try {
            await copyPublicKeyToClipboard();
            showCopyPublicOutput('Public Key copied to clipboard');
        } catch (error) {
            showCopyPublicOutput(`${error}`);
        }
    });

    // Event handler for sending SOL
    elements.send_sol_button.addEventListener('click', async function(event) {
        event.preventDefault(); // Prevent default form submission
        const recipientAddress = document.getElementById('recipientAddress').value;
        const amount = parseFloat(document.getElementById('send_to_recipient_amount').value);
        if (isNaN(amount) || amount <= 0) {
            showSendingOutput('Please enter a valid amount.');
            return;
        }
        try {
            showSendingOutput('Transaction in progress...');
            await sendSol(recipientAddress, amount);
            showSendingOutput(`Transaction sent successfully. SOL sent: ${amount} Recipient Address: ${recipientAddress}`);
            updateBalanceAndUsdValue(); // Update balance and USD value after sending transaction
        } catch (error) {
            showSendingOutput(`${error}`);
        }
    });
});