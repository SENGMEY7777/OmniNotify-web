<template>
    <section class="manage-users-view">
        <!-- Page Header -->
        <div class="header-section d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="page-title">Users</h1>
                <p class="page-subtitle">All registered users and account status.</p>
            </div>
        </div>

        <!-- 4 KPI Stat Cards -->
        <BaseStateCard :stats="userStats" class="mb-4" />

        <!-- Alert Message -->
        <transition name="fade">
            <div v-if="error" class="alert alert-danger custom-alert mb-4" role="alert">
                <TablerIcon name="alert-circle" size="18" />
                <span>{{ error }}</span>
                <button type="button" class="btn-close ms-auto" aria-label="Close" @click="error = ''"></button>
            </div>
        </transition>

        <!-- User Table Card -->
        <div class="card card-table p-4">
            <div class="table-header d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div class="desc">
                    <h4 class="table-title">User Accounts</h4>
                    <span class="table-subtitle">All registered customer and admin profiles</span>
                </div>
                <div class="table-filters d-flex align-items-center gap-2 flex-wrap">
                    <!-- Status Filter -->
                    <select
                        v-model="filterStatus"
                        class="form-select form-select-sm filter-select"
                        aria-label="Filter by status"
                    >
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>

                    <!-- Reset Filter Button -->
                    <button
                        v-if="filterStatus"
                        type="button"
                        class="clear-filter-btn"
                        title="Reset filter"
                        @click="filterStatus = ''"
                    >
                        Reset filter
                    </button>
                </div>
            </div>

            <div class="table-container">
                <BaseTable
                    caption="All registered user accounts"
                    :columns="columns"
                    :rows="paginatedRows"
                    :loading="loading"
                    row-key="user_id"
                >
                    <!-- User Name Slot -->
                    <template #cell-full_name="{ value, row }">
                        <div class="user-cell d-flex align-items-center gap-2">
                            <div class="user-avatar-circle">
                                {{ (value || 'U').charAt(0).toUpperCase() }}
                            </div>
                            <div class="user-info">
                                <span class="user-name">{{ value || 'Unnamed User' }}</span>
                            </div>
                        </div>
                    </template>

                    <!-- Email Slot -->
                    <template #cell-email="{ value }">
                        <span class="email-text">{{ value || '—' }}</span>
                    </template>

                    <!-- Phone Slot -->
                    <template #cell-phone_number="{ value }">
                        <span class="phone-text">{{ value || '—' }}</span>
                    </template>

                    <!-- Status Slot (No Role Column) -->
                    <template #cell-status="{ value }">
                        <span
                            class="status-badge"
                            :class="value === 'Active' ? 'read' : 'failed'"
                        >
                            <span class="status-dot"></span>
                            {{ value }}
                        </span>
                    </template>

                    <!-- Created Slot -->
                    <template #cell-created_at="{ value }">
                        <span class="timestamp-text">
                            {{ value || '—' }}
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
const allUsers = ref([])
const filterStatus = ref('')

const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
})

// Columns without "Role"
const columns = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'phone_number', label: 'Phone' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created' },
]

const filteredRows = computed(() => {
    let result = allUsers.value
    if (filterStatus.value) {
        result = result.filter(u => u.status === filterStatus.value)
    }
    return result
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

const userStats = computed(() => {
    const total = allUsers.value.length
    const active = allUsers.value.filter(u => u.status === 'Active').length
    const inactive = total - active
    const activeRate = total ? ((active / total) * 100).toFixed(1) : '100.0'

    return [
        {
            label: 'Total Users',
            value: total.toLocaleString(),
            tone: 'purple',
            icon: 'users',
            change: '+15.3%',
            changeTone: 'positive',
            subtitle: 'Registered accounts',
        },
        {
            label: 'Active Accounts',
            value: active.toLocaleString(),
            tone: 'green',
            icon: 'check',
            change: `+${activeRate}%`,
            changeTone: 'positive',
            subtitle: 'Active user rate',
        },
        {
            label: 'Inactive Accounts',
            value: inactive.toLocaleString(),
            tone: 'red',
            icon: 'alert',
            change: inactive > 0 ? `${inactive} inactive` : '0 inactive',
            changeTone: inactive > 0 ? 'negative' : 'positive',
            subtitle: 'Disabled accounts',
        },
    ]
})

function handlePageChange(newPage) {
    pagination.value.page = newPage
}

function handleLimitChange(newLimit) {
    pagination.value.limit = newLimit
    pagination.value.page = 1
    pagination.value.total_pages = Math.ceil(filteredRows.value.length / newLimit) || 1
}

async function loadUsers() {
    loading.value = true
    error.value = ''
    try {
        const result = await get('/auth/admin/getAll')
        const rawList = result.users || result.data || result || []
        allUsers.value = rawList.map(u => ({
            ...u,
            status: (u.status === true || u.status === 'Active' || u.is_active === true) ? 'Active' : 'Inactive',
            created_at: u.created_at ? new Date(u.created_at).toLocaleDateString() : '—',
        }))
        pagination.value.total = allUsers.value.length
        pagination.value.total_pages = Math.ceil(allUsers.value.length / pagination.value.limit) || 1
    } catch (e) {
        error.value = e.message
    } finally {
        loading.value = false
    }
}

onMounted(loadUsers)
</script>

<style scoped>
.manage-users-view {
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

/* User Avatar & Info */
.user-cell {
    font-weight: 600;
    color: #152033;
    font-size: 14.5px;
}

.user-avatar-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #f3f0ff;
    color: #8751ff;
    font-weight: 700;
    font-size: 13px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
}

.user-name {
    font-weight: 600;
    color: #152033;
}

.email-text {
    font-weight: 500;
    color: #334155;
    font-size: 14px;
}

.phone-text {
    color: #64748b;
    font-size: 13.5px;
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
.status-badge.active {
    color: #059669;
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
}

.status-badge.failed,
.status-badge.inactive {
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
