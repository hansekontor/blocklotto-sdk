// @ts-check
import localforage from 'localforage';

/**
 * Retrieves the active wallet from localForage storage.
 * 
 * This function attempts to fetch the wallet object stored in localForage under the key 'wallet'.
 * If successful, it returns the wallet object. If there is an error (e.g., localForage is unavailable),
 * it logs the error and returns `null`.
 * 
 * @returns {Promise<Object|null>} A promise that resolves to the wallet object if found, or `null` if not found or on error.
 * 
 * @throws {Error} If there is an issue accessing localForage, the error is logged and `null` is returned.
 */
const getActiveWallet = async () => {
    let wallet;
    try {
        wallet = await localforage.getItem('wallet');
        // console.log("getActiveWalletFromLocalForage localforage wallet", wallet);
    } catch (err) {
        console.log(`Error in getActiveWalletFromLocalForage`, err);
        wallet = null;
    }
    return wallet;
};

export default getActiveWallet;