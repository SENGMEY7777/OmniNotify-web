<template>
    <main class="user-portal-view">
        <!-- Top Navigation Header -->
        <header class="user-top-navbar">
            <div class="navbar-brand-section">
                <div class="brand-logo-badge">
                    <TablerIcon name="bell" :size="22" />
                </div>
                <div>
                    <div class="brand-title-wrap">
                        <span class="brand-title">OmniNotify</span>
                        <span class="portal-badge">User Portal</span>
                    </div>
                    <p class="greeting-text">
                        {{ timeGreeting }}, <strong class="greeting-name">{{ user.full_name || user.name || 'Valued User' }}</strong>
                    </p>
                </div>
            </div>

            <div class="navbar-actions-section">
                <!-- Theme Toggle -->
                <button
                    type="button"
                    class="btn-icon-nav"
                    :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
                    @click="toggleTheme"
                >
                    <TablerIcon :name="isDark ? 'sun' : 'moon'" :size="19" />
                </button>

                <!-- Refresh Data -->
                <button
                    type="button"
                    class="btn-icon-nav"
                    :class="{ 'is-spinning': loading }"
                    title="Refresh Data"
                    :disabled="loading"
                    @click="loadAll(1)"
                >
                    <TablerIcon name="clock" :size="19" />
                </button>

                <!-- Edit Profile Button -->
                <button
                    type="button"
                    class="btn-profile-nav"
                    @click="openProfileModal"
                >
                    <TablerIcon name="user" :size="17" />
                    <span class="d-none d-sm-inline">Profile</span>
                </button>

                <!-- Logout Button -->
                <button
                    type="button"
                    class="btn-logout-nav"
                    @click="showLogoutModal = true"
                >
                    <TablerIcon name="logout" :size="17" />
                    <span>Sign Out</span>
                </button>
            </div>
        </header>

        <!-- Logout Confirmation Modal (Matches Admin Design) -->
        <teleport to="body">
            <transition name="modal-fade">
                <div v-if="showLogoutModal" class="logout-modal-backdrop" @click.self="showLogoutModal = false">
                    <div class="logout-modal-dialog-box" role="dialog" aria-modal="true" aria-labelledby="logout-title">
                        <div class="logout-modal-icon-badge">
                            <IconLogout2 :size="28" :stroke-width="2.2" />
                        </div>
                        <h3 id="logout-title" class="logout-modal-title">Sign Out</h3>
                        <p class="logout-modal-desc">Are you sure you want to log out of your session? You will need to sign in again to access your account.</p>
                        <div class="logout-modal-actions">
                            <button type="button" class="btn-modal-cancel" :disabled="loggingOut" @click="showLogoutModal = false">
                                Cancel
                            </button>
                            <button type="button" class="btn-confirm-logout" :disabled="loggingOut" @click="confirmLogout">
                                <span v-if="loggingOut" class="btn-spinner" aria-hidden="true"></span>
                                <span>{{ loggingOut ? 'Logging out...' : 'Yes, Log Out' }}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </transition>
        </teleport>

        <!-- Profile Edit Modal -->
        <teleport to="body">
            <transition name="modal-fade">
                <div v-if="showProfileModal" class="logout-modal-backdrop" @click.self="showProfileModal = false">
                    <div class="modal-dialog-box profile-modal-box text-start" role="dialog" aria-modal="true">
                        <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                            <h3 class="logout-modal-title mb-0">Edit Profile</h3>
                            <button type="button" class="btn-close-banner" @click="showProfileModal = false">✕</button>
                        </div>

                        <!-- Avatar Upload Form -->
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="user-avatar-large flex-shrink-0" style="width: 64px; height: 64px;">
                                <img
                                    v-if="user.avatar_url || user.avatar"
                                    :src="getAvatarUrl(user.avatar_url || user.avatar)"
                                    alt="Avatar"
                                    class="avatar-large-img"
                                    @error="$event.target.src = DEFAULT_AVATAR"
                                />
                                <span v-else class="avatar-large-initials" style="font-size: 24px;">
                                    {{ userInitial }}
                                </span>
                            </div>
                            <div>
                                <input
                                    ref="avatarFileInput"
                                    type="file"
                                    accept="image/*"
                                    class="d-none"
                                    @change="handleAvatarUpload"
                                />
                                <div class="d-flex gap-2">
                                    <button
                                        type="button"
                                        class="btn btn-sm btn-outline-primary rounded-3"
                                        :disabled="avatarLoading"
                                        @click="avatarFileInput?.click()"
                                    >
                                        {{ avatarLoading ? 'Uploading...' : 'Upload Photo' }}
                                    </button>
                                    <button
                                        v-if="user.avatar_url || user.avatar"
                                        type="button"
                                        class="btn btn-sm btn-outline-danger rounded-3"
                                        :disabled="avatarLoading"
                                        @click="deleteAvatar"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <small class="text-muted d-block mt-1">PNG, JPG up to 5MB</small>
                            </div>
                        </div>

                        <!-- Profile Info Form -->
                        <form @submit.prevent="saveProfile">
                            <div class="mb-3">
                                <label class="form-label fw-semibold small">Full Name</label>
                                <input
                                    v-model="profileForm.full_name"
                                    type="text"
                                    class="form-control rounded-3"
                                    required
                                />
                            </div>

                            <div class="mb-3">
                                <label class="form-label fw-semibold small">Email Address</label>
                                <input
                                    v-model="profileForm.email"
                                    type="email"
                                    class="form-control rounded-3"
                                    required
                                />
                            </div>

                            <div class="row g-2 mb-3">
                                <div class="col-sm-7">
                                    <label class="form-label fw-semibold small">Phone Number</label>
                                    <input
                                        v-model="profileForm.phone_number"
                                        type="text"
                                        class="form-control rounded-3"
                                        placeholder="012345678"
                                    />
                                </div>
                                <div class="col-sm-5">
                                    <label class="form-label fw-semibold small">Gender</label>
                                    <select v-model.number="profileForm.gender" class="form-select rounded-3">
                                        <option :value="0">Female</option>
                                        <option :value="1">Male</option>
                                    </select>
                                </div>
                            </div>

                            <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                                <button
                                    type="button"
                                    class="btn-modal-cancel"
                                    @click="showProfileModal = false"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    class="btn btn-primary rounded-3 px-3 fw-bold"
                                    :disabled="profileLoading"
                                >
                                    <span v-if="profileLoading" class="spinner-border spinner-border-sm me-1"></span>
                                    <span>Save Changes</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </transition>
        </teleport>

        <div class="portal-container">
            <!-- 4 KPI Stat Cards -->
            <div class="mb-4">
                <BaseStateCard :stats="statCards" />
            </div>

            <!-- Error Banner -->
            <transition name="fade">
                <div v-if="error" class="alert-error-banner mb-4" role="alert">
                    <TablerIcon name="alert-circle" :size="20" class="flex-shrink-0" />
                    <span class="flex-grow-1">{{ error }}</span>
                    <button type="button" class="btn-close-banner" aria-label="Close" @click="error = ''">✕</button>
                </div>
            </transition>

            <!-- Main Layout Grid -->
            <div class="row g-4 align-items-start">
                <!-- Left Sidebar: Profile & Channel Preferences -->
                <div class="col-12 col-lg-4">
                    <!-- Profile Card -->
                    <div class="card card-sidebar-panel p-4 mb-4">
                        <div class="text-center mb-3">
                            <div class="user-avatar-large mx-auto mb-3">
                                <img
                                    v-if="user.avatar_url || user.avatar"
                                    :src="getAvatarUrl(user.avatar_url || user.avatar)"
                                    :alt="user.full_name || 'User Avatar'"
                                    class="avatar-large-img"
                                    @error="$event.target.src = DEFAULT_AVATAR"
                                />
                                <span v-else class="avatar-large-initials">
                                    {{ userInitial }}
                                </span>
                            </div>
                            <h2 class="profile-card-name mb-1">{{ user.full_name || user.name || 'Unnamed User' }}</h2>
                            <p class="profile-card-email mb-2 text-muted">{{ user.email || 'user@omninotify.com' }}</p>
                            
                            <div class="d-flex align-items-center justify-content-center gap-2 flex-wrap mb-2">
                                <span class="role-pill">
                                    {{ (user.role || 'USER').toUpperCase() }}
                                </span>
                                <span class="status-pill" :class="isActiveUser ? 'active' : 'inactive'">
                                    <span class="status-dot"></span>
                                    {{ isActiveUser ? 'Active' : 'Inactive' }}
                                </span>
                            </div>

                            <button type="button" class="btn btn-sm btn-outline-secondary rounded-pill px-3 mt-1" @click="openProfileModal">
                                Edit Profile
                            </button>
                        </div>

                        <div class="panel-divider my-3"></div>

                        <!-- User Meta List -->
                        <div class="profile-meta-list">
                            <div class="meta-item d-flex justify-content-between align-items-center py-2">
                                <span class="meta-label text-muted d-flex align-items-center gap-2">
                                    <TablerIcon name="user" :size="16" />
                                    <span>User ID</span>
                                </span>
                                <button
                                    type="button"
                                    class="btn-copy-meta"
                                    :title="user.user_id || user.id || ''"
                                    @click="copyText(user.user_id || user.id, 'User ID copied!')"
                                >
                                    <span class="id-truncate">{{ shortId(user.user_id || user.id) }}</span>
                                    <TablerIcon name="clipboard" :size="14" />
                                </button>
                            </div>

                            <div v-if="user.phone_number" class="meta-item d-flex justify-content-between align-items-center py-2">
                                <span class="meta-label text-muted d-flex align-items-center gap-2">
                                    <TablerIcon name="send" :size="16" />
                                    <span>Phone</span>
                                </span>
                                <span class="meta-val fw-semibold">{{ user.phone_number }}</span>
                            </div>

                            <div v-if="user.gender !== undefined && user.gender !== null" class="meta-item d-flex justify-content-between align-items-center py-2">
                                <span class="meta-label text-muted d-flex align-items-center gap-2">
                                    <TablerIcon name="users" :size="16" />
                                    <span>Gender</span>
                                </span>
                                <span class="meta-val fw-semibold">{{ user.gender === 1 || user.gender === '1' ? 'Male' : 'Female' }}</span>
                            </div>

                            <div class="meta-item d-flex justify-content-between align-items-center py-2">
                                <span class="meta-label text-muted d-flex align-items-center gap-2">
                                    <TablerIcon name="calendar" :size="16" />
                                    <span>Member Since</span>
                                </span>
                                <span class="meta-val">{{ formatDate(user.created_at) }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Channel Preferences Panel -->
                    <div class="card card-sidebar-panel p-4 mb-4">
                        <div class="d-flex align-items-center justify-content-between mb-2">
                            <h3 class="panel-card-title mb-0">Channel Preferences</h3>
                            <span v-if="preferencesLoading" class="spinner-border spinner-border-sm text-primary" role="status"></span>
                        </div>
                        <p class="channel-desc-text text-muted small mb-3">
                            Toggle channels you want to receive alerts and notifications on.
                        </p>

                        <div class="channel-status-list">
                            <!-- In-App -->
                            <div class="channel-toggle-row d-flex align-items-center justify-content-between p-2 rounded-3 mb-2 channel-inapp">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="channel-icon-circle channel-inapp">
                                        <IconArrowsExchange :size="17" />
                                    </span>
                                    <div>
                                        <div class="channel-title-text">In-App Notifications</div>
                                        <span class="channel-sub-text">Live web alerts</span>
                                    </div>
                                </div>
                                <div class="form-check form-switch m-0">
                                    <input
                                        v-model="userPrefs.enable_in_app"
                                        class="form-check-input"
                                        type="checkbox"
                                        @change="updateChannelPref('enable_in_app')"
                                    />
                                </div>
                            </div>

                            <!-- Email -->
                            <div class="channel-toggle-row d-flex align-items-center justify-content-between p-2 rounded-3 mb-2 channel-email">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="channel-icon-circle channel-email">
                                        <IconMail :size="17" />
                                    </span>
                                    <div>
                                        <div class="channel-title-text">Email Receipts</div>
                                        <span class="channel-sub-text">{{ user.email || 'Email address' }}</span>
                                    </div>
                                </div>
                                <div class="form-check form-switch m-0">
                                    <input
                                        v-model="userPrefs.enable_email"
                                        class="form-check-input"
                                        type="checkbox"
                                        @change="updateChannelPref('enable_email')"
                                    />
                                </div>
                            </div>

                            <!-- SMS -->
                            <div class="channel-toggle-row d-flex align-items-center justify-content-between p-2 rounded-3 mb-2 channel-sms">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="channel-icon-circle channel-sms">
                                        <IconMessageDots :size="17" />
                                    </span>
                                    <div>
                                        <div class="channel-title-text">SMS Text Messages</div>
                                        <span class="channel-sub-text">{{ user.phone_number || 'SMS & OTP alerts' }}</span>
                                    </div>
                                </div>
                                <div class="form-check form-switch m-0">
                                    <input
                                        v-model="userPrefs.enable_sms"
                                        class="form-check-input"
                                        type="checkbox"
                                        @change="updateChannelPref('enable_sms')"
                                    />
                                </div>
                            </div>

                            <!-- Push -->
                            <div class="channel-toggle-row d-flex align-items-center justify-content-between p-2 rounded-3 mb-2 channel-push">
                                <div class="d-flex align-items-center gap-2">
                                    <span class="channel-icon-circle channel-push">
                                        <IconBell :size="17" />
                                    </span>
                                    <div>
                                        <div class="channel-title-text">Push Notifications</div>
                                        <span class="channel-sub-text">Browser & device push</span>
                                    </div>
                                </div>
                                <div class="form-check form-switch m-0">
                                    <input
                                        v-model="userPrefs.enable_push"
                                        class="form-check-input"
                                        type="checkbox"
                                        @change="updateChannelPref('enable_push')"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Telegram Bot Link Card -->
                    <div class="card card-sidebar-panel p-4">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span class="channel-icon-circle channel-telegram">
                                <IconBrandTelegram :size="20" />
                            </span>
                            <h3 class="panel-card-title mb-0">Telegram Alerts</h3>
                        </div>
                        <p class="channel-desc-text text-muted small mb-3">
                            Connect your Telegram account to receive instant banking & transfer alerts directly in your chat.
                        </p>

                        <button
                            type="button"
                            class="btn btn-outline-primary w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2 fw-semibold"
                            :disabled="telegramLoading"
                            @click="connectTelegram"
                        >
                            <span v-if="telegramLoading" class="spinner-border spinner-border-sm"></span>
                            <TablerIcon v-else name="send" :size="16" />
                            <span>{{ telegramLoading ? 'Connecting...' : 'Connect Telegram Bot' }}</span>
                        </button>
                    </div>
                </div>

                <!-- Right Main Content: Notification Center -->
                <div class="col-12 col-lg-8">
                    <div class="card card-notifications-panel p-4">
                        <!-- Header with Title and Global Actions -->
                        <div class="notifications-header d-flex align-items-center justify-content-between mb-3 flex-wrap gap-3">
                            <div>
                                <h3 class="panel-main-title mb-1">Notification Center</h3>
                                <p class="text-muted small mb-0">Manage all incoming alerts, security notifications, and transaction updates.</p>
                            </div>

                            <div class="d-flex align-items-center gap-2">
                                <button
                                    v-if="unreadCount > 0"
                                    type="button"
                                    class="btn-mark-all-read"
                                    :disabled="markingAll || loading"
                                    @click="markAllAsRead"
                                >
                                    <TablerIcon name="check" :size="16" />
                                    <span>{{ markingAll ? 'Marking...' : 'Mark All Read' }}</span>
                                </button>
                            </div>
                        </div>

                        <!-- Filter Controls Bar -->
                        <div class="filter-controls-bar d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4">
                            <!-- Left: Tab Badges (All, Unread, Read) -->
                            <div class="tab-pill-group" role="tablist">
                                <button
                                    type="button"
                                    class="tab-pill-btn"
                                    :class="{ 'active': activeTab === 'all' }"
                                    @click="activeTab = 'all'"
                                >
                                    <span>All</span>
                                    <span class="pill-count">{{ filteredNotifications.length }}</span>
                                </button>

                                <button
                                    type="button"
                                    class="tab-pill-btn"
                                    :class="{ 'active': activeTab === 'unread' }"
                                    @click="activeTab = 'unread'"
                                >
                                    <span>Unread</span>
                                    <span v-if="unreadCount > 0" class="pill-count unread-pill">{{ unreadCount }}</span>
                                    <span v-else class="pill-count">0</span>
                                </button>

                                <button
                                    type="button"
                                    class="tab-pill-btn"
                                    :class="{ 'active': activeTab === 'read' }"
                                    @click="activeTab = 'read'"
                                >
                                    <span>Read</span>
                                </button>
                            </div>

                            <!-- Right: Channel & Priority Filters + Search -->
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                                <!-- Channel Filter -->
                                <select
                                    v-model="filterChannel"
                                    class="form-select form-select-sm filter-dropdown"
                                    aria-label="Filter by channel"
                                >
                                    <option value="">All Channels</option>
                                    <option value="IN_APP">IN_APP</option>
                                    <option value="SMS">SMS</option>
                                    <option value="EMAIL">EMAIL</option>
                                    <option value="PUSH">PUSH</option>
                                    <option value="TELEGRAM">TELEGRAM</option>
                                </select>

                                <!-- Priority Filter -->
                                <select
                                    v-model="filterPriority"
                                    class="form-select form-select-sm filter-dropdown"
                                    aria-label="Filter by priority"
                                >
                                    <option value="">All Priorities</option>
                                    <option value="CRITICAL">CRITICAL</option>
                                    <option value="HIGH">HIGH</option>
                                    <option value="NORMAL">NORMAL</option>
                                    <option value="LOW">LOW</option>
                                </select>

                                <!-- Reset Filters -->
                                <button
                                    v-if="filterChannel || filterPriority || searchQuery || activeTab !== 'all'"
                                    type="button"
                                    class="btn-reset-filters"
                                    title="Reset All Filters"
                                    @click="resetFilters"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>

                        <!-- Search Box Bar -->
                        <div class="search-input-wrapper mb-3">
                            <span class="search-icon-left">
                                <TablerIcon name="search" :size="17" />
                            </span>
                            <input
                                v-model="searchQuery"
                                type="text"
                                class="form-control form-control-search"
                                placeholder="Search notifications by title, body, or event type..."
                            />
                            <button
                                v-if="searchQuery"
                                type="button"
                                class="btn-clear-search"
                                aria-label="Clear search"
                                @click="searchQuery = ''"
                            >
                                ✕
                            </button>
                        </div>

                        <!-- Loading State -->
                        <div v-if="loading && !notifications.length" class="state-placeholder py-5 text-center">
                            <div class="spinner-border text-primary mb-3" role="status"></div>
                            <h5 class="fw-bold mb-1">Loading your notifications...</h5>
                            <p class="text-muted small">Fetching latest messages from core banking service.</p>
                        </div>

                        <!-- Empty State -->
                        <div v-else-if="!filteredNotifications.length" class="state-placeholder py-5 text-center">
                            <div class="empty-icon-circle mx-auto mb-3">
                                <TablerIcon name="bell" :size="32" />
                            </div>
                            <h5 class="fw-bold mb-1">No notifications found</h5>
                            <p class="text-muted small mb-3">
                                {{ searchQuery || filterChannel || filterPriority || activeTab !== 'all'
                                    ? 'No notifications match your current filter criteria.'
                                    : 'You are completely caught up! New notifications will appear here automatically in real time.' }}
                            </p>
                            <button
                                v-if="searchQuery || filterChannel || filterPriority || activeTab !== 'all'"
                                type="button"
                                class="btn btn-outline-primary btn-sm rounded-3"
                                @click="resetFilters"
                            >
                                Clear Active Filters
                            </button>
                        </div>

                        <!-- Notifications Feed List -->
                        <div v-else class="notifications-feed-list">
                            <article
                                v-for="item in paginatedNotifications"
                                :key="item.notification_id || item.id"
                                class="notification-feed-card"
                                :class="{ 'is-unread': !isItemRead(item), 'is-updating': item._updating }"
                            >
                                <!-- Left: Channel Icon Badge -->
                                <div class="feed-icon-badge flex-shrink-0" :class="getChannelTone(item.channel)">
                                    <component :is="getChannelIcon(item.channel)" :size="20" />
                                </div>

                                <!-- Center: Notification Content -->
                                <div class="feed-body-wrap flex-grow-1 min-width-0" @click="handleItemClick(item)">
                                    <div class="feed-header-line d-flex align-items-center justify-content-between gap-2 mb-1">
                                        <div class="d-flex align-items-center gap-2 flex-wrap">
                                            <span class="feed-item-title">{{ item.title || item.event_type || 'Notification' }}</span>
                                            <span v-if="!isItemRead(item)" class="badge-unread-dot" title="Unread notification"></span>
                                        </div>

                                        <!-- Priority Badge -->
                                        <span
                                            v-if="item.priority"
                                            class="badge-priority"
                                            :class="item.priority.toLowerCase()"
                                        >
                                            {{ item.priority }}
                                        </span>
                                    </div>

                                    <p class="feed-item-message mb-2">
                                        {{ item.body || item.message || 'No description provided.' }}
                                    </p>

                                    <!-- Footer Meta Line -->
                                    <div class="feed-meta-line d-flex align-items-center gap-2 flex-wrap">
                                        <!-- Relative & Absolute Timestamp -->
                                        <span class="meta-time-text" :title="item.created_at ? new Date(item.created_at).toLocaleString() : ''">
                                            <TablerIcon name="clock" :size="13" />
                                            <span>{{ formatTimeAgo(item.created_at) }}</span>
                                        </span>

                                        <!-- Channel Badge -->
                                        <span class="meta-channel-pill" :class="getChannelTone(item.channel)">
                                            {{ item.channel || 'IN_APP' }}
                                        </span>

                                        <!-- Event Type Tag -->
                                        <span v-if="item.event_type" class="meta-event-tag">
                                            {{ item.event_type }}
                                        </span>

                                        <!-- Status Indicator -->
                                        <span class="status-read-indicator" :class="isItemRead(item) ? 'text-muted' : 'text-primary fw-bold'">
                                            {{ isItemRead(item) ? 'Read' : 'Click to mark read' }}
                                        </span>
                                    </div>
                                </div>

                                <!-- Right: Delete Button -->
                                <button
                                    type="button"
                                    class="btn-delete-item ms-2 flex-shrink-0"
                                    title="Delete notification"
                                    @click.stop="deleteNotification(item)"
                                >
                                    <TablerIcon name="x" :size="16" />
                                </button>
                            </article>
                        </div>

                        <!-- Pagination Footer -->
                        <div v-if="filteredNotifications.length > 0" class="mt-4 pt-3 border-top">
                            <BasePagination
                                :page="pagination.page"
                                :total-pages="pagination.total_pages"
                                :total="filteredNotifications.length"
                                :limit="pagination.limit"
                                :loading="loading"
                                @change-page="handlePageChange"
                                @change-limit="handleLimitChange"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
    IconBrandTelegram,
    IconMail,
    IconMessageDots,
    IconBell,
    IconArrowsExchange,
    IconShieldLock,
    IconCreditCard,
    IconDeviceMobile,
    IconLogout2
} from '@tabler/icons-vue'
import TablerIcon from '@/components/common/TablerIcon.vue'
import BaseStateCard from '@/components/common/BaseStateCard.vue'
import BasePagination from '@/components/common/BasePagination.vue'
import { apiRequest, put, del } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useNotificationStore, isItemRead } from '@/stores/notification'
import { getAvatarUrl, DEFAULT_AVATAR } from '@/utils/avatar'
import { initTheme, toggleTheme, isDark } from '@/utils/theme'
import { playMessageSound } from '@/utils/sound'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToastStore()
const notifStore = useNotificationStore()

