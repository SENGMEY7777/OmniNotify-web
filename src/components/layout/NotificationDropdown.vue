<template>
  <div v-if="isOpen" class="notification-dropdown-wrapper" ref="dropdownRef">
    <div class="notification-dropdown" role="dialog" aria-label="Notifications menu">
      <!-- Header -->
      <div class="dropdown-header">
        <h2 class="dropdown-title">Notifications</h2>
        <button
          class="filter-btn"
          type="button"
          aria-label="Refresh notifications"
          title="Refresh notifications"
          @click="fetchNotifications"
        >
          <IconAdjustmentsHorizontal :size="19" stroke-width="1.8" />
        </button>
      </div>

      <!-- Navigation Tabs & Actions -->
      <div class="tabs-bar">
        <div class="tabs-group" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'all'"
            :class="['tab-item', { active: activeTab === 'all' }]"
            @click="activeTab = 'all'"
          >
            All
          </button>
          <button
            type="button"
            role="tab"
            :aria-selected="activeTab === 'unread'"
            :class="['tab-item', { active: activeTab === 'unread' }]"
            @click="activeTab = 'unread'"
          >
            Unread
            <span v-if="unreadCount > 0" class="tab-badge">{{ unreadCount }}</span>
          </button>
        </div>

        <button
          v-if="unreadCount > 0"
          type="button"
          class="mark-all-read-btn"
          @click="markAllAsRead"
        >
          Mark all as read
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <span class="dropdown-spinner"></span>
        <p>Loading notifications…</p>
      </div>

      <!-- Notifications List -->
      <div v-else class="notifications-list" role="feed">
        <div
          v-for="item in filteredList"
          :key="item.id"
          class="notification-item"
          :class="{ unread: !item.read }"
          @click="markAsRead(item)"
        >
          <!-- Icon Badge -->
          <div class="icon-badge" :class="item.tone">
            <component :is="item.iconComponent" :size="20" stroke-width="1.8" />
          </div>

          <!-- Content -->
          <div class="content-col">
            <div class="title-row">
              <span class="item-title">{{ item.title }}</span>
              <span v-if="!item.read" class="unread-dot" aria-label="Unread"></span>
            </div>
            <p class="item-desc">{{ item.description }}</p>
            <div class="meta-row">
              <span class="item-time">{{ item.time }}</span>
              <span v-if="item.channel" class="channel-pill" :class="item.channel.toLowerCase().replace(/[^a-z0-9]/g, '_')">
                {{ item.channel }}
              </span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredList.length === 0" class="empty-state">
          <p>No {{ activeTab === 'unread' ? 'unread' : '' }} notifications</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  IconArrowsExchange,
  IconBuildingBank,
  IconCreditCard,
  IconShieldLock,
  IconAlertCircle,
  IconBell,
  IconSparkles,
  IconAdjustmentsHorizontal,
  IconMessageDots,
  IconMail,
  IconBrandTelegram
} from '@tabler/icons-vue'
import { apiRequest } from '@/services/api'
import { playMessageSound } from '@/utils/sound'
import { useNotificationStore } from '@/stores/notification'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'update:unreadCount'])

const notifStore = useNotificationStore()
const dropdownRef = ref(null)
const activeTab = ref('all') // 'all' | 'unread'
const loading = ref(false)

