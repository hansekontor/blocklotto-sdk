// @ts-check
import { addSlpToRedeemTx, addUtxos } from '../../../utils/cashMethods';
import TicketHistory from '../../../utils/ticket';
import writeWalletState from './writeWalletState';

/**
 * Adds a redeem transaction (tx) to the wallet's state, updating both the ticket history 
 * and the SLP balances and UTXOs.
 * 
 * This function takes a redeem transaction and its associated data, processes it by adding 
 * the SLP transaction data, and then updates the ticket history and wallet state with the 
 * new transaction information. It then writes the updated wallet state back to the storage.
 * 
 * @param {Object} context - The context containing the wallet state and functions to update it.
 * @param {Wallet} context.wallet - The current wallet object that contains state information (e.g., tickets, balances).
 * @param {Function} context.setWallet - Function to update the wallet state in the application.
 * @param {Function} context.setApiError - Function to set an API error state in the application.
 * @param {Object} tx - The redeem transaction object (without SLP data) to be added to the wallet's state.
 * @param {Object} redeemData - The data related to the redeem transaction, used to process the ticket redemption.
 * 
 * @returns {Promise<void>} - A promise that resolves when the transaction is successfully added to the wallet's state.
 */
const addRedeemTxToStorage = async ({ wallet, setWallet, setApiError }, tx, redeemData) => {
    try {
        // Add SLP data to the redeem transaction
        const slpTx = addSlpToRedeemTx(tx);
        // Initialize the TicketHistory object with the wallet's current ticket data
        const ticketHistory = new TicketHistory(wallet.state.tickets);
        // Add the ticket from the redemption process
        await ticketHistory.addTicketFromRedemption(slpTx, redeemData);

        // Update the SLP balances and UTXOs
        const newSlpBalancesAndUtxos = addUtxos(wallet.state.slpBalancesAndUtxos, wallet.Path1899.cashAddress, [slpTx]);

        // Merge the new state with the updated ticket history and SLP balances
        const newState = Object.assign(wallet.state, { tickets: ticketHistory.tickets, slpBalancesAndUtxos: newSlpBalancesAndUtxos });
        wallet.state = newState;

        // Update the wallet state in the application
        setWallet(wallet);

        // Write the updated wallet state to storage
        writeWalletState(wallet, newState);

        // Reset the API error state to indicate success
        setApiError(false);
    } catch (error) {
        console.log(`Error in addRedeemTxToStorage`);
        console.log(error);

        // Set the API error state to true to indicate failure
        setApiError(true);
    }
}

export default addRedeemTxToStorage;