// ── Reactive State ──────────────────────────────────────────────────
const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const notifications = ref([])
const loading = ref(false)
const markingAll = ref(false)
const showLogoutModal = ref(false)
const loggingOut = ref(false)
const error = ref('')

// Profile Modal State
const showProfileModal = ref(false)
const profileLoading = ref(false)
const avatarLoading = ref(false)
const avatarFileInput = ref(null)
const profileForm = ref({
    full_name: '',
    email: '',
    phone_number: '',
    gender: 0,
})

// Channel Preferences State
const preferencesLoading = ref(false)
const userPrefs = ref({
    enable_in_app: true,
    enable_email: true,
    enable_sms: false,
    enable_push: false,
})

// Telegram Connect State
const telegramLoading = ref(false)

// Filter & Search Controls
const activeTab = ref('all') // 'all' | 'unread' | 'read'
const searchQuery = ref('')
const filterChannel = ref('')
const filterPriority = ref('')

// Pagination
const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
})

// ── Computed Properties ───────────────────────────────────────────
const isActiveUser = computed(() => {
    const s = user.value.status
    const a = user.value.is_active
    return s === 'Active' || s === true || s === 1 || a === true || a === 1
})

const userInitial = computed(() => {
    const name = user.value.full_name || user.value.name || 'U'
    return (name[0] || 'U').toUpperCase()
})

