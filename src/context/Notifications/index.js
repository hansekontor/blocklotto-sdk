import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import DefaultNotification from '../../components/Notification/DefaultNotification';
import NotificationAnimation from '../../components/Notification/NotificationAnimation';
import NotificationCollector from '../../components/Notification/NotificationBody';

export const NotificationsContext = createContext();

export const NotificationsProvider = ({ children, Notification = DefaultNotification }) => {
    const [notifications, setNotifications] = useState([]);

    // Add notification handler
    const addNotification = useCallback(({ type, message }) => {
        // We use the updater function to safely add notifications after rendering
        setNotifications((prev) => [...prev, { type, message, id: Date.now() }]);
    }, []);

    // Remove notification handler
    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    // Trigger a side-effect to safely update state after render
    useEffect(() => {
        // This will prevent direct state updates during render
    }, [notifications]); 

    return (
        <NotificationsContext.Provider value={addNotification}>
            {children}
            <NotificationCollector>
                {notifications.map(({ type, message, id }, index) => (
                    <NotificationAnimation key={index} id={id} removeNotification={removeNotification}>
                        <Notification type={type} message={message} />
                    </NotificationAnimation>
                ))}
            </NotificationCollector>
        </NotificationsContext.Provider>
    )
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationsProvider");
    }
    return context;
};