// @ts-check
import React from 'react';
import { AuthProvider } from '../context/Auth';
import { CashTabProvider } from '../context/CashTab';
import DefaultLoading from '../components/Loading';
import DefaultNotification from '../components/Notification/DefaultNotification';
import { NotificationsProvider } from '../context/Notifications';
import { AppProvider } from '../context/App';
import { OnBoardingProvider } from '../context/OnBoarding';

export function BlockLottoProvider({
    children,
    Loading = DefaultLoading,
    Notification = DefaultNotification
}) {
    return (
        <AuthProvider>
            <CashTabProvider Loading={Loading}>
                <NotificationsProvider Notification={Notification}>
                    <AppProvider Loading={Loading}>
                        <OnBoardingProvider>
                            {children}
                        </OnBoardingProvider>
                    </AppProvider>
                </NotificationsProvider>
            </CashTabProvider>
        </AuthProvider>
    )
}
