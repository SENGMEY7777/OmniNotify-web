<template>
    <section class="manage-notifications-view user-notifications-view">
        <!-- Page Header -->
        <div class="header-section d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
                <h1 class="page-title">My Notifications</h1>
                <p class="page-subtitle">View and manage all your banking alerts, transactions, and security updates.</p>
            </div>
            <div class="d-flex align-items-center gap-2">
                <button
                    v-if="summaryStats.unread > 0"
                    class="btn btn-outline-primary-custom"
                    type="button"
                    :disabled="markingAll"
                    @click="markAllAsRead"
                >
                    <span v-if="markingAll" class="spinner-border spinner-border-sm me-1"></span>
                    <TablerIcon v-else name="check" size="18" />
                    <span>Mark all read</span>
                </button>
                <button class="btn btn-primary-custom" type="button" :disabled="loading" @click="load(1)">
                    <TablerIcon name="clock" size="18" :class="{ 'spin-icon': loading }" />
                    <span>Refresh</span>
                </button>
            </div>
        </div>

        <!-- 4 KPI Stat Cards using BaseStateCard -->
        <BaseStateCard :stats="statCards" class="mb-4" />

        <!-- Notification Table Card -->
        <div class="card card-table p-4">
            <div class="table-header d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
                <div class="desc">
                    <h4 class="table-title">Notification Records</h4>
                    <span class="table-subtitle">All alerts received across your connected channels</span>
                </div>
                <div class="table-filters d-flex align-items-center gap-2 flex-wrap">
                    <!-- Search Input -->
                    <div class="search-input-wrap">
                        <TablerIcon name="search" size="16" class="search-icon" />
                        <input
                            v-model="searchQuery"
                            type="text"
                            placeholder="Search title, message..."
                            class="form-control form-control-sm search-input"
                            @input="handleSearch"
                        />
                    </div>

                    <!-- Channel Filter -->
                    <select
                        v-model="filters.channel"
                        class="form-select form-select-sm filter-select"
                        aria-label="Filter by channel"
                        @change="applyFilters"
                    >
                        <option value="">All Channels</option>
                        <option value="IN_APP">IN_APP</option>
                        <option value="PUSH">PUSH</option>
                        <option value="EMAIL">EMAIL</option>
                        <option value="SMS">SMS</option>
                        <option value="TELEGRAM">TELEGRAM</option>
                    </select>

                    <!-- Status Filter -->
                    <select
                        v-model="filters.status"
                        class="form-select form-select-sm filter-select"
                        aria-label="Filter by status"
                        @change="applyFilters"
                    >
                        <option value="">All Statuses</option>
                        <option value="UNREAD">UNREAD</option>
                        <option value="READ">READ</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="FAILED">FAILED</option>
                    </select>

                    <!-- Reset Filter Button -->
                    <button
                        v-if="filters.channel || filters.status || searchQuery"
                        type="button"
                        class="clear-filter-btn"
                        title="Reset filter"
                        @click="resetFilters"
                    >
                        Reset filter
                    </button>
                </div>
            </div>

            <div class="table-container">
                <BaseTable
                    caption="User notifications records"
                    :columns="columns"
                    :rows="displayedRows"
                    :loading="loading"
                    row-key="notification_id"
                >
                    <!-- Event & Title Slot -->
                    <template #cell-title="{ row, value }">
                        <div class="event-cell" @click="openDetailModal(row)">
                            <div class="event-title-wrap">
                                <span class="event-title">{{ value || row.event_type }}</span>
                                <span v-if="!isRowRead(row)" class="unread-bullet" title="Unread alert"></span>
                            </div>
                            <p v-if="row.body" class="event-body-preview">{{ row.body }}</p>
                        </div>
                    </template>

                    <!-- Channel Badge Slot -->
                    <template #cell-channel="{ value }">
                        <span class="channel-badge" :class="value ? value.toLowerCase().replace(/[^a-z0-9]/g, '_') : ''">
                            {{ value }}
                        </span>
                    </template>

                    <!-- Priority Badge Slot -->
                    <template #cell-priority="{ value }">
                        <span class="priority-badge" :class="value ? value.toLowerCase() : 'normal'">
                            {{ value }}
                        </span>
                    </template>

                    <!-- Status Badge Slot -->
                    <template #cell-status="{ row, value }">
                        <button
                            type="button"
                            class="status-badge-btn"
                            :title="isRowRead(row) ? 'Already read' : 'Click to mark as READ'"
                            @click.stop="toggleStatus(row)"
                        >
                            <span class="status-badge" :class="isRowRead(row) ? 'read' : (value ? value.toLowerCase() : 'delivered')">
                                <span class="status-dot"></span>
                                {{ isRowRead(row) ? 'READ' : (value || 'DELIVERED') }}
                            </span>
                        </button>
                    </template>

                    <!-- Timestamp / Created Slot -->
                    <template #cell-created_at="{ value }">
                        <span class="timestamp-text">
                            {{ value ? new Date(value).toLocaleString() : '—' }}
                        </span>
                    </template>

                    <!-- Action Column -->
                    <template #cell-actions="{ row }">
                        <div class="table-actions-wrap d-flex align-items-center gap-2">
                            <button
                                type="button"
                                class="btn-action-icon btn-action-view"
                                title="View Details"
                                @click.stop="openDetailModal(row)"
                            >
                                <IconEye :size="16" />
                            </button>
                            <button
                                v-if="!isRowRead(row)"
                                type="button"
                                class="btn-action-icon btn-action-read"
                                title="Mark as Read"
                                @click.stop="toggleStatus(row)"
                            >
                                <IconCheck :size="16" />
                            </button>
                            <button
                                type="button"
                                class="btn-action-icon btn-action-delete"
                                :class="{ 'btn-action-locked': isSecurityAlert(row) }"
                                :title="isSecurityAlert(row) ? 'Security alert locked' : 'Remove from inbox'"
                                @click.stop="openDeleteModal(row)"
                            >
                                <IconShieldLock v-if="isSecurityAlert(row)" :size="16" />
                                <IconTrash v-else :size="16" />
                            </button>
                        </div>
                    </template>
                </BaseTable>
            </div>

            <!-- Pagination Component -->
            <div class="mt-3">
                <BasePagination
                    :page="pagination.page"
                    :total-pages="pagination.total_pages"
                    :total="pagination.total"
                    :limit="pagination.limit"
                    :loading="loading"
                    @change-page="handlePageChange"
                    @change-limit="handleLimitChange"
                />
            </div>
        </div>

        <!-- Detail Modal -->
        <BaseModal
            v-model:is-open="showDetailModal"
            :title="activeNotification?.title || 'Notification Details'"
            :subtitle="activeNotification?.created_at ? new Date(activeNotification.created_at).toLocaleString() : ''"
            icon="bell"
            size="md"
        >
            <div v-if="activeNotification" class="notification-detail-box">
                <div class="detail-badge-strip d-flex align-items-center gap-2 mb-3 flex-wrap">
                    <span class="channel-badge" :class="activeNotification.channel ? activeNotification.channel.toLowerCase().replace(/[^a-z0-9]/g, '_') : ''">
                        {{ activeNotification.channel }}
                    </span>
                    <span class="priority-badge" :class="activeNotification.priority ? activeNotification.priority.toLowerCase() : 'normal'">
                        {{ activeNotification.priority || 'NORMAL' }}
                    </span>
                    <span class="status-badge" :class="isRowRead(activeNotification) ? 'read' : 'delivered'">
                        <span class="status-dot"></span>
                        {{ isRowRead(activeNotification) ? 'READ' : (activeNotification.status || 'DELIVERED') }}
                    </span>
                </div>

                <div class="detail-message-card p-3 rounded-3 mb-3">
                    <h6 class="detail-message-label text-muted small mb-2">Message Body</h6>
                    <p class="detail-message-text mb-0">{{ activeNotification.body || 'No message description available.' }}</p>
                </div>

                <div class="detail-meta-list small text-muted">
                    <div class="d-flex justify-content-between py-1 border-bottom">
                        <span>Event Type</span>
                        <strong class="text-dark">{{ activeNotification.event_type || 'SYSTEM_ALERT' }}</strong>
                    </div>
                    <div class="d-flex justify-content-between py-1 border-bottom">
                        <span>Received At</span>
                        <strong class="text-dark">{{ activeNotification.created_at ? new Date(activeNotification.created_at).toLocaleString() : '—' }}</strong>
                    </div>
                    <div v-if="activeNotification.read_at" class="d-flex justify-content-between py-1 border-bottom">
                        <span>Read At</span>
                        <strong class="text-emerald">{{ new Date(activeNotification.read_at).toLocaleString() }}</strong>
                    </div>
                </div>
            </div>

            <template #footer-right>
                <button type="button" class="btn-modal-outline" @click="showDetailModal = false">
                    Close
                </button>
                <button
                    v-if="!isRowRead(activeNotification)"
                    type="button"
                    class="btn-modal-primary"
                    @click="markActiveAsRead"
                >
                    <TablerIcon name="check" size="16" />
                    <span>Mark as Read</span>
                </button>
            </template>
        </BaseModal>

        <!-- Standard Enterprise Delete Confirm Modal -->
        <DeleteConfirmModal
            :is-open="showDeleteModal"
            :notification-title="notificationToDelete?.title"
            :is-security-alert="isSecurityAlert(notificationToDelete)"
            :deleting="deleting"
            @close="showDeleteModal = false"
            @confirm="handleDeleteNotification"
        />
    </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { IconEye, IconCheck, IconTrash, IconShieldLock } from '@tabler/icons-vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseStateCard from '@/components/common/BaseStateCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import TablerIcon from '@/components/common/TablerIcon.vue'
