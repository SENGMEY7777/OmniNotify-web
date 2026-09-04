<template>
    <section class="template-dashboard-view">
        <!-- Page Header -->
        <div class="header-section d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="page-title">Templates</h1>
                <p class="page-subtitle">Create, configure, and manage notification templates.</p>
            </div>
            <button class="btn btn-primary-custom" type="button" @click="showForm = true">
                <TablerIcon name="plus" size="18" />
                <span>New template</span>
            </button>
        </div>

        <!-- 3 KPI Stat Cards -->
        <BaseStateCard :stats="templateStats" class="mb-4" />



        <!-- New Template Modal -->
        <BaseModal
            v-model:is-open="showForm"
            title="Notification Template"
            subtitle="Configure your event message layout based on your need."
            icon="template"
            size="lg"
        >
            <form id="templateModalForm" @submit.prevent="create">
                <!-- Section 1: Template Configuration -->
                <div class="form-section-title">Template Configuration</div>

                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Event Type <span class="required-star">*</span></label>
                        <select v-model="form.event_type" class="form-select" required>
                            <option value="">Choose an event type...</option>
                            <option value="TRANSACTION_DEPOSIT">TRANSACTION_DEPOSIT</option>
                            <option value="TRANSACTION_TRANSFER">TRANSACTION_TRANSFER</option>
                            <option value="TRANSACTION_WITHDRAW">TRANSACTION_WITHDRAW</option>
                            <option value="PAYMENT_BILL">PAYMENT_BILL</option>
                            <option value="PAYMENT_FAILED">PAYMENT_FAILED</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Default Channel <span class="required-star">*</span></label>
                        <select v-model="form.default_channel" class="form-select">
                            <option value="IN_APP">IN_APP</option>
                            <option value="PUSH">PUSH</option>
                            <option value="EMAIL">EMAIL</option>
                            <option value="SMS">SMS</option>
                            <option value="TELEGRAM">TELEGRAM</option>
                        </select>
                    </div>
                </div>

                <div class="form-toggle-wrap mb-2">
                    <label class="form-toggle-switch">
                        <input type="checkbox" :checked="form.is_active === 1" @change="form.is_active = $event.target.checked ? 1 : 0" />
                        <span class="form-toggle-slider"></span>
                    </label>
                    <span class="form-toggle-label" @click="form.is_active = form.is_active === 1 ? 0 : 1">
                        Active status (enable template immediately)
                    </span>
                </div>

                <div class="modal-dashed-divider"></div>

                <!-- Section 2: Template Content -->
                <div class="form-section-title">Template Content</div>

                <div class="mb-3">
                    <label class="form-label">Title Template <span class="required-star">*</span></label>
                    <input
                        v-model="form.title_template"
                        class="form-control"
                        placeholder="e.g. 🔔 {{title}} or Transfer Alert"
                        required
                    />
                </div>

                <div class="mb-2">
                    <label class="form-label">Body Template <span class="required-star">*</span></label>
                    <textarea
                        v-model="form.body_template"
                        class="form-control"
                        rows="3"
                        placeholder="Message body with variables e.g. Your transfer of {{amount}} is complete."
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
                    form="templateModalForm"
                    class="btn-modal-primary"
                    :disabled="submitting"
                >
                    <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                    <span>Create Template</span>
                </button>
            </template>
        </BaseModal>




        <!-- Template Table Card -->
        <div class="card card-table p-4">
            <div class="table-header d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div class="desc">
                    <h4 class="table-title">Message Templates</h4>
                    <span class="table-subtitle">All active and inactive event templates</span>
                </div>
                <div class="table-filters d-flex align-items-center gap-2 flex-wrap">
                    <!-- Channel Filter -->
                    <select
                        v-model="filters.channel"
                        class="form-select form-select-sm filter-select"
                        aria-label="Filter by channel"
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
                    >
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
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
                    caption="All notification templates"
                    :columns="columns"
                    :rows="paginatedRows"
                    :loading="loading"
                    row-key="template_id"
                >
                    <!-- Event Slot -->
                    <template #cell-event_type="{ value }">
                        <div class="event-cell d-flex align-items-center gap-2">
                            <span class="event-title">{{ value }}</span>
                        </div>
                    </template>

                    <!-- Title Template Slot -->
                    <template #cell-title_template="{ value }">
                        <span class="title-text">{{ value }}</span>
                    </template>

                    <!-- Channel Slot -->
                    <template #cell-default_channel="{ value }">
                        <span class="channel-badge" :class="value ? value.toLowerCase().replace(/[^a-z0-9]/g, '_') : ''">
                            {{ value }}
                        </span>
                    </template>

                    <!-- Status Slot -->
                    <template #cell-is_active="{ row }">
                        <button
                            type="button"
                            class="status-badge-btn"
                            :class="{ 'is-updating': row._updating }"
                            title="Click to toggle status"
                            @click="toggle(row)"
                        >
                            <span
                                class="status-badge"
                                :class="row.is_active ? 'read' : 'failed'"
                            >
                                <span class="status-dot"></span>
                                {{ row.is_active ? 'Active' : 'Inactive' }}
                            </span>
                        </button>
                    </template>

                    <!-- Template ID Slot -->
                    <template #cell-template_id="{ value }">
                        <span class="id-chip">{{ String(value).slice(0, 8) }}…</span>
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
import BaseModal from '@/components/common/BaseModal.vue'
import TablerIcon from '@/components/common/TablerIcon.vue'
import { get, post, put } from '@/services/api'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()
const rows = ref([])
const loading = ref(false)
const submitting = ref(false)
const showForm = ref(false)

