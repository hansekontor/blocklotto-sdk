// @ts-check
import createNewWallet from './createNewWallet';

/**
 * Creates a new wallet and updates the wallet state.
 * 
 * This function creates a new wallet, either from an imported mnemonic or by generating a new one, 
 * then sets the wallet in the state. If the wallet is imported, it also updates the wallet with the 
 * existing tickets and balance information. 
 * 
 * @param {Object} params - The parameters required for the wallet creation and update process.
 * @param {Function} params.setWallet - A function that updates the current wallet in the state.
 * @param {Function} params.updateWallets - A function that updates the wallet with additional information such as tickets and balance.
 * @param {Function} params.setLoading - A function to indicate loading state, typically used to show or hide a loading spinner.
 * @param {string} [importMnemonic] - An optional mnemonic string. If provided, the wallet is created using the imported mnemonic.
 *                                    If not provided, a new wallet is generated instead.
 * 
 * @returns {Promise<void>} - A promise that resolves when the wallet is successfully created and state is updated.
 */
const createWallet = async ({ setWallet, updateWallets, setLoading }, importMnemonic) => {
    // Create a new wallet using the provided mnemonic or generate a new one
    const newWallet = await createNewWallet(importMnemonic);
    
    // Set the newly created wallet in the state
    setWallet(newWallet);

    // If the wallet is imported, update it with the existing tickets and balance
    if (importMnemonic) {
        updateWallets({
            wallet: newWallet,
        }).finally(() => setLoading(false));
    } else {
        // No further action required for a new wallet
        // setLoading(false);  // Uncomment this if you want to reset loading state in this case as well
    }
}

export default createWallet;