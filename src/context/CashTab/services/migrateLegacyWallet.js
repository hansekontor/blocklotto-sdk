// @ts-check
import { HDPrivateKey } from '@hansekontor/checkout-components';
import localforage from 'localforage';
import deriveAccount from './deriveAccount';

/**
 * Migrates a legacy wallet by deriving additional account paths and storing it in IndexedDB.
 * 
 * This function accepts a legacy wallet object that does not have all necessary paths (Path245, Path145, Path1899).
 * It derives these paths using the mnemonic phrase and then updates the wallet object to include these paths.
 * The updated wallet is then stored in IndexedDB using `localforage`.
 * 
 * @param {Wallet} wallet - The legacy wallet object to be migrated.
 * @returns {Promise<Object>} The updated wallet object with derived paths (`Path245`, `Path145`, `Path1899`).
 * 
 * @throws {Error} Throws an error if there is an issue with deriving the accounts or saving the wallet to localforage.
 */
const migrateLegacyWallet = async (wallet) => {
    const NETWORK = process.env.REACT_APP_NETWORK;
    const mnemonic = wallet.mnemonic;
    const masterHDNode = HDPrivateKey.fromPhrase(mnemonic);

    // Derive accounts for Path245, Path145, and Path1899
    const Path245 = await deriveAccount({
        masterHDNode,
        path: "m/44'/245'/0'/0/0",
    });
    const Path145 = await deriveAccount({
        masterHDNode,
        path: "m/44'/145'/0'/0/0",
    });
    const Path1899 = await deriveAccount({
        masterHDNode,
        path: "m/44'/1899'/0'/0/0",
    });

    // Add derived paths to the wallet
    wallet.Path245 = Path245;
    wallet.Path145 = Path145;
    wallet.Path1899 = Path1899;

    // Attempt to store the updated wallet in IndexedDB
    try {
        await localforage.setItem('wallet', wallet);
    } catch (err) {
        console.log(
            `Error setting wallet to wallet indexedDb in migrateLegacyWallet()`,
        );
        console.log(err);
    }

    return wallet;
};

export default migrateLegacyWallet;