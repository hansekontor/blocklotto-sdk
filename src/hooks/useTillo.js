/**
 * This file is part of the BlockLotto core functionality.
 *
 * DO NOT EDIT THIS FILE DIRECTLY.
 * Any changes to this file may cause unexpected behavior.
 * Please consult the project maintainers before making modifications.
 */

// node modules
import React, { useEffect, useState } from "react";
import bio from "bufio";
import {
  TX,
  MTX,
  Coin,
  Script,
  KeyRing,
} from "@hansekontor/checkout-components";
import { PaymentRequest, Payment, PaymentACK } from "b70-checkout";
import { stringify as uuidStringify } from "uuid";
import BigNumber from "bignumber.js";

// core modules
import { useApp } from "../context/App";
import { useCashTab } from "../context/CashTab";
import { getWalletState } from "../utils/cashMethods";
import { useNotifications } from "../context/Notifications";

export default function useTillo() {
  const { setLoadingStatus, setEtokenTimeout } = useApp();
  const { wallet, addCashout } = useCashTab();
  const notify = useNotifications();
  const { slpBalancesAndUtxos } = getWalletState(wallet);

  const token =
    slpBalancesAndUtxos.tokens?.length > 0
      ? slpBalancesAndUtxos.tokens[0]
      : false;
  const balance = token
    ? new BigNumber({ ...token.balance, _isBigNumber: true }).toNumber() / 100
    : 0;

  const [tilloStage, setTilloStage] = useState("filter");
  const [giftcardAmount, setGiftcardAmount] = useState(10);
  const [tilloBrands, setTilloBrands] = useState(false);
  const [tilloSelection, setTilloSelection] = useState([]);
  const [giftcardLink, setGiftcardLink] = useState(false);
  const [brandData, setBrandData] = useState(false);

  // fetch available tillo brands
  useEffect(() => {
    const getTilloBrands = async () => {
      const response = await fetch("https://lsbx.nmrai.com/v1/cards", {
        method: "GET",
        headers: new Headers({
          "Content-Type": "application/etoken-paymentrequest",
        }),
        mode: "cors",
        signal: AbortSignal.timeout(20000),
      });

      const availableBrands = await response.json();

      const possibleBrands = availableBrands.filter(function (brand) {
        const lowerLimit = brand.limits?.lower;
        if (!lowerLimit) return true;
        if (lowerLimit < balance) return true;
      });

      const formattedBrands = possibleBrands.map((brand) => {
        brand.label = brand.name;
        brand.value = brand.brand;

        return brand;
      });

      const formattedBrandsWithoutCreditCards = formattedBrands.filter(
        (brand) => {
          if (brand.label === "Reward Pass USD") return false;
          else return true;
        }
      );

      return formattedBrandsWithoutCreditCards;
    };

    if (!tilloBrands) {
      (async () => {
        try {
          const fetchedTilloBrands = await getTilloBrands();
          setTilloBrands(fetchedTilloBrands);
          setTilloSelection(fetchedTilloBrands);          
        } catch(err) {
          notify({ type: "error", message: "Tillo API Error"});
        }
      })();
    }
  }, []);

  const filterTilloBrands = (country, currency) => {
    if (!country) {
      throw new Error("Missing country");
    }

    if (!currency) {
      throw new Error("Missing currency");
    }
    const newTilloSelection = tilloBrands
      .filter((brand) => brand.countries.includes(country))
      .filter((brand) => brand.currency === currency)
      .filter(function (brand) {
        if (!brand.limits) {
          return true;
        } else {
          const lowerLimit = brand.limits.lower;
          const upperLimit = brand.limits.upper;
          const isInRange =
            giftcardAmount >= lowerLimit && giftcardAmount <= upperLimit;
          if (isInRange) return true;
          else return false;
        }
      });

    setTilloSelection(newTilloSelection);

    return newTilloSelection;
  };

  const getGiftcard = async (brand, onError) => {
    try {
      setLoadingStatus("REQUESTING GIFTCARD");

      const isValidAmount = validateGiftcardAmount(giftcardAmount);

      if (isValidAmount) {
        const json = {
          value: String(giftcardAmount),
          brand,
        };
        console.log("cardOptions", json);

        const invoiceRes = await fetch("https://lsbx.nmrai.com/v1/cardreq", {
          method: "POST",
          mode: "cors",
          body: JSON.stringify(json),
          headers: new Headers({
            "Content-Type": "application/etoken-paymentrequest",
          }),
          signal: AbortSignal.timeout(20000),
        });
        // console.log("invoiceRes", invoiceRes);

        // add api error handling
        if (invoiceRes.status !== 200) {                
          const msg = await rawPaymentRes.text();
          throw new Error(msg);
        }

        const invoiceArrayBuffer = await invoiceRes.arrayBuffer();
        const invoiceBuf = Buffer.from(invoiceArrayBuffer);

        const pr = PaymentRequest.fromRaw(invoiceBuf);
        const prOutputs = pr.paymentDetails.outputs;
        console.log("pr", pr);

        setLoadingStatus("BUILDING TRANSACTION");

        const merchantData = pr.paymentDetails.getData("json");
        // console.log("merchantData", merchantData);
        const paymentDataBuf = Buffer.from(merchantData.paymentdata, "hex");
        const br = bio.read(paymentDataBuf);
        const id = uuidStringify(br.readBytes(16));
        const amount = br.readU32() / 100;
        // console.log({id, amount})

        const payment = new Payment({
          memo: pr.paymentDetails.memo,
        });

        // Get token coins
        const sortedTokenUtxos = slpBalancesAndUtxos.slpUtxos
          .filter((u) => u.slp?.tokenId && ["MINT", "SEND"].includes(u.slp.type))
          .sort((a, b) => parseInt(a.slp.value) - parseInt(b.slp.value));

        const tx = new MTX();
        // Add outputs
        for (let i = 0; i < prOutputs.length; i++) {
          tx.addOutput(Script.fromRaw(prOutputs[i].script), prOutputs[i].value);
        }

        // Calculate needed coins
        const coinsBurned = [];
        let baseAmount = amount * 100;
        for (let i = 0; i < sortedTokenUtxos.length; i++) {
          const utxo = sortedTokenUtxos[i];
          tx.addCoin(Coin.fromJSON(utxo));
          coinsBurned.push(utxo);
          baseAmount -= parseInt(utxo.slp.value);
          if (baseAmount <= 0) break;
        }

        console.log("baseAmount", baseAmount);

        if (baseAmount > 0)
          throw new Error("Insufficient token funds in address");

        const buyerKeyring = KeyRing.fromSecret(wallet.Path1899.fundingWif);

        // Add a change output to script if necessary
        const baseChange = parseInt(baseAmount * -1);
        if (baseChange > 0) {
          tx.outputs[0].script
            .pushData(U64.fromInt(baseChange).toBE(Buffer))
            .compile();
          tx.addOutput(buyerKeyring.getAddress(), 546);
        }

        // Sign tx
        const hashTypes = Script.hashType;
        const sighashType =
          hashTypes.ALL | hashTypes.ANYONECANPAY | hashTypes.SIGHASH_FORKID;
        tx.sign(buyerKeyring, sighashType);

        payment.transactions.push(tx.toRaw());
        payment.refundTo.push({
          value: 546,
          script: Script.fromAddress(buyerKeyring.getAddress("string")).toRaw(),
        });

        const sig = buyerKeyring.sign(paymentDataBuf);

        payment.setData({
          ...merchantData,
          buyerpubkey: buyerKeyring.getPublicKey("hex"),
          signature: sig.toString("hex"),
        });

        const rawPaymentRes = await fetch("https://lsbx.nmrai.com/v1/cardpay", {
          method: "POST",
          signal: AbortSignal.timeout(20000),
          headers: new Headers({
            "Content-Type": `application/etoken-payment`,
          }),
          body: payment.toRaw(),
        });
        console.log("rawPaymentRes", rawPaymentRes);
        if (rawPaymentRes.status !== 200)
          throw new Error(rawPaymentRes.statusText);

        const paymentResArrayBuf = await rawPaymentRes.arrayBuffer();
        const response = Buffer.from(paymentResArrayBuf);

        const ack = PaymentACK.fromRaw(response);

        // console.log("ack.payment", ack.payment.getData('json'))
        // console.log("ack.memo", ack.memo)

        const rawTransactions = ack.payment.transactions;
        const txs = rawTransactions.map((r) => TX.fromRaw(r));
        // console.log(txs)

        // remove utxos locally
        await addCashout(txs, coinsBurned);

        setLoadingStatus(false);
        setEtokenTimeout(true);

        const link = ack.payment.getData("json").payout.result.url;

        return link;
      }
    } catch (err) {
        return onError(err);
    }
  };

  const validateGiftcardAmount = (amount) => {
    const isPositiveAmount = amount > 0;
    const hasSufficientBalance = balance >= amount;

    if (!isPositiveAmount) {
      throw new Error("Amount needs to be positive");
    } else if (!hasSufficientBalance) {
      throw new Error("Amount exceeds available balance");
    } else {
      return true;
    }
  };

  const handleTilloBrandChange = (selectedBrand) => {
    const selectedBrandData = tilloSelection.find(
      (item) => item.brand === selectedBrand
    );

    setBrandData(selectedBrandData);
  };

  return {
    tilloStage,
    giftcardAmount,
    giftcardLink,
    tilloSelection,
    brandData,
    getGiftcard,
    setGiftcardAmount,
    setGiftcardLink,
    filterTilloBrands,
    handleTilloBrandChange,
    setTilloStage,
  };
}
