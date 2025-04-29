// @ts-check
import localforage from 'localforage';

/**
 * Retrieves the list of saved wallets from local storage, excluding the active wallet.
 * 
 * This function checks for the 'savedWallets' entry in local storage using `localforage`. 
 * If it doesn't exist or there’s an error, an empty array is returned. It also ensures that
 * the active wallet (if passed) is not included in the returned list of saved wallets.
 * 
 * @param {Wallet} activeWallet - The currently active wallet, which will be excluded from the list of saved wallets.
 * 
 * @returns {Promise<Wallet[]>} A promise that resolves to an array of saved wallet objects, excluding the active wallet.
 * Each wallet object is expected to have a `name` property.
 */
const getSavedWallets = async (activeWallet) => {
    let savedWallets;
    try {
        savedWallets = await localforage.getItem('savedWallets');
        if (savedWallets === null) {
            savedWallets = [];
        }
    } catch (err) {
        console.log(`Error in getSavedWallets`);
        console.log(err);
        savedWallets = [];
    }
    // Even though the active wallet is still stored in savedWallets, don't return it in this function
    for (let i = 0; i < savedWallets.length; i += 1) {
        if (
            typeof activeWallet !== 'undefined' &&
            activeWallet.name &&
            savedWallets[i].name === activeWallet.name
        ) {
            savedWallets.splice(i, 1);
        }
    }
    return savedWallets;
};

export default getSavedWallets;