// Default sample notifications if API returns empty
const defaultSamples = [
  {
    id: 'sample-1',
    type: 'transfer',
    channel: 'TELEGRAM',
    title: 'Telegram Alert: Money transferred',
    description: 'Your transfer of $1,250 to Alex Morgan has been completed.',
    time: '5m ago',
    read: false,
    tone: 'purple',
    iconComponent: IconBrandTelegram,
  },
  {
    id: 'sample-2',
    type: 'sms',
    channel: 'SMS',
    title: 'SMS OTP Code',
    description: 'Your verification code is 849201. Valid for 5 minutes.',
    time: '10m ago',
    read: true,
    tone: 'orange',
    iconComponent: IconMessageDots,
  },
  {
    id: 'sample-3',
    type: 'email',
    channel: 'EMAIL',
    title: 'Email Statement Ready',
    description: 'Your monthly banking account statement for August is now available.',
    time: '25m ago',
    read: true,
    tone: 'blue',
    iconComponent: IconMail,
  },
  {
    id: 'sample-4',
    type: 'push',
    channel: 'PUSH',
    title: 'Push Notification: Security alert',
    description: 'New login detected from Chrome on macOS.',
    time: '1h ago',
    read: false,
    tone: 'purple',
    iconComponent: IconBell,
  },
]

const items = ref([...defaultSamples])

function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Recently'

  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d ago`
  return date.toLocaleDateString()
}

function resolveNotificationStyle(item) {
  const channel = String(item.channel || '').toUpperCase().trim().replace('-', '_')
  const eventType = String(item.event_type || '').toUpperCase().trim()
  const text = `${item.title || ''} ${item.body || item.message || ''} ${eventType}`.toLowerCase()

  // 1. Prioritize Channel-based Icons
  if (channel === 'TELEGRAM' || text.includes('telegram')) {
    return { tone: 'purple', iconComponent: IconBrandTelegram }
  }

  if (channel === 'SMS' || text.includes('sms')) {
    return { tone: 'orange', iconComponent: IconMessageDots }
  }

  if (channel === 'EMAIL' || text.includes('email') || text.includes('mail')) {
    return { tone: 'blue', iconComponent: IconMail }
  }

  if (channel === 'PUSH') {
    return { tone: 'purple', iconComponent: IconBell }
  }

  if (channel === 'IN_APP') {
    if (eventType.includes('OTP') || text.includes('otp')) {
      return { tone: 'blue', iconComponent: IconShieldLock }
    }
    if (eventType.includes('ALERT') || eventType.includes('SECURITY') || text.includes('alert')) {
      return { tone: 'red', iconComponent: IconAlertCircle }
    }
    return { tone: 'green', iconComponent: IconArrowsExchange }
  }

  // 2. Fallbacks if channel is unspecified
  if (eventType.includes('TRANSFER') || text.includes('transfer') || text.includes('ផ្ទេរ')) {
    return { tone: 'green', iconComponent: IconArrowsExchange }
  }
  if (eventType.includes('OTP') || text.includes('otp')) {
    return { tone: 'blue', iconComponent: IconShieldLock }
  }
  if (eventType.includes('PAYMENT') || text.includes('payment')) {
    return { tone: 'green', iconComponent: IconCreditCard }
  }
  if (eventType.includes('SECURITY') || eventType.includes('ALERT')) {
    return { tone: 'red', iconComponent: IconAlertCircle }
  }

  return { tone: 'purple', iconComponent: IconBell }
}

async function fetchNotifications() {
  const token = localStorage.getItem('token')
  if (!token) return

  loading.value = true
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const isAdmin = user.role === 'admin'
    const endpoint = isAdmin ? '/admin/notification?page=1&limit=20' : '/auth/user/notifications?page=1&limit=20'

    const res = await apiRequest(endpoint)
    const rawList = Array.isArray(res) ? res : (res.data || res.notifications || [])

    if (rawList.length > 0) {
      items.value = rawList.map((n) => {
        const style = resolveNotificationStyle(n)
        const isRead = n.is_read !== undefined
          ? Boolean(n.is_read)
          : n.status === 'READ' || (n.read_at !== null && n.read_at !== undefined)

        return {
          id: n.notification_id || n.id,
          title: n.title || 'Notification',
          description: n.body || n.message || '',
          channel: n.channel || 'IN_APP',
          time: formatTimeAgo(n.created_at),
          read: isRead,
          tone: style.tone,
          iconComponent: style.iconComponent,
        }
      })
    }
  } catch (err) {
    console.warn('[Notifications] Could not fetch live notifications, showing samples:', err.message)
  } finally {
    loading.value = false
  }
}

const unreadCount = computed(() => items.value.filter((i) => !i.read).length)

watch(unreadCount, (newVal) => {
  emit('update:unreadCount', newVal)
}, { immediate: true })

const filteredList = computed(() => {
  if (activeTab.value === 'unread') {
    return items.value.filter((i) => !i.read)
  }
  return items.value
})

async function markAsRead(item) {
  if (item.read) return
  item.read = true

  notifStore.decrementUnread(item.id)
  window.dispatchEvent(new CustomEvent('notification-status-changed', {
    detail: { id: item.id, status: 'READ' }
  }))

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'

  try {
    if (isAdmin) {
      await apiRequest(`/admin/notification/${item.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'READ' })
      })
    } else {
      await apiRequest(`/auth/user/notifications/${item.id}/read`, {
        method: 'PATCH'
      })
    }
  } catch (err) {
    console.warn('[Notification] Failed to mark as read on server:', err.message)
  }
}