const filters = ref({
    channel: '',
    status: '',
})

const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
})

const form = ref({
    event_type: '',
    title_template: '',
    body_template: '',
    default_channel: 'IN_APP',
    is_active: 1,
})

const columns = [
    { key: 'event_type', label: 'Event' },
    { key: 'title_template', label: 'Title Template' },
    { key: 'default_channel', label: 'Channel' },
    { key: 'is_active', label: 'Status' },
    { key: 'template_id', label: 'ID' },
]

const filteredRows = computed(() => {
    let list = rows.value || []
    if (filters.value.channel) {
        list = list.filter(r => r.default_channel === filters.value.channel)
    }
    if (filters.value.status) {
        const isActive = filters.value.status === 'Active'
        list = list.filter(r => Boolean(r.is_active) === isActive)
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

const templateStats = computed(() => {
    const total = rows.value.length
    const active = rows.value.filter(r => r.is_active).length
    const inactive = total - active
    const activeRate = total ? ((active / total) * 100).toFixed(1) : '100.0'

    return [
        {
            label: 'Total Templates',
            value: total.toLocaleString(),
            tone: 'purple',
            icon: 'template',
            change: '+12.5%',
            changeTone: 'positive',
            subtitle: 'Configured events',
        },
        {
            label: 'Active Templates',
            value: active.toLocaleString(),
            tone: 'green',
            icon: 'check',
            change: `+${activeRate}%`,
            changeTone: 'positive',
            subtitle: 'Ready to send',
        },
        {
            label: 'Inactive Templates',
            value: inactive.toLocaleString(),
            tone: 'red',
            icon: 'alert',
            change: inactive > 0 ? `${inactive} disabled` : '0 disabled',
            changeTone: inactive > 0 ? 'negative' : 'positive',
            subtitle: 'Paused templates',
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

function resetFilters() {
    filters.value.channel = ''
    filters.value.status = ''
}

async function load() {
    loading.value = true
    try {
        const result = await get('/admin/template/getAll')
        rows.value = result.data || result || []
    } catch (e) {
        toast.error(e.message || 'Failed to load templates.')
    } finally {
        loading.value = false
    }
}

function resetForm() {
    form.value = {
        event_type: '',
        title_template: '',
        body_template: '',
        default_channel: 'IN_APP',
        is_active: 1,
    }
}

function saveDraft() {
    try {
        localStorage.setItem('omni_template_draft', JSON.stringify(form.value))
        toast.success('Template draft saved successfully!')
        showForm.value = false
    } catch (_) {}
}

async function create() {
    submitting.value = true
    try {
        await post('/admin/template/create', form.value)
        toast.success('Template created successfully!')
        showForm.value = false
        resetForm()
        await load()
    } catch (e) {
        toast.error(e.message || 'Failed to create template.')
    } finally {
        submitting.value = false
    }
}


async function toggle(row) {
    if (row._updating) return
    row._updating = true
    const newActive = row.is_active ? 0 : 1
    const prevActive = row.is_active
    row.is_active = newActive

    try {
        await put(`/admin/template/${row.template_id}`, { is_active: newActive })
        toast.success(`Template ${newActive ? 'activated' : 'deactivated'} successfully!`)
    } catch (e) {
        row.is_active = prevActive
        toast.error(e.message || 'Failed to update template status.')
    } finally {
        row._updating = false
    }
}

onMounted(load)
</script>

<style scoped>
.template-dashboard-view {
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
}

.event-title {
    font-weight: 600;
    color: #152033;
    font-size: 14.5px;
}

.title-text {
    font-weight: 500;
    color: #334155;
    font-size: 14px;
}

.id-chip {
    font-family: monospace;
    font-size: 12px;
    color: #64748b;
    background: #f1f5f9;
    padding: 3px 8px;
    border-radius: 6px;
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

.custom-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    border-radius: 10px;
    font-size: 14px;
}

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
