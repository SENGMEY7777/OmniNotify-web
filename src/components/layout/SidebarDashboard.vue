<template>
	<aside
		class="sidebar-rail d-flex flex-column"
		:class="{
			'is-collapsed': isSidebarCollapsed,
			'is-expanded': !isSidebarCollapsed,
			'is-mobile-open': isMobileSidebarOpen
		}"
	>
		<!-- Top Section: Brand / Theme -->
		<div class="rail-top">
						<RouterLink v-if="isAdmin" class="rail-brand d-flex align-items-center gap-3" :to="{ name: 'admin-dashboard' }" aria-label="Fundex home" @click="closeMobileSidebar">
							<div class="brand-mark" aria-hidden="true"><i class="brand-mark-shape"></i></div>
							<span v-if="!isSidebarCollapsed" class="brand-name">Fundex</span>
						</RouterLink>
						<RouterLink v-else class="rail-brand d-flex align-items-center gap-3" :to="{ name: 'user-dashboard' }" aria-label="Fundex home" @click="closeMobileSidebar">
							<div class="brand-mark" aria-hidden="true"><i class="brand-mark-shape"></i></div>
							<span v-if="!isSidebarCollapsed" class="brand-name">Fundex</span>
						</RouterLink>
		</div>

		<!-- Navigation Icons -->
		<nav class="rail-nav" aria-label="Main navigation">
			<ul class="rail-list">
				<!-- Dashboard -->
				<li class="rail-item">
					<RouterLink
						class="rail-link"
						active-class="active"
						exact-active-class="active"
						:to="{ name: isAdmin ? 'admin-dashboard' : 'user-dashboard' }"
						@click="closeMobileSidebar"
					>
						<div class="icon-box">
							<TablerIcon name="home" size="22" />
						</div>
						<span v-if="!isSidebarCollapsed" class="link-text">Dashboard</span>
						<span v-if="isSidebarCollapsed" class="rail-tooltip">Dashboard</span>
					</RouterLink>
				</li>

				<!-- Notifications -->
				<li class="rail-item">
					<RouterLink
						class="rail-link"
						active-class="active"
						:to="{ name: isAdmin ? 'notification' : 'user-notification' }"
						@click="closeMobileSidebar"
					>
						<div class="icon-box">
							<TablerIcon name="bell" size="22" />
							<span v-if="isSidebarCollapsed && notifStore.unreadCount > 0" class="rail-badge">
								{{ notifStore.unreadCount > 9 ? '9+' : notifStore.unreadCount }}
							</span>
						</div>
						<span v-if="!isSidebarCollapsed" class="link-text">Notifications</span>
						<span v-if="!isSidebarCollapsed && notifStore.unreadCount > 0" class="expanded-badge">
							{{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}
						</span>
						<span v-if="isSidebarCollapsed" class="rail-tooltip">Notifications</span>
					</RouterLink>
				</li>

				<!-- Templates -->
				<li v-if="isAdmin" class="rail-item">
					<RouterLink
						class="rail-link"
						active-class="active"
						:to="{ name: 'template' }"
						@click="closeMobileSidebar"
					>
						<div class="icon-box">
							<TablerIcon name="template" size="22" />
						</div>
						<span v-if="!isSidebarCollapsed" class="link-text">Templates</span>
						<span v-if="isSidebarCollapsed" class="rail-tooltip">Templates</span>
					</RouterLink>
				</li>

				<li v-if="!isAdmin" class="rail-item">
					<RouterLink class="rail-link" active-class="active" :to="{ name: 'user-profile' }" @click="closeMobileSidebar">
						<div class="icon-box"><TablerIcon name="user" size="22" /></div>
						<span v-if="!isSidebarCollapsed" class="link-text">My Profile</span>
						<span v-if="isSidebarCollapsed" class="rail-tooltip">My Profile</span>
					</RouterLink>
				</li>

				<li v-if="!isAdmin" class="rail-item">
					<button
						type="button"
						class="rail-link rail-link-btn"
						aria-label="Link Telegram"
						@click="openTelegramModal"
					>
						<div class="icon-box">
							<IconBrandTelegram :size="22" />
						</div>
						<span v-if="!isSidebarCollapsed" class="link-text">Link Telegram</span>
						<span v-if="isSidebarCollapsed" class="rail-tooltip">Link Telegram</span>
					</button>
				</li>

				<!-- Users -->
				<li v-if="isAdmin" class="rail-item">
					<RouterLink
						class="rail-link"
						active-class="active"
						:to="{ name: 'manage-user' }"
						@click="closeMobileSidebar"
					>
						<div class="icon-box">
							<TablerIcon name="user" size="22" />
						</div>
						<span v-if="!isSidebarCollapsed" class="link-text">Users</span>
						<span v-if="isSidebarCollapsed" class="rail-tooltip">Users</span>
					</RouterLink>
				</li>

				<!-- Delivery Logs -->
				<li v-if="isAdmin" class="rail-item">
					<RouterLink
						class="rail-link"
						active-class="active"
						:to="{ name: 'delivery-log' }"
						@click="closeMobileSidebar"
					>
						<div class="icon-box">
							<TablerIcon name="clipboard" size="22" />
						</div>
						<span v-if="!isSidebarCollapsed" class="link-text">Delivery Logs</span>
						<span v-if="isSidebarCollapsed" class="rail-tooltip">Delivery Logs</span>
					</RouterLink>
				</li>

				<!-- Audit Logs -->
				<li v-if="isAdmin" class="rail-item">
					<RouterLink
						class="rail-link"
						active-class="active"
						:to="{ name: 'audit-log' }"
						@click="closeMobileSidebar"
					>
						<div class="icon-box">
							<TablerIcon name="shield-lock" size="22" />
						</div>
						<span v-if="!isSidebarCollapsed" class="link-text">Audit Logs</span>
						<span v-if="isSidebarCollapsed" class="rail-tooltip">Audit Logs</span>
					</RouterLink>
				</li>

				<!-- Settings -->
				<li v-if="isAdmin" class="rail-item">
					<RouterLink
						class="rail-link"
						active-class="active"
						:to="{ name: 'setting' }"
						@click="closeMobileSidebar"
					>
						<div class="icon-box">
							<TablerIcon name="settings" size="22" />
						</div>
						<span v-if="!isSidebarCollapsed" class="link-text">Settings</span>
						<span v-if="isSidebarCollapsed" class="rail-tooltip">Settings</span>
					</RouterLink>
				</li>
			</ul>
		</nav>

		<!-- Upgrade Section -->
		<div v-if="!isSidebarCollapsed" class="sidebar-upgrade-wrapper">
			<div class="upgrade-card">
				<div class="upgrade-title-row">
					<div class="upgrade-icon-badge">
						<TablerIcon name="bolt" size="18" />
					</div>
					<p class="upgrade-title">Upgrade to pro</p>
				</div>
				<p class="upgrade-desc">Get unlimited budget setup and more powerful features. Upgrade today.</p>
				<button type="button" class="btn-upgrade" @click="handleUpgrade">Upgrade</button>
			</div>
		</div>

		<div v-else class="rail-item upgrade-rail-item">
			<button
				class="rail-link upgrade-btn-collapsed"
				type="button"
				aria-label="Upgrade to Pro"
				@click="handleUpgrade"
			>
				<div class="icon-box">
					<TablerIcon name="bolt" size="22" />
				</div>
				<span class="rail-tooltip">Upgrade to Pro</span>
			</button>
		</div>

		<!-- Bottom Section: Log Out -->
		<div class="rail-bottom">
			<div class="rail-item">
				<button
					class="rail-link logout-btn"
					type="button"
					aria-label="Log Out"
					@click="showLogoutModal = true"
				>
					<div class="icon-box">
						<TablerIcon name="logout" size="22" />
					</div>
					<span v-if="!isSidebarCollapsed" class="link-text">Log Out</span>
					<span v-if="isSidebarCollapsed" class="rail-tooltip">Log Out</span>
				</button>
			</div>
		</div>

		<!-- Logout Confirmation Modal -->
		<teleport to="body">
			<transition name="modal-fade">
				<div v-if="showLogoutModal" class="modal-backdrop" @click.self="showLogoutModal = false">
					<div class="modal-dialog-box" role="dialog" aria-modal="true" aria-labelledby="logout-title">
						<div class="modal-icon-badge">
							<IconLogout2 :size="28" :stroke-width="2.2" />
						</div>
						<h3 id="logout-title" class="modal-title">Sign Out</h3>
						<p class="modal-desc">Are you sure you want to log out of your session? You will need to sign in again to access the dashboard.</p>
						<div class="modal-actions">
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

		<!-- Telegram Link Modal -->
		<teleport to="body">
			<transition name="modal-fade">
				<div v-if="showTelegramModal" class="modal-backdrop" @click.self="showTelegramModal = false">
					<div class="modal-dialog-box modal-telegram-box" role="dialog" aria-modal="true" aria-labelledby="telegram-modal-title">
						<div class="modal-icon-badge telegram-badge">
							<IconBrandTelegram :size="30" :stroke-width="2" />
						</div>
						<h3 id="telegram-modal-title" class="modal-title">Connect Telegram Bot</h3>
						<p class="modal-desc">
							Link your Telegram account to receive real-time banking alerts, transfer updates, and instant OTP security codes.
						</p>

						<!-- Telegram Connect Steps -->
						<div v-if="telegramLink" class="telegram-link-card">
							<div class="step-row">
								<span class="step-badge">1</span>
								<span class="step-label">Open bot with your secure link:</span>
							</div>

							<div class="telegram-url-input-wrap">
								<input
									type="text"
									readonly
									:value="telegramLink"
									class="telegram-url-input"
									@click="$event.target.select()"
								/>
								<button
									type="button"
									class="btn-copy-link"
									@click="copyTelegramLink"
								>
									{{ copied ? 'Copied!' : 'Copy' }}
								</button>
							</div>

							<div class="step-row mt-2">
								<span class="step-badge">2</span>
								<span class="step-label">Press <strong>Start</strong> in Telegram to activate!</span>
							</div>
						</div>

						<p v-if="telegramError" class="alert alert-danger p-2 small mt-2">{{ telegramError }}</p>

						<div class="modal-actions mt-4">
							<button type="button" class="btn-cancel" @click="showTelegramModal = false">
								Close
							</button>
							<button
								v-if="telegramLink"
								type="button"
								class="btn-telegram-primary"
								@click="openTelegramBot"
							>
								<IconBrandTelegram :size="18" />
								<span>Open in Telegram</span>
							</button>
							<button
								v-else
								type="button"
								class="btn-telegram-primary"
								:disabled="telegramLoading"
								@click="generateTelegramLink"
							>
								<span v-if="telegramLoading" class="btn-spinner" aria-hidden="true"></span>
								<span>{{ telegramLoading ? 'Connecting...' : 'Generate Link' }}</span>
							</button>
						</div>
					</div>
				</div>
			</transition>
		</teleport>
	</aside>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { IconBrandTelegram, IconLogout2 } from '@tabler/icons-vue'
import TablerIcon from '@/components/common/TablerIcon.vue'
import { apiRequest } from '@/services/api'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useNotificationStore } from '@/stores/notification'
import { removeCookie } from '@/utils/cookies'
import { isSidebarCollapsed, isMobileSidebarOpen, closeMobileSidebar } from '@/utils/sidebarState'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const notifStore = useNotificationStore()