import { get, apiRequest } from '@/services/api'
import { useNotificationStore } from '@/stores/notification'
import { useToastStore } from '@/stores/toast'

const notifStore = useNotificationStore()
const toast = useToastStore()

const rows = ref([])
const loading = ref(false)
const markingAll = ref(false)
const searchQuery = ref('')
const showDetailModal = ref(false)
const activeNotification = ref(null)

const showDeleteModal = ref(false)
const notificationToDelete = ref(null)
const deleting = ref(false)

const summaryStats = ref({
    total: 0,
    delivered: 0,
    unread: 0,
    failed: 0,
})

const statCards = computed(() => [
    {
        label: 'Total Notifications',
        value: (summaryStats.value.total || 0).toLocaleString(),
        tone: 'purple',
        icon: 'arrow',
        change: '+100%',
        changeTone: 'positive',
        subtitle: 'All received alerts',
    },
    {
        label: 'Delivered / Read',
        value: (summaryStats.value.delivered || 0).toLocaleString(),
        tone: 'green',
        icon: 'check',
        change: summaryStats.value.total
            ? `+${((summaryStats.value.delivered / summaryStats.value.total) * 100).toFixed(1)}%`
            : '+100%',
        changeTone: 'positive',
        subtitle: 'Delivery rate',
    },
    {
        label: 'Unread Alerts',
        value: (summaryStats.value.unread || 0).toLocaleString(),
        tone: 'blue',
        icon: 'clock',
        change: summaryStats.value.unread > 0 ? `${summaryStats.value.unread} unread` : 'All read',
        changeTone: summaryStats.value.unread > 0 ? 'negative' : 'positive',
        subtitle: 'Requires attention',
    },
    {
        label: 'Failed Deliveries',
        value: (summaryStats.value.failed || 0).toLocaleString(),
        tone: 'red',
        icon: 'alert',
        change: summaryStats.value.total
            ? `-${((summaryStats.value.failed / summaryStats.value.total) * 100).toFixed(1)}%`
            : '-0.0%',
        changeTone: summaryStats.value.failed > 0 ? 'negative' : 'positive',
        subtitle: 'Delivery issues',
    },
])

