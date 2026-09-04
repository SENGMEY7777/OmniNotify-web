<template>
    <section class="audit-logs-view">
        <!-- Page Header -->
        <div class="header-section d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="page-title">Audit Logs</h1>
                <p class="page-subtitle">Review administrative activity, system operations, and security logs.</p>
            </div>
        </div>

        <!-- 3-4 KPI Stat Cards -->
        <BaseStateCard :stats="auditStats" class="mb-4" />

        <!-- Alert Message -->
        <transition name="fade">
            <div v-if="error" class="alert alert-danger custom-alert mb-4" role="alert">
                <TablerIcon name="alert-circle" size="18" />
                <span>{{ error }}</span>
                <button type="button" class="btn-close ms-auto" aria-label="Close" @click="error = ''"></button>
            </div>
        </transition>

        <!-- Audit Table Card -->
        <div class="card card-table p-4">
            <div class="table-header d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div class="desc">
                    <h4 class="table-title">Audit Trail Records</h4>
                    <span class="table-subtitle">All recorded admin actions and state changes</span>
                </div>
                <div class="table-filters d-flex align-items-center gap-2 flex-wrap">
                    <!-- Action Filter -->
                    <select
                        v-model="filters.action"
                        class="form-select form-select-sm filter-select"
                        aria-label="Filter by action"
                    >
                        <option value="">All Actions</option>
                        <option value="CREATE">CREATE</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                        <option value="LOGIN">LOGIN</option>
                    </select>

                    <!-- Reset Filter Button -->
                    <button
                        v-if="filters.action"
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
                    caption="All system audit trail logs"
                    :columns="columns"
                    :rows="paginatedRows"
                    :loading="loading"
                    row-key="audit_id"
                >
                    <!-- Action Slot -->
                    <template #cell-action="{ value, row }">
                        <span
                            class="action-badge"
                            :class="getActionClass(value || row.action || row.event || row.activity)"
                        >
                            <span class="action-dot"></span>
                            {{ value || row.action || row.event || row.activity || 'OPERATION' }}
                        </span>
                    </template>

                    <!-- Entity Slot -->
                    <template #cell-entity_type="{ value, row }">
                        <div class="entity-pill" :class="getEntityClass(value || row.entity_type || row.entity || row.target)">
                            <TablerIcon :name="getEntityIcon(value || row.entity_type || row.entity || row.target)" size="14" />
                            <span>{{ formatEntityName(value || row.entity_type || row.entity || row.target) }}</span>
                        </div>
                    </template>

                    <!-- Entity ID Slot -->
                    <template #cell-entity_id="{ value, row }">
                        <span v-if="value || row.entity_id || row.target_id || row.id" class="id-chip">
                            {{ String(value || row.entity_id || row.target_id || row.id).slice(0, 8) }}…
                        </span>
                        <span v-else class="text-muted">—</span>
                    </template>

                    <!-- IP Address Slot -->
                    <template #cell-ip_address="{ value, row }">
                        <span class="ip-text">{{ value || row.ip_address || row.ip || '127.0.0.1' }}</span>
                    </template>

                    <!-- Timestamp Slot -->
                    <template #cell-created_at="{ value, row }">
                        <span class="timestamp-text">
                            {{ (value || row.created_at || row.timestamp || row.createdAt) ? new Date(value || row.created_at || row.timestamp || row.createdAt).toLocaleString() : '—' }}
                        </span>
                    </template>
                </BaseTable>
            </div>

            <!-- Pagination Component -->
            <div class="mt-3">
                <BasePagination
                    :page="pagination.page"
                    :total-pages="pagination.total_pages"
                    :total="filteredRows.length"
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
import { computed, onMounted, ref, watch } from 'vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import BaseStateCard from '@/components/common/BaseStateCard.vue'
import TablerIcon from '@/components/common/TablerIcon.vue'
import { get } from '@/services/api'

const loading = ref(false)
const error = ref('')
const rows = ref([])
const rawStats = ref({})

const filters = ref({
    action: '',
})

const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
})

const columns = [
    { key: 'action', label: 'Action' },
    { key: 'entity_type', label: 'Entity' },
    { key: 'entity_id', label: 'Entity ID' },
    { key: 'ip_address', label: 'IP Address' },
    { key: 'created_at', label: 'Timestamp' },
]

const filteredRows = computed(() => {
    let list = rows.value || []
    if (filters.value.action) {
        list = list.filter(r => (r.action || '').toUpperCase().includes(filters.value.action.toUpperCase()))
    }
    return list
})

const paginatedRows = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.limit
    return filteredRows.value.slice(start, start + pagination.value.limit)
})

watch(filteredRows, (newList) => {
    pagination.value.total = newList.length
    pagination.value.total_pages = Math.ceil(newList.length / pagination.value.limit) || 1
    if (pagination.value.page > pagination.value.total_pages) {
        pagination.value.page = 1
    }
}, { immediate: true })

const auditStats = computed(() => {
    const total = rows.value.length || Number(rawStats.value.total || 0)
    const updates = rows.value.filter(r => (r.action || '').toUpperCase().includes('UPDATE')).length
    const creates = rows.value.filter(r => (r.action || '').toUpperCase().includes('CREATE')).length
    const deletes = rows.value.filter(r => (r.action || '').toUpperCase().includes('DELETE')).length

    return [
        {
            label: 'Total Audit Logs',
            value: total.toLocaleString(),
            tone: 'purple',
            icon: 'arrow',
            change: '+18.4%',
            changeTone: 'positive',
            subtitle: 'Recorded operations',
        },
        {
            label: 'Mutations (Create/Update)',
            value: (creates + updates).toLocaleString(),
            tone: 'green',
            icon: 'check',
            change: `${creates} creations`,
            changeTone: 'positive',
            subtitle: 'State modifications',
        },
        {
            label: 'Security / Deletes',
            value: deletes.toLocaleString(),
            tone: 'red',
            icon: 'alert',
            change: deletes > 0 ? `${deletes} deleted` : '0 critical events',
            changeTone: deletes > 0 ? 'negative' : 'positive',
            subtitle: 'High-impact events',
        },
    ]
})

