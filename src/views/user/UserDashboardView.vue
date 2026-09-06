<template>
    <div class="user-dashboard">
        <header class="page-heading">
            <div>
                <h1>Dashboard Overview</h1>
                <p class="intro">Monitor your notifications, delivery performance, and active channels.</p>
            </div>
            <div class="header-actions">
                <button
                    type="button"
                    class="btn-telegram-header"
                    :disabled="telegramLoading"
                    @click="openTelegramModal"
                >
                    <IconBrandTelegram :size="19" />
                    <span>Link Telegram</span>
                </button>
            </div>
        </header>

        <p v-if="error" class="alert alert-danger">{{ error }}</p>
        <BaseStateCard :stats="stats" />

        <section class="dashboard-grid">
            <article class="panel delivery-panel col-8">
                <div class="panel-heading">
                    <div>
                        <h2>Notification performance</h2>
                        <p v-if="isDateFiltered">Filtered for week of <strong>{{ filterDateLabel }}</strong></p>
                        <p v-else>Notification delivery over the last {{ days }} days</p>
                    </div>
                    <div class="period-filter-controls">
                        <button
                            v-if="isDateFiltered"
                            type="button"
                            class="clear-filter-btn"
                            @click="handleResetDate"
                        >
                            Reset filter
                        </button>
                        <select
                            v-model="days"
                            class="period-button"
                            aria-label="Dashboard period"
                            @change="isDateFiltered = false; loadDashboard()"
                        >
                            <option :value="7">Last 7 days</option>
                            <option :value="30">Last 30 days</option>
                            <option :value="90">Last 90 days</option>
                        </select>
                    </div>
                </div>
                <DeliveryPerformanceImage
                    :activity="activityData"
                    :selected-date="selectedCalendarDate"
                    :is-date-filtered="isDateFiltered"
                />
            </article>
            <CalendarDate
                class="card-panel-col"
                :model-value="selectedCalendarDate"
                @select-date="handleDateSelect"
                @reset-date="handleResetDate"
            />
        </section>
    </div>
    <div class="container recent-activities-container mt-3 m-0 p-0">
        <div class="row">
            <div class="col-8">
                <div class="card card-recent-activities p-4">
                    <div class="header-titles d-flex align-items-center justify-content-between">
                        <div class="desc">
                            <h4 class="header-title">Recent Activities</h4>
                            <span class="sub-header-title">Latest notification records</span>
                        </div>
                        <div class="btn-see-more">
                            <RouterLink class="btn see-more-btn" :to="{ name: 'user-notification' }">See more</RouterLink>
                        </div>
                    </div>
                    <div class="table-container mt-3">
                        <BaseTable
                            caption="Recent user notification activity"
                            :columns="activityColumns"
                            :rows="activityRows"
                            :loading="loading"
                        >
                            <template #cell-event="{ value }">
                                <span class="event-title">{{ value }}</span>
                            </template>
                            <template #cell-channel="{ value }">
                                <span class="channel-badge" :class="value ? value.toLowerCase().replace('-', '_') : ''">{{ value }}</span>
                            </template>
                            <template #cell-priority="{ value }">
                                <span class="priority-badge" :class="value ? value.toLowerCase() : ''">{{ value }}</span>
                            </template>
                            <template #cell-status="{ row, value }">
                                <button
                                    type="button"
                                    class="status-badge-btn"
                                    :title="value === 'READ' ? 'Read' : 'Click to mark as READ'"
                                    @click.stop="handleRowStatusToggle(row)"
                                >
                                    <span class="status-badge" :class="value ? value.toLowerCase() : ''">
                                        <span class="status-dot"></span>
                                        {{ value }}
                                    </span>
                                </button>
                            </template>
                            <template #cell-timestamp="{ value }">
                                <span class="timestamp-text">{{ value }}</span>
                            </template>
                        </BaseTable>
                    </div>
                </div>
            </div>
            <div class="col-4">
                <div class="card card-channels p-4 mt-2">
                    <div class="delivery-channel">
                        <h3 class="delivery-title">Delivery Channel</h3>
                        <span class="delivery-subtitle">Where alerts are sent</span>
                    </div>
                    <DeliveryChannelChart :channels="channels" />
                </div>
            </div>
        </div>
    </div>

    <!-- Telegram Link Modal -->
    <teleport to="body">
        <transition name="modal-fade">
            <div v-if="showTelegramModal" class="modal-backdrop" @click.self="showTelegramModal = false">
                <div class="modal-dialog-box modal-telegram-box" role="dialog" aria-modal="true" aria-labelledby="user-telegram-title">
                    <div class="modal-icon-badge telegram-badge">
                        <IconBrandTelegram :size="30" :stroke-width="2" />
                    </div>
                    <h3 id="user-telegram-title" class="modal-title">Connect Telegram Bot</h3>
                    <p class="modal-desc">
                        Link your Telegram account to receive real-time OmniNotify alerts, transactions, and security updates directly in your chat.
                    </p>

                    <!-- Telegram Connect Steps -->
                    <div v-if="telegramLink" class="telegram-link-card">
                        <div class="step-row">
                            <span class="step-badge">1</span>
                            <span class="step-label">Open bot with your secure link:</span>
                        </div>

                        <div class="telegram-url-input-wrap">
                            <input
                                type="text"
                                readonly
                                :value="telegramLink"
                                class="telegram-url-input"
                                @click="$event.target.select()"
                            />
                            <button
                                type="button"
                                class="btn-copy-link"
                                @click="copyTelegramLink"
                            >
                                {{ copied ? 'Copied!' : 'Copy' }}
                            </button>
                        </div>

                        <div class="step-row mt-2">
                            <span class="step-badge">2</span>
                            <span class="step-label">Press <strong>Start</strong> in Telegram to activate!</span>
                        </div>
                    </div>

                    <p v-if="telegramError" class="alert alert-danger p-2 small mt-2">{{ telegramError }}</p>

                    <div class="modal-actions mt-4">
                        <button type="button" class="btn-cancel" @click="showTelegramModal = false">
                            Close
                        </button>
                        <button
                            v-if="telegramLink"
                            type="button"
                            class="btn-telegram-primary"
                            @click="openTelegramBot"
                        >
                            <IconBrandTelegram :size="18" />
                            <span>Open in Telegram</span>
                        </button>
                        <button
                            v-else
                            type="button"
                            class="btn-telegram-primary"
                            :disabled="telegramLoading"
                            @click="generateTelegramLink"
                        >
                            <span v-if="telegramLoading" class="btn-spinner" aria-hidden="true"></span>
                            <span>{{ telegramLoading ? 'Connecting...' : 'Generate Link' }}</span>
                        </button>
                    </div>
                </div>
            </div>
        </transition>
    </teleport>
