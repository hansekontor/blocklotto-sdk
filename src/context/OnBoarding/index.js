// @ts-check

/**
 * This file is part of the BlockLotto core functionality.
 * 
 * DO NOT EDIT THIS FILE DIRECTLY.
 * Any changes to this file may cause unexpected behavior.
 * Please consult the project maintainers before making modifications.
 */

import React, { createContext, useContext } from 'react';
import { useApp } from '../App';
import { bcrypto } from '@hansekontor/checkout-components';

/**
 * @typedef {Object} OnBoardingContextValue
 * @property {(e: PasswordSubmitEvent) => void} handlePasswordSubmit
 */

/**
 * @typedef {Object} PasswordSubmitEvent
 * @property {HTMLFormElement & { password: { value: string } }} target - The target form element with a password field.
 * @property {() => void} preventDefault - Prevents the default form submission behavior.
 */

export const OnBoardingContext = createContext/** @type {OnBoardingContextValue} */({});

/**
 * Provider component for OnBoarding context.
 *
 * Supplies password submission handling to children components.
 *
 * @param {{ children: React.ReactNode }} props - Children components.
 * @returns {JSX.Element}
 */
export const OnBoardingProvider = ({ children }) => {
    const { setProtection } = useApp();

    /**
     * Handles the password submission event.
     * Verifies the input password against a hardcoded hash.
     *
     * @param {PasswordSubmitEvent} e - The event triggered on password submission.
     */
    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        const password = e.target.password.value;
        const passwordBuf = Buffer.from(password, 'utf-8');
        const hashedPassword = bcrypto.SHA256.digest(passwordBuf).toString('hex');

        const expectedHash = "615da616fc5a5bcd93bc21237807c08eeacbe120ca60e0c3e228712be644596d";
        const verified = hashedPassword === expectedHash;

        console.log("pw verified", verified);
        setProtection(!verified);
    };

    return (
        <OnBoardingContext.Provider value={{ handlePasswordSubmit }}>
            {children}
        </OnBoardingContext.Provider>
    );
};

/**
 * Hook to access onboarding functionality.
 * Must be used within an OnBoardingProvider.
 *
 * @returns {OnBoardingContextValue}
 */
export const useOnBoarding = () => {
    const context = useContext(OnBoardingContext);
    if (!context) {
        throw new Error("useOnBoarding must be used within a OnBoardingProvider");
    }
    // @ts-ignore
    return context;
};