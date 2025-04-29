/**
 * @typedef {Object} User
 * @property {string} kyc_status
 * @property {Object} ipGeo
 * @property {boolean} ipGeo.ticketPurchase
 * @property {boolean} ipGeo.affiliate
 * @property {string} [email] - The user's email address
 * @property {any} [other] - Any other user data properties
 */


/**
 * @typedef {Object} AppContextValue
 * @property {boolean} protection
 * @property {User} user
 * @property {any} wallet
 * @property {any[]} unredeemedTickets
 * @property {number} balance
 * @property {number[]} playerNumbers
 * @property {object} activeTicket
 * @property {boolean} redeemAll
 * @property {boolean} payout
 * @property {number} ticketQuantity
 * @property {(value: number) => void} setTicketQuantity
 * @property {(value: boolean) => void} setProtection
 * @property {(value: string) => void} setLoadingStatus
 * @property {React.Dispatch<React.SetStateAction<number[]>>} setPlayerNumbers
 * @property {(value: object) => void} setActiveTicket
 * @property {(value: boolean) => void} setRedeemAll
 */

export {};