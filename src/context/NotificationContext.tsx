import React, { createContext, useContext, useState } from 'react';
import type { Notification } from '../types';
import { getFromStorage, setToStorage, KEYS } from '../services/db';

interface NotificationContextType {
  notifications: Notification[];
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (title: string, description: string, type: Notification['type']) => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>(() => getFromStorage<Notification[]>(KEYS.NOTIFICATIONS) || []);

  const refreshNotifications = () => {
    setNotifications(getFromStorage<Notification[]>(KEYS.NOTIFICATIONS) || []);
  };

  const markAsRead = (id: string) => {
    const list = getFromStorage<Notification[]>(KEYS.NOTIFICATIONS) || [];
    const index = list.findIndex(n => n.id === id);
    if (index !== -1) {
      list[index].read = true;
      setToStorage(KEYS.NOTIFICATIONS, list);
      refreshNotifications();
    }
  };

  const markAllAsRead = () => {
    const list = getFromStorage<Notification[]>(KEYS.NOTIFICATIONS) || [];
    const updated = list.map(n => ({ ...n, read: true }));
    setToStorage(KEYS.NOTIFICATIONS, updated);
    refreshNotifications();
  };

  const addNotification = (title: string, description: string, type: Notification['type']) => {
    const list = getFromStorage<Notification[]>(KEYS.NOTIFICATIONS) || [];
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      title,
      description,
      time: 'Just now',
      read: false,
      type
    };
    list.unshift(newNotif);
    setToStorage(KEYS.NOTIFICATIONS, list);
    refreshNotifications();
  };



  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, markAllAsRead, addNotification, refreshNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
