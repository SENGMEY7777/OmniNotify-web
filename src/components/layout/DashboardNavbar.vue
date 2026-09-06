<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import TablerIcon from '@/components/common/TablerIcon.vue'
import { IconLogout2 } from '@tabler/icons-vue'
import NotificationDropdown from './NotificationDropdown.vue'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { get, apiRequest } from '@/services/api'
import { getAvatarUrl, DEFAULT_AVATAR } from '@/utils/avatar'
import { initTheme, toggleTheme, isDark } from '@/utils/theme'
import { isSidebarCollapsed, toggleSidebarCollapse, toggleMobileSidebar } from '@/utils/sidebarState'

const router = useRouter()
const notifStore = useNotificationStore()
const authStore = useAuthStore()
const toast = useToastStore()

const showNotifications = ref(false)
const showProfileMenu = ref(false)
const showLogoutModal = ref(false)
const isLoggingOut = ref(false)
const profileMenuRef = ref(null)

const userName = computed(() => authStore.user?.full_name || authStore.user?.name || 'Gustavo')
const userEmail = computed(() => authStore.user?.email || (authStore.user?.role === 'user' ? 'user@omninotify.com' : 'admin@omninotify.com'))
const userRole = computed(() => (authStore.user?.role || 'admin').toUpperCase())
const userInitial = computed(() => (userName.value?.[0] || 'G').toUpperCase())
const userAvatar = computed(() => getAvatarUrl(authStore.user?.avatar_url || authStore.user?.avatar))

function toggleNotifications() {
	showNotifications.value = !showNotifications.value
	if (showNotifications.value) showProfileMenu.value = false
}

function toggleProfileMenu() {
	showProfileMenu.value = !showProfileMenu.value
	if (showProfileMenu.value) showNotifications.value = false
}

function handleLogout() {
	showProfileMenu.value = false
	showLogoutModal.value = true
}

async function confirmLogout() {
	isLoggingOut.value = true
	try {
		await apiRequest(authStore.isUser ? '/auth/user/logout' : '/auth/admin/logout', { method: 'DELETE' })
	} catch (_) {}

	authStore.clearAuth()
	toast.info('You have been signed out safely.', 'Signed Out')
	showLogoutModal.value = false
	router.push('/login')
}

function handleClickOutside(e) {
	if (profileMenuRef.value && !profileMenuRef.value.contains(e.target)) {
		showProfileMenu.value = false
	}
}

const seenPopupIds = new Set()

function handleLiveNotification(event) {
	// Refresh badge count with slight delay to ensure DB transaction is completed
	setTimeout(() => {
		notifStore.fetchNotifications()
	}, 800)

	// Only show popup for 'new-notification' events (not status-changed)
	if (event.type !== 'new-notification') return

	const n = event?.detail
	if (!n) return

	// If socket.js already showed a toast, skip to avoid duplicate
	if (n._toastShown) return

	// Deduplicate
	const id = n.notification_id || n.id || `${n.title}_${n.body}`
	if (seenPopupIds.has(id)) return
	seenPopupIds.add(id)
	setTimeout(() => seenPopupIds.delete(id), 8000)

	// Show the popup toast (for manually dispatched events, e.g. from ManageNotificationView)
	const isLogin = n.event_type === 'USER_LOGIN' || n.type === 'USER_LOGIN' || String(n.title || '').toLowerCase().includes('security') || String(n.title || '').toLowerCase().includes('login')
	toast.addToast({
		type: isLogin ? 'warning' : (n.priority === 'HIGH' || n.priority === 'CRITICAL' ? 'warning' : 'info'),
		title: n.title || (isLogin ? '🔐 Security Alert: User Login' : '🔔 New Notification'),
		message: n.body || n.message || '',
		duration: 8000,
		sound: true,
	})
}

async function refreshUserProfile() {
	if (!authStore.token) return
	try {
		const res = await get(authStore.isUser ? '/auth/user/me' : '/auth/admin/profile')
		const profile = res?.data || res?.user || res
		if (profile && (profile.email || profile.user_id || profile.id)) {
			authStore.updateUser(profile)
		}
	} catch (_) {}
}

