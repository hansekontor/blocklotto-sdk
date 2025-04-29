// @ts-check
import { KeyRing } from '@hansekontor/checkout-components';
import cashaddr from 'ecashaddrjs';

/**
 * Derives an account based on a given HD node and path.
 * 
 * This function takes a master HD node and a derivation path, derives the appropriate account,
 * and generates several types of addresses (cash address, SLP address, legacy address).
 * It also returns the public key, funding WIF (Wallet Import Format), and funding address.
 * 
 * @param {Object} params - The parameters for deriving the account.
 * @param {Object} params.masterHDNode - The master HD node (usually from BIP32/BIP44).
 * @param {string} params.path - The derivation path to derive the account (e.g., "m/44'/0'/0'/0").
 * 
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 * - `publicKey`: The derived public key in hexadecimal format.
 * - `cashAddress`: The derived cash address (standard Bitcoin Cash address format).
 * - `slpAddress`: The derived SLP address (SLP token address).
 * - `fundingWif`: The Wallet Import Format (WIF) of the private key.
 * - `fundingAddress`: The derived funding address (SLP address).
 * - `legacyAddress`: The derived legacy address (base58 format).
 * 
 * @throws {Error} Throws an error if there's an issue with deriving the account or generating addresses.
 */
const deriveAccount = async ({ masterHDNode, path }) => {
    const node = masterHDNode.derivePath(path);
    const publicKey = node.toPublic().publicKey.toString('hex');
    const keyring = KeyRing.fromPrivate(node.privateKey, null);
    const cashAddress = keyring.getAddress('string');
    const decodedAddress = cashaddr.decode(cashAddress);
    const slpAddress = cashaddr.encode(
        'etoken',
        decodedAddress.type,
        decodedAddress.hash
    );

    return {
        publicKey,
        cashAddress,
        slpAddress,
        fundingWif: keyring.toSecret(),
        fundingAddress: slpAddress,
        legacyAddress: keyring.getAddress('base58'),
    };
};

export default deriveAccount;