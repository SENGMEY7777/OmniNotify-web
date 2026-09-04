<template>
	<div class="row g-3 stats-row" aria-label="Workspace statistics">
		<div
			v-for="stat in stats"
			:key="stat.label"
			:class="stats.length === 3 ? 'col-12 col-md-4' : (stats.length === 2 ? 'col-12 col-md-6' : 'col-12 col-sm-6 col-lg-3')"
		>
			<article
				class="stat-card"
				:class="{ 'is-clickable': stat.clickable === true, 'is-active': stat.isActive }"
				:tabindex="stat.clickable ? 0 : undefined"
				@click="stat.clickable && $emit('select-stat', stat)"
				@keydown.enter="stat.clickable && $emit('select-stat', stat)"
			>
				<!-- Top Row: Icon + Label side-by-side -->
				<div class="stat-top-row">
					<div class="stat-icon" :class="stat.tone">
						<component :is="iconMap[stat.icon] || iconMap.bolt" :size="20" :stroke-width="2.2" />
					</div>
					<span class="stat-label">{{ stat.label }}</span>
				</div>

				<!-- Middle: Big Value -->
				<div class="stat-main-value">
					<strong class="stat-value">{{ stat.value }}</strong>
				</div>

				<!-- Bottom: Trend + Subtitle -->
				<div v-if="stat.change || stat.subtitle" class="stat-footer-row">
					<span v-if="stat.change" :class="stat.changeTone || 'positive'" class="stat-change">{{ stat.change }}</span>
					<span class="stat-subtitle">{{ stat.subtitle || 'Since last month' }}</span>
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
	IconBolt,
	IconBell,
	IconClock,
} from '@tabler/icons-vue'

defineProps({
	stats: {
		type: Array,
		default: () => [],
	},
})

defineEmits(['select-stat'])

const iconMap = {
	alert: IconAlertTriangle,
	arrow: IconArrowUpRight,
	check: IconCircleCheck,
	users: IconUsers,
	bolt: IconBolt,
	bell: IconBell,
	clock: IconClock,
}
</script>

<style scoped>
.stats-row {
	margin-top: 16px;
}

.stat-card {
	min-width: 0;
	padding: 22px 24px;
	border: 1px solid #eef0f4;
	border-radius: 16px;
	background: #fff;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	transition: all 0.2s ease;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.stat-card.is-clickable {
	cursor: pointer;
}

.stat-card:hover {
	border-color: #cbd5e1;
	transform: translateY(-2px);
	box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
}

.stat-card.is-active {
	border-color: #8751ff;
	box-shadow: 0 0 0 2px #8751ff, 0 8px 20px rgba(135, 81, 255, 0.1);
	background: #fdfcff;
}

.stat-top-row {
	display: flex;
	align-items: center;
	gap: 14px;
}

.stat-icon {
	width: 44px;
	height: 44px;
	display: grid;
	place-items: center;
	border-radius: 12px;
	font-size: 20px;
	flex-shrink: 0;
}

.stat-label {
	margin: 0;
	color: #525c76;
	font-size: 15px;
	font-weight: 600;
	line-height: 1.2;
}

.stat-main-value {
	margin-top: 16px;
	margin-bottom: 6px;
}

.stat-value {
	color: #111827;
	font-size: 32px;
	font-weight: 800;
	line-height: 1.1;
	letter-spacing: -0.02em;
}

.stat-footer-row {
	display: flex;
	align-items: center;
	gap: 8px;
	font-size: 13.5px;
}

.stat-change {
	font-weight: 700;
}

.stat-subtitle {
	color: #64748b;
	font-weight: 500;
}

.positive {
	color: #10b981;
}

.negative {
	color: #ef4444;
}

.purple {
	color: #8751ff;
	background: #f5f3ff;
}

.green {
	color: #10b981;
	background: #ecfdf5;
}

.blue {
	color: #3b82f6;
	background: #eff6ff;
}

.red {
	color: #ef4444;
	background: #fef2f2;
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
