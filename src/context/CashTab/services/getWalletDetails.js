// @ts-check
import { HDPrivateKey } from '@hansekontor/checkout-components';
import deriveAccount from './deriveAccount';

/**
 * Retrieves and derives wallet details including account paths for Path245, Path145, and Path1899.
 * If the wallet does not have these paths, it derives them from the provided mnemonic phrase.
 * The wallet name is either extracted from the cash address or, if provided, is used from the wallet object.
 * 
 * @param {Wallet} wallet - The wallet object containing at least a mnemonic phrase.
 * @returns {Promise<Object|null>} The updated wallet details with the derived account paths (Path245, Path145, Path1899), or `null` if the wallet is not provided.
 * 
 * @throws {Error} Throws an error if there is an issue with deriving the accounts from the mnemonic.
 */
const getWalletDetails = async (wallet) => {
    // If no wallet is provided, return null
    if (!wallet) {
        return null;
    }
    
    // Since this info is in localForage now, only get the variable
    const NETWORK = process.env.REACT_APP_NETWORK;
    const mnemonic = wallet.mnemonic;
    const masterHDNode = HDPrivateKey.fromPhrase(mnemonic);

    // Derive account paths Path245, Path145, and Path1899 from the master HD node
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

    // Extract a name from the cash address if it exists or use the existing name
    let name = Path1899.cashAddress.slice(12, 17);
    // Only set the name if it does not currently exist in the wallet
    if (wallet && wallet.name) {
        name = wallet.name;
    }

    // Return the updated wallet object with derived account paths and name
    return {
        mnemonic: wallet.mnemonic,
        name,
        Path245,
        Path145,
        Path1899,
    };
};

export default getWalletDetails;