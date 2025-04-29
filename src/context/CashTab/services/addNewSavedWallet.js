// @ts-check

import { Mnemonic } from '@hansekontor/checkout-components';
import localforage from 'localforage';
import getWalletDetails from './getWalletDetails';

/**
 * Adds a new wallet to the savedWallets list.
 *
 * This function either creates a new wallet from a provided mnemonic or generates a new mnemonic
 * for a fresh wallet. It then ensures that the wallet does not already exist in the savedWallets list.
 * If the wallet is not already saved, it adds the new wallet to the savedWallets and updates the local storage.
 *
 * @param {string} [importMnemonic] - The mnemonic to import for the new wallet. If not provided, a new mnemonic is generated.
 * 
 * @returns {Promise<boolean>} Returns `true` if the wallet was successfully added to the savedWallets, otherwise `false` if the wallet already exists.
 */
const addNewSavedWallet = async importMnemonic => {
    // Add a new wallet to savedWallets from importMnemonic or just new wallet
    const lang = 'english';
    
    // Create 128 bit BIP39 mnemonic, either using the provided importMnemonic or generating a new one
    const Bip39128BitMnemonic = importMnemonic
        ? importMnemonic
        // @ts-ignore
        : new Mnemonic({ language: lang });

    // @ts-ignore
    const newSavedWallet = await getWalletDetails({
        mnemonic: Bip39128BitMnemonic.toString(),
    });

    // Get saved wallets from local storage
    let savedWallets;
    try {
        savedWallets = await localforage.getItem('savedWallets');
        // If this doesn't exist yet, savedWallets === null
        if (savedWallets === null) {
            savedWallets = [];
        }
    } catch (err) {
        console.log(
            `Error in savedWallets = await localforage.getItem("savedWallets") in addNewSavedWallet()`,
        );
        console.log(err);
        console.log(`savedWallets in error state`, savedWallets);
    }

    // If the wallet is from an imported mnemonic, ensure it doesn't already exist in savedWallets
    if (importMnemonic) {
        for (let i = 0; i < savedWallets.length; i += 1) {
            // Check if the wallet is already in savedWallets
            if (savedWallets[i].mnemonic === importMnemonic) {
                console.log(`Error: this wallet already exists in savedWallets`);
                console.log(`Wallet not being added.`);
                return false;
            }
        }
    }

    // Add the new wallet to savedWallets
    savedWallets.push(newSavedWallet);

    // Update the savedWallets list in local storage
    try {
        await localforage.setItem('savedWallets', savedWallets);
    } catch (err) {
        console.log(
            `Error in localforage.setItem("savedWallets", activeWallet) called in createNewWallet with ${importMnemonic}`,
        );
        console.log(`savedWallets`, savedWallets);
        console.log(err);
    }

    return true;
};

export default addNewSavedWallet;