chrome.runtime.onInstalled.addListener(() => {
    // This runs when the extension is installed or updated
    checkWalletKeys();
});

async function checkWalletKeys() {
    chrome.storage.local.get(['publicKey', 'secretKey'], (result) => {
        const keysExist = result.publicKey && result.secretKey;
        chrome.storage.local.set({ keysExist });
    });
}