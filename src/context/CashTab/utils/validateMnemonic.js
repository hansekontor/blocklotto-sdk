// @ts-check
import { Mnemonic } from '@hansekontor/checkout-components';

/**
 * Validates if the provided mnemonic is a valid BIP39 phrase.
 *
 * This function checks if the given mnemonic can be converted into a valid `Mnemonic` object
 * and if the string representation of the object matches the original mnemonic.
 * If the validation is successful, it returns `true`; otherwise, it returns `false`.
 *
 * @param {string} mnemonic - The mnemonic phrase to validate.
 * 
 * @returns {boolean} Returns `true` if the mnemonic is valid, otherwise `false`.
 */
const validateMnemonic = (mnemonic) => {
    let mnemonicTestOutput;

    try {
        // Attempt to convert the mnemonic phrase into a Mnemonic object
        mnemonicTestOutput = Mnemonic.fromPhrase(mnemonic);

        // Check if the mnemonic is valid by comparing the string representation
        if (mnemonicTestOutput.toString() === mnemonic) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        // Log any errors that occur during the process
        console.log(err);
        return false;
    }
};

export default validateMnemonic;