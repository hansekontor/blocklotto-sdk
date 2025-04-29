// @ts-check

import localforage from "localforage";

/**
 * Updates the state of a wallet object and persists it to local storage.
 *
 * This function mutates the provided wallet by setting its `state` property to `newState`,
 * then saves the updated wallet to persistent storage using localforage.
 *
 * @param {Wallet} wallet - The wallet object to update and persist. Must conform to the Wallet typedef.
 * @param {State} newState - The new state to apply to the wallet, including balances, UTXOs, and tickets.
 * @returns {Promise<void>} A promise that resolves when the wallet has been saved successfully.
 *
 * @example
 * const newState = {
 *   balances: 0,
 *   utxos: [],
 *   tokens: [],
 *   slpBalancesAndUtxos: {
 *     tokens: [],
 *     nonSlpUtxos: [],
 *     slpUtxos: [],
 *   },
 *   tickets: [],
 * };
 *
 * await writeWalletState(wallet, newState);
 */
const writeWalletState = async (wallet, newState) => {
    // console.log("writeWalletState", wallet?.state, newState);
    // Add new state as an object on the active wallet
    wallet.state = newState;
    try {
        await localforage.setItem('wallet', wallet);
    } catch (err) {
        console.log(`Error in writeWalletState()`);
        console.log(err);
    }
};

export default writeWalletState;