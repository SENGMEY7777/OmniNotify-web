import { io } from 'socket.io-client'
import { getCookie } from '@/utils/cookies'
import { playMessageSound } from '@/utils/sound'
import { useToastStore } from '@/stores/toast'
import { useNotificationStore } from '@/stores/notification'

let socket = null

export function getSocket() {
  return socket
}

export function initSocket() {
  const token = getCookie('token') || localStorage.getItem('token')
  if (!token) {
    if (socket) {
      socket.disconnect()
      socket = null
    }
    return null
  }

  if (socket && socket.connected) {
    return socket
  }

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
  const socketUrl = apiBase.replace(/\/api\/?$/, '')

  socket = io(socketUrl, {
    auth: { token },
    query: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  })

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected to notification server:', socket.id)
  })

  const seenNotificationIds = new Set()

  function handleIncomingNotification(data) {
    if (!data) return
    const id = data.notification_id || data.id || data.metadata?.ref_id || `${data.title}_${data.body}_${data.created_at || ''}`
    if (seenNotificationIds.has(id)) {
      return // Ignore duplicate
    }
    seenNotificationIds.add(id)
    setTimeout(() => seenNotificationIds.delete(id), 6000)

    console.log('[Socket.IO] Incoming notification received:', data)

    // Play chime sound
    playMessageSound()

    // Show toast
    try {
      const toast = useToastStore()
      toast.addToast({
        type: 'info',
        title: data.title || '🔔 New Notification',
        message: data.body || data.message || '',
        duration: 6000,
        sound: false, // already played above
      })
    } catch (_) {}

    // Increment reactive notification store directly
    try {
      const notifStore = useNotificationStore()
      notifStore.incrementUnread(data)
    } catch (_) {}

    // Dispatch custom DOM event for components (e.g. NotificationDropdown, Navbar)
    window.dispatchEvent(new CustomEvent('new-notification', { detail: data }))
  }

  socket.on('notification', handleIncomingNotification)

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.debug('[Socket.IO] Connection error:', error.message)
  })

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