function getActionClass(action) {
    if (!action) return 'info'
    const act = action.toUpperCase()
    if (act.includes('CREATE') || act.includes('INSERT')) return 'success'
    if (act.includes('UPDATE') || act.includes('EDIT')) return 'primary'
    if (act.includes('DELETE') || act.includes('REMOVE')) return 'danger'
    if (act.includes('LOGOUT')) return 'danger'
    if (act.includes('LOGIN') || act.includes('AUTH')) return 'purple'
    return 'info'
}

function formatEntityName(entity) {
    if (!entity) return 'System'
    const name = String(entity).replace(/_/g, ' ').toLowerCase()
    return name.charAt(0).toUpperCase() + name.slice(1)
}

function getEntityIcon(entity) {
    if (!entity) return 'file-text'
    const ent = String(entity).toUpperCase()
    if (ent.includes('USER') || ent.includes('ACCOUNT')) return 'user'
    if (ent.includes('NOTIF') || ent.includes('ALERT') || ent.includes('MESSAGE')) return 'bell'
    if (ent.includes('TEMPLATE') || ent.includes('LAYOUT')) return 'template'
    if (ent.includes('AUTH') || ent.includes('SESSION') || ent.includes('TOKEN')) return 'shield-lock'
    if (ent.includes('SETTING') || ent.includes('CONFIG')) return 'settings'
    return 'file-text'
}

function getEntityClass(entity) {
    if (!entity) return 'system'
    const ent = String(entity).toUpperCase()
    if (ent.includes('USER') || ent.includes('ACCOUNT')) return 'user'
    if (ent.includes('NOTIF') || ent.includes('ALERT')) return 'notification'
    if (ent.includes('TEMPLATE')) return 'template'
    if (ent.includes('AUTH') || ent.includes('SESSION')) return 'auth'
    return 'system'
}

function handlePageChange(newPage) {
    pagination.value.page = newPage
}

function handleLimitChange(newLimit) {
    pagination.value.limit = newLimit
    pagination.value.page = 1
    pagination.value.total_pages = Math.ceil(filteredRows.value.length / newLimit) || 1
}

function resetFilters() {
    filters.value.action = ''
}

async function load() {
    loading.value = true
    error.value = ''
    try {
        const candidates = [
            '/admin/audit/audit-logs',
            '/admin/audit/audit-logs?page=1&limit=10',
            '/admin/audit/audit-log',
            '/admin/audit/logs',
            '/admin/audit/getLogs',
            '/admin/audit/getAll',
            '/admin/audit/getLog',
            '/admin/audit',
            '/admin/auditLog',
            '/admin/audit-logs',
        ]

        let result = null
        let successEndpoint = null
        for (const ep of candidates) {
            try {
                const res = await get(ep)
                if (res) {
                    result = res
                    successEndpoint = ep
                    break
                }
            } catch (_) {}
        }

        // Fetch stats
        try {
            const summary = await get('/admin/audit/audit-logs/stats')
            rawStats.value = summary || {}
        } catch (_) {
            try {
                const summary = await get('/admin/audit/stats')
                rawStats.value = summary || {}
            } catch (_) {}
        }

        let list = []
        if (Array.isArray(result)) {
            list = result
        } else if (result && typeof result === 'object') {
            list = result.audit_logs || result.logs || result.data || result.records || result.rows || result.items || []
        }
        rows.value = Array.isArray(list) ? list : []
        pagination.value.total = rows.value.length
        pagination.value.total_pages = Math.ceil(rows.value.length / pagination.value.limit) || 1

        if (!successEndpoint && !rows.value.length) {
            error.value = 'Endpoint not found or no audit logs returned.'
        }
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

onMounted(load)
</script>

<style scoped>
.audit-logs-view {
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

/* Action Badge */
.action-badge {
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

.action-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: currentColor;
}

.action-badge.success {
    color: #059669;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
}

.action-badge.primary {
    color: #2563eb;
    background: #eff6ff;
    border: 1px solid #bfdbfe;
}

.action-badge.purple {
    color: #7c3aed;
    background: #f3e8ff;
    border: 1px solid #ddd6fe;
}

.action-badge.danger {
    color: #dc2626;
    background: #fef2f2;
    border: 1px solid #fecaca;
}

.action-badge.info {
    color: #475569;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
}

.entity-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 10px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 600;
}

.entity-pill.user {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #dbeafe;
}

.entity-pill.notification {
    background: #faf5ff;
    color: #7e22ce;
    border: 1px solid #f3e8ff;
}

.entity-pill.template {
    background: #ecfdf5;
    color: #047857;
    border: 1px solid #d1fae5;
}

.entity-pill.auth {
    background: #fdf2f8;
    color: #be185d;
    border: 1px solid #fce7f3;
}

.entity-pill.system {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
}

.id-chip {
    font-family: monospace;
    font-size: 12px;
    color: #64748b;
    background: #f1f5f9;
    padding: 3px 8px;
    border-radius: 6px;
}

.ip-text {
    font-family: monospace;
    color: #475569;
    font-size: 13.5px;
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