const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
})

const filters = ref({
    channel: '',
    status: '',
})

const columns = [
    { key: 'title', label: 'Event & Title' },
    { key: 'channel', label: 'Channel' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Timestamp' },
    { key: 'actions', label: 'Actions' },
]

function isRowRead(item) {
    if (!item) return true
    return Boolean(item.read_at || item.status === 'READ' || item.is_read)
}

const filteredRows = computed(() => {
    let list = rows.value
    if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase().trim()
        list = list.filter((r) =>
            (r.title && r.title.toLowerCase().includes(q)) ||
            (r.body && r.body.toLowerCase().includes(q)) ||
            (r.event_type && r.event_type.toLowerCase().includes(q))
        )
    }
    if (filters.value.channel) {
        list = list.filter((r) => String(r.channel).toUpperCase() === filters.value.channel)
    }
    if (filters.value.status) {
        if (filters.value.status === 'UNREAD') {
            list = list.filter((r) => !isRowRead(r))
        } else if (filters.value.status === 'READ') {
            list = list.filter((r) => isRowRead(r))
        } else {
            list = list.filter((r) => String(r.status).toUpperCase() === filters.value.status)
        }
    }
    return list
})

const displayedRows = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.limit
    return filteredRows.value.slice(start, start + pagination.value.limit)
})