</template>

<script setup>
import { IconBrandTelegram } from '@tabler/icons-vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseStateCard from '@/components/common/BaseStateCard.vue'
import DeliveryPerformanceImage from '@/components/dashboard/DeliveryPerformanceImage.vue'
import CalendarDate from '@/components/dashboard/CalendarDate.vue'
import DeliveryChannelChart from '@/components/dashboard/DeliveryChannelChart.vue'
import { get, apiRequest } from '@/services/api'
import { useNotificationStore } from '@/stores/notification'
import { useToastStore } from '@/stores/toast'
import { onMounted, onUnmounted, ref } from 'vue'

const notifStore = useNotificationStore()
const toast = useToastStore()
const days = ref(7)
const loading = ref(false)
const error = ref('')
const selectedCalendarDate = ref(new Date())
const isDateFiltered = ref(false)
const filterDateLabel = ref('')

const showTelegramModal = ref(false)
const telegramLoading = ref(false)
const telegramLink = ref('')
const telegramError = ref('')
const copied = ref(false)

async function openTelegramModal() {
    showTelegramModal.value = true
    telegramError.value = ''
    if (!telegramLink.value) {
        await generateTelegramLink()
    }
}

async function generateTelegramLink() {
    telegramLoading.value = true
    telegramError.value = ''
    try {
        const res = await apiRequest('/auth/user/telegram/link', { method: 'POST' })
        const data = res?.data || res || {}
        if (data.link) {
            telegramLink.value = data.link
        } else {
            telegramError.value = 'Could not generate Telegram link. Please try again.'
        }
    } catch (err) {
        telegramError.value = err.message || 'Failed to generate Telegram connection link.'
    } finally {
        telegramLoading.value = false
    }
}

function openTelegramBot() {
    if (telegramLink.value) {
        window.open(telegramLink.value, '_blank')
        toast.success('Opening Telegram Bot!')
    }
}

async function copyTelegramLink() {
    if (!telegramLink.value) return
    try {
        await navigator.clipboard.writeText(telegramLink.value)
        copied.value = true
        toast.success('Telegram link copied to clipboard!')
        setTimeout(() => { copied.value = false }, 3000)
    } catch (_) {
        toast.info('Link ready to copy.')
    }
}

