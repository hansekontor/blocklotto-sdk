// @ts-check
import TicketHistory from '../../../utils/ticket';
import { addSlpToSendTx, addUtxos, removeUsedCoins } from '../../../utils/cashMethods';
import writeWalletState from './writeWalletState';

// todo: integrate with addIssueTxsToStorage 

/**
 * Processes issuance transactions and updates the wallet state accordingly.
 * It adds newly issued tickets, updates SLP balances and UTXOs based on coins used and change from payment transactions.
 *
 * @param {Object} context - Context object containing wallet and state management functions.
 * @param {Wallet} context.wallet - The wallet object whose state needs to be updated.
 * @param {(wallet: Wallet) => void} context.setWallet - State setter function to update the wallet in the app.
 * @param {(hasError: boolean) => void} context.setApiError - Function to set or clear API error state.
 * @param {Array<Object>} txs - The new issuance transactions to be added to ticket history.
 * @param {Array<Object>} coinsUsed - List of UTXOs that were used in the payment transaction.
 * @param {Array<Object>} [paymentTxs] - Optional array of payment transactions to process SLP change.
 * 
 * @returns {Promise<void>} Resolves after updating and persisting the new wallet state.
 */
const addIssueTxs = async ({ wallet, setWallet, setApiError }, txs, coinsUsed, paymentTxs = []) => {
    try {
        // Initialize ticket history manager with current wallet tickets
        const ticketHistory = new TicketHistory(wallet.state.tickets);
        await ticketHistory.addTicketsFromIssuance(txs);

        let newState;

        if (coinsUsed.length > 0) {
            // Remove UTXOs that have been used for payment transactions
            let newSlpBalancesAndUtxos = removeUsedCoins(wallet.state.slpBalancesAndUtxos, coinsUsed);

            if (paymentTxs) {
                const slpTxs = paymentTxs.map(tx => addSlpToSendTx(tx));
                // Add UTXOs that came back as change
                newSlpBalancesAndUtxos = addUtxos(newSlpBalancesAndUtxos, wallet.Path1899.cashAddress, slpTxs);
            }

            newState = Object.assign(wallet.state, { tickets: ticketHistory.tickets, slpBalancesAndUtxos: newSlpBalancesAndUtxos });
        } else {
            newState = Object.assign(wallet.state, { tickets: ticketHistory.tickets });
        }

        wallet.state = newState;
        setWallet(wallet);

        await writeWalletState(wallet, newState);
        setApiError(false);

        // return newly added tickets
        const hashArray = txs.map(tx => tx.rhash());
        console.log("hashArray", hashArray);
        const addedTickets = hashArray.map(hash => {
            const newTicket = ticketHistory.tickets.find(ticket => ticket.issueTx.hash === hash);
            return newTicket;
        }).filter(ticket => ticket);

        console.log("addedTickets", addedTickets);
        return addedTickets;
    } catch (error) {
        console.log(`Error in addIssueTx(txs)`);
        console.log(error);
        setApiError(true);
    }
};

export default addIssueTxs;