const timeGreeting = computed(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
})

const unreadCount = computed(() => {
    return notifications.value.filter(n => !isItemRead(n)).length
})

const readCount = computed(() => {
    return notifications.value.filter(n => isItemRead(n)).length
})

// 4 KPI Summary Cards
const statCards = computed(() => {
    const total = notifications.value.length
    const unread = unreadCount.value
    const read = readCount.value

    return [
        {
            label: 'Total Notifications',
            value: total.toLocaleString(),
            tone: 'purple',
            icon: 'bell',
            change: total > 0 ? `${total} events` : '0 events',
            changeTone: 'positive',
            subtitle: 'Lifetime received',
        },
        {
            label: 'Unread Alerts',
            value: unread.toLocaleString(),
            tone: 'blue',
            icon: 'alert',
            change: unread > 0 ? 'Requires attention' : 'All caught up',
            changeTone: unread > 0 ? 'negative' : 'positive',
            subtitle: 'Active unread messages',
        },
        {
            label: 'Read Notifications',
            value: read.toLocaleString(),
            tone: 'green',
            icon: 'check',
            change: total ? `${((read / total) * 100).toFixed(0)}% read` : '100% read',
            changeTone: 'positive',
            subtitle: 'Acknowledged messages',
        },
        {
            label: 'Active Preferences',
            value: [userPrefs.value.enable_in_app, userPrefs.value.enable_email, userPrefs.value.enable_sms, userPrefs.value.enable_push].filter(Boolean).length + '/4 Active',
            tone: 'orange',
            icon: 'bolt',
            change: 'Configured channels',
            changeTone: 'positive',
            subtitle: 'In-app, Email, SMS, Push',
        },
    ]
})

