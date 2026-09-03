<template>
	<div class="row g-3 stats-row" aria-label="Workspace statistics">
		<div v-for="stat in stats" :key="stat.label" class="col-3">
			<article class="stat-card">
				<div class="stat-icon" :class="stat.tone">
					<component :is="iconMap[stat.icon]" :size="20" :stroke-width="2" />
				</div>
				<p class="stat-label">{{ stat.label }}</p>
				<div class="stat-value-group">
					<strong class="stat-value">{{ stat.value }}</strong>
					<span v-if="stat.change" :class="stat.changeTone" class="stat-change">{{ stat.change }}</span>
				</div>
			</article>
		</div>
	</div>
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
.stats-row {
	margin-top: 24px;
}

.stat-card {
	min-width: 0;
	height: 150px;
	padding: 20px;
	border: 1px solid #e3e5e9;
	border-radius: 14px;
	background: #fff;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	transition: all 0.2s ease;
}

.stat-card:hover {
	border-color: #cbd5e1;
	box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
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

.stat-label {
	margin: 12px 0 0;
	color: #697489;
	font-size: 14px;
	font-weight: 500;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.stat-value-group {
	display: flex;
	align-items: baseline;
	gap: 6px;
	margin-top: 4px;
}

.stat-value {
	color: #152033;
	font-size: 26px;
	font-weight: 800;
	line-height: 1;
}

.stat-change {
	font-size: 13px;
	font-weight: 700;
}

.positive {
	color: #159570;
}

.negative {
	color: #e34c5b;
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

@media (max-width: 1000px) {
	.col-3 {
		flex: 0 0 50%;
		max-width: 50%;
	}
}

@media (max-width: 600px) {
	.col-3 {
		flex: 0 0 100%;
		max-width: 100%;
	}
}
</style>
