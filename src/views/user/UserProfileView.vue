<template>
    <div class="settings-view user-profile-view">
        <div class="header-section mb-4">
            <h1 class="page-title">My Profile</h1>
            <p class="page-subtitle">Manage your personal account information, security credentials, and alert channels.</p>
        </div>

        <div class="row g-4">
            <!-- Profile Info Card -->
            <div class="col-lg-8">
                <div class="card settings-card p-4 mb-4">
                    <h3 class="card-section-title mb-3">User Profile</h3>

                    <div v-if="message" class="alert mb-4" :class="ok ? 'alert-success' : 'alert-danger'">
                        {{ message }}
                    </div>

                    <form @submit.prevent="save">
                        <!-- Avatar Section -->
                        <div class="avatar-setting-section mb-4">
                            <h4 class="avatar-upload-title">Profile picture upload</h4>
                            <div class="avatar-upload-row">
                                <img
                                    :src="avatarSrc"
                                    alt="User Avatar"
                                    class="avatar-large avatar-img"
                                    @error="$event.target.src = DEFAULT_AVATAR"
                                />
                                <div class="avatar-upload-details">
                                    <strong>{{ form.full_name || 'Valued User' }}</strong>
                                    <span>Role/Title</span>
                                    <span>Account Member</span>
                                </div>
                                <input
                                    ref="avatarFileInput"
                                    type="file"
                                    accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
                                    class="d-none"
                                    :disabled="avatarLoading"
                                    @change="handleAvatarFile"
                                />
                                <button
                                    type="button"
                                    class="btn upload-photo-button"
                                    :disabled="avatarLoading"
                                    @click="chooseAvatarFile"
                                >
                                    <span v-if="avatarLoading" class="spinner-border spinner-border-sm me-1"></span>
                                    <span v-else class="upload-cloud" aria-hidden="true">☁</span>
                                    Upload New Photo
                                </button>
                                <button
                                    type="button"
                                    class="btn delete-photo-button"
                                    :disabled="avatarLoading || !form.avatar_url"
                                    @click="deleteAvatar"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>

                        <div class="form-divider mb-4"></div>

                        <!-- General Profile Fields -->
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Full Name <span class="text-danger">*</span></label>
                                <input
                                    v-model="form.full_name"
                                    class="form-control"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Email Address <span class="text-danger">*</span></label>
                                <input
                                    v-model="form.email"
                                    type="email"
                                    class="form-control"
                                    placeholder="user@omninotify.com"
                                    required
                                />
                            </div>
                        </div>

                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Phone Number</label>
                                <input
                                    v-model="form.phone_number"
                                    class="form-control"
                                    placeholder="+855 12 345 678"
                                />
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Gender</label>
                                <select v-model.number="form.gender" class="form-select">
                                    <option :value="0">Female</option>
                                    <option :value="1">Male</option>
                                </select>
                            </div>
                        </div>

                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-primary" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                                Save Profile Changes
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Channel Preferences Card -->
                <div class="card settings-card p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div>
                            <h3 class="card-section-title mb-1">Notification Preferences</h3>
                            <p class="text-muted small mb-0">Control which delivery channels are enabled for your alerts.</p>
                        </div>
                        <button
                            class="btn btn-sm btn-outline-primary-pref"
                            :disabled="savingPrefs"
                            @click="savePreferences"
                        >
                            <span v-if="savingPrefs" class="spinner-border spinner-border-sm me-1"></span>
                            <span>{{ savingPrefs ? 'Saving...' : 'Save Preferences' }}</span>
                        </button>
                    </div>

                    <div class="pref-grid">
                        <div class="pref-item d-flex justify-content-between align-items-center p-3 rounded-3 mb-2">
                            <div class="d-flex align-items-center gap-3">
                                <span class="pref-icon-box in-app"><TablerIcon name="bell" :size="20" /></span>
                                <div>
                                    <strong class="d-block text-dark font-size-14">In-App Notifications</strong>
                                    <span class="text-muted small">Receive popup alerts inside the web platform</span>
                                </div>
                            </div>
                            <div class="form-check form-switch m-0">
                                <input v-model="prefs.enable_in_app" class="form-check-input" type="checkbox" role="switch" />
                            </div>
                        </div>

                        <div class="pref-item d-flex justify-content-between align-items-center p-3 rounded-3 mb-2">
                            <div class="d-flex align-items-center gap-3">
                                <span class="pref-icon-box email"><TablerIcon name="mail" :size="20" /></span>
                                <div>
                                    <strong class="d-block text-dark font-size-14">Email Notifications</strong>
                                    <span class="text-muted small">Receive statements & transaction emails</span>
                                </div>
                            </div>
                            <div class="form-check form-switch m-0">
                                <input v-model="prefs.enable_email" class="form-check-input" type="checkbox" role="switch" />
                            </div>
                        </div>

                        <div class="pref-item d-flex justify-content-between align-items-center p-3 rounded-3 mb-2">
                            <div class="d-flex align-items-center gap-3">
                                <span class="pref-icon-box sms"><TablerIcon name="hash" :size="20" /></span>
                                <div>
                                    <strong class="d-block text-dark font-size-14">SMS Notifications</strong>
                                    <span class="text-muted small">Receive SMS text alerts for urgent transactions</span>
                                </div>
                            </div>
                            <div class="form-check form-switch m-0">
                                <input v-model="prefs.enable_sms" class="form-check-input" type="checkbox" role="switch" />
                            </div>
                        </div>

                        <div class="pref-item d-flex justify-content-between align-items-center p-3 rounded-3">
                            <div class="d-flex align-items-center gap-3">
                                <span class="pref-icon-box push"><TablerIcon name="bolt" :size="20" /></span>
                                <div>
                                    <strong class="d-block text-dark font-size-14">Push Notifications</strong>
                                    <span class="text-muted small">Instant device push alerts</span>
                                </div>
                            </div>
                            <div class="form-check form-switch m-0">
                                <input v-model="prefs.enable_push" class="form-check-input" type="checkbox" role="switch" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Profile Summary & Telegram Side Cards -->
            <div class="col-lg-4">
                <!-- User Summary Card -->
                <div class="card settings-card p-4 text-center mb-4">
                    <div class="d-flex justify-content-center mb-3">
                        <img
                            :src="avatarSrc"
                            alt="User Avatar"
                            class="avatar-preview-side avatar-img"
                            @error="$event.target.src = DEFAULT_AVATAR"
                        />
                    </div>
                    <h4 class="fw-bold mb-1">{{ form.full_name || 'Valued User' }}</h4>
                    <p class="text-muted small mb-3">{{ form.email || 'user@omninotify.com' }}</p>
                    <div>
                        <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold">
                            ACCOUNT USER
                        </span>
                    </div>
                </div>

                <!-- Telegram Integration Card -->
                <div class="card settings-card p-4 text-center">
                    <div class="telegram-side-icon-box mb-3 mx-auto">
                        <IconBrandTelegram :size="36" />
                    </div>
                    <h5 class="fw-bold mb-1">Telegram Banking Alerts</h5>
                    <p class="text-muted small mb-3">
                        Connect your Telegram bot to get live alerts, OTP codes, and payment notifications directly in Telegram.
                    </p>
                    <button
                        type="button"
                        class="btn btn-telegram-connect w-100"
                        :disabled="telegramLoading"
                        @click="connectTelegram"
                    >
                        <span v-if="telegramLoading" class="spinner-border spinner-border-sm me-1"></span>
                        <IconBrandTelegram v-else :size="18" />
                        <span>{{ telegramLoading ? 'Connecting...' : 'Connect Telegram Bot' }}</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { IconBrandTelegram } from '@tabler/icons-vue'
