// @ts-check
import { KeyRing } from '@hansekontor/checkout-components';

/**
 * Signs a message using a secret key.
 *
 * @param {any} secret - The secret key used to generate the signature.
 * @param {Buffer} msg - The message to be signed.
 * @returns {Buffer} The generated signature for the provided message.
 */
const signMessage = (secret, msg) => {
    const keyring = KeyRing.fromSecret(secret, null);
    const sig = keyring.sign(msg);

    return sig;
}

export default signMessage;