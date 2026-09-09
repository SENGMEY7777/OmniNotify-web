<template>
    <section class="manage-notifications-view">
        <!-- Page Header -->
        <div class="header-section d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="page-title">Notifications</h1>
                <p class="page-subtitle">Queue notifications and update their status.</p>
            </div>
            <button class="btn btn-primary-custom" type="button" @click="showForm = true">
                <TablerIcon name="plus" size="18" />
                <span>New notification</span>
            </button>
        </div>

        <!-- 4 KPI Stat Cards using BaseStateCard -->
        <BaseStateCard :stats="statCards" class="mb-4" />


        <!-- New Notification Modal -->
        <BaseModal
            v-model:is-open="showForm"
            title="Notification Request"
            subtitle="Send your notification request based on your need."
            icon="send"
            size="lg"
        >
            <form id="notificationModalForm" @submit.prevent="create">
                <!-- Section 1: Recipient Contact Details -->
                <div class="form-section-title">Recipient Contact Details</div>

                <div class="mb-3">
                    <label class="form-label">Send Request to</label>
                    <div class="input-with-icon">
                        <span class="input-icon-left">
                            <TablerIcon name="user" size="18" />
                        </span>
                        <select
                            v-model="selectedUserKey"
                            class="form-select"
                            @change="onUserSelectChange"
                        >
                            <option value="">Select a recipient from user directory...</option>
                            <option
                                v-for="u in userList"
                                :key="u.user_id || u.id"
                                :value="u.user_id || u.id"
                            >
                                {{ u.full_name || u.name || 'User' }} ({{ u.email || u.user_id || 'ID' }})
                            </option>
                            <option value="custom">-- Custom Recipient / Manual ID --</option>
                        </select>
                    </div>
                </div>

                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Name</label>
                        <input
                            v-model="recipientName"
                            class="form-control"
                            placeholder="Recipient Full Name"
                        />
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email / User ID <span class="required-star">*</span></label>
                        <input
                            v-model="form.user_id"
                            class="form-control"
                            placeholder="e.g. user UUID or email"
                            required
                        />
                    </div>
                </div>

                <div class="modal-dashed-divider"></div>

                <!-- Section 2: Delivery & Channel Details -->
                <div class="form-section-title">Delivery & Channel Details</div>

                <div class="mb-3">
                    <label class="form-label">Notification Template <span class="required-star">*</span></label>
                    <div class="input-with-icon">
                        <span class="input-icon-left">
                            <TablerIcon name="template" size="18" />
                        </span>
                        <select
                            v-model="selectedTemplateKey"
                            class="form-select"
                            required
                            @change="onTemplateSelectChange"
                        >
                            <option value="">Choose an event template...</option>
                            <option
                                v-for="t in templateList"
                                :key="t.template_id || t.id"
                                :value="t.template_id || t.id"
                            >
                                {{ t.event_type }} - {{ t.title_template }}
                            </option>
                            <option value="custom">-- Custom Template ID (Manual UUID) --</option>
                        </select>
                    </div>
                </div>

                <div v-if="selectedTemplateKey === 'custom' || !templateList.length" class="mb-3">
                    <label class="form-label">Template UUID <span class="required-star">*</span></label>
                    <input
                        v-model="form.template_id"
                        class="form-control"
                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                        required
                    />
                </div>

                <div class="row g-3 mb-1">
                    <div class="col-md-4">
                        <label class="form-label">Event Type <span class="required-star">*</span></label>
                        <select v-model="form.event_type" class="form-select" required>
                            <option value="TRANSACTION_DEPOSIT">TRANSACTION_DEPOSIT</option>
                            <option value="TRANSACTION_TRANSFER">TRANSACTION_TRANSFER</option>
                            <option value="TRANSACTION_WITHDRAW">TRANSACTION_WITHDRAW</option>
                            <option value="PAYMENT_BILL">PAYMENT_BILL</option>
                            <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Channel <span class="required-star">*</span></label>
                        <select v-model="form.channel" class="form-select">
                            <option value="IN_APP">IN_APP</option>
                            <option value="PUSH">PUSH</option>
                            <option value="EMAIL">EMAIL</option>
                            <option value="SMS">SMS</option>
                            <option value="TELEGRAM">TELEGRAM</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Priority <span class="required-star">*</span></label>
                        <select v-model="form.priority" class="form-select">
                            <option value="LOW">LOW</option>
                            <option value="NORMAL">NORMAL</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                        </select>
                    </div>
                </div>

                <div class="modal-dashed-divider"></div>

                <!-- Section 3: Request Details -->
                <div class="form-section-title">Request Details</div>

                <div class="mb-3">
                    <label class="form-label">Title <span class="required-star">*</span></label>
                    <input
                        v-model="form.title"
                        class="form-control"
                        placeholder="Notification Title e.g. Payment Request"
                        required
                    />
                </div>

                <div class="mb-2">
                    <label class="form-label">Description / Message Body <span class="required-star">*</span></label>
                    <textarea
                        v-model="form.body"
                        class="form-control"
                        rows="3"
                        placeholder="Send the notification message today ya!"
                        required
                    ></textarea>
                </div>

            </form>

            <template #footer-right>
                <button type="button" class="btn-modal-outline" @click="showForm = false">
                    Cancel
                </button>
                <button
                    type="submit"
                    form="notificationModalForm"
                    class="btn-modal-primary"
                    :disabled="submitting"
                >
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                    <span>Send Request</span>
                </button>
            </template>
        </BaseModal>




        <!-- Notification Table Card -->
        <div class="card card-table p-4">
            <div class="table-header d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div class="desc">
                    <h4 class="table-title">Notification Records</h4>
                    <span class="table-subtitle">All queued, delivered and read events</span>
                </div>
                <div class="table-filters d-flex align-items-center gap-2 flex-wrap">
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
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="READ">READ</option>
                        <option value="PENDING">PENDING</option>
                        <option value="QUEUED">QUEUED</option>
                        <option value="FAILED">FAILED</option>
                    </select>

                    <!-- Reset Filter Button -->
                    <button
                        v-if="filters.channel || filters.status"
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
                    caption="All notification records"
                    :columns="columns"
                    :rows="rows"
                    :loading="loading"
                    row-key="notification_id"
                >
                    <!-- Event & Title Slot -->
                    <template #cell-title="{ row, value }">
                        <div class="event-cell d-flex align-items-center gap-2">
                            <span class="event-title">{{ value || row.event_type }}</span>
                            <span v-if="row.duplicate_count > 1" class="duplicate-count" :title="`${row.duplicate_count} identical notifications`">
                                ×{{ row.duplicate_count }}
                            </span>
                        </div>
                    </template>

                    <!-- Recipient Slot -->
                    <template #cell-full_name="{ value, row }">
                        <div class="recipient-cell">
                            <span class="recipient-name">{{ value || row.recipient || 'Vann Sengmey' }}</span>
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
                        <div class="dropdown d-inline-block">
                            <button
                                type="button"
                                class="status-badge-btn"
                                :class="{ 'is-updating': row._updating }"
                                title="Click to change status"
                                @click="toggleStatus(row)"
                            >
                                <span class="status-badge" :class="value ? value.toLowerCase() : 'pending'">
                                    <span class="status-dot"></span>
                                    {{ value }}
                                </span>
                            </button>
                        </div>
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
                                v-if="row.status === 'PENDING' || row.status === 'QUEUED'"
                                type="button"
                                class="btn-action-icon btn-action-cancel"
                                title="Cancel Pending Notification"
                                :disabled="cancellingId === (row.notification_id || row.id)"
                                @click.stop="handleCancelNotification(row)"
                            >
                                <IconBan :size="16" />
                            </button>
                            <button
                                type="button"
                                class="btn-action-icon btn-action-delete"
                                :class="{ 'btn-action-locked': isSecurityOrFinancialAlert(row) || !isNotificationRead(row) }"
                                :disabled="!isNotificationRead(row) || deleting"
                                :title="isSecurityOrFinancialAlert(row) ? 'Security & financial records are locked' : !isNotificationRead(row) ? 'Mark notification as read before deleting' : 'Archive Notification'"
                                @click.stop="openDeleteModal(row)"
                            >
                                <IconShieldLock v-if="isSecurityOrFinancialAlert(row) || !isNotificationRead(row)" :size="16" />
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
                <div class="core-banking-badges d-flex align-items-center gap-2 mb-3 flex-wrap">
                    <span class="channel-badge" :class="activeNotification.channel ? activeNotification.channel.toLowerCase().replace(/[^a-z0-9]/g, '_') : ''">
                        {{ activeNotification.channel }}
                    </span>
                    <span class="priority-badge" :class="activeNotification.priority ? activeNotification.priority.toLowerCase() : 'normal'">
                        <span class="badge-dot"></span>{{ activeNotification.priority || 'NORMAL' }}
                    </span>
                    <span class="status-badge" :class="activeNotification.status ? activeNotification.status.toLowerCase() : 'pending'">
                        <span class="status-dot"></span>
                        {{ activeNotification.status || 'PENDING' }}
                    </span>
                </div>

                <div class="core-banking-details">
                    <div class="core-detail-row">
                        <span>Account holder</span>
                        <strong>{{ activeNotification.full_name || activeNotification.recipient || 'Unknown' }}</strong>
                    </div>
                    <div class="core-detail-row">
                        <span>Email</span>
                        <strong>{{ activeNotification.email || 'Unknown' }}</strong>
                    </div>
                    <div class="core-detail-row">
                        <span>Device</span>
                        <strong>{{ activeNotification.device || activeNotification.metadata?.device || 'Unknown' }}</strong>
                    </div>
                    <div class="core-detail-row">
                        <span>IP address</span>
                        <strong>{{ activeNotification.ip_address || activeNotification.metadata?.ip_address || 'unknown' }}</strong>
                    </div>
                    <div class="core-detail-row">
                        <span>Event</span>
                        <strong>{{ activeNotification.event_type || 'SYSTEM_ALERT' }}</strong>
                    </div>
                </div>

                <div v-if="isSecurityOrFinancialAlert(activeNotification)" class="security-review-note">
                    <TablerIcon name="shield-lock" size="20" />
                    <span>If you do not recognize this activity, secure the account and review it immediately.</span>
                </div>

                <div class="alert-reference">Alert ID · {{ activeNotification.notification_id || 'Unknown' }}</div>
            </div>

            <template #footer-right>
                <button type="button" class="btn-modal-outline" @click="showDetailModal = false">
                    Close
                </button>
            </template>
        </BaseModal>

        <!-- Standard Enterprise Delete Confirm Modal -->
        <DeleteConfirmModal
            :is-open="showDeleteModal"
            :notification-title="notificationToDelete?.title"
            :is-security-alert="isSecurityOrFinancialAlert(notificationToDelete)"
            :is-admin="true"
            :deleting="deleting"
            @close="showDeleteModal = false"
            @confirm="handleDeleteNotification"
        />
    </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { IconEye, IconTrash, IconShieldLock, IconBan } from '@tabler/icons-vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseStateCard from '@/components/common/BaseStateCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import DeleteConfirmModal from '@/components/common/DeleteConfirmModal.vue'