const stats = ref([
    { label: 'Total notifications', value: '—', change: '+100%', changeTone: 'positive', icon: 'arrow', tone: 'purple', subtitle: 'All received alerts' },
    { label: 'Delivered successfully', value: '—', change: '+96.2%', changeTone: 'positive', icon: 'check', tone: 'green', subtitle: 'Delivered or read' },
    { label: 'Unread alerts', value: '—', change: '0 unread', changeTone: 'positive', icon: 'clock', tone: 'blue', subtitle: 'Requires attention' },
    { label: 'Failed deliveries', value: '—', change: '-0.0%', changeTone: 'negative', icon: 'alert', tone: 'red', subtitle: 'Delivery issues' },
])

const activityColumns = [
    { key: 'event', label: 'Event & Title' },
    { key: 'channel', label: 'Channel' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'timestamp', label: 'Timestamp' },
]

const activityRows = ref([])
const activityData = ref([])
const channels = ref([])
const allUserNotifications = ref([])

const formatNumber = (value) => Number(value || 0).toLocaleString()

const channelColorMap = {
    push: '#8751ff',
    sms: '#54249b',
    email: '#351276',
    telegram: '#c1b2fa',
    in_app: '#a58bef',
    'in-app': '#a58bef'
}

function formatDateToYMD(d) {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function getWeekRangeForDate(d) {
    const date = new Date(d)
    const dayOfWeek = (date.getDay() + 6) % 7 // Mon = 0, Sun = 6
    const monday = new Date(date)
    monday.setDate(date.getDate() - dayOfWeek)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)

    return {
        from: formatDateToYMD(monday),
        to: formatDateToYMD(sunday),
        fromDate: new Date(monday.setHours(0, 0, 0, 0)),
        toDate: new Date(sunday.setHours(23, 59, 59, 999))
    }
}

async function handleDateSelect(date) {
    selectedCalendarDate.value = date
    isDateFiltered.value = true
    filterDateLabel.value = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
    await loadDashboard()
}

async function handleResetDate() {
    selectedCalendarDate.value = new Date()
    isDateFiltered.value = false
    filterDateLabel.value = ''
    await loadDashboard()
}