watch(
    [filteredRows, () => pagination.value.limit],
    () => {
        pagination.value.total = filteredRows.value.length
        pagination.value.total_pages = Math.max(1, Math.ceil(filteredRows.value.length / pagination.value.limit))
        if (pagination.value.page > pagination.value.total_pages) {
            pagination.value.page = 1
        }
    },
    { immediate: true }
)

function applyFilters() {
    pagination.value.page = 1
}

function handleSearch() {
    pagination.value.page = 1
}

function resetFilters() {
    filters.value.channel = ''
    filters.value.status = ''
    searchQuery.value = ''
    pagination.value.page = 1
}

async function load(pageNo = 1) {
    loading.value = true
    try {
        const res = await get(`/auth/user/notifications?page=1&limit=100`)
        const list = Array.isArray(res) ? res : (res.data || [])
        rows.value = list

        const total = list.length
        const unread = list.filter((item) => !isRowRead(item)).length
        const delivered = list.filter((item) => ['DELIVERED', 'READ', 'SUCCESS'].includes(String(item.status).toUpperCase()) || item.read_at).length
        const failed = list.filter((item) => String(item.status).toUpperCase() === 'FAILED').length

        summaryStats.value = { total, unread, delivered, failed }

        pagination.value.page = pageNo
    } catch (e) {
        toast.error(e.message || 'Failed to load notifications.')
    } finally {
        loading.value = false
    }
}

function handlePageChange(newPage) {
    pagination.value.page = newPage
}

function handleLimitChange(newLimit) {
    pagination.value.limit = newLimit
    pagination.value.page = 1
}

async function toggleStatus(row) {
    if (!row || !row.notification_id || isRowRead(row)) return

    try {
        await apiRequest(`/auth/user/notifications/${row.notification_id}/read`, { method: 'PATCH' })
        row.status = 'READ'
        row.read_at = new Date().toISOString()
        notifStore.decrementUnread()

        summaryStats.value.unread = Math.max(0, summaryStats.value.unread - 1)
        toast.success('Marked as read.')

        window.dispatchEvent(new CustomEvent('notification-status-changed', {
            detail: { id: row.notification_id, status: 'READ' }
        }))
    } catch (err) {
        toast.error(err.message || 'Failed to update status.')
    }
}

function openDetailModal(row) {
    activeNotification.value = row
    showDetailModal.value = true
}

async function markActiveAsRead() {
    if (!activeNotification.value) return
    await toggleStatus(activeNotification.value)
}

async function markAllAsRead() {
    const unreadList = rows.value.filter((r) => !isRowRead(r))
    if (!unreadList.length) {
        toast.info('All notifications are already read.')
        return
    }

    markingAll.value = true
    try {
        await Promise.all(
            unreadList.map((item) =>
                apiRequest(`/auth/user/notifications/${item.notification_id}/read`, { method: 'PATCH' }).catch(() => {})
            )
        )
        rows.value.forEach((r) => {
            r.status = 'READ'
            r.read_at = new Date().toISOString()
        })
        summaryStats.value.unread = 0
        notifStore.markAllRead()
        notifStore.fetchNotifications()
        toast.success('All notifications marked as read!')
    } catch (err) {
        toast.error(err.message || 'Failed to mark all as read.')
    } finally {
        markingAll.value = false
    }
}

