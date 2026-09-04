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

        <!-- Alert Message -->
        <transition name="fade">
            <div v-if="message" class="alert custom-alert mb-4" :class="ok ? 'alert-success' : 'alert-danger'" role="alert">
                <TablerIcon :name="ok ? 'check' : 'alert-circle'" size="18" />
                <span>{{ message }}</span>
                <button type="button" class="btn-close ms-auto" aria-label="Close" @click="message = ''"></button>
            </div>
        </transition>

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

                <div class="form-toggle-wrap mb-2">
                    <label class="form-toggle-switch">
                        <input type="checkbox" v-model="useTemplate" />
                        <span class="form-toggle-slider"></span>
                    </label>
                    <span class="form-toggle-label" @click="useTemplate = !useTemplate">
                        Use notification template
                    </span>
                </div>

                <div class="modal-dashed-divider"></div>

                <!-- Section 2: Delivery & Channel Details -->
                <div class="form-section-title">Delivery & Channel Details</div>

                <div v-if="useTemplate" class="mb-3">
                    <label class="form-label">Select Template</label>
                    <div class="input-with-icon">
                        <span class="input-icon-left">
                            <TablerIcon name="template" size="18" />
                        </span>
                        <select
                            v-model="selectedTemplateKey"
                            class="form-select"
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
                        </select>
                    </div>
                </div>

                <div class="row g-3 mb-1">
                    <div class="col-md-4">
                        <label class="form-label">Event Type <span class="required-star">*</span></label>
                        <div class="input-with-icon">
                            <span class="input-icon-left">
                                <TablerIcon name="tag" size="16" />
                            </span>
                            <input
                                v-model="form.event_type"
                                class="form-control"
                                placeholder="e.g. SYSTEM_ALERT"
                                required
                            />
                        </div>
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
    </section>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseStateCard from '@/components/common/BaseStateCard.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import TablerIcon from '@/components/common/TablerIcon.vue'
import { get, post, put } from '@/services/api'
import { useNotificationStore } from '@/stores/notification'

const notifStore = useNotificationStore()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const showForm = ref(false)
const message = ref('')
const ok = ref(false)

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
    event_type: 'SYSTEM_ALERT',
    title: '',
    body: '',
    channel: 'IN_APP',
    priority: 'NORMAL',
})

const userList = ref([])
const templateList = ref([])
const selectedUserKey = ref('')
const recipientName = ref('')
const useTemplate = ref(false)
const selectedTemplateKey = ref('')

async function fetchDropdownData() {
    try {
        const [usersRes, templatesRes] = await Promise.allSettled([
            get('/auth/admin/getAll'),
            get('/admin/template')
        ])
        if (usersRes.status === 'fulfilled') {
            const rawUsers = usersRes.value.users || usersRes.value.data || usersRes.value || []
            userList.value = Array.isArray(rawUsers) ? rawUsers : []
        }
        if (templatesRes.status === 'fulfilled') {
            const rawTemplates = templatesRes.value.data || templatesRes.value || []
            templateList.value = Array.isArray(rawTemplates) ? rawTemplates : []
        }
    } catch (_) {}
}

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

function onTemplateSelectChange() {
    if (!selectedTemplateKey.value) return
    const found = templateList.value.find(t => (t.template_id || t.id) === selectedTemplateKey.value)
    if (found) {
        form.value.template_id = found.template_id || found.id || ''
        if (found.event_type) form.value.event_type = found.event_type
        if (found.default_channel) form.value.channel = found.default_channel
        if (found.title_template) form.value.title = found.title_template
        if (found.body_template) form.value.body = found.body_template
    }
}

function resetForm() {
    form.value = {
        template_id: '',
        user_id: '',
        event_type: 'SYSTEM_ALERT',
        title: '',
        body: '',
        channel: 'IN_APP',
        priority: 'NORMAL',
    }
    selectedUserKey.value = ''
    recipientName.value = ''
    selectedTemplateKey.value = ''
    useTemplate.value = false
}

function saveDraft() {
    try {
        localStorage.setItem('omni_notification_draft', JSON.stringify({
            ...form.value,
            recipientName: recipientName.value,
            selectedUserKey: selectedUserKey.value,
        }))
        message.value = 'Notification draft saved successfully!'
        ok.value = true
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
]

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
        rows.value = result.data || []
        if (result.pagination) {
            pagination.value = result.pagination
        } else {
            pagination.value.page = next
            pagination.value.total = rows.value.length
            pagination.value.total_pages = Math.ceil(rows.value.length / currentLimit) || 1
        }
    } catch (e) {
        message.value = e.message
        ok.value = false
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
    submitting.value = true
    message.value = ''
    try {
        await post('/admin/notification', form.value)
        message.value = 'Notification queued successfully!'
        ok.value = true
        showForm.value = false
        resetForm()
        await Promise.all([load(1), fetchStats()])
    } catch (e) {
        message.value = e.message
        ok.value = false
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
        await fetchStats()
    } catch (e) {
        row.status = oldStatus
        message.value = e.message
        ok.value = false
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

    const existingIdx = rows.value.findIndex(r => r.notification_id === newRow.notification_id)
    if (existingIdx !== -1) {
        rows.value[existingIdx] = newRow
    } else {
        rows.value.unshift(newRow)
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
</style>
