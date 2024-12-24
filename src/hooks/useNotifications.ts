import { useState, useEffect, useCallback } from 'react'
import { Notification } from '@/components/admin/NotificationCenter'

const STORAGE_KEY = 'admin_notifications'

export function useNotifications() {
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        const storedNotifications = localStorage.getItem(STORAGE_KEY)
        if (storedNotifications) {
            setNotifications(JSON.parse(storedNotifications))
        }
    }, [])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    }, [notifications])

    const addNotification = useCallback((message: string, type: 'info' | 'warning' | 'error' = 'info') => {
        const newNotification: Notification = {
            id: Date.now().toString(),
            message,
            type,
            timestamp: new Date(),
            read: false,
        }
        setNotifications(prev => [newNotification, ...prev])
    }, [])

    const markAsRead = useCallback((id: string) => {
        setNotifications(prev =>
            prev.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        )
    }, [])

    const clearAllNotifications = useCallback(() => {
        setNotifications([])
    }, [])

    return {
        notifications,
        addNotification,
        markAsRead,
        clearAllNotifications,
    }
}

