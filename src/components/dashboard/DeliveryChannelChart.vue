<template>
    <div class="channel-chart" aria-label="Delivery channel distribution">
        <div class="donut-container">
            <svg class="donut-svg" viewBox="0 0 200 200">
                <!-- Background track -->
                <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    stroke="#f8fafc"
                    stroke-width="26"
                />
                <!-- Slices -->
                <circle
                    v-for="slice in slices"
                    :key="slice.name"
                    class="donut-segment"
                    :class="{
                        'is-active': activeChannel?.name === slice.name,
                        'is-dimmed': activeChannel && activeChannel.name !== slice.name
                    }"
                    cx="100"
                    cy="100"
                    r="70"
                    fill="none"
                    :stroke="slice.color"
                    :stroke-width="activeChannel?.name === slice.name ? 30 : 26"
                    :stroke-dasharray="`${slice.dash} ${circumference}`"
                    :stroke-dashoffset="slice.offset"
                    transform="rotate(-90 100 100)"
                    @mouseenter="activeChannel = slice"
                    @mouseleave="activeChannel = null"
                />
            </svg>

            <!-- Center display -->
            <div class="donut-center" aria-live="polite">
                <span class="center-label">{{ activeChannel ? activeChannel.name : 'Total' }}</span>
                <strong
                    class="center-value"
                    :style="activeChannel ? { color: activeChannel.color } : {}"
                >
                    {{ activeChannel ? (activeChannel.count !== undefined ? activeChannel.count.toLocaleString() : activeChannel.value) : totalCount.toLocaleString() }}
                </strong>
                <span v-if="activeChannel && activeChannel.percentage !== undefined" class="center-sub">
                    {{ activeChannel.percentage }}%
                </span>
            </div>
        </div>

        <ul class="legend">
            <li
                v-for="channel in channels"
                :key="channel.name"
                class="legend-item"
                :class="{
                    'is-active': activeChannel?.name === channel.name,
                    'is-dimmed': activeChannel && activeChannel.name !== channel.name
                }"
                @mouseenter="activeChannel = channel"
                @mouseleave="activeChannel = null"
            >
                <span class="legend-swatch" :class="channel.tone" :style="{ backgroundColor: channel.color }" aria-hidden="true"></span>
                <span class="legend-name">{{ channel.name }}</span>
                <strong class="legend-value">
                    {{ (channel.count !== undefined ? channel.count : channel.value).toLocaleString() }}
                    <span class="legend-percent">({{ getChannelPercent(channel) }}%)</span>
                </strong>
            </li>
        </ul>
        <div class="legend-total">Total <strong>{{ totalCount.toLocaleString() }}</strong></div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({ channels: { type: Array, default: () => [] } })
const activeChannel = ref(null)

const channels = computed(() => props.channels.length ? props.channels : [
    { name: 'PUSH', count: 35, value: 35, percentage: 35, tone: 'push', color: '#8751ff' },
    { name: 'SMS', count: 20, value: 20, percentage: 20, tone: 'sms', color: '#54249b' },
    { name: 'EMAIL', count: 20, value: 20, percentage: 20, tone: 'email', color: '#351276' },
    { name: 'TELEGRAM', count: 15, value: 15, percentage: 15, tone: 'telegram', color: '#c1b2fa' },
    { name: 'IN-APP', count: 10, value: 10, percentage: 10, tone: 'in-app', color: '#a58bef' },
])

const radius = 70
const circumference = 2 * Math.PI * radius

const totalCount = computed(() => {
    return channels.value.reduce((sum, c) => sum + Number(c.count !== undefined ? c.count : (c.value || 0)), 0)
})

function getChannelPercent(channel) {
    if (channel.percentage !== undefined && channel.percentage !== null) {
        return channel.percentage
    }
    if (totalCount.value > 0) {
        const cnt = channel.count !== undefined ? channel.count : channel.value
        return Math.round((Number(cnt || 0) / totalCount.value) * 100)
    }
    return 0
}

const slices = computed(() => {
    const list = channels.value
    if (!list.length) return []

    const gap = list.length > 1 ? 4 : 0
    let accumulated = 0
    const total = totalCount.value || 1

    return list.map((channel) => {
        const countVal = Number(channel.count !== undefined ? channel.count : (channel.value || 0))
        const valueRatio = total > 0 ? countVal / total : 1 / list.length
        const segmentLength = valueRatio * circumference
        const dash = Math.max(segmentLength - gap, 0)
        const offset = -accumulated

        accumulated += segmentLength

        return {
            ...channel,
            dash,
            offset,
        }
    })
})
</script>

<style scoped>
.channel-chart {
    width: 100%;
    display: grid;
    justify-items: center;
    gap: 20px;
    margin-top: 16px;
}

.donut-container {
    position: relative;
    width: 100%;
    max-width: 235px;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
}

.donut-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
}

.donut-segment {
    cursor: pointer;
    transition: stroke-width 0.25s ease, opacity 0.25s ease, filter 0.25s ease;
}

.donut-segment.is-active {
    opacity: 1;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.16));
}

.donut-segment.is-dimmed {
    opacity: 0.35;
}

.donut-center {
    position: absolute;
    inset: 22%;
    border-radius: 50%;
    background: transparent;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: none;
    pointer-events: none;
    transition: all 0.25s ease;
    text-align: center;
    padding: 8px;
}

.center-label {
    font-size: 12px;
    font-weight: 700;
    color: #697489;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.2;
    transition: color 0.2s ease;
}

.center-value {
    font-size: 24px;
    font-weight: 800;
    color: #152033;
    line-height: 1.2;
    margin-top: 2px;
    transition: color 0.2s ease, transform 0.2s ease;
}

.center-sub {
    font-size: 12px;
    font-weight: 600;
    color: #8751ff;
    margin-top: 2px;
}

.legend {
    width: 100%;
    max-width: 320px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 9px;
    margin: 0;
    padding: 0;
    list-style: none;
    justify-self: center;
}

.legend-item {
    display: grid;
    grid-template-columns: 12px 1fr auto;
    align-items: center;
    gap: 12px;
    padding: 7px 12px;
    border-radius: 9px;
    color: #697489;
    font-size: 13.5px;
    cursor: pointer;
    transition: background-color 0.2s ease, opacity 0.2s ease;
}

.legend-item:hover,
.legend-item.is-active {
    background: #f8fafc;
    opacity: 1;
}

.legend-item.is-dimmed {
    opacity: 0.4;
}

.legend-name {
    font-weight: 600;
}

.legend-value {
    color: #152033;
    font-size: 13.5px;
    font-weight: 700;
}

.legend-percent {
    font-size: 12px;
    font-weight: 500;
    color: #94a3b8;
    margin-left: 4px;
}

.legend-total {
    width: 100%;
    max-width: 320px;
    display: flex;
    justify-content: space-between;
    padding-top: 14px;
    border-top: 1px solid #e3e5e9;
    color: #697489;
    font-size: 13.5px;
}

.legend-total strong {
    color: #152033;
    font-weight: 700;
}

.legend-swatch {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    display: inline-block;
}

@media (max-width: 600px) {
    .donut-container {
        max-width: 160px;
    }

    .legend {
        width: 100%;
    }
}
</style>
