import { io } from 'socket.io-client'
import { getCookie } from '@/utils/cookies'
import { playMessageSound } from '@/utils/sound'
import { useToastStore } from '@/stores/toast'
import { useNotificationStore } from '@/stores/notification'

let socket = null

export function getSocket() {
  return socket
}

export function initSocket(forceReconnect = false) {
  const token = getCookie('token') || localStorage.getItem('token')
  if (!token) {
    if (socket) {
      socket.disconnect()
      socket = null
    }
    return null
  }

  if (socket && socket.connected && !forceReconnect) {
    return socket
  }

  if (socket) {
    socket.disconnect()
    socket = null
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
    try {
      const notifStore = useNotificationStore()
      notifStore.fetchNotifications()
    } catch (_) {}
  })

  const seenNotificationIds = new Set()

  function handleIncomingNotification(data) {
    if (!data) return

    // Normalize: some backends wrap in { data: {...} } or { notification: {...} }
    const payload = data.data || data.notification || data

    const id = payload.notification_id || payload.id || payload.metadata?.ref_id
      || `${payload.title}_${payload.body}_${payload.created_at || Date.now()}`

    if (seenNotificationIds.has(id)) {
      return // Ignore duplicate
    }
    seenNotificationIds.add(id)
    setTimeout(() => seenNotificationIds.delete(id), 8000)

    console.log('[Socket.IO] Incoming notification received:', payload)

    // Play chime sound
    playMessageSound()

    // Show toast popup
    try {
      const toast = useToastStore()
      toast.addToast({
        type: 'info',
        title: payload.title || '🔔 New Notification',
        message: payload.body || payload.message || '',
        duration: 7000,
        sound: false, // already played above
      })
    } catch (_) {}

    // Increment reactive notification store count
    try {
      const notifStore = useNotificationStore()
      notifStore.incrementUnread(payload)
    } catch (_) {}

    // Dispatch custom DOM event for NotificationDropdown and Navbar
    // Mark toastShown=true so DashboardNavbar doesn't duplicate the popup
    window.dispatchEvent(new CustomEvent('new-notification', {
      detail: { ...payload, _toastShown: true }
    }))
  }

  // Listen on every possible backend event name
  const notifEvents = [
    'notification',
    'new_notification',
    'new-notification',
    'notification:new',
    'notification:delivered',
    'transaction',
    'transaction:new',
    'alert',
    'message',
    'delivered',
    'push',
  ]
  notifEvents.forEach((evt) => socket.on(evt, handleIncomingNotification))

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
