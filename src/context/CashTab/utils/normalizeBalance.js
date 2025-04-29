// @ts-check
import { fromSmallestDenomination } from '../../../utils/cashMethods';

/**
 * Normalizes the balance by calculating the total balance in satoshis and the total balance in the smallest denomination.
 * 
 * @param {Object} slpBalancesAndUtxos - The SLP balances and UTXOs data.
 * @param {Array} slpBalancesAndUtxos.nonSlpUtxos - The list of non-SLP UTXOs.
 * @param {object} utxo - An individual UTXO object.
 * @param {number} utxo.value - The value of the UTXO (in satoshis).
 * 
 * @returns {Object} An object containing:
 * - {number} totalBalanceInSatoshis: The total balance of non-SLP UTXOs in satoshis.
 * - {string} totalBalance: The total balance in the smallest denomination (e.g., BCH).
 */
const normalizeBalance = (slpBalancesAndUtxos) => {
    const totalBalanceInSatoshis = slpBalancesAndUtxos.nonSlpUtxos.reduce(
        (previousBalance, utxo) => previousBalance + utxo.value,
        0,
    );
    return {
        totalBalanceInSatoshis,
        totalBalance: fromSmallestDenomination(totalBalanceInSatoshis),
    };
};

export default normalizeBalance;