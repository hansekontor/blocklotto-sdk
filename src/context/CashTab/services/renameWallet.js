// @ts-check
import localforage from 'localforage';

/**
 * Renames an existing wallet in the saved wallets list.
 * 
 * This function updates the name of a wallet from `oldName` to `newName`. 
 * It performs the following tasks:
 * 1. Loads the saved wallets from local storage.
 * 2. Verifies that no other wallet already has the new name.
 * 3. Updates the name of the specified wallet.
 * 4. Saves the updated list of saved wallets back to local storage.
 * 
 * If the `newName` already exists in the saved wallets, the function will return `false`.
 * If the operation is successful, it returns `true`. Otherwise, it returns `false` in case of an error.
 *
 * @param {string} oldName - The current name of the wallet to be renamed.
 * @param {string} newName - The new name to assign to the wallet.
 * 
 * @returns {Promise<boolean>} Returns `true` if the wallet is renamed successfully, `false` if there was an error or the new name is already taken.
 */
const renameWallet = async (oldName, newName) => {
    // Load savedWallets
    let savedWallets;
    try {
        savedWallets = await localforage.getItem('savedWallets');
    } catch (err) {
        console.log(
            `Error in await localforage.getItem("savedWallets") in renameWallet`,
        );
        console.log(err);
        return false;
    }

    // Verify that no existing wallet has this name
    for (let i = 0; i < savedWallets.length; i += 1) {
        if (savedWallets[i].name === newName) {
            // Return an error if the new name already exists
            return false;
        }
    }

    // Change the name of the desired wallet
    for (let i = 0; i < savedWallets.length; i += 1) {
        if (savedWallets[i].name === oldName) {
            // Replace the name of this wallet with the new name
            savedWallets[i].name = newName;
        }
    }

    // Resave the updated list of saved wallets
    try {
        await localforage.setItem('savedWallets', savedWallets);
    } catch (err) {
        console.log(
            `Error in localforage.setItem("savedWallets", savedWallets) in renameWallet()`,
        );
        return false;
    }

    // Return true if the wallet was renamed successfully
    return true;
};

export default renameWallet;