// @ts-check
import localforage from 'localforage';
import { isLegacyMigrationRequired } from '../../../utils/cashMethods';
import getActiveWallet from './getActiveWallet';
import migrateLegacyWallet from './migrateLegacyWallet';
import getWalletDetails from './getWalletDetails';

/**
 * Retrieves the active wallet either from `localForage` or `localStorage`, 
 * and ensures its structure is up-to-date. If the wallet is found in `localStorage` 
 * but not in `localForage`, it will migrate it. If no wallet is found, it creates 
 * a new wallet and stores it in `localForage`.
 * 
 * @async
 * @function getWallet
 * @returns {Promise<Object>} The wallet object, which contains the details of 
 * the user's wallet, such as public keys, addresses, balances, etc.
 * 
 * @throws {Error} Throws an error if there's an issue interacting with `localForage` 
 * or `localStorage`.
 * 
 * @example
 * // Example usage
 * const wallet = await getWallet();
 * console.log(wallet);
 */
const getWallet = async () => {
    let wallet;
    let existingWallet;
    try {
        // Retrieve the existing wallet from localForage
        existingWallet = await getActiveWallet();
        // existing wallet will be:
        // 1 - the 'wallet' value from localForage, if it exists
        // 2 - false if it does not exist in localForage
        // 3 - null if there's an error

        // Check if the wallet requires migration (missing Path1899 or public key)
        if (existingWallet) {
            if (isLegacyMigrationRequired(existingWallet)) {
                console.log(`Wallet does not have Path1899 or does not have a public key`);
                existingWallet = await migrateLegacyWallet(existingWallet);
                console.log("Migrated existing wallet", existingWallet);
            }
        }

        // If no wallet is found in localForage, check localStorage
        if (!existingWallet) {
            existingWallet = JSON.parse(window.localStorage.getItem('wallet'));
            // If found in localStorage, migrate to localForage
            if (existingWallet !== null) {
                wallet = await getWalletDetails(existingWallet);
                await localforage.setItem('wallet', wallet);
                return wallet;
            }
        }
    } catch (err) {
        console.log(`Error in getWallet()`, err);
        /* 
        Error here implies a problem interacting with localForage or localStorage API.
        This error is rarely encountered in testing.
        Even if an error occurs, return 'wallet' based on the logic below from existingWallet.
        */
    }

    // If no wallet is found or if the existing wallet is null, create a new one
    if (existingWallet === null || !existingWallet) {
        wallet = await getWalletDetails(existingWallet);
        await localforage.setItem('wallet', wallet);
    } else {
        wallet = existingWallet;
    }

    return wallet;
};

export default getWallet;