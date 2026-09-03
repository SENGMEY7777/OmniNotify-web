<template>
    <section class="stats-grid" aria-label="Workspace statistics">
        <article v-for="stat in stats" :key="stat.label" class="stat-card">
            <div class="stat-icon" :class="stat.tone">{{ stat.icon }}</div>
            <p>{{ stat.label }}</p>
            <strong>{{ stat.value }}</strong>
            <span :class="stat.changeTone">{{ stat.change }}</span>
        </article>
    </section>
</template>

<script setup>
defineProps({
    stats: {
        type: Array,
        default: () => [],
    },
})
</script>