function isSecurityAlert(item) {
    if (!item) return false
    const type = String(item.event_type || '').toUpperCase()
    const title = String(item.title || '').toUpperCase()
    return (
        type.includes('LOGIN') ||
        type.includes('OTP') ||
        type.includes('SECURITY') ||
        title.includes('LOGIN') ||
        title.includes('OTP') ||
        title.includes('SECURITY')
    )
}

function openDeleteModal(row) {
    notificationToDelete.value = row
    showDeleteModal.value = true
}

async function handleDeleteNotification() {
    if (!notificationToDelete.value?.notification_id) return
    const target = notificationToDelete.value

    if (isSecurityAlert(target)) {
        toast.warning('🔒 Security Record Locked: For account protection and fraud prevention, security and login alerts cannot be deleted.', 'Security Locked')
        showDeleteModal.value = false
        return
    }

    deleting.value = true
    try {
        await apiRequest(`/auth/user/notifications/${target.notification_id}`, { method: 'DELETE' }).catch(() => {})
        rows.value = rows.value.filter((r) => r.notification_id !== target.notification_id)
        
        toast.success('Notification removed from inbox.', 'Removed')
        
        summaryStats.value.total = Math.max(0, summaryStats.value.total - 1)
        if (!isRowRead(target)) {
            summaryStats.value.unread = Math.max(0, summaryStats.value.unread - 1)
            notifStore.decrementUnread(target.notification_id)
        }
        showDeleteModal.value = false
        notificationToDelete.value = null
    } catch (err) {
        if (err.message && err.message.includes('Security Record Locked')) {
            toast.warning(err.message, 'Security Locked')
        } else {
            rows.value = rows.value.filter((r) => r.notification_id !== target.notification_id)
            toast.success('Notification removed from inbox.', 'Removed')
        }
        showDeleteModal.value = false
        notificationToDelete.value = null
    } finally {
        deleting.value = false
    }
}

function handleLiveNotification(event) {
    const item = event.detail
    if (!item) return

    const newRow = {
        notification_id: item.notification_id || item.id,
        title: item.title || 'New Notification',
        body: item.body || item.message || '',
        event_type: item.event_type || 'SYSTEM_ALERT',
        channel: item.channel || 'IN_APP',
        priority: item.priority || 'NORMAL',
        status: item.status || 'DELIVERED',
        read_at: null,
        created_at: new Date().toISOString()
    }

    const idx = rows.value.findIndex((r) => r.notification_id === newRow.notification_id)
    if (idx !== -1) {
        rows.value[idx] = newRow
    } else {
        rows.value.unshift(newRow)
        summaryStats.value.total += 1
        summaryStats.value.unread += 1
    }
}

onMounted(() => {
    load(1)
    window.addEventListener('new-notification', handleLiveNotification)
    window.addEventListener('notification-status-changed', handleLiveNotification)
})

onUnmounted(() => {
    window.removeEventListener('new-notification', handleLiveNotification)
    window.removeEventListener('notification-status-changed', handleLiveNotification)
})
</script>

<style scoped>
.manage-notifications-view {
    color: #152033;
}

.page-title {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 4px;
}

.page-subtitle {
    font-size: 14px;
    color: #64748b;
    margin: 0;
}

.btn-primary-custom {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 18px;
    border-radius: 10px;
    background: #8751ff;
    border: 0;
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 4px 14px rgba(135, 81, 255, 0.25);
}

.btn-primary-custom:hover {
    background: #733be6;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(135, 81, 255, 0.35);
}

.btn-outline-primary-custom {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 16px;
    border-radius: 10px;
    background: #f5f3ff;
    border: 1px solid #ddd6fe;
    color: #8751ff;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-outline-primary-custom:hover {
    background: #ede9fe;
    color: #7c3aed;
}

.card-table {
    border: 1px solid #e3e5e9;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.table-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px;
}

.table-subtitle {
    font-size: 13.5px;
    color: #64748b;
}

.search-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 10px;
    color: #94a3b8;
    pointer-events: none;
}

