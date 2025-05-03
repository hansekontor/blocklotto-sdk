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
            await sleep(10000);
            for (let retries = 0; retries < 2; retries++) {
                console.log("set kyc result, attempt", retries)
                const rawPaymentRes = await sendPayment(authPayment.rawPayment);

                // status 400 is expected with non approved kyc
                if (rawPaymentRes.status == 400) {
                    const msg = await rawPaymentRes.text();
                    console.log("msg", msg);

                    if (msg?.includes("review")) {
                        onError("KYC NEEDS REVIEW");
                    }
                    
                    if (msg?.includes("Invalid")) {
                        onError("INVALID KYV");
                    } 
                    
                    if (msg?.includes("declined")) {
                        onError("KYC WAS DECLINED");
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
            // notify({ message: "AN ERROR OCCURED", type: "error" });
            // history.push("/");
            onError("AN ERROR OCCURED");
        }
    }

    const handleKYCResult = async (result, onSuccess, onError) => {
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
                    onError("KYC WAS CANCELLED AGAIN");
                }
            case "error":
                setLoadingStatus("A KYC ERROR OCCURED");
                return setKycResult(onError);

            // ----Complete workflow-----
            case "auto_approved":
                if (isFiat) {
                    setLoadingStatus("CAPTURE PAYMENT")
                    return capturePayment(onSuccess, onError);
                } else {
                    setShowKyc(false);
                    break;
                }
            case "auto_declined":
                setLoadingStatus("INVALID KYC");
                if (isFiat)
                    return setKycResult(onError);
                else {
                    // return repeatOnboarding();
                    // notify({ type: 'error', message: 'INVALID KYC' });
                    // history.push("/");
                    onError("INVALID KYC");
                }
            case "needs_review":
                setLoadingStatus("KYC NEEDS REVIEW")
                return setKycResult(onError);
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