import TablerIcon from '@/components/common/TablerIcon.vue'
import { get, post, put, del } from '@/services/api'
import { useNotificationStore } from '@/stores/notification'
import { useToastStore } from '@/stores/toast'

const notifStore = useNotificationStore()
const toast = useToastStore()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const showForm = ref(false)

const showDetailModal = ref(false)
const activeNotification = ref(null)
const showDeleteModal = ref(false)
const notificationToDelete = ref(null)
const deleting = ref(false)

const summaryStats = ref({
    total: 0,
    delivered: 0,
    pending: 0,
    failed: 0,
})

const statCards = computed(() => [
    {
        label: 'Total Notifications',
        value: (summaryStats.value.total || 0).toLocaleString(),
        tone: 'purple',
        icon: 'arrow',
        change: '+11.2%',
        changeTone: 'positive',
        subtitle: 'Since last month',
    },
    {
        label: 'Delivered',
        value: (summaryStats.value.delivered || 0).toLocaleString(),
        tone: 'green',
        icon: 'check',
        change: summaryStats.value.total
            ? `+${((summaryStats.value.delivered / summaryStats.value.total) * 100).toFixed(1)}%`
            : '+94.1%',
        changeTone: 'positive',
        subtitle: 'Delivery rate',
    },
    {
        label: 'Pending / Queued',
        value: (summaryStats.value.pending || 0).toLocaleString(),
        tone: 'blue',
        icon: 'users',
        change: summaryStats.value.pending > 0 ? 'In flight' : '0 queued',
        changeTone: 'positive',
        subtitle: 'Active queue',
    },
    {
        label: 'Failed Deliveries',
        value: (summaryStats.value.failed || 0).toLocaleString(),
        tone: 'red',
        icon: 'alert',
        change: summaryStats.value.total
            ? `-${((summaryStats.value.failed / summaryStats.value.total) * 100).toFixed(1)}%`
            : '-0.0%',
        changeTone: 'negative',
        subtitle: 'Failure rate',
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

function applyFilters() {
    load(1, pagination.value.limit)
}

function resetFilters() {
    filters.value.channel = ''
    filters.value.status = ''
    load(1, pagination.value.limit)
}

const form = ref({
    template_id: '',
    user_id: '',
    event_type: 'TRANSACTION_DEPOSIT',
    title: '',
    body: '',
    channel: 'IN_APP',
    priority: 'NORMAL',
})

const userList = ref([])
const templateList = ref([])
const selectedUserKey = ref('')
const recipientName = ref('')
const selectedTemplateKey = ref('')

async function fetchDropdownData() {
    try {
        const [usersRes, templatesRes] = await Promise.allSettled([
            get('/auth/admin/getAll'),
            get('/admin/template/getAll')
        ])
        if (usersRes.status === 'fulfilled' && usersRes.value) {
            const rawUsers = usersRes.value.users || usersRes.value.data || usersRes.value || []
            userList.value = Array.isArray(rawUsers)
                ? rawUsers.filter(u => (u.role || '').toLowerCase() !== 'admin' && (u.role || '').toLowerCase() !== 'superadmin')
                : []
        }
        if (templatesRes.status === 'fulfilled' && templatesRes.value) {
            const rawTemplates = templatesRes.value.data || templatesRes.value.templates || templatesRes.value || []
            templateList.value = Array.isArray(rawTemplates) ? rawTemplates : []
        }
    } catch (_) {}
}

watch(showForm, (isOpen) => {
    if (isOpen) {
        fetchDropdownData()
    }
})

function onUserSelectChange() {
    if (!selectedUserKey.value || selectedUserKey.value === 'custom') {
        if (selectedUserKey.value === 'custom') {
            form.value.user_id = ''
            recipientName.value = ''
        }
        return
    }
    const found = userList.value.find(u => (u.user_id || u.id) === selectedUserKey.value)
    if (found) {
        form.value.user_id = found.user_id || found.id || ''
        recipientName.value = found.full_name || found.name || ''
    }
}

function normalizeEventType(type) {
    if (!type) return 'TRANSACTION_DEPOSIT'
    const clean = String(type).trim().toUpperCase()
    if (clean === 'TRANFER' || clean === 'TRANSFER' || clean === 'TRANSACTION_TRANSFER') return 'TRANSACTION_TRANSFER'
    if (clean === 'DEPOSIT' || clean === 'TRANSACTION_DEPOSIT') return 'TRANSACTION_DEPOSIT'
    if (clean === 'WITHDRAW' || clean === 'WITHDRAWAL' || clean === 'TRANSACTION_WITHDRAW') return 'TRANSACTION_WITHDRAW'
    if (clean === 'BILL' || clean === 'PAYMENT_BILL') return 'PAYMENT_BILL'
    if (clean === 'FAILED' || clean === 'PAYMENT_FAILED') return 'PAYMENT_FAILED'
    return clean
}

function onTemplateSelectChange() {
    if (!selectedTemplateKey.value || selectedTemplateKey.value === 'custom') {
        if (selectedTemplateKey.value === 'custom') {
            form.value.template_id = ''
        }
        return
    }
    const found = templateList.value.find(t => String(t.template_id || t.id) === String(selectedTemplateKey.value))
    if (found) {
        form.value.template_id = found.template_id || found.id || ''
        form.value.event_type = normalizeEventType(found.event_type)
        if (found.default_channel) form.value.channel = found.default_channel
        if (found.title_template) form.value.title = found.title_template
        if (found.body_template) form.value.body = found.body_template
    }
}

function resetForm() {
    form.value = {
        template_id: '',
        user_id: '',
        event_type: 'TRANSACTION_DEPOSIT',
        title: '',
        body: '',
        channel: 'IN_APP',
        priority: 'NORMAL',
    }
    selectedUserKey.value = ''
    recipientName.value = ''
    selectedTemplateKey.value = ''
}

function saveDraft() {
    try {
        localStorage.setItem('omni_notification_draft', JSON.stringify({
            ...form.value,
            recipientName: recipientName.value,
            selectedUserKey: selectedUserKey.value,
            selectedTemplateKey: selectedTemplateKey.value,
        }))
        toast.success('Notification draft saved successfully!')
        showForm.value = false
    } catch (_) {}
}

const columns = [
    { key: 'title', label: 'Event & Title' },
    { key: 'full_name', label: 'Recipient' },
    { key: 'channel', label: 'Channel' },
    { key: 'priority', label: 'Priority' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Timestamp' },
    { key: 'actions', label: 'Actions' },
]

// The same event can be created more than once by retries or repeated delivery
// requests. Keep the newest copy visible and collapse exact duplicates into one
// admin row so the list represents unique notification content.
function notificationGroupKey(item) {
    return [
        item.user_id || item.full_name || item.recipient || '',
        item.event_type || '',
        item.title || '',
        item.body || '',
        item.channel || '',
        item.priority || '',
    ].map(value => String(value).trim().toLowerCase()).join('|')
}

function collapseDuplicateNotifications(list) {
    const groups = new Map()

    for (const item of list) {
        const key = notificationGroupKey(item)
        const current = groups.get(key)
        if (current) {
            current.duplicate_count += 1
        } else {
            groups.set(key, { ...item, duplicate_count: 1 })
        }
    }

    return Array.from(groups.values())
}

const cancellingId = ref('')

function isSecurityOrFinancialAlert(item) {
    if (!item) return false
    const type = String(item.event_type || '').toUpperCase()
    const title = String(item.title || '').toUpperCase()
    return (
        type.includes('TRANSACTION') ||
        type.includes('TRANSFER') ||
        type.includes('DEPOSIT') ||
        type.includes('WITHDRAW') ||
        type.includes('OTP') ||
        type.includes('LOGIN') ||
        type.includes('SECURITY') ||
        title.includes('TRANSACTION') ||
        title.includes('OTP') ||
        title.includes('LOGIN') ||
        title.includes('SECURITY')
    )
}

function isNotificationRead(item) {
    return Boolean(item?.read_at || String(item?.status || '').toUpperCase() === 'READ')
}

function openDetailModal(row) {
    activeNotification.value = row
    showDetailModal.value = true
}

function openDeleteModal(row) {
    notificationToDelete.value = row
    showDeleteModal.value = true
}

async function handleCancelNotification(row) {
    if (!row) return
    const id = row.notification_id || row.id
    cancellingId.value = id
    try {
        await post(`/admin/notification/${id}/cancel`, {})
        row.status = 'CANCELLED'
        toast.success('Pending notification campaign cancelled.', 'Cancelled')
        fetchStats()
    } catch (err) {
        toast.error(err.message || 'Failed to cancel notification.')
    } finally {
        cancellingId.value = ''
    }
}

async function handleDeleteNotification() {
    if (!notificationToDelete.value) return
    const target = notificationToDelete.value
    const id = target.notification_id || target.id

    if (isSecurityOrFinancialAlert(target)) {
        toast.warning('🔒 Security Record Locked: For banking fraud prevention and audit compliance, financial transactions and security alerts cannot be deleted.', 'Security Record Locked')
        showDeleteModal.value = false
        return
    }

    if (!isNotificationRead(target)) {
        toast.warning('Unread notifications cannot be deleted. Mark the notification as read first.', 'Unread Notification Locked')
        showDeleteModal.value = false
        return
    }

    deleting.value = true
    try {
        await del(`/admin/notification/${id}`)
        rows.value = rows.value.filter(r => (r.notification_id || r.id) !== id)
        toast.success('Notification archived from active records.', 'Archived')
        summaryStats.value.total = Math.max(0, summaryStats.value.total - 1)
        showDeleteModal.value = false
        notificationToDelete.value = null
        fetchStats()
    } catch (err) {
        if (err.message && err.message.includes('Security Record Locked')) {
            toast.warning(err.message, 'Security Record Locked')
        } else {
            toast.error(err.message || 'Failed to archive notification.')
        }
        showDeleteModal.value = false
        notificationToDelete.value = null
    } finally {
        deleting.value = false
    }
}

async function fetchStats() {
    try {
        const dashboard = await get('/admin/notification/dashboard?days=30')
        const summary = dashboard.summary || dashboard || {}
        summaryStats.value = {
            total: Number(summary.total || 0),
            delivered: Number(summary.delivered || 0),
            pending: Number(summary.pending || 0),
            failed: Number(summary.failed || 0),
        }
    } catch (_) {}
}

async function load(next = 1, currentLimit = pagination.value.limit) {
    loading.value = true
    try {
        let url = `/admin/notification?page=${next}&limit=${currentLimit}`
        if (filters.value.channel) {
            url += `&channel=${filters.value.channel}`
        }
        if (filters.value.status) {
            url += `&status=${filters.value.status}`
        }
        const result = await get(url)
        // The API returns newest records first, so the first item in each
        // duplicate group is the copy used for status, timestamp, and actions.
        rows.value = collapseDuplicateNotifications(result.data || [])
        if (result.pagination) {
            pagination.value = result.pagination
        } else {
            pagination.value.page = next
            pagination.value.total = rows.value.length
            pagination.value.total_pages = Math.ceil(rows.value.length / currentLimit) || 1
        }
    } catch (e) {
        toast.error(e.message || 'Failed to load notifications.')
    } finally {
        loading.value = false
    }
}

function handlePageChange(newPage) {
    load(newPage, pagination.value.limit)
}

function handleLimitChange(newLimit) {
    pagination.value.limit = newLimit
    load(1, newLimit)
}

async function create() {
    let finalTemplateId = form.value.template_id ? form.value.template_id.trim() : ''
    if (!finalTemplateId && selectedTemplateKey.value && selectedTemplateKey.value !== 'custom') {
        finalTemplateId = selectedTemplateKey.value
    }
    const matchedTemplate = templateList.value.find(t =>
        String(t.template_id || t.id) === String(finalTemplateId || selectedTemplateKey.value)
    )
    if (matchedTemplate) {
        finalTemplateId = matchedTemplate.template_id || matchedTemplate.id
    }

    if (!finalTemplateId) {
        toast.error('Please select a template or enter a Template UUID.')
        return
    }
    if (!form.value.user_id || !form.value.user_id.trim()) {
        toast.error('Please select a recipient or enter an Email / User ID.')
        return
    }

    submitting.value = true
    try {
        let finalUserId = form.value.user_id.trim()
        const matchedUser = userList.value.find(u =>
            (u.email && u.email.toLowerCase() === finalUserId.toLowerCase()) ||
            (u.user_id && String(u.user_id) === String(finalUserId)) ||
            (u.id && String(u.id) === String(finalUserId))
        )
        if (matchedUser) {
            finalUserId = matchedUser.user_id || matchedUser.id
        }

        const payload = {
            template_id: finalTemplateId,
            user_id: finalUserId,
            event_type: normalizeEventType(form.value.event_type),
            title: form.value.title.trim(),
            body: form.value.body.trim(),
            channel: form.value.channel,
            priority: form.value.priority,
        }

        const result = await post('/admin/notification', payload)

        // Grab the notification data (api.js returns payload.data directly)
        const notifData = (result && result.notification_id) ? result : (result?.data || null)
        const notifTitle = notifData?.title || payload.title || '🔔 New Notification'
        const notifBody = notifData?.body || payload.body || ''

        // ✅ Show popup toast directly — most reliable method
        toast.addToast({
            type: 'info',
            title: notifTitle,
            message: notifBody,
            duration: 7000,
            sound: true,
        })

        showForm.value = false
        resetForm()
        await Promise.all([load(1), fetchStats()])

        // Also dispatch DOM event to update badge & dropdown list
        if (notifData && notifData.notification_id) {
            notifStore.incrementUnread(notifData)
            window.dispatchEvent(new CustomEvent('new-notification', {
                detail: { ...notifData, _toastShown: true }
            }))
        }
    } catch (e) {
        toast.error(e.message || 'Failed to send notification.')
    } finally {
        submitting.value = false
    }
}


async function toggleStatus(row) {
    if (!row || !row.notification_id || row._updating) return
    const newStatus = row.status === 'READ' ? 'DELIVERED' : 'READ'
    const oldStatus = row.status
    row.status = newStatus
    row._updating = true

    if (newStatus === 'READ') {
        notifStore.decrementUnread(row.notification_id)
    } else {
        notifStore.totalUnread++
    }

    try {
        await put(`/admin/notification/${row.notification_id}`, { status: newStatus })
        window.dispatchEvent(new CustomEvent('notification-status-changed', {
            detail: { id: row.notification_id, status: newStatus }
        }))
        toast.success(`Notification status updated to ${newStatus}`)
        await fetchStats()
    } catch (e) {
        row.status = oldStatus
        toast.error(e.message || 'Failed to update notification status.')
    } finally {
        row._updating = false
    }
}

function handleLiveNotification(event) {
    const item = event.detail
    if (!item) return

    const newRow = {
        notification_id: item.notification_id || item.id,
        title: item.title || 'New Alert',
        event_type: item.event_type || 'SYSTEM_ALERT',
        channel: item.channel || 'IN_APP',
        priority: item.priority || 'HIGH',
        status: item.status || 'DELIVERED',
        full_name: item.full_name || 'Vann Sengmey',
        created_at: new Date().toISOString(),
    }

    const duplicateIdx = rows.value.findIndex(r => notificationGroupKey(r) === notificationGroupKey(newRow))
    const existingIdx = rows.value.findIndex(r => r.notification_id === newRow.notification_id)
    if (existingIdx !== -1) {
        rows.value[existingIdx] = newRow
    } else if (duplicateIdx !== -1) {
        rows.value[duplicateIdx] = { ...newRow, duplicate_count: rows.value[duplicateIdx].duplicate_count + 1 }
    } else {
        rows.value.unshift({ ...newRow, duplicate_count: 1 })
    }
    summaryStats.value.total++
    if (newRow.status === 'DELIVERED') summaryStats.value.delivered++
    else summaryStats.value.pending++
}

onMounted(() => {
    load()
    fetchStats()
    fetchDropdownData()
    window.addEventListener('new-notification', handleLiveNotification)
})


onUnmounted(() => {
    window.removeEventListener('new-notification', handleLiveNotification)
})
</script>

<style scoped>
.manage-notifications-view {
    color: #152033;
    font-family: "Geist", sans-serif;
}

.page-title {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.1;
    margin: 0;
}

.page-subtitle {
    margin-top: 6px;
    color: #697489;
    font-size: 15px;
}

.duplicate-count {
    display: inline-flex;
    align-items: center;
    min-height: 20px;
    padding: 1px 7px;
    border-radius: 999px;
    color: #6d43d8;
    background: #eee8ff;
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
}

.btn-primary-custom {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    height: 50px;
    padding: 0 24px;
    border: 0;
    border-radius: 12px;
    color: #fff;
    background: #2A1E62;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: background-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-primary-custom:hover {
    background: #352778;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(42, 30, 98, 0.35);
}



.btn-secondary-custom {
    padding: 9px 18px;
    border: 1px solid #dfe2e8;
    border-radius: 10px;
    background: #fff;
    color: #475569;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
}

.btn-secondary-custom:hover {
    background: #f8fafc;
}

.btn-clear-filter {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 10px;
}

/* Stat Cards */
.stat-card {
    min-width: 0;
    height: 145px;
    padding: 20px;
    border: 1px solid #e3e5e9;
    border-radius: 14px;
    background: #fff;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: all 0.2s ease;
    cursor: pointer;
}

.stat-card:hover {
    border-color: #996dff;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(135, 81, 255, 0.1);
}

.stat-card.is-active-filter {
    border-color: #8751ff;
    box-shadow: 0 0 0 2px #8751ff;
    background: #fbf9ff;
}

.active-pill-badge {
    font-size: 11px;
    font-weight: 700;
    color: #8751ff;
    background: #ede9fe;
    padding: 3px 8px;
    border-radius: 6px;
}

.stat-icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    border-radius: 10px;
    font-size: 20px;
    font-weight: 700;
}

.stat-label {
    margin: 8px 0 0;
    color: #697489;
    font-size: 13.5px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.stat-value-group {
    display: flex;
    align-items: baseline;
    gap: 6px;
    margin-top: 2px;
}

.stat-value {
    color: #152033;
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
}

.stat-change {
    font-size: 13px;
    font-weight: 700;
}

.positive {
    color: #159570;
}

.negative {
    color: #e34c5b;
}

.purple {
    color: #8751ff;
    background: #f2efff;
}

.green {
    color: #159570;
    background: #e8faf3;
}

.blue {
    color: #3d79e8;
    background: #edf4ff;
}

.red {
    color: #e34c5b;
    background: #fff0f1;
}

.custom-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 10px;
    font-size: 14px;
}

.card-table,
.form-card {
    border-radius: 14px;
    border: 1px solid #e3e5e9;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.form-title {
    font-size: 18px;
    font-weight: 700;
}

.form-label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 4px;
}

.table-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
}

.table-subtitle {
    font-size: 13.5px;
    color: #697489;
}

.filter-indicator {
    font-size: 13px;
    color: #8751ff;
    background: #ede9fe;
    padding: 5px 12px;
    border-radius: 8px;
    font-weight: 600;
}

.table-search-input {
    min-width: 170px;
    border-radius: 9px;
    border: 1px solid #e2e8f0;
    font-size: 13px;
    padding: 6px 12px;
}

.filter-select {
    width: auto;
    border-radius: 9px;
    border: 1px solid #e2e8f0;
    font-size: 13px;
    padding: 6px 28px 6px 10px;
    font-weight: 500;
    color: #334155;
    background-color: #f8fafc;
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
    border-color: #c4b5fd;
}

/* Event Cell */
.event-cell {
    font-weight: 600;
    color: #152033;
    font-size: 14.5px;
    white-space: nowrap;
}

.recipient-cell {
    font-weight: 500;
    color: #334155;
    font-size: 14px;
    white-space: nowrap;
}

/* Channel Badge */
.channel-badge {
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    padding: 2px 9px;
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

/* Priority Badge */
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

/* Status Badge & Button */
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

.status-badge.cancelled {
    color: #64748b;
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
}

.status-badge.retrying {
    color: #d97706;
    background: #fffbeb;
    border: 1px solid #fde68a;
}

.timestamp-text {
    font-size: 13.5px;
    color: #697489;
    white-space: nowrap;
}

/* Action Buttons */
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

.btn-action-cancel {
    background: #fffbeb;
    border: 1px solid #fde68a;
    color: #d97706;
}

.btn-action-cancel:hover {
    background: #fef3c7;
    border-color: #fcd34d;
    color: #b45309;
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

.btn-action-delete.btn-action-locked {
    background: #fffbeb;
    border-color: #fde68a;
    color: #d97706;
}

.btn-action-delete.btn-action-locked:hover {
    background: #fef3c7;
    border-color: #fcd34d;
    color: #b45309;
}

/* Delete Modal Styles */
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
    max-width: 400px;
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

.delete-badge {
    background: #fff1f2;
    color: #f43f5e;
}

[data-theme="dark"] .delete-badge {
    background: rgba(244, 63, 94, 0.2) !important;
    color: #fb7185 !important;
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
    margin: 0 0 22px;
}

[data-theme="dark"] .modal-desc {
    color: #94a3b8 !important;
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

.btn-confirm-delete {
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
    background: #f43f5e;
    border: 0;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
}

.btn-confirm-delete:hover {
    background: #e11d48;
}

.btn-confirm-delete:disabled {
    opacity: 0.65;
    cursor: not-allowed;
}

.detail-message-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
}

.core-banking-badges .channel-badge,
.core-banking-badges .priority-badge,
.core-banking-badges .status-badge {
    min-height: 38px;
    padding: 7px 14px;
    border-radius: 9px;
    font-size: 14px;
    font-weight: 700;
}

.core-banking-badges .priority-badge {
    color: #b42318;
    background: #fff1f0;
    border: 1px solid #f5b7b1;
}

.core-banking-badges .badge-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 7px;
    border-radius: 50%;
    background: currentColor;
}

.core-banking-details {
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: #fff;
}

.core-detail-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    padding: 15px 20px;
    border-bottom: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 14px;
}

.core-detail-row:last-child { border-bottom: 0; }
.core-detail-row strong { color: #172033; font-weight: 400; text-align: right; }

.security-review-note {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-top: 18px;
    padding: 17px 20px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    color: #334155;
    background: #f8fafc;
    font-size: 14px;
    line-height: 1.55;
}

.security-review-note :deep(svg) { color: #b42318; flex: 0 0 auto; }

.alert-reference {
    margin-top: 18px;
    color: #64748b;
    font-size: 13px;
    letter-spacing: .01em;
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

/* Transitions */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.expand-enter-active,
.expand-leave-active {
    transition: all 0.25s ease-out;
}

.expand-enter-from,
.expand-leave-to {
    opacity: 0;
    transform: translateY(-8px);
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
