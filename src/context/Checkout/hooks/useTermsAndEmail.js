// @ts-check
import { useEffect } from "react";
import { useCashTab } from "../../CashTab";
import sleep from "../../../utils/sleep";
import checkoutAllowedCountryOptions from '../../../constants/checkoutAllowedCountryOptions';
import { KeyRing, bcrypto } from '@hansekontor/checkout-components';
const { SHA256 } = bcrypto;
import { useApp } from "../../App";

export default function useTermsAndEmail({ 
    hasAgreed, 
    setHasAgreed, 
    setFirstRendering, 
    setEmailError, 
    setCountryError,
    setHasEmail, 
}) {
    const { forceWalletUpdate, wallet } = useCashTab();
    const { user } = useApp();

    useEffect(() => {
        (async () => {
            if (hasAgreed) {
                await forceWalletUpdate();
            }
        })
    }, [hasAgreed])


    const handleAgree = async (e) => {
        e.preventDefault();
        setHasAgreed(true);
        await sleep(500);
        setFirstRendering(false);
    }

    const handleSubmitEmail = async (e) => {
        console.log("handleSubmitEmail called");
        e.preventDefault();

        const emailInput = e.target.email.value;
        const isValidEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(emailInput);
        if (!isValidEmail) {
            setEmailError("Invalid Email");
        }

        const countryInput = e.target.country.value;
        const isValidCountry = checkoutAllowedCountryOptions.map(({ value }) => value).includes(countryInput);
        if (!isValidCountry) {
            setCountryError(`Clux is unavailable in ${countryInput}`);
        }

        if (!isValidEmail || !isValidCountry)
            return;

        const buyerKeyring = KeyRing.fromSecret(wallet.Path1899.fundingWif, null);

        console.log("email", emailInput);
        console.log("user.access", user.access);
        const msg = Buffer.from(emailInput, 'utf-8');
        const sig = buyerKeyring.sign(SHA256.digest(msg));

        console.log("msg", msg);
        console.log("sig", sig);
        const json = {
            email: emailInput,
            pubkey: wallet.Path1899.publicKey,
            signature: sig.toString('hex'),
        };
        console.log("json", json);
        const userRes = await fetch("https://lsbx.nmrai.com/v1/user", {
            method: "POST",
            mode: "cors",
            headers: new Headers({
                "Content-Type": "application/json"
            }),
            signal: AbortSignal.timeout(20000),
            body: JSON.stringify(json)
        });
        console.log("userRes", userRes);
        // forward based on response
        const userResJson = await userRes.json();
        console.log("userResJson", userResJson);
        if (userRes.status === 200)
            setHasEmail(true);
    }

    return {
        handleAgree,
        handleSubmitEmail,
    }
}