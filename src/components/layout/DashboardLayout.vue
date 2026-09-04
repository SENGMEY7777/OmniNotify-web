<template>
	<div class="dashboard-layout">
		<!-- Backdrop for mobile drawer -->
		<transition name="fade">
			<div
				v-if="isMobileSidebarOpen"
				class="sidebar-mobile-backdrop"
				aria-hidden="true"
				@click="closeMobileSidebar"
			></div>
		</transition>

		<SidebarDashboard />
		<section class="dashboard-content">
			<DashboardNavbar />
			<main class="page-content"><router-view /></main>
		</section>
	</div>
</template>

<script setup>
import { onMounted } from 'vue'
import DashboardNavbar from './DashboardNavbar.vue'
import SidebarDashboard from './SidebarDashboard.vue'
import { initSocket } from '@/services/socket'
import { isMobileSidebarOpen, closeMobileSidebar } from '@/utils/mobileNav'

onMounted(() => {
	initSocket()
})
</script>

<style scoped>
.dashboard-layout {
	height: 100dvh;
	display: flex;
	overflow: hidden;
	background: #f4f5f7;
	position: relative;
}

.sidebar-mobile-backdrop {
	display: none;
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
	-webkit-overflow-scrolling: touch;
	max-width: 1440px;
	width: 100%;
	margin: 0 auto;
	padding: 32px;
}

@media (max-width: 992px) {
	.sidebar-mobile-backdrop {
		display: block;
		position: fixed;
		inset: 0;
		background: rgba(15, 23, 42, 0.6);
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		z-index: 1040;
	}

	.page-content {
		padding: 20px 16px;
	}
}

@media (max-width: 576px) {
	.page-content {
		padding: 16px 12px;
	}
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}
</style>
