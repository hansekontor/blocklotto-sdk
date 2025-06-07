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

            const isDbApproved = user.kyc_status?.includes("approved");
            const hasTickets = tickets.length > 0;
            const isApproved = isDbApproved || hasTickets;
            const needsReview = user.kyc_status?.includes("needs_review");
            const isDeclined = user.kyc_status?.includes("declined");

            if (isApproved) {
                setIsKYCed(true);
            } else if (needsReview) {
                setLoadingStatus("KYC NEEDS REVIEW");
            } else if (isDeclined) {
                setLoadingStatus("ACCESS DENIED");
            }
        };
        initialStates();
    }, []);
}