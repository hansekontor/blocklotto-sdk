// @ts-check
import { isValidStoredWallet } from '../../../utils/cashMethods';
import activateNewWallet from './activateNewWallet';

/**
 * Activates an existing wallet, either by loading it from storage or by fetching missing data from an API.
 * 
 * This function checks if the wallet has the necessary state parameters stored. If so, it activates the wallet 
 * immediately. If the wallet is missing state parameters (likely from a legacy or unmigrated wallet), 
 * it fetches the missing data via an API before activation.
 * 
 * @param {Object} params - The parameters required to activate the wallet.
 * @param {Function} params.setLoading - A function to set the loading state, typically to display or hide a loading spinner.
 * @param {Function} params.updateWallets - A function to update the wallet's state, typically by fetching data from an API.
 * @param {Function} params.setWallet - A function to set the currently active wallet in the state.
 * @param {Object} walletToActivate - The wallet that needs to be activated.
 * 
 * @returns {Promise<void>} - A promise that resolves once the wallet is activated, either immediately or after fetching data.
 */
const activateWallet = async ({ setLoading, updateWallets, setWallet }, walletToActivate) => {
    // Set loading to true to show the loading spinner during the wallet activation process
    setLoading(true);

    // Activate the wallet
    const newWallet = await activateNewWallet(walletToActivate);
    
    // Set the newly activated wallet in the state
    setWallet(newWallet);

    // Check if the wallet is valid and has the necessary state stored
    if (isValidStoredWallet(walletToActivate)) {
        // If all state parameters are available, immediately activate the wallet
        setLoading(false);
    } else {
        // If state parameters are missing, fetch them from the API (for legacy wallets)
        updateWallets({
            wallet: newWallet,
        }).finally(() => setLoading(false)); // Ensure loading state is reset after API call
    }
}

export default activateWallet;