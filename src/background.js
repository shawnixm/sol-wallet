/**
 * Background Script
 * 
 * This is the service worker that runs in the background of the Chrome extension.
 * It handles initialization of the wallet status when the extension is installed or updated.
 */

// Listen for extension installation or update
chrome.runtime.onInstalled.addListener(() => {
    checkWalletKeys();
});

/**
 * Checks if wallet keys exist in storage and updates status
 * 
 * This function is called when the extension is installed or updated
 * to ensure the keysExist flag correctly reflects whether keys are stored.
 */
async function checkWalletKeys() {
    chrome.storage.local.get(['publicKey', 'secretKey'], (result) => {
        const keysExist = result.publicKey && result.secretKey;
        chrome.storage.local.set({ keysExist });
    });
}