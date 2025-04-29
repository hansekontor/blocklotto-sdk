/**
 * @typedef {Object} Wallet
 * @property {string} mnemonic - The mnemonic phrase used to create the wallet.
 * @property {string} name - The name of the wallet.
 * @property {Path} Path245 - The details for Path245 wallet.
 * @property {Path} Path145 - The details for Path145 wallet.
 * @property {Path} Path1899 - The details for Path1899 wallet.
 * @property {State} state - The state of the wallet, including balances and UTXOs.
 */

/**
 * @typedef {Object} Path
 * @property {string} publicKey - The public key of the wallet.
 * @property {string} cashAddress - The cash address of the wallet.
 * @property {string} slpAddress - The SLP address of the wallet.
 * @property {string} fundingWif - The funding WIF (Wallet Import Format) of the wallet.
 * @property {string} fundingAddress - The funding address of the wallet.
 * @property {string} legacyAddress - The legacy address of the wallet.
 */

/**
 * @typedef {Object} State
 * @property {number} balances - The total balance of the wallet.
 * @property {Array} utxos - The list of UTXOs (Unspent Transaction Outputs) in the wallet.
 * @property {Array} tokens - The list of tokens in the wallet.
 * @property {SlpBalancesAndUtxos} slpBalancesAndUtxos - The SLP-related balances and UTXOs.
 * @property {Array} tickets - The list of tickets associated with the wallet.
 */

/**
 * @typedef {Object} SlpBalancesAndUtxos
 * @property {Array} tokens - The list of tokens in SLP format.
 * @property {Array} nonSlpUtxos - The list of non-SLP UTXOs.
 * @property {Array} slpUtxos - The list of SLP UTXOs.
 */

/**
 * CashTabContext provides a context for accessing and managing the wallet state, transaction data, 
 * settings, and various wallet operations (such as cashouts, adding tickets, etc.).
 * 
 * @typedef {Object} CashTabContextType
 * @property {Wallet} wallet - The current wallet object.
 * @property {boolean} setWallet - Function to update the wallet.
 * @property {Wallet} loading - The current wallet object.
 * @property {function} setLoading - Function to update the wallet.
 * @property {Array} unredeemedTickets - Array of unredeemed tickets in the wallet.
 * @property {number} balance - The total balance of the wallet.
 * @property {function} updateWallets - Function to update the wallet state based on transaction data.
 * @property {function} addIssueTxs - Function to add issue transactions to the wallet.
 * @property {function} changeCashtabSettings - Function to update the settings of the Cashtab.
 * @property {function} addMinedTicketToStorage - Function to add a mined ticket to the wallet's state.
 * @property {function} addRedeemTxToStorage - Function to add a redeem transaction to the wallet.
 * @property {function} addCashout - Function to handle adding a cashout transaction to the wallet.
 * @property {function} forceWalletUpdate - Function to force an update of the wallet state.
 * @property {function} createWallet - Function to create a new wallet.
 * @property {function} migrateLegacyWallet - Function to migrate an old wallet to the new format.
 * @property {function} renameWallet - Function to rename a saved wallet.
 * @property {function} deleteWallet - Function to delete a saved wallet.
 * @property {function} getWalletDetails - Function to fetch details of a specific wallet.
 * @property {boolean} cashtabSettings - Boolean indicating the current Cashtab settings state.
 * @property {boolean} apiError - Boolean indicating if there is an error with the API.
 * @property {boolean} loading - Boolean indicating if the application is in a loading state.
 * @property {Array} tickets - Array of the tickets associated with the current wallet.
 * @property {Object} slpBalancesAndUtxos - Object containing the SLP balances and UTXOs of the wallet.
 */