// Filtered Notifications List
const filteredNotifications = computed(() => {
    let list = notifications.value

    // Tab Filter
    if (activeTab.value === 'unread') {
        list = list.filter(n => !isItemRead(n))
    } else if (activeTab.value === 'read') {
        list = list.filter(n => isItemRead(n))
    }

    // Channel Filter
    if (filterChannel.value) {
        list = list.filter(n => String(n.channel || '').toUpperCase() === filterChannel.value)
    }

    // Priority Filter
    if (filterPriority.value) {
        list = list.filter(n => String(n.priority || '').toUpperCase() === filterPriority.value)
    }

    // Search Query (Title, Body, Event Type)
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim()
        list = list.filter(n => {
            const title = (n.title || '').toLowerCase()
            const body = (n.body || n.message || '').toLowerCase()
            const eventType = (n.event_type || '').toLowerCase()
            return title.includes(query) || body.includes(query) || eventType.includes(query)
        })
    }

    return list
})

// Paginated Rows for display
const paginatedNotifications = computed(() => {
    const start = (pagination.value.page - 1) * pagination.value.limit
    return filteredNotifications.value.slice(start, start + pagination.value.limit)
})

watch(filteredNotifications, (newList) => {
    pagination.value.total = newList.length
    pagination.value.total_pages = Math.ceil(newList.length / pagination.value.limit) || 1
    if (pagination.value.page > pagination.value.total_pages) {
        pagination.value.page = 1
    }
}, { immediate: true })

