// @ts-check

import { useEffect } from "react";
import { useHistory } from "react-router-dom";
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
    const history = useHistory();
    const notify = useNotifications();
    const { setLoadingStatus, user, setUser, wallet } = useApp();

    useEffect(() => {
        if (kycConfig) {
            // @ts-ignore
            window.HyperKYCModule.launch(kycConfig, handleKYCResult);
        }
    }, [kycConfig]);


    const setKycResult = async () => {
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
                        history.push("/")
                    }
                    
                    if (msg?.includes("Invalid")) {
                        history.push("/");
                    } 
                    
                    if (msg?.includes("declined")) {
                        history.push("/");
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
            notify({ message: "Error in KYC process", type: "error" });
            setLoadingStatus(false);
            history.push("/");
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
                    notify({ type: "error", message:"Kyc was cancelled again"});
                    await sleep(1000);
                    history.push("/");
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
                    const newUser = user;
                    newUser.kyc_status = result.status;
                    notify({ type: 'error', message: 'Invalid KYC' });
                    history.push("/");
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