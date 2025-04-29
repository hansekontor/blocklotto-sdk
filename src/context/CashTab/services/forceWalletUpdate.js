// @ts-check
import getWallet from './getWallet';

/**
 * Forces an update of the wallet by fetching the current wallet state 
 * and passing it to the provided update function.
 * 
 * This function retrieves the current wallet using `getWallet()`, 
 * and then calls the `updateWallet` function with the fetched wallet 
 * as part of the update process.
 * 
 * @param {Function} updateWallet - A function that accepts an object with the wallet 
 *                                  and performs an update action on it. This function 
 *                                  should return a promise.
 * 
 * @returns {Promise<*>} - The result of calling `updateWallet` with the current wallet. 
 *                          It returns whatever `updateWallet` returns.
 */
const forceWalletUpdate = async (updateWallet) => {
    // Fetch the current wallet
    const wallet = await getWallet();

    // Pass the wallet to the update function
    return await updateWallet({ wallet });
}

export default forceWalletUpdate;