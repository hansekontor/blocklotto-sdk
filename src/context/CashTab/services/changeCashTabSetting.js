// @ts-check
import { currency } from '../../../utils/ticker';
import localforage from 'localforage';

/**
 * Updates the Cashtab settings and stores them in `localforage`.
 * 
 * This function updates the settings for a specific key in the Cashtab settings object.
 * It performs the following steps:
 * 1. Sets the loading state to true to prevent UI updates during the operation.
 * 2. Retrieves the current settings from `localforage`.
 * 3. Validates the key and new value for the settings change.
 * 4. Updates the settings in both the state and `localforage`.
 * 5. Sets the loading state back to false after the operation.
 * 
 * @param {Object} context - The context containing functions to update the UI state.
 * @param {Function} context.setLoading - Function to set the loading state, indicating an ongoing operation.
 * @param {Function} context.setCashtabSettings - Function to update the Cashtab settings in the state.
 * @param {string} key - The key of the setting to be updated.
 * @param {string|number} newValue - The new value to set for the specified setting key.
 * 
 * @returns {Promise<void>} 
 */
const changeCashtabSettings = async ({ setLoading, setCashtabSettings }, key, newValue) => {
    // Set loading to true as you do not want to display the fiat price of the last currency
    // loading = true will lock the UI until the fiat price has updated
    setLoading(true);

    // Get settings from localforage
    let currentSettings;
    let newSettings;
    try {
        currentSettings = await localforage.getItem('settings');
    } catch (err) {
        console.log(`Error in changeCashtabSettings`, err);
        // Set fiat price to null, which disables fiat sends throughout the app
        // setFiatPrice(null);
        // Unlock the UI
        setLoading(false);
        return;
    }

    // Make sure function was called with valid params
    if (
        Object.keys(currentSettings).includes(key) &&
        currency.settingsValidation[key].includes(newValue)
    ) {
        // Update settings
        newSettings = currentSettings;
        newSettings[key] = newValue;
    }

    // Set new settings in state so they are available in context throughout the app
    setCashtabSettings(newSettings);

    // Write new settings in localforage
    try {
        await localforage.setItem('settings', newSettings);
    } catch (err) {
        console.log(
            `Error writing newSettings object to localforage in changeCashtabSettings`,
            err,
        );
        console.log(`newSettings`, newSettings);
        // do nothing. If this happens, the user will see default currency next time they load the app.
    }

    setLoading(false);
};

export default changeCashtabSettings;