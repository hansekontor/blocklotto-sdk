// @ts-check
import { convertArrayBufferToBase64 } from "../../../utils/convertArrBuffBase64";

/**
 * Creates an authentication handler that manages user sign-up, sign-in, sign-out, 
 * and authentication status.
 * 
 * The authentication handler provides methods to:
 * - Turn on/off authentication requirements.
 * - Sign up a new user using WebAuthn.
 * - Sign in an existing user using WebAuthn.
 * - Sign out the user.
 * 
 * @param {Object} config - Configuration object containing authentication state and methods.
 * @param {boolean} config.isAuthenticationRequired - Whether authentication is required.
 * @param {string | null} config.credentialId - The user's credential ID, stored in Base64 format.
 * @param {boolean} config.isSignedIn - Whether the user is signed in.
 * @param {boolean} config.loading - Whether the authentication process is loading.
 * @param {Function} config.setIsAuthenticationRequired - Function to set authentication requirement state.
 * @param {Function} config.setIsSignedIn - Function to set signed-in state.
 * @param {Function} config.setCredentialId - Function to set the credential ID.
 * @param {PublicKeyCredentialCreationOptions} config.publicKeyCredentialCreationOptions - The options for creating a public key credential.
 * @param {PublicKeyCredentialRequestOptions} config.publicKeyCredentialRequestOptions - The options for requesting a public key credential.
 * 
 * @returns {Object} The authentication handler with methods for sign-up, sign-in, sign-out, and authentication toggling.
 */
export const createAuthenticationHandler = ({
    isAuthenticationRequired,
    credentialId,
    isSignedIn,
    loading,
    setIsAuthenticationRequired,
    setIsSignedIn,
    setCredentialId,
    publicKeyCredentialCreationOptions,
    publicKeyCredentialRequestOptions,
}) => {
    /**
     * Turns on the authentication requirement, provided the `credentialId` is set.
     * If the `credentialId` is not set, it prevents enabling authentication to avoid locking the user out.
     */
    const turnOnAuthentication = () => {
        if (credentialId) {
            setIsAuthenticationRequired(true);
        }
    };

    /**
     * Turns off the authentication requirement.
     */
    const turnOffAuthentication = () => {
        setIsAuthenticationRequired(false);
    };

    /**
     * Signs up a new user by creating a public key credential using WebAuthn.
     * Once the user is successfully registered, the `credentialId` is stored as a Base64 string,
     * and the user is marked as signed in.
     * 
     * @async
     * @throws {Error} Throws an error if credential creation fails.
     */
    const signUp = async () => {
        try {
            const publicKeyCredential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
            });
    
            if (publicKeyCredential instanceof PublicKeyCredential && publicKeyCredential.rawId) {
                // Convert the rawId from ArrayBuffer to Base64
                const base64Id = convertArrayBufferToBase64(publicKeyCredential.rawId);
                setIsSignedIn(true);
                setCredentialId(base64Id);
                setIsAuthenticationRequired(true);
            } else {
                throw new Error('Error: navigator.credentials.create() returns invalid credential in signUp()');
            }
        } catch (err) {
            throw err;
        }
    };

    /**
     * Signs in an existing user using WebAuthn.
     * The method retrieves the user's credential based on the `credentialId`.
     * If the credential matches the stored `credentialId`, the user is signed in.
     * 
     * @async
     * @throws {Error} Throws an error if authentication fails or if the credentials do not match.
     */
    const signIn = async () => {
        try {
            const assertion = await navigator.credentials.get({
                publicKey: publicKeyCredentialRequestOptions,
            });
    
            // Ensure the credential is a PublicKeyCredential
            if (assertion instanceof PublicKeyCredential && assertion.rawId) {
                const base64Id = convertArrayBufferToBase64(assertion.rawId);
                if (base64Id === credentialId) {
                    setIsSignedIn(true);
                }
            } else {
                throw new Error('Error: navigator.credentials.get() returned an invalid credential');
            }
        } catch (err) {
            throw err;
        }
    };
    
    /**
     * Signs out the current user.
     * This action sets the `isSignedIn` flag to `false`, effectively logging the user out.
     */
    const signOut = () => {
        setIsSignedIn(false);
    };

    // Return the authentication methods
    return {
        isAuthenticationRequired,
        credentialId,
        isSignedIn,
        loading,
        turnOnAuthentication,
        turnOffAuthentication,
        signUp,
        signIn,
        signOut,
    };
};