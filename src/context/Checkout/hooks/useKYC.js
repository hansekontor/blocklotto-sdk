// @ts-check

import { useEffect } from "react";
import sleep from "../../../utils/sleep";
import { useNotifications } from "../../Notifications";
import { useApp } from "../../App";

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
    const notify = useNotifications();
    const { setLoadingStatus, user, wallet } = useApp();

    useEffect(() => {
        if (kycConfig) {
            // @ts-ignore
            window.HyperKYCModule.launch(kycConfig, handleKYCResult);
        }
    }, [kycConfig]);


    const setKycResult = async (onError) => {
        try {
            await sleep(8000);
            for (let retries = 0; retries < 2; retries++) {
                console.log("set kyc result, attempt", retries)
                const rawPaymentRes = await sendPayment(authPayment.rawPayment);

                if (rawPaymentRes.status == 400) {
                    const msg = await rawPaymentRes.text();
                    console.log("msg", msg);

                    // status 400 and db confirmation: repeat onboarding
                    if (msg?.includes("Invalid") || msg?.includes("review") || msg?.includes("error")) {
                        notify({ message: "KYC NEEDS REVIEW", type: "error" });
                        // history.push("/");
                        // return repeatOnboarding(); 
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
                        throw new Error(msg);
                    }
                }
            }
        } catch (err) {
            console.error(err);
            // setLoadingStatus("AN ERROR OCCURED");
            // await sleep(2000);
            // return repeatOnboarding();
            notify({ message: "AN ERROR OCCURED", type: "error" });
            // history.push("/");
            onError();
        }
    }

    const handleKYCResult = async (result) => {
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
                    setLoadingStatus("KYC WAS CANCELLED AGAIN");
                    await sleep(2000);
                    // history.push("/select");
                }
            case "error":
                setLoadingStatus("A KYC ERROR OCCURED");
                return setKycResult();

            // ----Complete workflow-----
            case "auto_approved":
                if (isFiat) {
                    setLoadingStatus("CAPTURE PAYMENT")
                    return capturePayment();
                } else {
                    setShowKyc(false);
                    break;
                }
            case "auto_declined":
                setLoadingStatus("INVALID KYC");
                if (isFiat)
                    return setKycResult();
                else {
                    // return repeatOnboarding();
                    notify({ type: 'error', message: 'INVALID KYC' });
                    // history.push("/");
                }
            case "needs_review":
                setLoadingStatus("KYC NEEDS REVIEW")
                return setKycResult();
        }
    }

    const handleKYC = async (e) => {
        e.preventDefault();

        const workflowId = "workflow_a93TCBh";
        const transactionId = wallet.Path1899.publicKey;
        // @ts-ignore
        const config = new window.HyperKycConfig(kycAccessToken, workflowId, transactionId);

        setKycConfig(config);
    }

    return {
        setKycResult,
        handleKYCResult,
        handleKYC,
    }
}