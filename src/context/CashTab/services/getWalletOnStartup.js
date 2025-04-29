// @ts-check
import { isValidStoredWallet, loadStoredWallet } from '../../../utils/cashMethods';
import getWallet from './getWallet';

/**
 * Loads the wallet from storage (localForage) on application startup.
 * This function fetches the wallet from storage, checks its validity,
 * and converts any token balance figures into big numbers if valid.
 * If the wallet is invalid or doesn't exist, it returns `null`.
 * 
 * @async
 * @function loadWalletFromStorageOnStartup
 * @returns {Promise<Object|boolean>} 
 * - Returns the wallet object if it's valid, with token balances converted to big numbers.
 * - Returns `null` if the wallet is invalid or doesn't exist in storage.
 * 
 * @example
 * const wallet = await loadWalletFromStorageOnStartup();
 * if (wallet) {
 *   console.log("Loaded valid wallet:", wallet);
 * } else {
 *   console.log("No valid wallet found.");
 * }
 */
const getWalletOnStartup = async () => {
    // Get wallet object from localforage
    const wallet = await getWallet();
    
    // If the wallet object in storage is valid, it is set as wallet
    const isValid = isValidStoredWallet(wallet);
    
    if (isValid) {
        // Convert all the token balance figures to big numbers
        const liveWalletState = loadStoredWallet(wallet.state);
        wallet.state = liveWalletState;

        // Return the wallet object with updated state
        return wallet;
    } else {
        // Return false if the wallet is invalid or doesn't exist
        return null;
    }
};

export default getWalletOnStartup;