// ── Helpers ────────────────────────────────────────────────────────
function shortId(id) {
    if (!id) return '—'
    const str = String(id)
    return str.length > 12 ? `${str.slice(0, 8)}...${str.slice(-4)}` : str
}

function formatDate(dateString) {
    if (!dateString) return '—'
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    } catch (_) {
        return '—'
    }
}

function formatTimeAgo(dateString) {
    if (!dateString) return 'Just now'
    try {
        const date = new Date(dateString)
        const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000)
        if (diffInSeconds < 60) return 'Just now'
        const diffInMinutes = Math.floor(diffInSeconds / 60)
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        const diffInHours = Math.floor(diffInMinutes / 60)
        if (diffInHours < 24) return `${diffInHours}h ago`
        const diffInDays = Math.floor(diffInHours / 24)
        if (diffInDays < 7) return `${diffInDays}d ago`
        return date.toLocaleDateString()
    } catch (_) {
        return 'Recently'
    }
}

function getChannelTone(channel) {
    const ch = String(channel || '').toUpperCase()
    if (ch === 'SMS') return 'sms'
    if (ch === 'EMAIL') return 'email'
    if (ch === 'TELEGRAM') return 'telegram'
    if (ch === 'PUSH') return 'push'
    return 'in_app'
}

function getChannelIcon(channel) {
    const ch = String(channel || '').toUpperCase()
    if (ch === 'SMS') return IconMessageDots
    if (ch === 'EMAIL') return IconMail
    if (ch === 'TELEGRAM') return IconBrandTelegram
    if (ch === 'PUSH') return IconBell
    return IconArrowsExchange
}

function copyText(text, successMsg) {
    if (!text) return
    navigator.clipboard?.writeText(text)
    toast.success(successMsg || 'Copied to clipboard!')
}

function resetFilters() {
    activeTab.value = 'all'
    filterChannel.value = ''
    filterPriority.value = ''
    searchQuery.value = ''
    pagination.value.page = 1
}

function handlePageChange(newPage) {
    pagination.value.page = newPage
}

function handleLimitChange(newLimit) {
    pagination.value.limit = newLimit
    pagination.value.page = 1
}

function openProfileModal() {
    profileForm.value = {
        full_name: user.value.full_name || user.value.name || '',
        email: user.value.email || '',
        phone_number: user.value.phone_number || '',
        gender: Number(user.value.gender ?? 0),
    }
    showProfileModal.value = true
}

// ── API Integrations ───────────────────────────────────────────────

/**
 * GET /auth/user/me
 * Retrieves current user profile details
 */
async function fetchUserProfile() {
    try {
        const res = await apiRequest('/auth/user/me')
        const data = res?.data || res || {}
        if (data && (data.user_id || data.id || data.email)) {
            user.value = { ...user.value, ...data }
            authStore.updateUser(data)
        }
    } catch (err) {
        console.warn('[UserHomeView] fetchUserProfile failed:', err.message)
    }
}

/**
 * PUT /auth/user/profile/update
 * Updates user full name, email, phone number, gender
 */