const showLogoutModal = ref(false)
const isLoggingOut = ref(false)
const showTelegramModal = ref(false)
const telegramLoading = ref(false)
const telegramLink = ref('')
const telegramError = ref('')
const copied = ref(false)

const isAdmin = computed(() => authStore.user?.role === 'admin')

async function openTelegramModal() {
	closeMobileSidebar()
	showTelegramModal.value = true
	telegramError.value = ''
	if (!telegramLink.value) {
		await generateTelegramLink()
	}
}

async function generateTelegramLink() {
	telegramLoading.value = true
	telegramError.value = ''
	try {
		const res = await apiRequest('/auth/user/telegram/link', { method: 'POST' })
		const data = res?.data || res || {}
		if (data.link) {
			telegramLink.value = data.link
		} else {
			telegramError.value = 'Could not generate Telegram link. Please try again.'
		}
	} catch (err) {
		telegramError.value = err.message || 'Failed to generate Telegram link.'
	} finally {
		telegramLoading.value = false
	}
}

function openTelegramBot() {
	if (telegramLink.value) {
		window.open(telegramLink.value, '_blank')
		toast.success('Opening Telegram bot!')
	}
}

async function copyTelegramLink() {
	if (!telegramLink.value) return
	try {
		await navigator.clipboard.writeText(telegramLink.value)
		copied.value = true
		toast.success('Telegram link copied to clipboard!')
		setTimeout(() => { copied.value = false }, 3000)
	} catch (_) {
		toast.info('Link ready to copy.')
	}
}

