// @ts-check
import writeWalletState from './writeWalletState';
import { TX } from '@hansekontor/checkout-components';

/**
 * Adds a mined ticket to the wallet's state and updates the stored wallet information.
 * 
 * This function updates the wallet's ticket state by adding the mined ticket details 
 * to an existing ticket, identified by its issue hash. It also updates the wallet state 
 * in local storage and triggers a wallet update in the application state.
 * 
 * @param {Object} context - The context containing state-setting functions.
 * @param {Function} context.setWallet - Function to update the wallet state in the application.
 * @param {Wallet} context.wallet - The current wallet object containing state and ticket information.
 * @param {Function} context.setApiError - Function to set an API error state in the application.
 * @param {string} issueHash - The unique hash identifying the ticket issue transaction.
 * @param {Object} minedTicket - The mined ticket object containing details such as hex data.
 * 
 * @returns {Promise<void>} - A promise indicating the success or failure of the operation.
 */
const addMinedTicketToStorage = async ({ setWallet, wallet, setApiError }, issueHash, minedTicket) => {
    try {
        // Extract current tickets from wallet state
        const newTickets = wallet?.state?.tickets;
        // Find the index of the ticket with the matching issueHash
        const index = newTickets.findIndex(ticket => ticket.issueTx.hash === issueHash);

        // Add the mined ticket to the found ticket
        newTickets[index].parsed.minedTicket = minedTicket;

        // Convert mined ticket hex to a TX object and update the ticket issueTx
        const issueTx = TX.fromRaw(Buffer.from(minedTicket.hex, 'hex'), null);
        newTickets[index].issueTx = issueTx.toJSON();

        // Update wallet state with the new tickets array
        const newState = Object.assign(wallet.state, { tickets: newTickets });
        wallet.state = newState;

        // Set the updated wallet and wallet state
        setWallet(wallet);

        // Save the updated wallet state to storage
        await writeWalletState(wallet, newState);

        // Reset API error state
        setApiError(false);
    } catch (error) {
        console.log("Error in addMinedTicketToStorage");
        console.log(error);

        // Set API error state to true in case of failure
        setApiError(true);
    }
}

export default addMinedTicketToStorage;