async function saveProfile() {
    profileLoading.value = true
    try {
        const payload = {
            full_name: profileForm.value.full_name.trim(),
            email: profileForm.value.email.trim(),
            gender: Number(profileForm.value.gender),
        }
        if (profileForm.value.phone_number && profileForm.value.phone_number.trim()) {
            payload.phone_number = profileForm.value.phone_number.trim()
        }

        const res = await apiRequest('/auth/user/profile/update', {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
        const updated = res?.data || res || {}
        user.value = { ...user.value, ...updated, ...payload }
        authStore.updateUser(user.value)
        toast.success('Profile updated successfully!')
        showProfileModal.value = false
    } catch (err) {
        toast.error(err.message || 'Failed to update profile.')
    } finally {
        profileLoading.value = false
    }
}

/**
 * PUT /auth/user/profile/update-avatar
 * Handles image file upload to server
 */
async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return

    avatarLoading.value = true
    try {
        const formData = new FormData()
        formData.append('avatar', file)

        const res = await apiRequest('/auth/user/profile/update-avatar', {
            method: 'PUT',
            body: formData,
        })
        const data = res?.data || res || {}
        const avatarUrl = data.avatar_url || data.avatar || ''
        if (avatarUrl) {
            user.value.avatar_url = avatarUrl
            authStore.updateUser({ avatar_url: avatarUrl })
        }
        toast.success('Avatar uploaded successfully!')
    } catch (err) {
        toast.error(err.message || 'Failed to upload avatar.')
    } finally {
        avatarLoading.value = false
        if (avatarFileInput.value) avatarFileInput.value.value = ''
    }
}

/**
 * DELETE /auth/user/profile/delete-avatar
 * Removes avatar
 */
async function deleteAvatar() {
    avatarLoading.value = true
    try {
        await apiRequest('/auth/user/profile/delete-avatar', { method: 'DELETE' })
        user.value.avatar_url = ''
        authStore.updateUser({ avatar_url: '' })
        toast.success('Avatar removed successfully.')
    } catch (err) {
        toast.error(err.message || 'Failed to remove avatar.')
    } finally {
        avatarLoading.value = false
    }
}

/**
 * GET /auth/user/preferences
 * Retrieves user's channel preferences
 */
async function fetchUserPreferences() {
    preferencesLoading.value = true
    try {
        const res = await apiRequest('/auth/user/preferences')
        const prefs = Array.isArray(res) ? res : (res?.data || [])
        if (prefs.length > 0) {
            const p = prefs[0]
            userPrefs.value = {
                enable_in_app: Boolean(p.enable_in_app),
                enable_email: Boolean(p.enable_email),
                enable_sms: Boolean(p.enable_sms),
                enable_push: Boolean(p.enable_push),
            }
        }
    } catch (_) {}
    finally {
        preferencesLoading.value = false
    }
}

/**
 * PUT /auth/user/preferences
 * Updates user channel notification preferences
 */
async function updateChannelPref(key) {
    try {
        const payload = {
            enable_in_app: userPrefs.value.enable_in_app ? 1 : 0,
            enable_email: userPrefs.value.enable_email ? 1 : 0,
            enable_sms: userPrefs.value.enable_sms ? 1 : 0,
            enable_push: userPrefs.value.enable_push ? 1 : 0,
        }
        await apiRequest('/auth/user/preferences', {
            method: 'PUT',
            body: JSON.stringify(payload)
        })
        toast.success('Notification preferences updated.')
    } catch (err) {
        userPrefs.value[key] = !userPrefs.value[key] // rollback
        toast.error(err.message || 'Failed to update preferences.')
    }
}

/**
 * POST /auth/user/telegram/link
 * Generates Telegram link to connect the bot
 */
async function connectTelegram() {
    telegramLoading.value = true
    try {
        const res = await apiRequest('/auth/user/telegram/link', { method: 'POST' })
        const data = res?.data || res || {}
        if (data.link) {
            window.open(data.link, '_blank')
            toast.success('Opening Telegram bot connection link!')
        } else {
            toast.info('Telegram link generated.')
        }
    } catch (err) {
        toast.error(err.message || 'Failed to connect Telegram.')
    } finally {
        telegramLoading.value = false
    }
}

/**
 * GET /auth/user/notifications?page=1&limit=50
 * Retrieves paginated user notifications
 */
async function fetchUserNotifications(pageNo = 1) {
    loading.value = true
    error.value = ''
    try {
        const res = await apiRequest(`/auth/user/notifications?page=${pageNo}&limit=50`)
        const list = Array.isArray(res) ? res : (res?.data || res?.notifications || [])
        notifications.value = list
    } catch (err) {
        error.value = err.message || 'Failed to load notifications.'
        toast.error(error.value)
    } finally {
        loading.value = false
    }
}

/**
 * PATCH /auth/user/notifications/:id/read
 * Mark a single notification as read
 */
async function handleItemClick(item) {
    if (!item) return
    const id = item.notification_id || item.id
    if (!id || isItemRead(item) || item._updating) return

    // Optimistic Update
    item._updating = true
    item.status = 'READ'
    item.is_read = true
    item.read_at = new Date().toISOString()
    notifStore.decrementUnread(id)

    try {
        await apiRequest(`/auth/user/notifications/${id}/read`, {
            method: 'PATCH',
        })
        window.dispatchEvent(new CustomEvent('notification-status-changed', {
            detail: { id, status: 'READ' }
        }))
    } catch (err) {
        // Rollback
        item.status = 'DELIVERED'
        item.is_read = false
        item.read_at = null
        toast.error('Failed to mark notification as read.')
    } finally {
        item._updating = false
    }
}

/**
 * DELETE /auth/user/notifications/:id
 * Removes/deletes a notification
 */
async function deleteNotification(item) {
    if (!item) return
    const id = item.notification_id || item.id
    if (!id) return

    const previousList = [...notifications.value]
    notifications.value = notifications.value.filter(n => (n.notification_id || n.id) !== id)

    try {
        await apiRequest(`/auth/user/notifications/${id}`, { method: 'DELETE' })
        toast.success('Notification deleted.')
    } catch (err) {
        notifications.value = previousList
        toast.error(err.message || 'Failed to delete notification.')
    }
}

/**
 * PATCH /auth/user/notifications/mark-all-read
 * Mark all user notifications as read in one request
 */
async function markAllAsRead() {
    if (unreadCount.value === 0) return
    markingAll.value = true

    // Optimistic Update
    const previousState = notifications.value.map(n => ({ ...n }))
    notifications.value.forEach(n => {
        n.status = 'READ'
        n.is_read = true
        n.read_at = new Date().toISOString()
    })
    notifStore.markAllRead()

    try {
        await apiRequest('/auth/user/notifications/mark-all-read', {
            method: 'PATCH',
        })
        toast.success('All notifications marked as read.')
        window.dispatchEvent(new CustomEvent('notifications-all-read'))
    } catch (err) {
        // Rollback on failure
        notifications.value = previousState
        toast.error(err.message || 'Failed to mark all as read.')
    } finally {
        markingAll.value = false
    }
}

/**
 * DELETE /auth/user/logout
 * Logs out user, invalidates session token, and redirects to login
 */
async function confirmLogout() {
    loggingOut.value = true
    try {
        await apiRequest('/auth/user/logout', { method: 'DELETE' })
    } catch (_) {}

    authStore.clearAuth()
    toast.success('Signed out successfully.')
    showLogoutModal.value = false
    router.push('/login')
}

async function loadAll(pageNo = 1) {
    await Promise.allSettled([
        fetchUserProfile(),
        fetchUserPreferences(),
        fetchUserNotifications(pageNo),
    ])
}

// ── Live Realtime Listener ─────────────────────────────────────────
function handleLiveNotification(event) {
    const item = event?.detail
    if (!item) return

    const newItem = {
        notification_id: item.notification_id || item.id || Date.now(),
        title: item.title || 'New Banking Alert',
        body: item.body || item.message || '',
        event_type: item.event_type || 'SYSTEM_ALERT',
        channel: item.channel || 'IN_APP',
        priority: item.priority || 'NORMAL',
        status: item.status || 'DELIVERED',
        is_read: false,
        created_at: item.created_at || new Date().toISOString(),
    }

    const idx = notifications.value.findIndex(n => (n.notification_id || n.id) === newItem.notification_id)
    if (idx !== -1) {
        notifications.value[idx] = { ...notifications.value[idx], ...newItem }
    } else {
        notifications.value.unshift(newItem)
    }

    try {
        playMessageSound()
    } catch (_) {}
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        if (showLogoutModal.value) showLogoutModal.value = false
        if (showProfileModal.value) showProfileModal.value = false
    }
}

