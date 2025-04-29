// @ts-check
import localforage from 'localforage';
import getWalletDetails from './getWalletDetails';
import { Mnemonic } from '@hansekontor/checkout-components';

/**
 * Creates a new wallet with a randomly generated or imported BIP39 mnemonic phrase.
 * This function initializes a new wallet, sets an initial state, and stores it in `localForage`.
 * 
 * If a mnemonic is provided, it will be used to generate the wallet. Otherwise, a new mnemonic is created.
 * 
 * @async
 * @function createNewWallet
 * @param {string} [importMnemonic] - Optional BIP39 mnemonic string to import. If not provided, a new mnemonic is generated.
 * @returns {Promise<Object>} The newly created wallet object with initialized state.
 * @throws {Error} Will throw an error if there is an issue saving the wallet to `localForage`.
 * 
 * @example
 * const newWallet = await createNewWallet();
 * console.log(newWallet);
 * 
 * @example
 * const importedWallet = await createNewWallet('your-12-word-mnemonic');
 * console.log(importedWallet);
 */
const createNewWallet = async (importMnemonic) => {
    const lang = 'english';

    
    // Create 128-bit BIP39 mnemonic (if no mnemonic is provided, generate a new one)
    const Bip39128BitMnemonic = importMnemonic
        ? importMnemonic
        // @ts-ignore
        : new Mnemonic({
            language: lang
        });

    // Get wallet details using the mnemonic
    // @ts-ignore
    const wallet = await getWalletDetails({
        mnemonic: Bip39128BitMnemonic.toString(),
    });

    // Set initial state for the wallet
    const initialState = {
        balances: {},
        utxos: [],
        tokens: [],
        slpBalancesAndUtxos: [],
        tickets: [],
    };

    wallet.state = initialState;

    try {
        // Save the wallet to localForage
        await localforage.setItem('wallet', wallet);
        console.log("createNewWallet() wallet set in localforage", wallet);
    } catch (err) {
        console.log(`Error setting wallet to wallet indexedDb in createNewWallet()`);
        console.log(err);
    }

    // Optionally, save to 'savedWallets', though currently not used
    // try {
    //     await localforage.setItem('savedWallets', [wallet]);
    // } catch (err) {
    //     console.log(`Error setting wallet to savedWallets indexedDb in createNewWallet()`);
    //     console.log(err);
    // }

    return wallet;
};

export default createNewWallet;