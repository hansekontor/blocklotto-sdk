// @ts-check

import { useEffect } from "react";
import { useHistory } from "react-router-dom";
import sleep from "../../../utils/sleep";
import { useNotifications } from "../../Notifications";
import { useApp } from "../../App";
import { kycWorkflowId } from "../../../constants/kyc"; 

export default function useKYC({
    authPayment,
    kycConfig,
    sendPayment,
    kycCancelCount,
    paymentProcessor,
    setKycCancelCount,
    capturePayment,
    setShowKyc,
    setKycConfig,
    kycAccessToken,
}) {
    const history = useHistory();
    const notify = useNotifications();
    const { setLoadingStatus, user, setUser, wallet } = useApp();

    useEffect(() => {
        const kycRequired = !user.kyc_status?.includes("approved");
        if (kycAccessToken && kycRequired) {
            const transactionId = wallet.Path1899.publicKey;

            // @ts-ignore
            const config = new window.HyperKycConfig(kycAccessToken, kycWorkflowId, transactionId);
            setKycConfig(config);
        }
    }, [kycAccessToken])


    const setKycResult = async () => {
        await sleep(10000);
        for (let retries = 0; retries < 2; retries++) {
            console.log("set kyc result, attempt", retries)
            const rawPaymentRes = await sendPayment(authPayment.rawPayment);

            // status 400 is expected with non approved kyc
            if (rawPaymentRes.status == 400) {
                const msg = await rawPaymentRes.text();
                console.log("msg", msg);

                if (msg?.includes("review")) {
                    throw new Error("KYC needs review");
                    // history.push("/")
                }
                
                if (msg?.includes("Invalid")) {
                    throw new Error("Invalid KYC");
                    // history.push("/");
                } 
                
                if (msg?.includes("declined")) {
                    throw new Error("KYC was declined");
                    // history.push("/");
                }

                if (msg?.includes("cancelled")) {
                    setLoadingStatus(false);
                    return;
                }

                if (retries < 1) {
                    await sleep(3000)
                    continue;
                } else {
                    // too many retries
                    throw new Error("KYC API Error");
                }
            }
        }
    }

    const handleKYCResult = async (result, onSuccess) => {
        console.log("KYC", result.status);
        const isFiat = paymentProcessor !== "etoken";
        console.log("isFiat", isFiat);
        switch (result.status) {

            // ----Incomplete workflow-----
            case "user_cancelled":
                if (kycCancelCount == 0 && !user.kyc_status?.includes("cancelled")) {
                    console.log("increase counter");
                    notify({ type: 'error', message: 'KYC was cancelled, try again' });

                    setKycCancelCount(1);
                    break;
                } else {
                    throw new Error("Kyc was cancelled repeatedly")
                }
            case "error":
                setLoadingStatus("A KYC ERROR OCCURED");
                return setKycResult();

            // ----Complete workflow-----
            case "auto_approved":
                const newUser = user;
                newUser.kyc_status = result.status;
                setUser(newUser);
                if (isFiat) {
                    setLoadingStatus("CAPTURE PAYMENT");
                    return capturePayment(onSuccess);
                } else {
                    setShowKyc(false);
                    break;
                }
            case "auto_declined":
                setLoadingStatus("INVALID KYC");
                if (isFiat)
                    return setKycResult();
                else {
                    const newUser = user;
                    newUser.kyc_status = result.status;
                    throw new Error("Invalid KYC");
                }
            case "needs_review":
                setLoadingStatus("KYC NEEDS REVIEW")
                return setKycResult();
        }
    }

    const handleKYCandCapture = async (e, onSuccess, onError) => {
        e.preventDefault();

        try {
            // throw error if kyc has already been processed
            const previousKycStatus = user.kyc_status;
            const kycAllowed = !previousKycStatus?.includes("approved") || !previousKycStatus?.includes("declined");
            if (!kycAllowed) {
                throw new Error("Repeated KYC");
            }            

            // throw error if config (and kycAccessToken and payment auth) is missing
            if (!kycConfig) {
                throw new Error("Missing KYC config: Payment Authorization required");
            }

            // @ts-ignore
            window.HyperKYCModule.launch(
                kycConfig, 
                (result) => handleKYCResult(result, onSuccess)
            )
        } catch(err) {
            console.error(err);
            onError(err);
        }



    }

    return {
        setKycResult,
        handleKYCResult,
        handleKYCandCapture,
    }
}