<template>
	<section class="stats-grid" aria-label="Workspace statistics">
		<article v-for="stat in stats" :key="stat.label" class="stat-card">
			<div class="stat-icon" :class="stat.tone">
				<component :is="iconMap[stat.icon]" :size="20" :stroke-width="2" />
			</div>
			<p>{{ stat.label }}</p>
			<strong>{{ stat.value }}</strong>
			<span :class="stat.changeTone">{{ stat.change }}</span>
		</article>
	</section>
</template>

<script setup>
import {
	IconAlertTriangle,
	IconArrowUpRight,
	IconCircleCheck,
	IconUsers,
} from '@tabler/icons-vue'

defineProps({
	stats: {
		type: Array,
		default: () => [],
	},
})

const iconMap = {
	alert: IconAlertTriangle,
	arrow: IconArrowUpRight,
	check: IconCircleCheck,
	users: IconUsers,
}
</script>

<style scoped>
.stats-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 18px;
	margin-top: 32px;
}

.stat-card {
	min-width: 0;
	padding: 20px;
	border: 1px solid #e3e5e9;
	border-radius: 14px;
	background: #fff;
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

.stat-card p {
	margin: 18px 0 0;
	color: #697489;
	font-size: 14px;
}

.stat-card strong {
	display: inline-block;
	margin-top: 8px;
	color: #152033;
	font-size: 26px;
}

.stat-card > span {
	display: inline-block;
	margin: 8px 0 0 6px;
	font-size: 13px;
	font-weight: 600;
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

.positive {
	color: #159570;
}

.negative {
	color: #e34c5b;
}

@media (max-width: 1000px) {
	.stats-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}

@media (max-width: 600px) {
	.stats-grid {
		grid-template-columns: 1fr;
	}
}
</style>
