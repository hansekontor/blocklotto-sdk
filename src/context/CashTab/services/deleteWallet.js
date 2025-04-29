// @ts-check
import localforage from 'localforage';

/**
 * Deletes a wallet from the saved wallets list.
 *
 * This function removes the specified wallet from the list of saved wallets. It checks both the name and mnemonic 
 * of the wallet to ensure the correct wallet is deleted. If the wallet is successfully deleted, it returns `true`.
 * Otherwise, it returns `false`. If any errors occur while interacting with local storage, the function will also 
 * return `false`.
 *
 * @param {Object} walletToBeDeleted - The wallet object to be deleted.
 * @param {string} walletToBeDeleted.name - The name of the wallet to be deleted.
 * @param {string} walletToBeDeleted.mnemonic - The mnemonic of the wallet to be deleted (used as a more secure identifier).
 * 
 * @returns {Promise<boolean>} Returns `true` if the wallet is successfully deleted, otherwise returns `false`.
 */
const deleteWallet = async walletToBeDeleted => {
    // Load savedWallets
    let savedWallets;
    try {
        savedWallets = await localforage.getItem('savedWallets');
    } catch (err) {
        console.log(
            `Error in await localforage.getItem("savedWallets") in deleteWallet`,
        );
        console.log(err);
        return false;
    }

    // Iterate over saved wallets to find the wallet to be deleted
    let walletFoundAndRemoved = false;
    for (let i = 0; i < savedWallets.length; i += 1) {
        if (savedWallets[i].name === walletToBeDeleted.name) {
            // Verify the mnemonic to ensure the correct wallet is deleted
            if (savedWallets[i].mnemonic === walletToBeDeleted.mnemonic) {
                // Delete the wallet
                savedWallets.splice(i, 1);
                walletFoundAndRemoved = true;
            }
        }
    }

    // If the wallet was not found, return false
    if (!walletFoundAndRemoved) {
        return false;
    }

    // Resave the updated list of saved wallets (excluding the deleted wallet)
    try {
        await localforage.setItem('savedWallets', savedWallets);
    } catch (err) {
        console.log(
            `Error in localforage.setItem("savedWallets", savedWallets) in deleteWallet()`,
        );
        return false;
    }

    // Return true if the wallet was successfully deleted
    return true;
};

export default deleteWallet;