// ── Lifecycle Hooks ────────────────────────────────────────────────
onMounted(() => {
    initTheme()
    loadAll(1)
    window.addEventListener('new-notification', handleLiveNotification)
    window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
    window.removeEventListener('new-notification', handleLiveNotification)
    window.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
/* ── Main View Container ──────────────────────────────────────────── */
.user-portal-view {
    min-height: 100vh;
    background-color: #f7f8fb;
    color: #152033;
    font-family: "Geist", system-ui, -apple-system, sans-serif;
    padding-bottom: 60px;
}

/* ── Top Navigation Bar ──────────────────────────────────────────── */
.user-top-navbar {
    background: #ffffff;
    border-bottom: 1px solid #e5e8ef;
    padding: 16px 36px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 30px;
}

.navbar-brand-section {
    display: flex;
    align-items: center;
    gap: 16px;
}

.brand-logo-badge {
    width: 44px;
    height: 44px;
    border-radius: 14px;
    background: linear-gradient(135deg, #2A1E62 0%, #6737D7 100%);
    color: #ffffff;
    display: grid;
    place-items: center;
    box-shadow: 0 4px 14px rgba(103, 55, 215, 0.35);
    flex-shrink: 0;
}

.brand-title-wrap {
    display: flex;
    align-items: center;
    gap: 8px;
}

.brand-title {
    font-size: 20px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.3px;
}

.portal-badge {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: #f1edfe;
    color: #6737d7;
    padding: 2px 8px;
    border-radius: 6px;
}

.greeting-text {
    margin: 2px 0 0;
    font-size: 13.5px;
    color: #64748b;
}

.greeting-name {
    color: #0f172a;
}

.navbar-actions-section {
    display: flex;
    align-items: center;
    gap: 10px;
}

.btn-icon-nav {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    color: #475569;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-icon-nav:hover:not(:disabled) {
    background: #f8fafc;
    color: #6737d7;
    border-color: #cbd5e1;
}

.btn-icon-nav.is-spinning :deep(svg) {
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.btn-profile-nav {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 42px;
    padding: 0 16px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    color: #334155;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-profile-nav:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #6737d7;
}

.btn-logout-nav {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    height: 42px;
    padding: 0 16px;
    border-radius: 12px;
    border: 1px solid #fee2e2;
    background: #fef2f2;
    color: #dc2626;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-logout-nav:hover:not(:disabled) {
    background: #fee2e2;
    border-color: #fca5a5;
    color: #b91c1c;
}

/* ── Portal Container ────────────────────────────────────────────── */
.portal-container {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 24px;
}

/* ── Alert Error Banner ──────────────────────────────────────────── */
.alert-error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 18px;
    border-radius: 12px;
    background: #fff1f2;
    border: 1px solid #fecdd3;
    color: #be123c;
    font-size: 14px;
    font-weight: 500;
}

.btn-close-banner {
    background: transparent;
    border: 0;
    color: #be123c;
    font-size: 14px;
    cursor: pointer;
    padding: 0 4px;
}

/* ── Panel Cards ─────────────────────────────────────────────────── */
.card-sidebar-panel,
.card-notifications-panel {
    border-radius: 18px;
    border: 1px solid #e3e6ed;
    background: #ffffff;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.panel-card-title {
    font-size: 17px;
    font-weight: 700;
    color: #0f172a;
}

.panel-main-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
}

.panel-divider {
    height: 1px;
    background: #f1f3f8;
}

/* ── User Avatar ─────────────────────────────────────────────────── */
.user-avatar-large {
    width: 86px;
    height: 86px;
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(135deg, #2A1E62 0%, #6737D7 100%);
    box-shadow: 0 6px 20px rgba(103, 55, 215, 0.28);
    display: grid;
    place-items: center;
}

.avatar-large-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.avatar-large-initials {
    font-size: 32px;
    font-weight: 800;
    color: #ffffff;
}

.profile-card-name {
    font-size: 19px;
    font-weight: 700;
    color: #0f172a;
}

.profile-card-email {
    font-size: 13.5px;
    word-break: break-all;
}

.role-pill {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 6px;
    background: #ede9fe;
    color: #6737d7;
}

.status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 999px;
    text-transform: uppercase;
}

.status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
}

.status-pill.active {
    background: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
}

.status-pill.inactive {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
}

/* ── Profile Meta List ───────────────────────────────────────────── */
.meta-item {
    font-size: 13.5px;
    border-bottom: 1px dashed #f1f3f8;
}

.meta-item:last-child {
    border-bottom: 0;
}

.btn-copy-meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 12px;
    font-family: monospace;
    color: #475569;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-copy-meta:hover {
    background: #ede9fe;
    border-color: #c4b5fd;
    color: #6737d7;
}

