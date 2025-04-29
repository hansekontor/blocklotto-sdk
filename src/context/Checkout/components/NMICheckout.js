// @ts-check
import React, { useEffect } from 'react';
import { useNotifications } from '../../Notifications';
import { useApp } from '../../App';
import { useCheckout } from '..';
;

/**
 * NMI Checkout component for embedding CollectJS payment fields.
 *
 * @param {Object} props - Component props
 * @param {'lightbox' | 'inline'} [props.variant='lightbox'] - The CollectJS variant to use: 'lightbox' opens a modal; 'inline' embeds fields directly.
 * @param {Object.<string, string>} [props.customCss] - Custom CSS styles to apply to the embedded CollectJS fields. 
 * You can pass any valid CSS property name in kebab-case (e.g. 'font-size', 'background-color').
 */
export function NMICheckout({
    variant = 'lightbox',
    customCss = {
        'border-radius': '12px',
        'height': '44px',
        'border-style': 'none'
    }
}) {
    const { handleNmiResult } = useCheckout()
    const notify = useNotifications();
    const { user } = useApp();

    useEffect(() => {
        (async () => {
            if (user && !user.ipGeo.ticketPurchase) {
                notify({ message: "ACCESS DENIED", type: "error" });
                // history.push("/select");
            }
        })()
    }, [user])

    useEffect(() => {
        // @ts-ignore: CollectJS is globally available
        window.CollectJS.configure({
            variant,
            styleSniffer: variant === 'inline',
            callback: (token) => {
                console.log('token', token)
                handleNmiResult(token)
            },
            fields: {
                ccnumber: {
                    placeholder: '1234 1234 1234 1234',
                    selector: '#ccnumber'
                },
                ccexp: {
                    placeholder: 'MM / YY',
                    selector: '#ccexp'
                },
                cvv: {
                    placeholder: 'CVV',
                    selector: '#cvv'
                }
            },
            customCss
        })
    }, [])

    if (variant === 'inline') {
        return (
            <>
                <div id="ccnumber" style={{width: '100%'}} />
                <div id="ccexp" style={{width: '100%'}} />
                <div id="cvv" style={{width: '100%'}} />
            </>
        )
    }

    return null
}