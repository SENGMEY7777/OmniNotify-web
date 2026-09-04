<template>
    <section class="delivery-logs-view">
        <!-- Page Header -->
        <div class="header-section d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="page-title">Delivery Logs</h1>
                <p class="page-subtitle">Track provider attempts, delivery logs, and error responses.</p>
            </div>
        </div>

        <!-- Alert Message -->
        <transition name="fade">
            <div v-if="error" class="alert alert-danger custom-alert mb-4" role="alert">
                <TablerIcon name="alert-circle" size="18" />
                <span>{{ error }}</span>
                <button type="button" class="btn-close ms-auto" aria-label="Close" @click="error = ''"></button>
            </div>
        </transition>

        <!-- Logs Table Card -->
        <div class="card card-table p-4">
            <div class="table-header d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div class="desc">
                    <h4 class="table-title">Provider Delivery Logs</h4>
                    <span class="table-subtitle">All delivery execution records</span>
                </div>
                <div class="table-filters d-flex align-items-center gap-2 flex-wrap">
                    <!-- Status Filter -->
                    <select
                        v-model="filters.status"
                        class="form-select form-select-sm filter-select"
                        aria-label="Filter by status"
                        @change="load(1)"
                    >
                        <option value="">All Statuses</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="FAILED">FAILED</option>
                        <option value="QUEUED">QUEUED</option>
                        <option value="PENDING">PENDING</option>
                    </select>

                    <!-- Reset Filter Button -->
                    <button
                        v-if="filters.status"
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
                    caption="All delivery log records"
                    :columns="columns"
                    :rows="rows"
                    :loading="loading"
                    row-key="log_id"
                >
                    <!-- Notification Title -->
                    <template #cell-notification_title="{ value }">
                        <div class="event-cell">
                            <span>{{ value || 'System Notification' }}</span>
                        </div>
                    </template>

                    <!-- Recipient -->
                    <template #cell-sent_to_user="{ value }">
                        <span class="recipient-text">{{ value || 'Vann Sengmey' }}</span>
                    </template>

                    <!-- Channel Badge -->
                    <template #cell-channel="{ value }">
                        <span class="channel-badge" :class="value ? value.toLowerCase().replace(/[^a-z0-9]/g, '_') : ''">
                            {{ value }}
                        </span>
                    </template>

                    <!-- Provider -->
                    <template #cell-provider="{ value }">
                        <span class="provider-badge">{{ value || 'Internal' }}</span>
                    </template>

                    <!-- Status Badge -->
                    <template #cell-log_status="{ value }">
                        <span
                            class="status-badge"
                            :class="value ? value.toLowerCase() : 'pending'"
                        >
                            <span class="status-dot"></span>
                            {{ value }}
                        </span>
                    </template>

                    <!-- Attempts -->
                    <template #cell-attempt_count="{ value }">
                        <span class="attempt-pill">{{ value || 1 }}</span>
                    </template>

                    <!-- Executed -->
                    <template #cell-executed_at="{ value }">
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
import { onMounted, ref } from 'vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import TablerIcon from '@/components/common/TablerIcon.vue'
import { get } from '@/services/api'

const loading = ref(false)
const error = ref('')
const rows = ref([])

const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
})

const filters = ref({
    status: '',
})

const columns = [
    { key: 'notification_title', label: 'Notification' },
    { key: 'sent_to_user', label: 'Recipient' },
    { key: 'channel', label: 'Channel' },
    { key: 'provider', label: 'Provider' },
    { key: 'log_status', label: 'Status' },
    { key: 'attempt_count', label: 'Attempts' },
    { key: 'executed_at', label: 'Executed' },
]

async function load(next = 1, currentLimit = pagination.value.limit) {
    loading.value = true
    error.value = ''
    try {
        let url = `/admin/notification/getLog?page=${next}&limit=${currentLimit}`
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
        error.value = e.message
    } finally {
        loading.value = false
    }
}

function resetFilters() {
    filters.value.status = ''
    load(1)
}

function handlePageChange(newPage) {
    load(newPage, pagination.value.limit)
}

function handleLimitChange(newLimit) {
    pagination.value.limit = newLimit
    load(1, newLimit)
}

onMounted(load)
</script>

<style scoped>
.delivery-logs-view {
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

.card-table {
    border-radius: 14px;
    border: 1px solid #e3e5e9;
    background: #fff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
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

.event-cell {
    font-weight: 600;
    color: #152033;
    font-size: 14.5px;
    white-space: nowrap;
}

.recipient-text {
    font-weight: 500;
    color: #334155;
    font-size: 14px;
    white-space: nowrap;
}

.provider-badge {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    background: #f1f5f9;
    padding: 3px 8px;
    border-radius: 6px;
}

.attempt-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f1f5f9;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
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

/* Status Badge */
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

.status-badge.read,
.status-badge.delivered,
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

.timestamp-text {
    font-size: 13.5px;
    color: #697489;
    white-space: nowrap;
}

.custom-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 10px;
    font-size: 14px;
}
</style>
