<script setup>
import { onMounted, ref } from 'vue'
import TablerIcon from '@/components/common/TablerIcon.vue'
import NotificationDropdown from './NotificationDropdown.vue'
import { useNotificationStore } from '@/stores/notification'
import { initTheme, toggleTheme, isDark } from '@/utils/theme'
import { isSidebarCollapsed, toggleSidebarCollapse, toggleMobileSidebar } from '@/utils/sidebarState'

const notifStore = useNotificationStore()
const showNotifications = ref(false)

function toggleNotifications() {
	showNotifications.value = !showNotifications.value
}

onMounted(() => {
	initTheme()
	notifStore.fetchNotifications()
})
</script>

<template>
	<header class="dashboard-navbar">
		<div class="navbar-left d-flex align-items-center gap-2">
			<!-- Mobile Hamburger Toggle -->
			<button
				class="mobile-menu-btn d-lg-none"
				type="button"
				aria-label="Toggle navigation menu"
				@click="toggleMobileSidebar"
			>
				<TablerIcon name="menu" size="22" />
			</button>

			<!-- Desktop Collapse / Expand Toggle Button -->
			<button
				class="sidebar-toggle-btn d-none d-lg-inline-flex"
				type="button"
				:aria-label="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
				:title="isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
				@click="toggleSidebarCollapse"
			>
				<TablerIcon name="layout-sidebar" size="20" />
			</button>

			<label class="search-field">
				<TablerIcon name="search" size="18" />
				<input type="search" placeholder="Search..." aria-label="Search" />
				<kbd class="d-none d-md-inline-block" aria-label="Command K">⌘ K</kbd>
			</label>
		</div>

		<div class="navbar-actions">
			<div class="utility-actions-wrapper">
				<div class="utility-actions">
					<button
						class="icon-button"
						type="button"
						:aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
						:title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
						@click="toggleTheme"
					>
						<TablerIcon :name="isDark ? 'sun' : 'moon'" size="20" />
					</button>
					<button
						class="icon-button notification-button"
						:class="{ active: showNotifications }"
						type="button"
						aria-label="Notifications"
						@click="toggleNotifications"
					>
						<TablerIcon name="bell" size="20" />
						<span v-if="notifStore.unreadCount > 0" class="notification-badge" aria-label="Unread notifications count">
							{{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}
						</span>
					</button>
				</div>
				<NotificationDropdown
					:is-open="showNotifications"
					@close="showNotifications = false"
				/>
			</div>

			<div class="profile-info">
				<button class="profile-button" type="button" aria-label="Open Gustavo's profile menu">
					<span class="avatar" aria-hidden="true">G</span>
					<strong class="d-none d-sm-inline">Gustavo</strong>
					<TablerIcon name="chevron-down" size="18" class="profile-chevron d-none d-sm-inline" />
				</button>
			</div>

		</div>
	</header>
</template>

<style scoped>


.dashboard-navbar {
	min-height: 75px;
	padding: 0 36px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 24px;
	background: #fff;
	border-bottom: 1px solid #e2e5ea;
}

.search-field,
.utility-actions,
.profile-button {
	display: flex;
	align-items: center;
	height: 50px;
}

.search-field {
	width: min(330px, 100%);
	height: 50px;
	gap: 20px;
	padding: 0 20px 0 23px;
	border: 1px solid #dfe2e8;
	border-radius: 13px;
	color: #657086;
	box-shadow: 0 1px 2px rgb(21 32 51 / 3%);
}

.search-field:focus-within {
	border-color: #996dff;
	box-shadow: 0 0 0 3px rgb(153 109 255 / 12%);
}

.search-field input {
	min-width: 0;
	font-weight: normal !important;
	flex: 1;
	border: 0;
	outline: 0;
	font-size: 13px !important;
	color: #51555c;
	background: transparent;
	font: 500 13px/1 "Geist", sans-serif;
}

.search-field input::placeholder {
	color: #657086;
	opacity: 1;
}

.search-icon {
	width: 20px;
	height: 20px;
	flex: 0 0 20px;
	border: 2px solid #748096;
	border-radius: 50%;
	position: relative;
}

.search-icon::after {
	content: "";
	width: 8px;
	height: 2px;
	position: absolute;
	right: -6px;
	bottom: -3px;
	background: #748096;
	transform: rotate(45deg);
}

kbd {
	flex: 0 0 auto;
	padding: 6px 10px;
	border: 1px solid #dfe2e8;
	border-radius: 6px;
	color: #657086;
	background: #fff;
	font: 500 16px/1 "Geist", sans-serif;
}

.navbar-actions {
	display: flex;
	align-items: center;
	gap: 14px;
}

.utility-actions-wrapper {
	position: relative;
}

.utility-actions,
.profile-button {
	min-height: 50px;
	border: 1px solid #dfe2e8;
	border-radius: 18px;
	background: #fff;
	box-shadow: 0 2px 0 #eef0f3, 0 0 0 5px #f5f6f8;
}

.utility-actions {
	overflow: hidden;
}

.icon-button {
	width: 84px;
	height: 48px;
	display: grid;
	place-items: center;
	border: 0;
	border-right: 1px solid #eef0f3;
	background: transparent;
	cursor: pointer;
}

.icon-button:last-child {
	border-right: 0;
}

.icon-button:hover,
.profile-button:hover {
	background: #faf9ff;
}

.sun-icon {
	width: 19px;
	height: 19px;
	border: 2px solid #253247;
	border-radius: 50%;
	box-shadow: 0 -9px 0 -7px #253247, 0 9px 0 -7px #253247, 9px 0 0 -7px #253247, -9px 0 0 -7px #253247;
}

.bell-icon {
	width: 19px;
	height: 21px;
	border: 2px solid #748096;
	border-bottom: 0;
	border-radius: 12px 12px 4px 4px;
	position: relative;
}

.bell-icon::after {
	content: "";
	width: 23px;
	height: 2px;
	position: absolute;
	left: -4px;
	bottom: -3px;
	background: #748096;
	border-radius: 2px;
}

.notification-button {
	position: relative;
}

.notification-badge {
	position: absolute;
	top: 7px;
	right: 18px;
	min-width: 18px;
	height: 18px;
	padding: 0 4px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 9px;
	background: #6737d7;
	color: #fff;
	font-size: 10.5px;
	font-weight: 700;
	font-family: inherit;
	line-height: 1;
	border: 2px solid #fff;
	box-shadow: 0 2px 5px rgba(103, 55, 215, 0.35);
	pointer-events: none;
}

.profile-button {
	min-width: 180px;
	height: 50px;
	gap: 14px;
	padding: 5px 18px 5px 6px;
	color: #0f172a;
	cursor: pointer;
	border: 1px solid #dfe2e8;
	border-radius: 16px;
	background: #fff;
	box-shadow: 0 0 0 4px #f8fafc;
	transition: all 0.15s ease;
	display: flex;
	align-items: center;
}

.profile-button strong {
	font-size: 17px;
	font-weight: 800;
	color: #0f172a;
	letter-spacing: -0.3px;
	font-family: inherit;
}

.avatar {
	width: 38px;
	height: 38px;
	display: grid;
	place-items: center;
	border-radius: 12px;
	color: #ffffff;
	background: linear-gradient(135deg, #c48b71 0%, #a86c55 46%, #283040 47%, #1e2533 100%);
	font-size: 18px;
	font-weight: 800;
	flex-shrink: 0;
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.profile-chevron {
	color: #64748b;
	margin-left: auto;
	transition: transform 0.2s ease, color 0.15s ease;
}

.profile-button:hover .profile-chevron {
	color: #0f172a;
}


.mobile-menu-btn,
.sidebar-toggle-btn {
	width: 44px;
	height: 44px;
	border-radius: 12px;
	border: 1px solid #dfe2e8;
	background: #fff;
	color: #334155;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.15s ease;
	flex-shrink: 0;
}

.mobile-menu-btn:hover,
.sidebar-toggle-btn:hover {
	background: #f1f5f9;
	color: #8751ff;
	border-color: #cbd5e1;
}

:global([data-theme="dark"] .mobile-menu-btn),
:global([data-theme="dark"] .sidebar-toggle-btn) {
	background: #111827 !important;
	border-color: #1f293d !important;
	color: #f8fafc !important;
}

:global([data-theme="dark"] .mobile-menu-btn:hover),
:global([data-theme="dark"] .sidebar-toggle-btn:hover) {
	background: #1a2234 !important;
	color: #a78bfa !important;
}

@media (max-width: 992px) {
	.dashboard-navbar {
		padding: 12px 16px;
		min-height: 64px;
	}

	.search-field {
		width: 180px;
		min-width: 140px;
		height: 44px;
	}

	.utility-actions,
	.profile-button {
		min-height: 44px;
	}

	.icon-button {
		width: 50px;
		height: 42px;
	}

	.profile-button {
		min-width: 0;
		padding: 4px 12px 4px 6px;
		font-size: 15px;
	}

	.avatar {
		width: 32px;
		height: 32px;
		font-size: 14px;
	}
}

@media (max-width: 576px) {
	.dashboard-navbar {
		padding: 10px 12px;
	}

	.search-field {
		display: none;
	}

	.profile-button {
		padding: 4px;
		border-radius: 12px;
	}
}

:global([data-theme="dark"] .utility-actions),
:global([data-theme="dark"] .profile-button) {
	background: #111827 !important;
	border-color: #1f293d !important;
	box-shadow: 0 0 0 4px #0b0f19 !important;
	color: #f8fafc !important;
}

:global([data-theme="dark"] .profile-button strong) {
	color: #f8fafc !important;
}

:global([data-theme="dark"] .profile-chevron) {
	color: #94a3b8 !important;
}

:global([data-theme="dark"] .icon-button) {
	border-right-color: #1f293d !important;
	color: #cbd5e1 !important;
}

:global([data-theme="dark"] .icon-button:hover),
:global([data-theme="dark"] .profile-button:hover) {
	background: #1a2234 !important;
}

:global([data-theme="dark"] .notification-badge) {
	border-color: #111827 !important;
}
</style>

