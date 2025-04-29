// @ts-check
import localforage from 'localforage';
import migrateLegacyWallet from './migrateLegacyWallet';
import { isLegacyMigrationRequired, isValidStoredWallet, loadStoredWallet } from '../../../utils/cashMethods';

/**
 * Activates a new wallet and ensures it is properly migrated and saved in local storage.
 * 
 * This function checks if the wallet being activated is part of a legacy system and migrates it if necessary.
 * It handles the following cases:
 * 1. If the currently active wallet is not present in the saved wallets list, it adds it.
 * 2. If the active wallet is in the saved wallets list but does not have the Path1899, it migrates it.
 * 3. Ensures the wallet is saved with its most recent state.
 * 4. If the wallet is legacy, it will migrate it to Path1899 and ensure it has all required public keys.
 * 
 * @param {Wallet} walletToActivate - The wallet to activate.
 * 
 * @returns {Promise<Wallet | null>} The activated wallet, potentially after migration.
 */
const activateNewWallet = async (walletToActivate) => {
    let currentlyActiveWallet;
    try {
        currentlyActiveWallet = await localforage.getItem('wallet');
    } catch (err) {
        console.log(`Error in localforage.getItem("wallet") in activateNewWallet()`);
        return null;
    }

    // Get savedwallets
    let savedWallets;
    try {
        savedWallets = await localforage.getItem('savedWallets');
    } catch (err) {
        console.log(`Error in localforage.getItem("savedWallets") in activateNewWallet()`);
        return null;
    }

    /*
    Two cases to handle when migrating wallets from legacy system:
    1. The active wallet has Path1899 but it’s missing from savedWallets. We add it.
    2. The wallet to activate is missing Path1899, so we add it.
    */

    // Check if the active wallet is in savedWallets
    let walletInSavedWallets = false;
    for (let i = 0; i < savedWallets.length; i += 1) {
        if (savedWallets[i].name === currentlyActiveWallet.name) {
            walletInSavedWallets = true;
            // Check if migration is needed for the active wallet
            if (isLegacyMigrationRequired(savedWallets[i])) {
                // Case 1: Migrate the active wallet to Path1899
                savedWallets[i].Path1899 = currentlyActiveWallet.Path1899;
                savedWallets[i].Path145 = currentlyActiveWallet.Path145;
                savedWallets[i].Path245 = currentlyActiveWallet.Path245;
            }

            // Update the wallet state in savedWallets
            savedWallets[i].state = currentlyActiveWallet.state;
        }
    }

    // Resave savedWallets after updates
    try {
        await localforage.setItem('savedWallets', savedWallets);
    } catch (err) {
        console.log(`Error in localforage.setItem("savedWallets") in activateNewWallet() for unmigrated wallet`);
    }

    if (!walletInSavedWallets) {
        savedWallets.push(currentlyActiveWallet);
        // Resave savedWallets if the wallet was not in savedWallets
        try {
            await localforage.setItem('savedWallets', savedWallets);
        } catch (err) {
            console.log(`Error in localforage.setItem("savedWallets") in activateNewWallet()`);
        }
    }

    // If wallet is legacy and requires migration, perform migration
    if (isLegacyMigrationRequired(walletToActivate)) {
        console.log(`Migrating wallet to Path1899`);
        walletToActivate = await migrateLegacyWallet(walletToActivate);
    } else {
        // If not legacy, activate the wallet as normal
        try {
            await localforage.setItem('wallet', walletToActivate);
        } catch (err) {
            console.log(`Error in localforage.setItem("wallet", walletToActivate) in activateNewWallet()`);
            return null;
        }
    }

    // Make sure stored wallet is in correct format for usage
    if (isValidStoredWallet(walletToActivate)) {
        const liveWalletState = loadStoredWallet(walletToActivate.state);
        walletToActivate.state = liveWalletState;
    }

    return walletToActivate;
};

export default activateNewWallet;