async function loadDashboard() {
    loading.value = true
    error.value = ''
    try {
        const [notifRes, prefRes] = await Promise.all([
            get('/auth/user/notifications?page=1&limit=100'),
            get('/auth/user/preferences').catch(() => ({ data: [] }))
        ])

        const rawList = Array.isArray(notifRes) ? notifRes : (notifRes.data || [])
        allUserNotifications.value = rawList

        let filteredList = rawList
        if (isDateFiltered.value && selectedCalendarDate.value) {
            const { fromDate, toDate } = getWeekRangeForDate(selectedCalendarDate.value)
            filteredList = rawList.filter((item) => {
                if (!item.created_at) return true
                const itemDate = new Date(item.created_at)
                return itemDate >= fromDate && itemDate <= toDate
            })
        } else {
            const cutoff = new Date()
            cutoff.setDate(cutoff.getDate() - Number(days.value || 7))
            filteredList = rawList.filter((item) => {
                if (!item.created_at) return true
                return new Date(item.created_at) >= cutoff
            })
        }

        // Calculate Stats
        const totalCount = rawList.length
        const unreadCount = rawList.filter((item) => !item.read_at && item.status !== 'READ' && !item.is_read).length
        const deliveredCount = rawList.filter((item) => ['DELIVERED', 'READ', 'SUCCESS'].includes(String(item.status).toUpperCase()) || item.read_at).length
        const failedCount = rawList.filter((item) => String(item.status).toUpperCase() === 'FAILED').length

        stats.value[0].value = formatNumber(totalCount)
        stats.value[0].change = totalCount > 0 ? '+100%' : '0%'

        stats.value[1].value = formatNumber(deliveredCount)
        const deliveredRate = totalCount > 0 ? ((deliveredCount / totalCount) * 100).toFixed(1) : '96.2'
        stats.value[1].change = `+${deliveredRate}%`

        stats.value[2].value = formatNumber(unreadCount)
        stats.value[2].change = unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'
        stats.value[2].changeTone = unreadCount > 0 ? 'negative' : 'positive'

        stats.value[3].value = formatNumber(failedCount)
        const failedRate = totalCount > 0 ? ((failedCount / totalCount) * 100).toFixed(1) : '0.0'
        stats.value[3].change = `-${failedRate}%`
        stats.value[3].changeTone = failedCount > 0 ? 'negative' : 'positive'

        // Calculate Activity Performance Points
        const activityMap = {}
        const sourceForActivity = isDateFiltered.value ? filteredList : rawList
        sourceForActivity.forEach((item) => {
            if (!item.created_at) return
            const dStr = formatDateToYMD(new Date(item.created_at))
            if (!activityMap[dStr]) {
                activityMap[dStr] = { date: dStr, total: 0, delivered: 0, pending: 0, failed: 0 }
            }
            activityMap[dStr].total += 1
            const st = String(item.status || (item.read_at ? 'READ' : 'PENDING')).toUpperCase()
            if (st === 'READ' || st === 'DELIVERED' || st === 'SUCCESS') {
                activityMap[dStr].delivered += 1
            } else if (st === 'FAILED') {
                activityMap[dStr].failed += 1
            } else {
                activityMap[dStr].pending += 1
            }
        })
        activityData.value = Object.values(activityMap)

        // Calculate Channel Distribution
        const channelCounts = {
            push: 0,
            sms: 0,
            email: 0,
            telegram: 0,
            in_app: 0
        }

        rawList.forEach((item) => {
            const ch = String(item.channel || 'in_app').toLowerCase().replace('-', '_')
            if (channelCounts[ch] !== undefined) {
                channelCounts[ch] += 1
            } else {
                channelCounts[ch] = (channelCounts[ch] || 0) + 1
            }
        })

        const totalChannelCount = Object.values(channelCounts).reduce((a, b) => a + b, 0)
        channels.value = Object.entries(channelCounts).map(([key, count]) => {
            const name = key.toUpperCase().replace('_', '-')
            const pct = totalChannelCount > 0 ? Math.round((count / totalChannelCount) * 100) : 0
            return {
                name,
                count,
                value: count,
                percentage: pct,
                tone: key,
                color: channelColorMap[key] || '#8751ff'
            }
        })

        // Populate Recent Activity Rows
        activityRows.value = rawList.slice(0, 8).map((item) => {
            const isRead = Boolean(item.read_at || item.status === 'READ' || item.is_read)
            return {
                id: item.notification_id || item.id,
                event: item.title || item.body || 'Alert Notification',
                event_type: item.event_type || 'SYSTEM_ALERT',
                channel: item.channel || 'IN_APP',
                priority: item.priority || 'NORMAL',
                status: isRead ? 'READ' : (item.status || 'DELIVERED'),
                timestamp: item.created_at ? new Date(item.created_at).toLocaleString() : '—'
            }
        })
    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
    }
}

async function handleRowStatusToggle(row) {
    if (!row || !row.id || row.status === 'READ') return
    row.status = 'READ'

    try {
        await apiRequest(`/auth/user/notifications/${row.id}/read`, { method: 'PATCH' })
        notifStore.decrementUnread()
        window.dispatchEvent(new CustomEvent('notification-status-changed', {
            detail: { id: row.id, status: 'READ' }
        }))

        // Refresh stats
        const curUnread = Math.max(0, (parseInt(String(stats.value[2].value).replace(/,/g, '')) || 0) - 1)
        stats.value[2].value = formatNumber(curUnread)
        stats.value[2].change = curUnread > 0 ? `${curUnread} unread` : 'All caught up'
        stats.value[2].changeTone = curUnread > 0 ? 'negative' : 'positive'
    } catch (err) {
        console.warn('Failed to mark notification as read:', err.message)
    }
}

function handleLiveNotification(event) {
    const item = event.detail
    if (!item) return

    const newRow = {
        id: item.notification_id || item.id,
        event: item.title || 'New Notification',
        event_type: item.event_type || 'SYSTEM_ALERT',
        channel: item.channel || 'IN_APP',
        priority: item.priority || 'NORMAL',
        status: item.status || 'DELIVERED',
        timestamp: new Date().toLocaleString()
    }

    const existingIdx = activityRows.value.findIndex(r => r.id === newRow.id)
    if (existingIdx !== -1) {
        activityRows.value[existingIdx] = newRow
    } else {
        activityRows.value.unshift(newRow)
        if (activityRows.value.length > 8) {
            activityRows.value.pop()
        }
    }

    // Increment total alerts & unread alerts
    const curTotal = (parseInt(String(stats.value[0].value).replace(/,/g, '')) || 0) + 1
    stats.value[0].value = formatNumber(curTotal)

    const curUnread = (parseInt(String(stats.value[2].value).replace(/,/g, '')) || 0) + 1
    stats.value[2].value = formatNumber(curUnread)
    stats.value[2].change = `${curUnread} unread`
    stats.value[2].changeTone = 'negative'
}