import TablerIcon from '@/components/common/TablerIcon.vue'
import { get, put, del, apiRequest } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { getAvatarUrl, DEFAULT_AVATAR } from '@/utils/avatar'

const authStore = useAuthStore()
const toast = useToastStore()

const form = ref({
    full_name: '',
    email: '',
    phone_number: '',
    gender: 0,
    avatar_url: '',
})

const prefs = ref({
    enable_in_app: true,
    enable_email: true,
    enable_sms: false,
    enable_push: false,
})

const avatarFileInput = ref(null)
const selectedAvatarFile = ref(null)
const avatarPreviewUrl = ref('')
const avatarSrc = computed(() => getAvatarUrl(avatarPreviewUrl.value || form.value.avatar_url))
const loading = ref(false)
const savingPrefs = ref(false)
const avatarLoading = ref(false)
const telegramLoading = ref(false)
const message = ref('')
const ok = ref(false)

async function loadProfile() {
    try {
        const [profileRes, prefRes] = await Promise.allSettled([
            get('/auth/user/me'),
            get('/auth/user/preferences')
        ])

        if (profileRes.status === 'fulfilled' && profileRes.value) {
            const data = profileRes.value?.data || profileRes.value?.user || profileRes.value || {}
            form.value.full_name = data.full_name ?? ''
            form.value.email = data.email ?? ''
            form.value.phone_number = data.phone_number ?? ''
            form.value.gender = Number(data.gender ?? 0)
            form.value.avatar_url = data.avatar_url ?? ''
            authStore.updateUser(data)
        }

        if (prefRes.status === 'fulfilled' && prefRes.value) {
            const prefList = Array.isArray(prefRes.value) ? prefRes.value : (prefRes.value.data || [])
            if (prefList.length > 0) {
                const first = prefList[0]
                prefs.value.enable_in_app = Boolean(first.enable_in_app)
                prefs.value.enable_email = Boolean(first.enable_email)
                prefs.value.enable_sms = Boolean(first.enable_sms)
                prefs.value.enable_push = Boolean(first.enable_push)
            }
        }
    } catch (e) {
        message.value = e.message || 'Failed to load profile'
    }
}