function handleKeyDown(e) {
	if (e.key === 'Escape' && showLogoutModal.value) {
		showLogoutModal.value = false
	}
}

onMounted(() => {
	initTheme()
	refreshUserProfile()
	notifStore.fetchNotifications()
	document.addEventListener('click', handleClickOutside)
	window.addEventListener('new-notification', handleLiveNotification)
	window.addEventListener('notification-status-changed', handleLiveNotification)
	window.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutside)
	window.removeEventListener('new-notification', handleLiveNotification)
	window.removeEventListener('notification-status-changed', handleLiveNotification)
	window.removeEventListener('keydown', handleKeyDown)
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
						<div class="bell-icon-wrapper">
							<TablerIcon name="bell" size="20" />
							<span v-if="notifStore.unreadCount > 0" class="notification-badge" aria-label="Unread notifications count">
								{{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}
							</span>
						</div>
					</button>
				</div>
				<NotificationDropdown
					:is-open="showNotifications"
					@close="showNotifications = false"
				/>
			</div>

			<div class="profile-info" ref="profileMenuRef">
				<button
					class="profile-button"
					:class="{ active: showProfileMenu }"
					type="button"
					aria-label="Open profile menu"
					@click="toggleProfileMenu"
				>
					<img :src="userAvatar" alt="User avatar" class="avatar avatar-img" @error="$event.target.src = DEFAULT_AVATAR" />
					<strong class="d-none d-sm-inline">{{ userName }}</strong>
					<TablerIcon name="chevron-down" size="18" class="profile-chevron d-none d-sm-inline" :class="{ rotated: showProfileMenu }" />
				</button>

				<!-- Profile Dropdown Popup -->
				<transition name="dropdown-anim">
					<div v-if="showProfileMenu" class="profile-dropdown-menu">
						<div class="profile-dropdown-header">
							<img :src="userAvatar" alt="User avatar" class="avatar header-avatar avatar-img" @error="$event.target.src = DEFAULT_AVATAR" />
							<div class="user-meta">
								<h5 class="user-fullname">{{ userName }}</h5>
								<p class="user-email">{{ userEmail }}</p>
								<span class="user-role-badge">{{ userRole }}</span>
							</div>
						</div>
						<div class="profile-dropdown-divider"></div>
						<div class="profile-dropdown-body">
							<RouterLink :to="authStore.isUser ? { name: 'user-profile' } : { name: 'setting' }" class="profile-dropdown-item" @click="showProfileMenu = false">
								<TablerIcon name="settings" size="18" />
								<span>Settings</span>
							</RouterLink>
							<RouterLink v-if="authStore.isAdmin" to="/admin/manage-user" class="profile-dropdown-item" @click="showProfileMenu = false">
								<TablerIcon name="users" size="18" />
								<span>Manage Users</span>
							</RouterLink>
							<button type="button" class="profile-dropdown-item" @click="toggleTheme(); showProfileMenu = false">
								<TablerIcon :name="isDark ? 'sun' : 'moon'" size="18" />
								<span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
							</button>
						</div>
						<div class="profile-dropdown-divider"></div>
						<div class="profile-dropdown-footer">
							<button type="button" class="profile-dropdown-item logout-item" @click="handleLogout">
								<TablerIcon name="logout" size="18" />
								<span>Sign Out</span>
							</button>
						</div>
					</div>
				</transition>
			</div>

		</div>

		<!-- Logout Confirmation Modal (Matches Sidebar Admin Design) -->
		<teleport to="body">
			<transition name="modal-fade">
				<div v-if="showLogoutModal" class="logout-modal-backdrop" @click.self="showLogoutModal = false">
					<div class="logout-modal-dialog-box" role="dialog" aria-modal="true" aria-labelledby="logout-title">
						<div class="logout-modal-icon-badge">
							<IconLogout2 :size="28" :stroke-width="2.2" />
						</div>
						<h3 id="logout-title" class="logout-modal-title">Sign Out</h3>
						<p class="logout-modal-desc">Are you sure you want to log out of your session? You will need to sign in again to access the dashboard.</p>
						<div class="logout-modal-actions">
							<button type="button" class="btn-cancel" :disabled="isLoggingOut" @click="showLogoutModal = false">
								Cancel
							</button>
							<button type="button" class="btn-confirm-logout" :disabled="isLoggingOut" @click="confirmLogout">
								<span v-if="isLoggingOut" class="btn-spinner" aria-hidden="true"></span>
								<span>{{ isLoggingOut ? 'Logging out...' : 'Yes, Log Out' }}</span>
							</button>
						</div>
					</div>
				</div>
			</transition>
		</teleport>
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
	overflow: visible;
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

.bell-icon-wrapper {
	position: relative;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.notification-badge {
	position: absolute;
	top: -6px;
	right: -8px;
	min-width: 18px;
	height: 18px;
	padding: 0 4px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border-radius: 9px;
	background: #6737d7;
	color: #fff;
	font-size: 10px;
	font-weight: 700;
	font-family: inherit;
	line-height: 1;
	border: 2px solid #fff;
	box-shadow: 0 2px 5px rgba(103, 55, 215, 0.35);
	pointer-events: none;
	z-index: 2;
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
	width: 40px;
	height: 40px;
	display: grid;
	place-items: center;
	border-radius: 50%;
	color: #ffffff;
	background: linear-gradient(135deg, #c48b71 0%, #a86c55 46%, #283040 47%, #1e2533 100%);
	font-size: 18px;
	font-weight: 800;
	flex-shrink: 0;
	box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

img.avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
	object-fit: cover;
	background: #f1f5f9;
	display: block;
}

.profile-info {
	position: relative;
}

.profile-chevron {
	color: #64748b;
	margin-left: auto;
	transition: transform 0.2s ease, color 0.15s ease;
}

.profile-chevron.rotated {
	transform: rotate(180deg);
}

.profile-button:hover .profile-chevron {
	color: #0f172a;
}

/* Profile Dropdown Popup */
.profile-dropdown-menu {
	position: absolute;
	top: calc(100% + 10px);
	right: 0;
	width: 260px;
	background: #ffffff;
	border-radius: 18px;
	border: 1px solid #eef0f5;
	box-shadow: 0 16px 36px -8px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04);
	padding: 12px;
	z-index: 9999;
}

.profile-dropdown-header {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 8px 10px 12px;
}

.header-avatar {
	width: 44px;
	height: 44px;
	font-size: 20px;
	border-radius: 14px;
}

.user-meta {
	flex: 1;
	min-width: 0;
}

.user-fullname {
	margin: 0 0 2px;
	font-size: 15px;
	font-weight: 700;
	color: #0f172a;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.user-email {
	margin: 0 0 4px;
	font-size: 12px;
	color: #64748b;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.user-role-badge {
	display: inline-block;
	padding: 2px 8px;
	font-size: 10.5px;
	font-weight: 700;
	letter-spacing: 0.04em;
	color: #6737d7;
	background: #ede9fe;
	border-radius: 6px;
}

.profile-dropdown-divider {
	height: 1px;
	background: #eef0f5;
	margin: 6px 0;
}

.profile-dropdown-body,
.profile-dropdown-footer {
	display: flex;
	flex-direction: column;
	gap: 2px;
}

.profile-dropdown-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 10px 12px;
	border-radius: 10px;
	font-size: 14px;
	font-weight: 600;
	color: #334155;
	text-decoration: none;
	background: transparent;
	border: 0;
	width: 100%;
	text-align: left;
	cursor: pointer;
	transition: all 0.15s ease;
}

.profile-dropdown-item:hover {
	background: #f8fafc;
	color: #6737d7;
}

.profile-dropdown-item.logout-item {
	color: #ef4444;
}

.profile-dropdown-item.logout-item:hover {
	background: #fef2f2;
	color: #dc2626;
}

/* Animations */
.dropdown-anim-enter-active {
	transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.dropdown-anim-leave-active {
	transition: all 0.15s ease-in;
}

.dropdown-anim-enter-from {
	opacity: 0;
	transform: translateY(-8px) scale(0.96);
}

.dropdown-anim-leave-to {
	opacity: 0;
	transform: translateY(-4px) scale(0.98);
}

/* Dark Mode Overrides */
:global([data-theme="dark"] .profile-dropdown-menu) {
	background: #111827 !important;
	border-color: #1f293d !important;
	box-shadow: 0 16px 36px -8px rgba(0, 0, 0, 0.5) !important;
}

:global([data-theme="dark"] .user-fullname) {
	color: #f8fafc !important;
}

:global([data-theme="dark"] .user-email) {
	color: #94a3b8 !important;
}

:global([data-theme="dark"] .profile-dropdown-divider) {
	background: #1f293d !important;
}

:global([data-theme="dark"] .profile-dropdown-item) {
	color: #cbd5e1 !important;
}

:global([data-theme="dark"] .profile-dropdown-item:hover) {
	background: #1a2234 !important;
	color: #c084fc !important;
}

:global([data-theme="dark"] .profile-dropdown-item.logout-item) {
	color: #f87171 !important;
}

:global([data-theme="dark"] .profile-dropdown-item.logout-item:hover) {
	background: #450a0a !important;
	color: #fca5a5 !important;
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

/* Logout Modal (Matches Sidebar Design) */
.logout-modal-backdrop {
	position: fixed;
	inset: 0;
	z-index: 9999;
	background: rgba(15, 23, 42, 0.5);
	backdrop-filter: blur(6px);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 20px;
}

.logout-modal-dialog-box {
	width: 100%;
	max-width: 400px;
	background: #ffffff;
	border-radius: 20px;
	padding: 30px 24px 24px;
	text-align: center;
	box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);
}

:global([data-theme="dark"] .logout-modal-dialog-box) {
	background: #111827 !important;
	border: 1px solid #1f293d;
}

.logout-modal-icon-badge {
	width: 56px;
	height: 56px;
	margin: 0 auto 16px;
	border-radius: 50%;
	background: #fff1f2;
	color: #f43f5e;
	display: flex;
	align-items: center;
	justify-content: center;
}

.logout-modal-title {
	font-size: 20px;
	font-weight: 800;
	color: #0f172a;
	margin: 0 0 8px;
}

:global([data-theme="dark"] .logout-modal-title) {
	color: #f8fafc !important;
}

.logout-modal-desc {
	font-size: 13.5px;
	color: #64748b;
	line-height: 1.55;
	margin: 0 0 22px;
}

:global([data-theme="dark"] .logout-modal-desc) {
	color: #94a3b8 !important;
}

.logout-modal-actions {
	display: flex;
	gap: 10px;
}

.btn-cancel,
.btn-confirm-logout {
	flex: 1;
	height: 44px;
	border-radius: 12px;
	font-size: 14px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.15s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-cancel {
	background: #f1f5f9;
	border: 0;
	color: #475569;
}

.btn-cancel:hover:not(:disabled) {
	background: #e2e8f0;
	color: #1e293b;
}

:global([data-theme="dark"] .btn-cancel) {
	background: #1e293b !important;
	color: #cbd5e1 !important;
}

.btn-confirm-logout {
	background: #f43f5e;
	border: 0;
	color: #ffffff;
	box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
}

.btn-confirm-logout:hover:not(:disabled) {
	background: #e11d48;
}

.btn-spinner {
	width: 15px;
	height: 15px;
	border: 2px solid rgba(255, 255, 255, 0.35);
	border-top-color: #ffffff;
	border-radius: 50%;
	display: inline-block;
	animation: spin 0.65s linear infinite;
	margin-right: 6px;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
	transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
	opacity: 0;
}
</style>
