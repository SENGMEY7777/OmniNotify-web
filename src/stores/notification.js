import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiRequest } from '@/services/api'

export function isItemRead(n) {
  if (!n) return true
  if (n.is_read === true || n.is_read === 1 || n.is_read === '1' || n.is_read === 'true') {
    return true
  }
  const status = String(n.status || '').toUpperCase().trim()
  if (status === 'READ') {
    return true
  }
  if (n.read_at !== null && n.read_at !== undefined && n.read_at !== '') {
    return true
  }
  return false
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const loading = ref(false)
  const totalUnread = ref(0)
  let pollTimer = null
  let burstTimers = []
  let listenersAttached = false

  const unreadCount = computed(() => totalUnread.value)

  const knownIds = new Set()
  let initialFetchDone = false

  async function fetchNotifications() {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const isAdmin = user.role === 'admin'
      const endpoint = isAdmin ? '/admin/notification?page=1&limit=50' : '/auth/user/notifications?page=1&limit=50'

      const res = await apiRequest(endpoint)
      const list = Array.isArray(res) ? res : (res.data || res.notifications || [])

      notifications.value = list

      const unreadList = list.filter((n) => !isItemRead(n))

      if (typeof res.unread_count === 'number') {
        totalUnread.value = res.unread_count
      } else if (typeof res.total_unread === 'number') {
        totalUnread.value = res.total_unread
      } else {
        totalUnread.value = unreadList.length
      }

      // After initial load, detect truly new unread items and fire popups
      if (initialFetchDone) {
        const newItems = unreadList.filter((n) => {
          const id = n.notification_id || n.id
          return id && !knownIds.has(id)
        })
        newItems.forEach((n) => {
          window.dispatchEvent(new CustomEvent('new-notification', { detail: n }))
        })
      }

      // Update known IDs
      list.forEach((n) => {
        const id = n.notification_id || n.id
        if (id) knownIds.add(id)
      })
      initialFetchDone = true

    } catch (_) {}
  }

  function incrementUnread(newNotification) {
    if (newNotification) {
      const id = newNotification.notification_id || newNotification.id
      const exists = id && notifications.value.some(n => (n.notification_id || n.id) === id)
      if (!exists) {
        notifications.value.unshift(newNotification)
      }
    }
    totalUnread.value++
    // Schedule a background sync to keep state accurate with database
    setTimeout(() => {
      fetchNotifications()
    }, 1000)
  }

  function decrementUnread(id) {
    totalUnread.value = Math.max(0, totalUnread.value - 1)
    if (id) {
      const target = notifications.value.find(n => (n.notification_id || n.id) === id)
      if (target) {
        target.status = 'READ'
        target.is_read = true
        target.read_at = new Date().toISOString()
      }
    }
  }

  function markAllRead() {
    totalUnread.value = 0
    notifications.value.forEach((n) => {
      n.status = 'READ'
      n.is_read = true
      n.read_at = new Date().toISOString()
    })
  }

  function handleVisibilityOrFocus() {
    if (document.visibilityState === 'visible') {
      fetchNotifications()
    }
  }

  function startPolling() {
    // Initial fetch immediately
    fetchNotifications()

    // Burst syncs after 500ms, 1500ms, 3000ms, 5000ms to immediately catch async backend login notifications
    clearBurstTimers()
    const delays = [500, 1500, 3000, 5000]
    burstTimers = delays.map((delay) => setTimeout(() => fetchNotifications(), delay))

    // Background continuous polling every 6 seconds
    if (!pollTimer) {
      pollTimer = setInterval(() => {
        fetchNotifications()
      }, 6000)
    }

    if (!listenersAttached && typeof window !== 'undefined') {
      window.addEventListener('focus', handleVisibilityOrFocus)
      document.addEventListener('visibilitychange', handleVisibilityOrFocus)
      listenersAttached = true
    }
  }

  function clearBurstTimers() {
    burstTimers.forEach(t => clearTimeout(t))
    burstTimers = []
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    clearBurstTimers()
    if (listenersAttached && typeof window !== 'undefined') {
      window.removeEventListener('focus', handleVisibilityOrFocus)
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      listenersAttached = false
    }
  }

  return {
    notifications,
    loading,
    totalUnread,
    unreadCount,
    fetchNotifications,
    incrementUnread,
    decrementUnread,
    markAllRead,
    startPolling,
    stopPolling,
  }
})