onMounted(loadProfile)

async function save() {
    loading.value = true
    message.value = ''
    try {
        const payload = {
            full_name: form.value.full_name,
            email: form.value.email,
            phone_number: form.value.phone_number,
            gender: form.value.gender,
        }
        const res = await put('/auth/user/profile/update', payload)
        const updated = res?.data || res || {}

        const cleaned = {
            full_name: updated.full_name ?? form.value.full_name,
            email: updated.email ?? form.value.email,
            phone_number: updated.phone_number ?? form.value.phone_number,
            gender: Number(updated.gender ?? form.value.gender)
        }

        Object.assign(form.value, cleaned)
        authStore.updateUser(cleaned)

        message.value = 'User profile updated successfully'
        ok.value = true
        toast.success('Profile updated successfully!')
    } catch (e) {
        message.value = e.message || 'Failed to update profile'
        ok.value = false
        toast.error(message.value)
    } finally {
        loading.value = false
    }
}

async function savePreferences() {
    savingPrefs.value = true
    try {
        await put('/auth/user/preferences', {
            event_type: 'SYSTEM_ALERT',
            enable_in_app: prefs.value.enable_in_app ? 1 : 0,
            enable_email: prefs.value.enable_email ? 1 : 0,
            enable_sms: prefs.value.enable_sms ? 1 : 0,
            enable_push: prefs.value.enable_push ? 1 : 0,
        })
        toast.success('Notification preferences updated!')
    } catch (err) {
        toast.error(err.message || 'Failed to save preferences.')
    } finally {
        savingPrefs.value = false
    }
}

function handleAvatarFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
        message.value = 'Please select an image file.'
        ok.value = false
        selectedAvatarFile.value = null
        return
    }
    if (file.size > 5 * 1024 * 1024) {
        message.value = 'Avatar must be 5 MB or smaller.'
        ok.value = false
        selectedAvatarFile.value = null
        return
    }

    if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
    selectedAvatarFile.value = file
    avatarPreviewUrl.value = URL.createObjectURL(file)
    uploadAvatarFile()
}

function chooseAvatarFile() {
    avatarFileInput.value?.click()
}

async function uploadAvatarFile() {
    if (!selectedAvatarFile.value) return

    avatarLoading.value = true
    message.value = ''
    try {
        const body = new FormData()
        body.append('avatar', selectedAvatarFile.value)
        const data = await put('/auth/user/profile/update-avatar', body)
        const newAvatarUrl = data?.avatar_url || ''
        form.value.avatar_url = newAvatarUrl
        authStore.updateUser({ ...data, avatar_url: newAvatarUrl })
        selectedAvatarFile.value = null
        if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
        avatarPreviewUrl.value = ''
        if (avatarFileInput.value) avatarFileInput.value.value = ''
        message.value = 'Profile picture updated successfully'
        ok.value = true
        toast.success('Avatar uploaded successfully!')
    } catch (e) {
        message.value = e.message || 'Failed to upload avatar'
        ok.value = false
        toast.error(message.value)
    } finally {
        avatarLoading.value = false
    }
}