function handleUpgrade() {
	toast.info('Pro plan upgrades and billing features are coming soon.', 'Upgrade to Pro')
}

async function confirmLogout() {
	try {
		isLoggingOut.value = true
		try {
			await apiRequest(isAdmin.value ? '/auth/admin/logout' : '/auth/user/logout', { method: 'DELETE' })
		} catch (_) {}

		authStore.clearAuth()
		removeCookie('token')
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		sessionStorage.clear()

		toast.info('You have been logged out safely.', 'Signed Out')

		showLogoutModal.value = false
		router.push({ name: 'login' })
	} catch (err) {
		// Handle error
	} finally {
		isLoggingOut.value = false
	}
}

function handleKeyDown(e) {
	if (e.key === 'Escape' && showLogoutModal.value) {
		showLogoutModal.value = false
	}
}

onMounted(() => {
	window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
	window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.sidebar-rail {
	height: 100dvh;
	background: #ffffff;
	border-right: 1px solid #e3e5e9;
	display: flex;
	flex-direction: column;
	z-index: 100;
	transition: width 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease, border-color 0.25s ease, transform 0.3s ease;
	position: relative;
	user-select: none;
}

/* Collapsed State (Compact Rail) */
.sidebar-rail.is-collapsed {
	width: 80px;
	min-width: 80px;
	align-items: center;
	padding: 20px 0 24px;
}

.sidebar-rail.is-collapsed .rail-top {
	justify-content: center;
	margin-bottom: 24px;
}

.sidebar-rail.is-collapsed .rail-link {
	width: 52px;
	height: 52px;
	border-radius: 14px;
	justify-content: center;
}

/* Expanded State (Full Sidebar) */
.sidebar-rail.is-expanded {
	width: 250px;
	min-width: 250px;
	align-items: stretch;
	padding: 20px 16px 24px;
}

.sidebar-rail.is-expanded .rail-top {
	justify-content: flex-start;
	padding: 0 8px;
	margin-bottom: 24px;
}

.sidebar-rail.is-expanded .rail-list {
	padding: 4px 6px;
	gap: 10px;
}


.sidebar-rail.is-expanded .rail-brand {
	display: flex;
	align-items: center;
	gap: 12px;
}

.sidebar-rail.is-expanded .brand-name {
	font-size: 22px;
	font-weight: 800;
	color: #0f172a;
	letter-spacing: -0.5px;
	white-space: nowrap;
}

.sidebar-rail.is-expanded .rail-link {
	width: 100%;
	height: 50px;
	padding: 0 16px;
	border-radius: 14px;
	justify-content: flex-start;
	gap: 14px;
	color: #64748b;
}

.sidebar-rail.is-expanded .icon-box {
	width: 24px;
	height: 24px;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sidebar-rail.is-expanded .link-text {
	font-size: 15px;
	font-weight: 500;
	color: #374151;
	flex: 1;
	text-align: left;
	white-space: nowrap;
}

.sidebar-rail.is-expanded .expanded-badge {
	min-width: 26px;
	height: 26px;
	padding: 0 8px;
	border-radius: 999px;
	font-size: 12px;
	font-weight: 700;
	background: #7c3aed;
	color: #ffffff;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	margin-left: auto;
}

.sidebar-rail.is-expanded .rail-link.active {
	border-radius: 14px;
}

.sidebar-rail.is-expanded .rail-link.active .expanded-badge {
	background: #6b35f2;
	color: #ffffff;
}

.sidebar-rail.is-expanded .rail-link.active .link-text {
	color: #6b35f2;
	font-weight: 700;
}



:global([data-theme="dark"] .sidebar-rail.is-expanded .brand-name) {
	color: #f8fafc !important;
}

/* Brand */
.rail-top {
	display: flex;
	align-items: center;
}


.rail-brand {
	display: inline-block;
	text-decoration: none;
	transition: transform 0.2s ease;
}

.rail-brand:hover {
	transform: scale(1.08);
}

.brand-mark {
	width: 44px;
	height: 44px;
	position: relative;
	display: block;
	overflow: hidden;
	border-radius: 12px;
	background: linear-gradient(135deg, #8751ff 0%, #6366f1 100%);
	box-shadow: 0 4px 14px rgba(135, 81, 255, 0.35);
}

.brand-mark::before,
.brand-mark::after,
.brand-mark-shape {
	content: "";
	position: absolute;
	background: #fff;
}

.brand-mark::before {
	width: 14px;
	height: 14px;
	top: 6px;
	left: 15px;
	border-radius: 50%;
}

.brand-mark::after {
	width: 12px;
	height: 12px;
	top: 5px;
	right: 4px;
}

.brand-mark-shape {
	width: 23px;
	height: 10px;
	right: 0;
	bottom: 11px;
	transform: rotate(42deg);
}

/* Nav */
.rail-nav {
	flex: 1;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.rail-list {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12px;
	width: 100%;
}

.rail-item {
	position: relative;
	display: flex;
	justify-content: center;
	width: 100%;
}

.rail-link {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 52px;
	height: 52px;
	border-radius: 14px;
	background: transparent;
	border: 0;
	color: #64748b;
	text-decoration: none;
	cursor: pointer;
	position: relative;
	transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.icon-box {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 100%;
	height: 100%;
}

.rail-link:hover:not(.active) {
	background: #f1f5f9;
	color: #0f172a;
	transform: translateY(-1px);
}

/* Active State */
.rail-link.active {
	background: #F4EFFF;
	border: none;
	color: #6b35f2 !important;
	font-weight: 700;
	box-shadow: none;
}


.rail-link.active .link-text {
	color: #6b35f2 !important;
	font-weight: 700;
	font-size: 15.5px;
}

.rail-link.active .tabler-icon {
	stroke: #6b35f2 !important;
	stroke-width: 2.2;
}




/* Notification badge */
.rail-badge {
	position: absolute;
	top: 4px;
	right: 4px;
	min-width: 16px;
	height: 16px;
	padding: 0 4px;
	font-size: 10px;
	font-weight: 700;
	background: #ef4444;
	color: #ffffff;
	border-radius: 999px;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2px solid #ffffff;
}

.rail-link.active .rail-badge {
	border-color: #7c3aed;
}

/* 🏷️ Floating Hover Tooltip */
.rail-tooltip {
	position: absolute;
	left: calc(100% + 12px);
	top: 50%;
	transform: translateY(-50%) translateX(-8px);
	background: #0f172a;
	color: #ffffff;
	padding: 6px 14px;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 600;
	letter-spacing: 0.01em;
	white-space: nowrap;
	pointer-events: none;
	opacity: 0;
	box-shadow: 0 8px 24px -4px rgba(15, 23, 42, 0.3);
	transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
	z-index: 1060;
}

/* Arrow indicator on tooltip */
.rail-tooltip::before {
	content: "";
	position: absolute;
	right: 100%;
	top: 50%;
	transform: translateY(-50%);
	border-width: 5px;
	border-style: solid;
	border-color: transparent #0f172a transparent transparent;
}

.rail-link:hover .rail-tooltip {
	opacity: 1;
	transform: translateY(-50%) translateX(0);
}

/* ⚡ Upgrade Card (Expanded) */
.sidebar-upgrade-wrapper {
	width: 100%;
	padding: 0;
	margin: 16px 0 8px;
}

.upgrade-card {
	padding: 22px 20px 20px;
	border-radius: 18px;
	background: linear-gradient(145deg, #1e1b4b 0%, #312070 50%, #4c1d95 100%);
	color: #ffffff;
	position: relative;
	overflow: hidden;
}

.upgrade-title-row {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 10px;
}

.upgrade-icon-badge {
	width: 28px;
	height: 28px;
	border-radius: 8px;
	background: rgba(251, 191, 36, 0.25);
	color: #fbbf24;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.upgrade-title {
	font-size: 16px;
	font-weight: 700;
	color: #ffffff;
	margin: 0;
	letter-spacing: -0.2px;
}

.upgrade-desc {
	font-size: 12.5px;
	line-height: 1.55;
	color: #a5b4fc;
	margin: 0 0 18px;
}

.btn-upgrade {
	width: 100%;
	height: 42px;
	border-radius: 999px;
	border: 0;
	background: #ffffff;
	color: #1e1b4b;
	font-size: 14px;
	font-weight: 700;
	cursor: pointer;
	transition: all 0.15s ease;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-upgrade:hover {
	background: #f0eeff;
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}


/* ⚡ Upgrade Button (Collapsed Rail) */
.upgrade-rail-item {
	margin: 6px 0;
}

.upgrade-btn-collapsed {
	background: rgba(251, 191, 36, 0.12) !important;
	color: #d97706 !important;
}

.upgrade-btn-collapsed:hover {
	background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
	color: #ffffff !important;
	box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
}

/* Bottom */
.rail-bottom {
	margin-top: auto;
	width: 100%;
	display: flex;
	justify-content: center;
}

.logout-btn {
	background: transparent !important;
	color: #ef4444 !important;
}

.logout-btn .link-text {
	color: #ef4444 !important;
}

.logout-btn .tabler-icon {
	stroke: #ef4444 !important;
}


.logout-btn:hover {
	background: #fef2f2 !important;
	color: #dc2626 !important;
	transform: translateY(-1px);
	box-shadow: none;
}

.logout-btn:hover .tabler-icon {
	stroke: #dc2626 !important;
}




/* 🌙 Dark Mode */
:global([data-theme="dark"] .sidebar-rail) {
	background: #111827 !important;
	border-right-color: #1f293d !important;
}

:global([data-theme="dark"] .upgrade-card) {
	background: linear-gradient(145deg, #0b0f19 0%, #1e153b 55%, #35105e 100%) !important;
	border: 1px solid rgba(135, 81, 255, 0.25);
	box-shadow: 0 10px 24px -6px rgba(0, 0, 0, 0.5) !important;
}

:global([data-theme="dark"] .upgrade-btn-collapsed) {
	background: rgba(251, 191, 36, 0.15) !important;
	color: #fbbf24 !important;
}


:global([data-theme="dark"] .rail-link) {
	color: #94a3b8 !important;
}

:global([data-theme="dark"] .rail-link:hover:not(.active)) {
	background: #1a2234 !important;
	color: #f8fafc !important;
}

:global([data-theme="dark"] .rail-link.active) {
	background: rgba(139, 92, 246, 0.15) !important;
	border: none !important;
	color: #a78bfa !important;
	box-shadow: none !important;
}

:global([data-theme="dark"] .rail-link.active .link-text) {
	color: #a78bfa !important;
	font-weight: 700 !important;
}

:global([data-theme="dark"] .rail-link.active .tabler-icon) {
	stroke: #a78bfa !important;
}



:global([data-theme="dark"] .rail-tooltip) {
	background: #1e293b !important;
	color: #f8fafc !important;
	border: 1px solid #334155;
}

:global([data-theme="dark"] .rail-tooltip::before) {
	border-color: transparent #334155 transparent transparent;
}

:global([data-theme="dark"] .logout-btn) {
	background: transparent !important;
	color: #f87171 !important;
}

:global([data-theme="dark"] .logout-btn .tabler-icon) {
	stroke: #f87171 !important;
}

:global([data-theme="dark"] .logout-btn:hover) {
	background: rgba(239, 68, 68, 0.12) !important;
	color: #fca5a5 !important;
}

:global([data-theme="dark"] .logout-btn:hover .tabler-icon) {
	stroke: #fca5a5 !important;
}




/* 📱 Responsive Mobile Drawer */
@media (max-width: 992px) {
	.sidebar-rail {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		width: 260px !important;
		min-width: 260px !important;
		align-items: stretch !important;
		padding: 20px 16px 24px !important;
		z-index: 1050;
		transform: translateX(-100%);
	}

	.sidebar-rail.is-mobile-open {
		transform: translateX(0);
		box-shadow: 10px 0 40px rgba(0, 0, 0, 0.35);
	}

	.sidebar-rail .rail-top {
		justify-content: flex-start !important;
		padding: 0 8px !important;
	}

	.sidebar-rail .rail-brand {
		display: flex !important;
		align-items: center !important;
		gap: 12px !important;
	}

	.sidebar-rail .brand-name {
		display: inline-block !important;
		font-size: 22px;
		font-weight: 800;
		color: #0f172a;
	}

	.sidebar-rail .rail-link {
		width: 100% !important;
		height: 48px !important;
		padding: 0 14px !important;
		border-radius: 12px !important;
		justify-content: flex-start !important;
		gap: 12px !important;
	}

	.sidebar-rail .icon-box {
		width: 24px !important;
		height: 24px !important;
		flex-shrink: 0 !important;
	}

	.sidebar-rail .link-text {
		display: inline-block !important;
		font-size: 14.5px !important;
		font-weight: 600 !important;
		flex: 1 !important;
		text-align: left !important;
	}

	.sidebar-rail .rail-tooltip {
		display: none !important;
	}
}


/* Logout Modal */
.modal-backdrop {
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

.modal-dialog-box {
	width: 100%;
	max-width: 400px;
	background: #ffffff;
	border-radius: 20px;
	padding: 30px 24px 24px;
	text-align: center;
	box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25);
}

:global([data-theme="dark"] .modal-dialog-box) {
	background: #111827 !important;
	border: 1px solid #1f293d;
}

.modal-icon-badge {
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

.modal-title {
	font-size: 20px;
	font-weight: 800;
	color: #0f172a;
	margin: 0 0 8px;
}

:global([data-theme="dark"] .modal-title) {
	color: #f8fafc !important;
}

.modal-desc {
	font-size: 13.5px;
	color: #64748b;
	line-height: 1.55;
	margin: 0 0 22px;
}

:global([data-theme="dark"] .modal-desc) {
	color: #94a3b8 !important;
}

.modal-actions {
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

.btn-confirm-logout:hover {
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

@keyframes spin {
	to { transform: rotate(360deg); }
}

.modal-fade-enter-active,
.modal-fade-leave-active {
	transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
	opacity: 0;
}

/* Telegram Modal Styles */
.modal-telegram-box {
	max-width: 440px !important;
}

.telegram-badge {
	background: #e0f2fe !important;
	color: #0284c7 !important;
}

:global([data-theme="dark"] .telegram-badge) {
	background: rgba(2, 132, 199, 0.2) !important;
	color: #38bdf8 !important;
}

.telegram-link-card {
	background: #f8fafc;
	border: 1px solid #e2e8f0;
	border-radius: 14px;
	padding: 16px;
	text-align: left;
	margin-bottom: 8px;
}

:global([data-theme="dark"] .telegram-link-card) {
	background: #1e293b !important;
	border-color: #334155 !important;
}

.step-row {
	display: flex;
	align-items: center;
	gap: 10px;
	font-size: 13.5px;
	color: #334155;
}

:global([data-theme="dark"] .step-row) {
	color: #e2e8f0 !important;
}

.step-badge {
	width: 22px;
	height: 22px;
	border-radius: 50%;
	background: #0284c7;
	color: #ffffff;
	font-size: 12px;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.step-label {
	flex: 1;
}

.telegram-url-input-wrap {
	display: flex;
	gap: 6px;
	margin-top: 8px;
	margin-bottom: 8px;
}

.telegram-url-input {
	flex: 1;
	height: 38px;
	border: 1px solid #cbd5e1;
	border-radius: 8px;
	padding: 0 10px;
	font-size: 12.5px;
	background: #ffffff;
	color: #475569;
	font-family: monospace;
}

:global([data-theme="dark"] .telegram-url-input) {
	background: #0f172a !important;
	border-color: #334155 !important;
	color: #94a3b8 !important;
}

.btn-copy-link {
	height: 38px;
	padding: 0 14px;
	border-radius: 8px;
	border: 1px solid #cbd5e1;
	background: #ffffff;
	color: #334155;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.15s ease;
}

.btn-copy-link:hover {
	background: #f1f5f9;
	border-color: #94a3b8;
}

:global([data-theme="dark"] .btn-copy-link) {
	background: #0f172a !important;
	border-color: #334155 !important;
	color: #e2e8f0 !important;
}

.btn-telegram-primary {
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
	gap: 8px;
	background: #0284c7;
	border: 0;
	color: #ffffff;
	box-shadow: 0 4px 12px rgba(2, 132, 199, 0.3);
}

.btn-telegram-primary:hover {
	background: #0369a1;
}

.btn-telegram-primary:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
</style>