onMounted(() => {
    loadDashboard()
    window.addEventListener('new-notification', handleLiveNotification)
    window.addEventListener('notification-status-changed', handleLiveNotification)
})

onUnmounted(() => {
    window.removeEventListener('new-notification', handleLiveNotification)
    window.removeEventListener('notification-status-changed', handleLiveNotification)
})
</script>

<style scoped>
.status-badge-btn {
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: transform 0.15s ease, opacity 0.15s ease;
}

.status-badge-btn:hover {
    transform: scale(1.05);
    opacity: 0.9;
}

.delivery-title {
    font-size: 20px !important;
}

.delivery-subtitle {
    font-size: 14px !important;
    color: #697489 !important;
}

.card-recent-activities {
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    border: none;
    margin-top: 10px !important;
}

.header-title {
    font-size: 20px !important;
}

.see-more-btn {
    background-color: white !important;
    color: black !important;
    border: 0.5px solid #e3e5e9 !important;
    font-size: 14px !important;
}

.sub-header-title {
    font-size: 16px !important;
    color: #697489 !important;
}

.event-title {
    font-weight: 500;
    color: #152033;
    font-size: 14px;
    white-space: nowrap;
}

.timestamp-text {
    font-size: 13px;
    color: #697489;
    white-space: nowrap;
}

.channel-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.03em;
    background: #f1f5f9;
    color: #475569;
}

.channel-badge.telegram {
    color: #0284c7;
    background: #e0f2fe;
}

.channel-badge.sms {
    color: #7c3aed;
    background: #f3e8ff;
}

.channel-badge.email {
    color: #4338ca;
    background: #e0e7ff;
}

.channel-badge.push {
    color: #9333ea;
    background: #faf5ff;
}

.channel-badge.in_app,
.channel-badge.in-app {
    color: #0d9488;
    background: #ccfbf1;
}

.priority-badge {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.priority-badge.normal {
    color: #475569;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
}

.priority-badge.low {
    color: #64748b;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
}

.priority-badge.medium {
    color: #c2410c;
    background: #fff7ed;
    border: 1px solid #fed7aa;
}

.priority-badge.high {
    color: #dc2626;
    background: #fef2f2;
    border: 1px solid #fecaca;
}

.priority-badge.critical {
    color: #991b1b;
    background: #fee2e2;
    border: 1px solid #fca5a5;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-height: 26px;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
}

.status-badge.delivered,
.status-badge.read,
.status-badge.success {
    color: #059669;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
}

.status-badge.pending,
.status-badge.queued {
    color: #2563eb;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
}

.status-badge.failed {
    color: #dc2626;
    background: #fef2f2;
    border: 1px solid #fecaca;
}

.status-badge.retrying {
    color: #d97706;
    background: #fffbeb;
    border: 1px solid #fde68a;
}

.user-dashboard {
    color: #152033;
}

.recent-activities-container {
    max-width: none;
}

.page-heading,
.panel-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 24px;
}

h1 {
    font-size: 32px;
    line-height: 1.1;
}

.intro,
.panel-heading p {
    margin-top: 8px;
    color: #697489;
    font-size: 15px;
}

.stat-card,
.panel {
    border: 1px solid #e3e5e9;
    border-radius: 14px;
    background: #fff;
}

.dashboard-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 18px;
    margin-top: 18px;
}

.dashboard-grid .delivery-panel {
    flex: 0 0 calc(66.666667% - 6px);
}

.dashboard-grid .card-panel-col {
    flex: 0 0 calc(33.333333% - 12px);
}

.panel {
    padding: 24px;
}

.panel h2 {
    font-size: 18px;
}

.period-filter-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}

.clear-filter-btn {
    padding: 7px 12px;
    border-radius: 7px;
    border: 1px solid #ddd6fe;
    background: #f5f3ff;
    color: #8751ff;
    font: 600 13px "Geist", sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
}

.clear-filter-btn:hover {
    background: #ede9fe;
    color: #7c3aed;
}