async function deleteAvatar() {
    avatarLoading.value = true
    message.value = ''
    try {
        await del('/auth/user/profile/delete-avatar')
        form.value.avatar_url = ''
        authStore.updateUser({ avatar_url: '' })
        message.value = 'Profile picture removed successfully'
        ok.value = true
        toast.success('Avatar deleted!')
    } catch (e) {
        message.value = e.message || 'Failed to delete avatar'
        ok.value = false
        toast.error(message.value)
    } finally {
        avatarLoading.value = false
    }
}

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
</script>

<style scoped>
.settings-view {
    padding: 0 4px;
}

.page-title {
    font-size: 26px;
    font-weight: 800;
    color: #1e293b;
    margin-bottom: 4px;
}

.page-subtitle {
    font-size: 14px;
    color: #64748b;
    margin-bottom: 0;
}

.settings-card {
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.settings-card .btn-primary {
    border-color: #8751ff;
    background-color: #8751ff;
}

.settings-card .btn-primary:hover:not(:disabled),
.settings-card .btn-primary:focus-visible {
    border-color: #733be6;
    background-color: #733be6;
}

.card-section-title {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
}

.form-divider {
    height: 1px;
    background: #e2e8f0;
}

.avatar-setting-section {
    display: block;
}

.avatar-upload-title {
    margin: 0 0 14px;
    color: #111827;
    font-size: 16px;
    font-weight: 700;
}

.avatar-upload-row {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
}

.avatar-upload-details {
    display: flex;
    min-width: 120px;
    flex-direction: column;
    gap: 2px;
    margin-right: auto;
    color: #64748b;
    font-size: 13px;
    line-height: 1.25;
}

.avatar-upload-details strong {
    margin-bottom: 2px;
    color: #111827;
    font-size: 15px;
}

.upload-photo-button,
.delete-photo-button {
    min-height: 42px;
    padding: 9px 17px;
    border-radius: 7px;
    font-size: 14px;
    font-weight: 600;
    white-space: nowrap;
}

.upload-photo-button {
    color: #ffffff;
    background: linear-gradient(135deg, #8751ff, #733be6);
    border: 0;
}

.upload-photo-button:hover:not(:disabled) {
    color: #ffffff;
    background: linear-gradient(135deg, #733be6, #5f28d9);
}

.delete-photo-button {
    color: #733be6;
    border: 1px solid #ddd6fe;
    background: #ffffff;
}

.delete-photo-button:hover:not(:disabled) {
    color: #5f28d9;
    background: #f5f3ff;
}

.upload-cloud {
    margin-right: 4px;
    font-size: 17px;
}

.avatar-large {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 28px;
    font-weight: 800;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.avatar-preview-side {
    width: 90px;
    height: 90px;
    border-radius: 24px;
    display: grid;
    place-items: center;
    font-size: 34px;
    font-weight: 800;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.avatar-img {
    object-fit: cover;
    background: #f1f5f9;
}

/* Preferences styles */
.pref-item {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
}

.pref-icon-box {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.pref-icon-box.in-app { background: #e0f2fe; color: #0284c7; }
.pref-icon-box.email { background: #f3e8ff; color: #7c3aed; }
.pref-icon-box.sms { background: #fef3c7; color: #d97706; }
.pref-icon-box.push { background: #ecfdf5; color: #059669; }

.btn-outline-primary-pref {
    background: #f5f3ff;
    border: 1px solid #ddd6fe;
    color: #8751ff;
    font-weight: 600;
}

.btn-outline-primary-pref:hover {
    background: #ede9fe;
    color: #7c3aed;
}

/* Telegram Side Box */
.telegram-side-icon-box {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #e0f2fe;
    color: #0284c7;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn-telegram-connect {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 10px;
    background: #0284c7;
    border: 0;
    color: #ffffff;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);
}

.btn-telegram-connect:hover {
    background: #0369a1;
}

/* Dark theme overrides */
[data-theme="dark"] .page-title {
    color: #f8fafc;
}

[data-theme="dark"] .page-subtitle {
    color: #94a3b8;
}

[data-theme="dark"] .settings-card {
    background: #111827;
    border-color: #1f293d;
}

[data-theme="dark"] .card-section-title,
[data-theme="dark"] .avatar-upload-title,
[data-theme="dark"] .avatar-upload-details strong {
    color: #f8fafc;
}

[data-theme="dark"] .pref-item {
    background: #1e293b;
    border-color: #334155;
}

[data-theme="dark"] .delete-photo-button {
    background: #111827;
    border-color: #334155;
    color: #c4b5fd;
}

[data-theme="dark"] .form-divider {
    background: #1f293d;
}
</style>