async function markAllAsRead() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = user.role === 'admin'
  const unreadItems = items.value.filter((i) => !i.read)
  items.value.forEach((item) => {
    item.read = true
  })

  notifStore.markAllRead()
  window.dispatchEvent(new CustomEvent('notifications-all-read'))
  emit('update:unreadCount', 0)

  await Promise.allSettled(
    unreadItems.map((item) => {
      if (isAdmin) {
        return apiRequest(`/admin/notification/${item.id}`, {
          method: 'PUT',
          body: JSON.stringify({ status: 'READ' })
        })
      } else {
        return apiRequest(`/auth/user/notifications/${item.id}/read`, {
          method: 'PATCH'
        })
      }
    })
  )
}

// Re-fetch when dropdown is opened
watch(() => props.isOpen, (open) => {
  if (open) {
    playMessageSound()
    fetchNotifications()
  }
})

// Click outside handler
function handleGlobalClick(event) {
  if (!props.isOpen) return
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    const toggleBtn = event.target.closest('.notification-button')
    if (!toggleBtn) {
      emit('close')
    }
  }
}

function handleKeydown(event) {
  if (event.key === 'Escape' && props.isOpen) {
    emit('close')
  }
}

function handleNewNotificationEvent(event) {
  const n = event.detail
  if (!n) return

  const style = resolveNotificationStyle(n)
  const isRead = n.is_read !== undefined
    ? Boolean(n.is_read)
    : n.status === 'READ' || (n.read_at !== null && n.read_at !== undefined)

  const newItem = {
    id: n.notification_id || n.id || Date.now(),
    title: n.title || 'Notification',
    description: n.body || n.message || '',
    channel: n.channel || 'IN_APP',
    time: formatTimeAgo(n.created_at || new Date().toISOString()),
    read: isRead,
    tone: style.tone,
    iconComponent: style.iconComponent,
  }

  const existingIdx = items.value.findIndex((i) => i.id === newItem.id)
  if (existingIdx !== -1) {
    items.value[existingIdx] = newItem
  } else {
    items.value.unshift(newItem)
  }
}

function handleStatusChanged(event) {
  const { id, status } = event.detail || {}
  const target = items.value.find((i) => i.id === id)
  if (target) {
    target.read = status === 'READ'
  }
}

onMounted(() => {
  fetchNotifications()
  document.addEventListener('click', handleGlobalClick, true)
  document.addEventListener('keydown', handleKeydown)
  window.addEventListener('new-notification', handleNewNotificationEvent)
  window.addEventListener('notification-status-changed', handleStatusChanged)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick, true)
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('new-notification', handleNewNotificationEvent)
  window.removeEventListener('notification-status-changed', handleStatusChanged)
})
</script>

<style scoped>
.notification-dropdown-wrapper {
  position: absolute;
  top: calc(100% + 14px);
  right: 0;
  z-index: 1050;
}