.search-input {
    padding-left: 32px;
    border-radius: 8px;
    border-color: #cbd5e1;
    min-width: 200px;
    font-size: 13px;
}

.filter-select {
    width: auto;
    min-width: 130px;
    border-radius: 8px;
    border-color: #cbd5e1;
    font-size: 13px;
}

.clear-filter-btn {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #ddd6fe;
    background: #f5f3ff;
    color: #8751ff;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.clear-filter-btn:hover {
    background: #ede9fe;
}

/* Event Cell */
.event-cell {
    cursor: pointer;
}

.event-title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
}

.event-title {
    font-weight: 600;
    color: #0f172a;
    font-size: 14px;
}

.event-body-preview {
    font-size: 12.5px;
    color: #64748b;
    margin: 2px 0 0;
    max-width: 380px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.unread-bullet {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #8751ff;
    flex-shrink: 0;
    display: inline-block;
}

/* Badges */
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

.channel-badge.telegram { color: #0284c7; background: #e0f2fe; }
.channel-badge.sms { color: #7c3aed; background: #f3e8ff; }
.channel-badge.email { color: #4338ca; background: #e0e7ff; }
.channel-badge.push { color: #9333ea; background: #faf5ff; }
.channel-badge.in_app, .channel-badge.in-app { color: #0d9488; background: #ccfbf1; }

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

.priority-badge.normal { color: #475569; background: #f1f5f9; border: 1px solid #e2e8f0; }
.priority-badge.low { color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; }
.priority-badge.medium { color: #c2410c; background: #fff7ed; border: 1px solid #fed7aa; }
.priority-badge.high { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; }
.priority-badge.critical { color: #991b1b; background: #fee2e2; border: 1px solid #fca5a5; }

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

.status-badge.delivered, .status-badge.read, .status-badge.success {
    color: #059669;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
}

.status-badge.pending, .status-badge.queued {
    color: #2563eb;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
}

.status-badge.failed {
    color: #dc2626;
    background: #fef2f2;
    border: 1px solid #fecaca;
}

.status-badge-btn {
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: transform 0.15s ease;
}

.status-badge-btn:hover {
    transform: scale(1.04);
}

.timestamp-text {
    font-size: 13px;
    color: #64748b;
    white-space: nowrap;
}

.btn-action-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-action-view {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #2563eb;
}

.btn-action-view:hover {
    background: #dbeafe;
    border-color: #93c5fd;
    color: #1d4ed8;
    transform: scale(1.06);
}

.btn-action-read {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
    color: #059669;
}

.btn-action-read:hover {
    background: #d1fae5;
    border-color: #6ee7b7;
    color: #047857;
    transform: scale(1.06);
}

.btn-action-delete {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
}

.btn-action-delete:hover {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #b91c1c;
    transform: scale(1.06);
}

.btn-action-locked {
    background: #fffbeb;
    border: 1px solid #fef3c7;
    color: #d97706;
}

.btn-action-locked:hover {
    background: #fef3c7;
    border-color: #fde68a;
    color: #b45309;
    transform: scale(1.06);
}

.detail-message-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
}

.btn-modal-outline {
    padding: 9px 18px;
    border-radius: 10px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #475569;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
}

.btn-modal-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 18px;
    border-radius: 10px;
    border: 0;
    background: #8751ff;
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
}

.spin-icon {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Dark theme overrides */
[data-theme="dark"] .manage-notifications-view,
[data-theme="dark"] .page-title,
[data-theme="dark"] .table-title,
[data-theme="dark"] .event-title {
    color: #f1f5f9 !important;
}

[data-theme="dark"] .card-table {
    background: #111827 !important;
    border-color: #1f293d !important;
}

[data-theme="dark"] .search-input,
[data-theme="dark"] .filter-select {
    background: #1a2234 !important;
    border-color: #2e3d5b !important;
    color: #cbd5e1 !important;
}

[data-theme="dark"] .btn-action-icon {
    background: #1a2234 !important;
    border-color: #2e3d5b !important;
    color: #94a3b8 !important;
}

[data-theme="dark"] .detail-message-card {
    background: #1e293b !important;
    border-color: #334155 !important;
}
</style>
