import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiRequest } from '@/services/api'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const loading = ref(false)
  const totalUnread = ref(0)

  const unreadCount = computed(() => totalUnread.value)

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
      const unreadList = list.filter((n) => {
        if (n.is_read !== undefined) return !n.is_read
        return n.status !== 'READ' && (n.read_at === null || n.read_at === undefined)
      })
      totalUnread.value = unreadList.length
    } catch (_) {}
  }

  function incrementUnread(newNotification) {
    if (newNotification) {
      notifications.value.unshift(newNotification)
    }
    totalUnread.value++
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

  return {
    notifications,
    loading,
    totalUnread,
    unreadCount,
    fetchNotifications,
    incrementUnread,
    decrementUnread,
    markAllRead,
  }
})
