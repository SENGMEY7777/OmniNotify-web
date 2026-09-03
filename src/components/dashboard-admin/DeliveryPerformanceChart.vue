<template>
    <div class="chart" aria-label="Delivery performance chart">
        <div v-for="bar in liveBars" :key="bar.day" class="bar-column">
            <div class="bar" :style="{ height: `${bar.height}%` }"></div>
            <span>{{ bar.day }}</span>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
    bars: {
        type: Array,
        default: () => [],
    },
})

const liveBars = ref(props.bars.map((bar) => ({ ...bar })))
let updateTimer

onMounted(() => {
    updateTimer = window.setInterval(() => {
        liveBars.value = liveBars.value.map((bar) => ({
            ...bar,
            height: Math.min(95, Math.max(25, bar.height + Math.round(Math.random() * 10 - 5))),
        }))
    }, 3000)
})

onUnmounted(() => {
    window.clearInterval(updateTimer)
})
</script>

<style scoped>
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

@media (max-width: 600px) {
    .chart {
        height: 180px;
    }
}
</style>