.notification-dropdown {
  width: 410px;
  max-width: calc(100vw - 32px);
  background: #ffffff;
  border-radius: 24px;
  border: 1px solid #edf0f5;
  box-shadow: 0 20px 50px -10px rgba(28, 14, 76, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: dropdownPop 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dropdownPop {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Header */
.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
}

.dropdown-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #151a26;
  letter-spacing: -0.2px;
}

.filter-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 0;
  background: transparent;
  color: #6c7385;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.filter-btn:hover {
  background: #f4f3f8;
  color: #3b4256;
}

/* Tabs & Action Bar */
.tabs-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid #f0f2f6;
}

.tabs-group {
  display: flex;
  gap: 20px;
}

.tab-item {
  position: relative;
  border: 0;
  background: transparent;
  padding: 8px 0 12px;
  font-size: 15px;
  font-weight: 600;
  color: #717786;
  cursor: pointer;
  transition: color 0.15s ease;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.tab-item:hover {
  color: #1e2433;
}

.tab-item.active {
  color: #6737d7;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2.5px;
  background: #6737d7;
  border-radius: 4px 4px 0 0;
}

.tab-badge {
  padding: 1px 6px;
  border-radius: 10px;
  background: #f2edfe;
  color: #6737d7;
  font-size: 11px;
  font-weight: 700;
}

.mark-all-read-btn {
  border: 0;
  background: transparent;
  font-size: 13.5px;
  font-weight: 500;
  color: #717786;
  cursor: pointer;
  padding: 8px 0 12px;
  transition: color 0.15s ease;
}

.mark-all-read-btn:hover {
  color: #6737d7;
  text-decoration: underline;
}

/* Loading state */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
  color: #858d9e;
  font-size: 13.5px;
}

.dropdown-spinner {
  width: 28px;
  height: 28px;
  border: 2.5px solid #e2ddf8;
  border-top-color: #6737d7;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Notifications List */
.notifications-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Custom Slim Scrollbar */
.notifications-list::-webkit-scrollbar {
  width: 5px;
}

.notifications-list::-webkit-scrollbar-track {
  background: transparent;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: #dcdee6;
  border-radius: 10px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: #bdc1cb;
}

/* Notification Item */
.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 14px 12px;
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.notification-item:hover {
  background: #f9f9fd;
}

/* Icon Badges */
.icon-badge {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-badge.orange {
  background: #fff4eb;
  color: #f97316;
}

.icon-badge.red {
  background: #feebee;
  color: #ef4444;
}

.icon-badge.green {
  background: #ebfbf2;
  color: #10b981;
}

.icon-badge.purple {
  background: #f3effe;
  color: #8b5cf6;
}

.icon-badge.blue {
  background: #eff6ff;
  color: #2563eb;
}

/* Content Column */
.content-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.item-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1e2b;
  line-height: 1.3;
}

.unread-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6737d7;
  margin-right: 4px;
}

.item-desc {
  margin: 0 0 6px;
  font-size: 13.5px;
  color: #656c7e;
  line-height: 1.45;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.item-time {
  font-size: 12.5px;
  font-weight: 500;
  color: #9aa1b2;
}

.channel-pill {
  display: inline-flex;
  align-items: center;
  padding: 1.5px 7px;
  border-radius: 6px;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.channel-pill.sms {
  background: #fff4eb;
  color: #ea580c;
}

.channel-pill.email {
  background: #eff6ff;
  color: #2563eb;
}

.channel-pill.telegram {
  background: #f3effe;
  color: #7c3aed;
}

.channel-pill.push,
.channel-pill.in_app,
.channel-pill.in-app {
  background: #f1f5f9;
  color: #475569;
}

/* Empty State */
.empty-state {
  padding: 36px 16px;
  text-align: center;
  color: #9299ab;
  font-size: 14px;
}
</style>
