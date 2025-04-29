// @ts-check
import { addSlpToSendTx, addUtxos, removeUsedCoins } from '../../../utils/cashMethods';
import writeWalletState from './writeWalletState';

/**
 * Adds a cashout transaction to the wallet's state by processing the send transactions (txs) 
 * and updating the SLP balances and UTXOs. It also removes the coins that were used in the transaction 
 * and updates the wallet state accordingly.
 * 
 * This function performs the following steps:
 * 1. Removes the used coins (burned) from the wallet's SLP balances and UTXOs.
 * 2. Adds SLP data to each send transaction.
 * 3. Updates the wallet's state with the new SLP balances and UTXOs.
 * 4. Writes the updated wallet state to the storage.
 * 
 * @param {Object} context - The context containing the wallet state and functions to update it.
 * @param {Wallet} context.wallet - The current wallet object containing state information (e.g., SLP balances, UTXOs).
 * @param {Function} context.setWallet - Function to update the wallet state in the application.
 * @param {Function} context.setApiError - Function to set an API error state in the application.
 * @param {Array} txs - An array of transactions (txs) to be processed as part of the cashout.
 * @param {Array} coinsBurned - An array of coins that were used (burned) in the transaction, which need to be removed from the wallet's UTXOs.
 * 
 * @returns {Promise<void>} - A promise that resolves when the transaction is successfully processed and the state is updated.
 */
const addCashout = async ({ wallet, setWallet, setApiError }, txs, coinsBurned) => {
    try {
        // Remove the used (burned) coins from the wallet's SLP balances and UTXOs
        const reducedSlpBalancesAndUtxos = removeUsedCoins(wallet.state.slpBalancesAndUtxos, coinsBurned);

        // Add SLP data to each send transaction
        const slpTxs = txs.map(tx => addSlpToSendTx(tx));

        // Update the SLP balances and UTXOs with the new transactions
        const newSlpBalancesAndUtxos = addUtxos(reducedSlpBalancesAndUtxos, wallet.Path1899.cashAddress, slpTxs);

        // Merge the new state with the updated SLP balances and UTXOs
        const newState = Object.assign(wallet.state, { slpBalancesAndUtxos: newSlpBalancesAndUtxos });

        // Set the updated state in the wallet object
        wallet.state = newState;

        // Update the wallet state in the application
        setWallet(wallet);

        // Write the updated wallet state to storage
        await writeWalletState(wallet, newState);

        // Reset the API error state to indicate success
        setApiError(false);
    } catch (error) {
        console.log(`Error in addCashout(txs)`);
        console.log(error);

        // Set the API error state to true to indicate failure
        setApiError(true);
    }
}

export default addCashout;