.period-button {
    padding: 8px 11px;
    border: 1px solid #e3e5e9;
    border-radius: 7px;
    color: #697489;
    background: #fff;
    font: 14px "Geist", sans-serif;
}

.card-channels {
    padding: 10px;
    border: none;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
}

/* Dark theme overrides */
[data-theme="dark"] .user-dashboard,
[data-theme="dark"] .header-title,
[data-theme="dark"] .event-title,
[data-theme="dark"] h1,
[data-theme="dark"] h2,
[data-theme="dark"] .delivery-title {
    color: #f1f5f9 !important;
}

[data-theme="dark"] .stat-card,
[data-theme="dark"] .panel,
[data-theme="dark"] .card-recent-activities,
[data-theme="dark"] .card-channels {
    background: #111827 !important;
    border-color: #1f293d !important;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

[data-theme="dark"] .period-button {
    background: #1a2234 !important;
    border-color: #2e3d5b !important;
    color: #cbd5e1 !important;
}

[data-theme="dark"] .see-more-btn {
    background-color: #1a2234 !important;
    color: #e2e8f0 !important;
    border-color: #2e3d5b !important;
}

@media (max-width: 1000px) {
    .dashboard-grid {
        display: block;
    }

    .dashboard-grid .delivery-panel,
    .dashboard-grid .card-panel-col {
        flex-basis: auto;
    }
}

.btn-telegram-header {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 10px;
    background: #0284c7;
    border: 0;
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}

.btn-telegram-header:hover {
    background: #0369a1;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(2, 132, 199, 0.35);
}

.btn-telegram-header:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

/* Modal and Telegram Link Card Styles */
.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.modal-dialog-box {
    width: 100%;
    max-width: 440px;
    background: #ffffff;
    border-radius: 20px;
    padding: 30px 24px 24px;
    text-align: center;
    box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);
}

[data-theme="dark"] .modal-dialog-box {
    background: #111827 !important;
    border: 1px solid #1f293d;
}

.modal-icon-badge {
    width: 56px;
    height: 56px;
    margin: 0 auto 16px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.telegram-badge {
    background: #e0f2fe;
    color: #0284c7;
}

[data-theme="dark"] .telegram-badge {
    background: rgba(2, 132, 199, 0.2) !important;
    color: #38bdf8 !important;
}

.modal-title {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 8px;
}

[data-theme="dark"] .modal-title {
    color: #f8fafc !important;
}

.modal-desc {
    font-size: 13.5px;
    color: #64748b;
    line-height: 1.55;
    margin: 0 0 20px;
}

[data-theme="dark"] .modal-desc {
    color: #94a3b8 !important;
}

.telegram-link-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 16px;
    text-align: left;
    margin-bottom: 8px;
}

[data-theme="dark"] .telegram-link-card {
    background: #1e293b !important;
    border-color: #334155 !important;
}

.step-row {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13.5px;
    color: #334155;
}

[data-theme="dark"] .step-row {
    color: #e2e8f0 !important;
}

.step-badge {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #0284c7;
    color: #ffffff;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.step-label {
    flex: 1;
}

.telegram-url-input-wrap {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    margin-bottom: 8px;
}

.telegram-url-input {
    flex: 1;
    height: 38px;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 0 10px;
    font-size: 12.5px;
    background: #ffffff;
    color: #475569;
    font-family: monospace;
}

[data-theme="dark"] .telegram-url-input {
    background: #0f172a !important;
    border-color: #334155 !important;
    color: #94a3b8 !important;
}

.btn-copy-link {
    height: 38px;
    padding: 0 14px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #334155;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-copy-link:hover {
    background: #f1f5f9;
    border-color: #94a3b8;
}

[data-theme="dark"] .btn-copy-link {
    background: #0f172a !important;
    border-color: #334155 !important;
    color: #e2e8f0 !important;
}

.modal-actions {
    display: flex;
    gap: 10px;
}

.btn-cancel {
    flex: 1;
    height: 44px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f1f5f9;
    border: 0;
    color: #475569;
}

[data-theme="dark"] .btn-cancel {
    background: #1e293b !important;
    color: #cbd5e1 !important;
}

.btn-telegram-primary {
    flex: 1;
    height: 44px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #0284c7;
    border: 0;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}

.btn-telegram-primary:hover {
    background: #0369a1;
}

.btn-telegram-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255, 255, 255, 0.35);
    border-top-color: #ffffff;
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.65s linear infinite;
    margin-right: 6px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
    opacity: 0;
}
</style>
