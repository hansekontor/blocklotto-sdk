// @ts-check
import { isValidCashtabSettings } from '../../../utils/validation';
import { currency } from '../../../utils/ticker';
import localforage from 'localforage';

/**
 * Loads the Cashtab settings from `localforage`, or sets them to default if not available or invalid.
 * 
 * This function attempts to retrieve the settings object from `localforage`. If the settings do not
 * exist or are invalid, it sets the settings to the default values defined in `currency.defaultSettings`.
 * It also updates the provided state with the loaded or default settings.
 *
 * @param {Function} setCashtabSettings - The function used to update the settings state.
 * 
 * @returns {Promise<Object>} The loaded or default settings object.
 */
const loadCashtabSettings = async (setCashtabSettings) => {
    // Get settings object from localforage
    let localSettings;
    try {
        localSettings = await localforage.getItem('settings');
        // If there is no key-value pair in localforage with key 'settings'
        if (localSettings === null) {
            // Create one with the default settings from Ticker.js
            localforage.setItem('settings', currency.defaultSettings);
            // Set state to default settings
            setCashtabSettings(currency.defaultSettings);
            return currency.defaultSettings;
        }
    } catch (err) {
        console.log(`Error getting cashtabSettings`, err);
        // If an error occurs, set settings to default
        setCashtabSettings(currency.defaultSettings);
        return currency.defaultSettings;
    }

    // If you found an object in localforage at the settings key, make sure it's valid
    if (isValidCashtabSettings(localSettings)) {
        setCashtabSettings(localSettings);
        return localSettings;
    }
    
    // If settings are not valid, set cashtabSettings to default
    setCashtabSettings(currency.defaultSettings);
    return currency.defaultSettings;
};

export default loadCashtabSettings;