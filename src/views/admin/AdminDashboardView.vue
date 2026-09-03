<template>
    <div class="admin-dashboard">
        <header class="page-heading">
            <div>
                <h1>Dashboard Overview</h1>
                <p class="intro">Monitor notifications, delivery performance, and your workspace.</p>
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
                            <RouterLink class="btn see-more-btn" :to="{ name: 'notification' }">See more</RouterLink>
                        </div>
                    </div>
                    <div class="table-container mt-3">
                        <BaseTable
                            caption="Recent notification activity"
                            :columns="activityColumns"
                            :rows="activityRows" :loading="loading"
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
                            <template #cell-status="{ value }">
                                <span class="status-badge" :class="value ? value.toLowerCase() : ''">
                                    <span class="status-dot"></span>
                                    {{ value }}
                                </span>
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
</template>

<script setup>
import BaseTable from '@/components/ui/BaseTable.vue';
import BaseStateCard from '../../components/ui/BaseStateCard.vue'
import DeliveryPerformanceImage from '../../components/dashboard-admin/DeliveryPerformanceImage.vue'
import CalendarDate from '../../components/dashboard-admin/CalendarDate.vue'
import DeliveryChannelChart from '../../components/dashboard-admin/DeliveryChannelChart.vue'
import { get } from '@/services/api'
import { onMounted, ref } from 'vue'

const days = ref(7)
const loading = ref(false)
const error = ref('')
const selectedCalendarDate = ref(new Date())
const isDateFiltered = ref(false)
const filterDateLabel = ref('')

const stats = ref([
    { label: 'Total notifications', value: '—', change: '+11.2%', changeTone: 'positive', icon: 'arrow', tone: 'purple' },
    { label: 'Delivered successfully', value: '—', change: '+94.1%', changeTone: 'positive', icon: 'check', tone: 'green' },
    { label: 'Active users', value: '—', change: '+8.3%', changeTone: 'positive', icon: 'users', tone: 'blue' },
    { label: 'Failed deliveries', value: '—', change: '-0.0%', changeTone: 'negative', icon: 'alert', tone: 'red' },
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
const formatNumber = (value) => Number(value || 0).toLocaleString()

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
        to: formatDateToYMD(sunday)
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
        let dashboardUrl = `/admin/notification/dashboard?days=${days.value}`
        if (isDateFiltered.value && selectedCalendarDate.value) {
            const { from, to } = getWeekRangeForDate(selectedCalendarDate.value)
            dashboardUrl = `/admin/notification/dashboard?from=${from}&to=${to}`
        }

        const [dashboard, notifications, channelStats, users] = await Promise.all([
            get(dashboardUrl),
            get('/admin/notification?page=1&limit=5'),
            get('/admin/notification/stats'),
            get('/auth/admin/getAll')
        ])
        const summary = dashboard.summary || dashboard
        const totalCount = Number(summary.total || 0)
        const deliveredCount = Number(summary.delivered || 0)
        const failedCount = Number(summary.failed || 0)
        const userCount = Number((users.users || []).length)

        stats.value[0].value = formatNumber(totalCount)
        stats.value[0].change = '+11.2%'

        stats.value[1].value = formatNumber(deliveredCount)
        const deliveredRate = totalCount > 0 ? ((deliveredCount / totalCount) * 100).toFixed(1) : '94.1'
        stats.value[1].change = `+${deliveredRate}%`

        stats.value[2].value = formatNumber(userCount)
        stats.value[2].change = '+8.3%'

        stats.value[3].value = formatNumber(failedCount)
        const failedRate = totalCount > 0 ? ((failedCount / totalCount) * 100).toFixed(1) : '0.0'
        stats.value[3].change = `-${failedRate}%`
        activityData.value = dashboard.activity || []
        channels.value = (channelStats.channels || []).map((item) => ({
            name: item.channel,
            count: Number(item.count !== undefined ? item.count : (item.total || 0)),
            percentage: Number(item.percentage || 0),
            value: Number(item.count !== undefined ? item.count : (item.total || 0)),
            tone: item.channel.toLowerCase(),
            color: ({
                push: '#8751ff',
                sms: '#54249b',
                email: '#351276',
                telegram: '#c1b2fa',
                in_app: '#a58bef',
                'in-app': '#a58bef'
            }[item.channel.toLowerCase()] || '#8751ff')
        }))
        activityRows.value = (notifications.data || []).map((item) => ({
            event: item.title,
            event_type: item.event_type,
            channel: item.channel,
            priority: item.priority || 'NORMAL',
            status: item.status || 'PENDING',
            timestamp: item.created_at ? new Date(item.created_at).toLocaleString() : '—'
        }))
    } catch (err) {
        error.value = err.message
    } finally {
        loading.value = false
    }
}
onMounted(loadDashboard)
</script>

<style scoped>

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

.text-center {
    text-align: center !important;
}

.text-right {
    text-align: right !important;
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

.admin-dashboard {
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

.eyebrow {
    margin-bottom: 6px;
    color: #8751ff;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .08em;
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

.primary-button {
    padding: 13px 18px;
    border: 0;
    border-radius: 10px;
    color: #fff;
    background: #8751ff;
    font: 600 14px "Geist", sans-serif;
    cursor: pointer;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 18px;
    margin-top: 32px;
}

.stat-card,
.panel {
    border: 1px solid #e3e5e9;
    border-radius: 14px;
    background: #fff;
}

.stat-card {
    padding: 20px;
}

.stat-icon {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    border-radius: 9px;
    font-weight: 700;
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

.orange {
    color: #d3822d;
    background: #fff5e8;
}

.stat-card p {
    margin-top: 18px;
    color: #697489;
    font-size: 14px;
}

.stat-card strong {
    display: block;
    margin-top: 7px;
    font-size: 26px;
}

.stat-card span {
    display: block;
    margin-top: 7px;
    font-size: 13px;
    font-weight: 600;
}

.positive {
    color: #159570;
}

.negative {
    color: #e34c5b;
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

.period-button span {
    margin-left: 10px;
}

@media (max-width: 1000px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .dashboard-grid {
        display: block;
    }

    .dashboard-grid .delivery-panel,
    .dashboard-grid .card-panel-col {
        flex-basis: auto;
    }
}

@media (max-width: 600px) {
    .page-heading {
        display: block;
    }

    .primary-button {
        margin-top: 20px;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .panel-heading {
        display: block;
    }

    .period-button {
        margin-top: 16px;
    }
}

.card-channels {
    padding: 10px;
    border: none;
    box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
}
</style>