.id-truncate {
    max-width: 110px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* ── Channels List ───────────────────────────────────────────────── */
.channel-toggle-row {
    border: 1px solid transparent;
    transition: all 0.15s ease;
}

.channel-toggle-row.channel-inapp { background: #f8fafc; border-color: #e2e8f0; }
.channel-toggle-row.channel-sms   { background: #fffaf5; border-color: #ffedd5; }
.channel-toggle-row.channel-email { background: #f0f7ff; border-color: #dbeafe; }
.channel-toggle-row.channel-push  { background: #fcfaff; border-color: #f3e8ff; }

.channel-icon-circle {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
}

.channel-icon-circle.channel-inapp { background: #e2e8f0; color: #334155; }
.channel-icon-circle.channel-sms   { background: #fed7aa; color: #c2410c; }
.channel-icon-circle.channel-email { background: #bfdbfe; color: #1d4ed8; }
.channel-icon-circle.channel-push  { background: #e9d5ff; color: #7e22ce; }
.channel-icon-circle.channel-telegram { background: #ddd6fe; color: #6d28d9; }

.channel-title-text {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
    line-height: 1.2;
}

.channel-sub-text {
    font-size: 11.5px;
    color: #64748b;
    line-height: 1;
}

/* ── Filter Controls ─────────────────────────────────────────────── */
.btn-mark-all-read {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 9px;
    border: 1px solid #c4b5fd;
    background: #f5f3ff;
    color: #6737d7;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-mark-all-read:hover:not(:disabled) {
    background: #ede9fe;
}

.tab-pill-group {
    display: inline-flex;
    background: #f1f5f9;
    padding: 3px;
    border-radius: 10px;
    gap: 3px;
}

.tab-pill-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 8px;
    border: 0;
    background: transparent;
    color: #64748b;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
}

.tab-pill-btn.active {
    background: #ffffff;
    color: #6737d7;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.pill-count {
    font-size: 11px;
    font-weight: 700;
    padding: 1px 6px;
    border-radius: 999px;
    background: #e2e8f0;
    color: #475569;
}

.pill-count.unread-pill {
    background: #6737d7;
    color: #ffffff;
}

.filter-dropdown {
    width: auto;
    border-radius: 9px;
    border: 1px solid #e2e8f0;
    font-size: 13px;
    padding: 6px 28px 6px 10px;
    font-weight: 500;
    color: #334155;
    background-color: #f8fafc;
}

.btn-reset-filters {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    background: #ffffff;
    color: #64748b;
    font-size: 12.5px;
    font-weight: 600;
    cursor: pointer;
}

.btn-reset-filters:hover {
    background: #f1f5f9;
    color: #1e293b;
}

/* ── Search Input ────────────────────────────────────────────────── */
.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon-left {
    position: absolute;
    left: 14px;
    color: #94a3b8;
    pointer-events: none;
    display: flex;
}

.form-control-search {
    padding-left: 40px;
    padding-right: 36px;
    height: 42px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #f8fafc;
    font-size: 13.5px;
}

.form-control-search:focus {
    background: #ffffff;
    border-color: #a78bfa;
    box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.15);
}

.btn-clear-search {
    position: absolute;
    right: 12px;
    background: transparent;
    border: 0;
    color: #94a3b8;
    font-size: 13px;
    cursor: pointer;
}

/* ── Notification Feed List ──────────────────────────────────────── */
.notifications-feed-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.notification-feed-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 18px;
    border-radius: 14px;
    border: 1px solid #edf0f5;
    background: #ffffff;
    transition: all 0.15s ease;
}

.notification-feed-card:hover {
    background: #fafbff;
    border-color: #dbeafe;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
}

.notification-feed-card.is-unread {
    background: #faf8ff;
    border-color: #ddd6fe;
    box-shadow: 0 2px 8px rgba(103, 55, 215, 0.05);
}

.notification-feed-card.is-updating {
    opacity: 0.6;
    pointer-events: none;
}

.feed-body-wrap {
    cursor: pointer;
}

.btn-delete-item {
    background: transparent;
    border: 0;
    color: #94a3b8;
    padding: 4px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.btn-delete-item:hover {
    background: #fee2e2;
    color: #dc2626;
}

/* Channel Badge Icons */
.feed-icon-badge {
    width: 44px;
    height: 44px;
    border-radius: 13px;
    display: grid;
    place-items: center;
}

.feed-icon-badge.in_app   { background: #f1f5f9; color: #475569; }
.feed-icon-badge.sms     { background: #fff4eb; color: #ea580c; }
.feed-icon-badge.email   { background: #eff6ff; color: #2563eb; }
.feed-icon-badge.push    { background: #f3effe; color: #7c3aed; }
.feed-icon-badge.telegram { background: #f3effe; color: #7c3aed; }

.feed-item-title {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.3;
}

.badge-unread-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #6737d7;
    flex-shrink: 0;
}

.badge-priority {
    font-size: 10.5px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 6px;
    text-transform: uppercase;
}

.badge-priority.critical { background: #fef2f2; color: #dc2626; }
.badge-priority.high     { background: #fff7ed; color: #c2410c; }
.badge-priority.normal   { background: #f1f5f9; color: #475569; }
.badge-priority.low      { background: #f8fafc; color: #94a3b8; }

.feed-item-message {
    font-size: 13.5px;
    color: #475569;
    line-height: 1.45;
    word-break: break-word;
}

.meta-time-text {
    font-size: 12px;
    color: #94a3b8;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.meta-channel-pill {
    font-size: 10.5px;
    font-weight: 700;
    padding: 1px 7px;
    border-radius: 5px;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}

.meta-channel-pill.in_app   { background: #f1f5f9; color: #475569; }
.meta-channel-pill.sms     { background: #fff4eb; color: #ea580c; }
.meta-channel-pill.email   { background: #eff6ff; color: #2563eb; }
.meta-channel-pill.push    { background: #f3effe; color: #7c3aed; }
.meta-channel-pill.telegram { background: #f3effe; color: #7c3aed; }

.meta-event-tag {
    font-size: 11px;
    font-family: monospace;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
    padding: 1px 6px;
    border-radius: 4px;
}

.status-read-indicator {
    font-size: 12px;
}

/* ── Empty State Icon ────────────────────────────────────────────── */
.empty-icon-circle {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #f5f3ff;
    color: #8b5cf6;
    display: grid;
    place-items: center;
}

/* ── Logout Modal (Matches Admin Design) ────────────────────────── */
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

.profile-modal-box {
    max-width: 480px;
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

.btn-modal-cancel,
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

.btn-modal-cancel {
    background: #f1f5f9;
    border: 0;
    color: #475569;
}

.btn-modal-cancel:hover:not(:disabled) {
    background: #e2e8f0;
    color: #1e293b;
}

:global([data-theme="dark"] .btn-modal-cancel) {
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

/* ── Dark Mode Support ───────────────────────────────────────────── */
:global([data-theme="dark"] .user-portal-view) {
    background-color: #0b0f19;
    color: #f8fafc;
}

:global([data-theme="dark"] .user-top-navbar) {
    background-color: #111827;
    border-bottom-color: #1f293d;
}

:global([data-theme="dark"] .brand-title) {
    color: #f8fafc;
}

:global([data-theme="dark"] .greeting-name) {
    color: #f8fafc;
}

:global([data-theme="dark"] .btn-icon-nav) {
    background: #1f293d;
    border-color: #334155;
    color: #cbd5e1;
}

:global([data-theme="dark"] .btn-profile-nav) {
    background: #1f293d;
    border-color: #334155;
    color: #f8fafc;
}

:global([data-theme="dark"] .card-sidebar-panel),
:global([data-theme="dark"] .card-notifications-panel) {
    background-color: #111827;
    border-color: #1f293d;
}

:global([data-theme="dark"] .panel-card-title),
:global([data-theme="dark"] .panel-main-title),
:global([data-theme="dark"] .profile-card-name),
:global([data-theme="dark"] .feed-item-title) {
    color: #f8fafc;
}

:global([data-theme="dark"] .notification-feed-card) {
    background-color: #161f30;
    border-color: #1f293d;
}

:global([data-theme="dark"] .notification-feed-card:hover) {
    background-color: #1a253a;
}

:global([data-theme="dark"] .notification-feed-card.is-unread) {
    background-color: #1e1b4b;
    border-color: #4338ca;
}

:global([data-theme="dark"] .feed-item-message) {
    color: #cbd5e1;
}

:global([data-theme="dark"] .tab-pill-group) {
    background-color: #1f293d;
}

:global([data-theme="dark"] .tab-pill-btn.active) {
    background-color: #334155;
    color: #f8fafc;
}

:global([data-theme="dark"] .form-control-search),
:global([data-theme="dark"] .filter-dropdown) {
    background-color: #1f293d;
    border-color: #334155;
    color: #f8fafc;
}

@media (max-width: 768px) {
    .user-top-navbar {
        padding: 12px 16px;
    }
    .portal-container {
        padding: 0 12px;
    }
}
</style>
