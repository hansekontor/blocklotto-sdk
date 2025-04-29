// @ts-check
import { useEffect } from "react";
import { useApp } from "../../App";

/**
 * Initializes user-related state on first load.
 *
 * Sets whether the user has an email and if they're KYC-verified,
 * based on their current profile and ticket history.
 * Also sets loading status for special KYC cases.
 *
 * @param {Array} tickets - List of user-issued tickets (can be empty).
 * @param {(val: boolean) => void} setHasEmail - Setter to update `hasEmail` state.
 * @param {(val: boolean) => void} setIsKYCed - Setter to update `isKYCed` state.
 */
export default function useInitialLoad(tickets, setHasEmail, setIsKYCed) {
    const { setLoadingStatus, user } = useApp();

    useEffect(() => {
        const initialStates = async () => {
            if (user.email) setHasEmail(true);

            if (user.kyc_status?.includes("approved") || tickets.length > 0) {
                setIsKYCed(true);
            } else if (user.kyc_status === "needs_review") {
                setLoadingStatus("KYC NEEDS REVIEW");
                // return repeatOnboarding();
            } else if (user.kyc_status?.includes("declined")) {
                setLoadingStatus("ACCESS DENIED");
                // return repeatOnboarding();
            }
        };
        initialStates();
    }, []);
}