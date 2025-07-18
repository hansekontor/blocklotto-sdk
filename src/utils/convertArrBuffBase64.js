// @ts-check
/**
 * This file is part of the BlockLotto core functionality.
 * 
 * DO NOT EDIT THIS FILE DIRECTLY.
 * Any changes to this file may cause unexpected behavior.
 * Please consult the project maintainers before making modifications.
*/

/**
 * Converts an ArrayBuffer to a Base64 encoded string.
 *
 * @param {ArrayBuffer} buffer - The ArrayBuffer to be converted.
 * @returns {string} The Base64 encoded string representation of the ArrayBuffer.
 *
 * @example
 * const buffer = new ArrayBuffer(8);
 * const base64Str = convertArrayBufferToBase64(buffer);
 * console.log(base64Str); // Outputs the Base64 string of the buffer
 */
export const convertArrayBufferToBase64 = (buffer) => {
    // convert the buffer from ArrayBuffer to Array of 8-bit unsigned integers
    const dataView = new Uint8Array(buffer);
    // convert the Array of 8-bit unsigned integers to a String
    const dataStr = dataView.reduce(
        (str, cur) => str + String.fromCharCode(cur),
        '',
    );
    // convert String to base64
    return window.btoa(dataStr);
};

/**
 * Converts a Base64 encoded string to an ArrayBuffer.
 *
 * @param {string} base64Str - The Base64 string to be converted.
 * @returns {ArrayBuffer} The ArrayBuffer representation of the Base64 string.
 *
 * @example
 * const base64Str = "U29tZSBkYXRh";
 * const buffer = convertBase64ToArrayBuffer(base64Str);
 * console.log(buffer); // Outputs the ArrayBuffer representation of the Base64 string
 */
export const convertBase64ToArrayBuffer = (base64Str) => {
    // convert base64 String to normal String
    const dataStr = window.atob(base64Str);
    // convert the String to an Array of 8-bit unsigned integers
    const dataView = Uint8Array.from(dataStr, (char) => char.charCodeAt(0));
    return dataView.buffer;
};