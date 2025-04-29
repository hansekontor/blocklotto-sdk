// @ts-check
import isEqual from "lodash.isequal";
import { getSlpBalancesAndUtxos } from '../../../utils/cashMethods';
import TicketHistory from '../../../utils/ticket';
import normalizeBalance from "../utils/normalizeBalance";
import writeWalletState from "./writeWalletState";

/**
 * Updates the wallet state by fetching fresh UTXO and ticket data, 
 * then updating the balances, tokens, tickets, and SLP-related info.
 *
 * @param {Object} params - The parameters for the update.
 * @param {Wallet} params.wallet - The wallet object to update.
 * @param {(cashAddress: string) => Promise<{ utxos: any[], txs: any[], tokenUtxos: any[] }>} params.getTicketData - 
 * A function that fetches ticket and UTXO data for a given cash address.
 * @param {(wallet: Wallet) => void} params.setWallet - State setter function to update the wallet in the app's state.
 * @param {(hasError: boolean) => void} params.setApiError - State setter to signal API error state in the UI.
 * 
 * @returns {Promise<void>} Resolves when the wallet state is updated or logs error if failed.
 */
const updateWallet = async ({ wallet, getTicketData, setWallet, setApiError }) => {
    console.log("update()");
    try {
        if (!wallet) {
            return;
        }

        // Fetch new ticket and UTXO data
        const ticketData = await getTicketData(wallet.Path1899.cashAddress);

        // Detect changes in UTXOs (though not used further here)
        const utxosHaveChanged = !isEqual(ticketData.tokenUtxos, wallet?.state?.utxos);

        // Recalculate SLP balances and UTXOs
        const slpBalancesAndUtxos = getSlpBalancesAndUtxos(ticketData.utxos);
        if (typeof slpBalancesAndUtxos === 'undefined') {
            throw new Error('slpBalancesAndUtxos is undefined');
        }

        // Update ticket history
        const ticketHistory = new TicketHistory(wallet.state.tickets);
        await ticketHistory.addTicketsFromNode(ticketData.txs);

        // Extract tokens
        const { tokens } = slpBalancesAndUtxos;

        // Construct the new wallet state
        const newState = {
            balances: normalizeBalance(slpBalancesAndUtxos),
            utxos: ticketData.utxos,
            tokens: tokens,
            slpBalancesAndUtxos: slpBalancesAndUtxos,
            tickets: ticketHistory.tickets
        };

        // Apply the new state to the wallet
        wallet.state = newState;
        setWallet(wallet);

        // Persist the new state using localForage
        await writeWalletState(wallet, newState);

        // Clear any previous API error
        setApiError(false);
    } catch (error) {
        console.log(`Error in update({wallet})`);
        console.log(error);
        // Trigger an API error state for the UI
        setApiError(true);
    }
};

export default updateWallet;