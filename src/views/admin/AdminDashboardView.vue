<template>
    <div class="admin-dashboard">
        <header class="page-heading">
            <div>
                <h1>Dashboard Overview</h1>
                <p class="intro">Monitor notifications, delivery performance, and your workspace.</p>
            </div>
        </header>

        <BaseStateCard :stats="stats" />

        <section class="dashboard-grid">
            <article class="panel delivery-panel">
                <div class="panel-heading">
                    <div>
                        <h2>Delivery performance</h2>
                        <p>Notification delivery over the last 7 days</p>
                    </div><button class="period-button" type="button">Last 7 days <span>⌄</span></button>
                </div>
                <div class="chart" aria-label="Delivery performance chart">
                    <div v-for="bar in bars" :key="bar.day" class="bar-column">
                        <div class="bar" :style="{ height: `${bar.height}%` }"></div><span>{{ bar.day }}</span>
                    </div>
                </div>
            </article>
            <article class="panel activity-panel">
                <div class="panel-heading">
                    <div>
                        <h2>Delivery Channels</h2>
                        <p>Channel health and delivery</p>
                    </div><a href="#activity">View all</a>
                </div>
                <ul class="activity-list">
                    <li v-for="activity in activities" :key="activity.title"><span class="activity-dot"
                            :class="activity.tone"></span>
                        <div><strong>{{ activity.title }}</strong><small>{{ activity.time }}</small></div>
                    </li>
                </ul>
            </article>
        </section>
    </div>
</template>

<script setup>
import BaseStateCard from '../../components/ui/BaseStateCard.vue'

const stats = [
    { label: 'Total notifications', value: '24,680', change: '+12.4%', changeTone: 'positive', icon: 'arrow', tone: 'purple' },
    { label: 'Delivered successfully', value: '23,942', change: '+8.2%', changeTone: 'positive', icon: 'check', tone: 'green' },
    { label: 'Active users', value: '1,284', change: '+5.7%', changeTone: 'positive', icon: 'users', tone: 'blue' },
    { label: 'Failed deliveries', value: '738', change: '-2.1%', changeTone: 'negative', icon: 'alert', tone: 'red' },
]
const bars = [
    { day: 'Mon', height: 48 }, { day: 'Tue', height: 67 }, { day: 'Wed', height: 55 },
    { day: 'Thu', height: 82 }, { day: 'Fri', height: 72 }, { day: 'Sat', height: 91 }, { day: 'Sun', height: 64 },
]
const activities = [
    { title: 'Welcome campaign sent', time: '2 minutes ago', tone: 'purple' },
    { title: 'New template created', time: '18 minutes ago', tone: 'blue' },
    { title: 'User permissions updated', time: '1 hour ago', tone: 'green' },
    { title: 'Delivery retry completed', time: '3 hours ago', tone: 'orange' },
]
</script>

<style scoped>
.admin-dashboard {
    color: #152033;
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
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) minmax(300px, 1fr);
    gap: 18px;
    margin-top: 18px;
}

.panel {
    padding: 24px;
}

.panel h2 {
    font-size: 18px;
}

.panel-heading a {
    color: #8751ff;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
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

.chart {
    height: 230px;
    display: flex;
    align-items: end;
    justify-content: space-around;
    gap: 12px;
    margin-top: 35px;
    padding: 0 8px;
    border-bottom: 1px solid #e3e5e9;
    background: repeating-linear-gradient(to top, transparent 0 56px, #f0f1f4 57px);
}

.bar-column {
    height: 100%;
    display: flex;
    flex: 1;
    flex-direction: column;
    align-items: center;
    justify-content: end;
    gap: 10px;
    color: #8993a5;
    font-size: 12px;
}

.bar {
    width: min(38px, 70%);
    min-height: 12px;
    border-radius: 7px 7px 0 0;
    background: linear-gradient(180deg, #a178ff, #8751ff);
}

.activity-list {
    margin-top: 25px;
    padding: 0;
    list-style: none;
}

.activity-list li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 15px 0;
    border-bottom: 1px solid #f0f1f4;
}

.activity-list li:last-child {
    border-bottom: 0;
}

.activity-dot {
    width: 9px;
    height: 9px;
    flex: 0 0 9px;
    border-radius: 50%;
}

.activity-list strong,
.activity-list small {
    display: block;
}

.activity-list strong {
    font-size: 14px;
}

.activity-list small {
    margin-top: 4px;
    color: #8993a5;
    font-size: 12px;
}

@media (max-width: 1000px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .dashboard-grid {
        grid-template-columns: 1fr;
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
</style>
