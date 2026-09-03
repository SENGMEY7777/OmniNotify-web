<template>
	<div class="dashboard-layout">
		<SidebarDashboard />
		<section class="dashboard-content">
			<DashboardNavbar />
			<main class="page-content"><router-view /></main>
		</section>
	</div>
</template>

<script setup>
import DashboardNavbar from './DashboardNavbar.vue'
import SidebarDashboard from './SidebarDashboard.vue'
</script>

<style scoped>
.dashboard-layout {
	height: 100dvh;
	display: flex;
	overflow: hidden;
	background: #f4f5f7;
}

.dashboard-content {
	min-width: 0;
	min-height: 0;
	display: flex;
	flex: 1;
	flex-direction: column;
}

.page-content {
	min-height: 0;
	flex: 1;
	overflow-y: auto;
	overflow-x: hidden;
	max-width: 1440px;
	width: 100%;
	margin: 0 auto;
	padding: 36px;
}
@media (max-width: 720px) {
	.dashboard-layout { display: block; }
	.dashboard-content { height: 100dvh; }
	.page-content { padding: 24px 18px; }
}
</style>
