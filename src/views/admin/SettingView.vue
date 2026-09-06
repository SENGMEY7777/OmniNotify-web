<template>
    <div class="settings-view">
        <div class="header-section mb-4">
            <h1 class="page-title">Settings</h1>
            <p class="page-subtitle">Manage your administrator account credentials and public profile.</p>
        </div>

        <div class="row g-4">
            <!-- Profile Info Card -->
            <div class="col-lg-8">
                <div class="card settings-card p-4">
                    <h3 class="card-section-title mb-3">Admin Profile</h3>

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
                                    alt="Admin Avatar"
                                    class="avatar-large avatar-img"
                                    @error="$event.target.src = DEFAULT_AVATAR"
                                />
                                <div class="avatar-upload-details">
                                    <strong>{{ form.full_name || 'Admin User' }}</strong>
                                    <span>Role/Title</span>
                                    <span>Administrator</span>
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
                                    placeholder="admin@omninotify.com"
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
            </div>

            <!-- Profile Summary Card -->
            <div class="col-lg-4">
                <div class="card settings-card p-4 text-center">
                    <div class="d-flex justify-content-center mb-3">
                        <img
                            :src="avatarSrc"
                            alt="Admin Avatar"
                            class="avatar-preview-side avatar-img"
                            @error="$event.target.src = DEFAULT_AVATAR"
                        />
                    </div>
                    <h4 class="fw-bold mb-1">{{ form.full_name || 'Admin User' }}</h4>
                    <p class="text-muted small mb-3">{{ form.email || 'admin@omninotify.com' }}</p>
                    <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold">
                        ADMINISTRATOR
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { get, put, del } from '@/services/api'
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

const avatarFileInput = ref(null)
const selectedAvatarFile = ref(null)
const avatarPreviewUrl = ref('')
const avatarSrc = computed(() => getAvatarUrl(avatarPreviewUrl.value || form.value.avatar_url))
const loading = ref(false)
const avatarLoading = ref(false)
const message = ref('')
const ok = ref(false)

const userInitial = computed(() => {
    return (form.value.full_name?.[0] || authStore.user?.full_name?.[0] || 'A').toUpperCase()
})

function onAvatarImgError() {
    // If image fails to load, do nothing destructive
}

async function loadProfile() {
    try {
        const res = await get('/auth/admin/profile')
        const data = res?.data || res || {}
        // Only assign the 5 editable fields — never spread the whole API response
        // into the form (would include user_id, role, status, is_verified, etc.)
        form.value.full_name    = data.full_name    ?? ''
        form.value.email        = data.email        ?? ''
        form.value.phone_number = data.phone_number ?? ''
        form.value.gender       = Number(data.gender ?? 0)
        form.value.avatar_url   = data.avatar_url   ?? ''
        authStore.updateUser(data)
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
        const res = await put('/auth/admin/profile/update-profile', payload)
        const updated = res?.data || res || {}
        
        // Update form and store only with returned editable fields
        const cleaned = {
            full_name: updated.full_name ?? form.value.full_name,
            email: updated.email ?? form.value.email,
            phone_number: updated.phone_number ?? form.value.phone_number,
            gender: Number(updated.gender ?? form.value.gender)
        }
        
        Object.assign(form.value, cleaned)
        authStore.updateUser(cleaned)
        
        message.value = 'Admin profile updated successfully'
        ok.value = true
        toast.success('Admin profile updated successfully!')
    } catch (e) {
        message.value = e.message || 'Failed to update profile'
        ok.value = false
        toast.error(message.value)
    } finally {
        loading.value = false
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
        const data = await put('/auth/admin/profile/update-avatar', body)
        const newAvatarUrl = data?.avatar_url || ''
        form.value.avatar_url = newAvatarUrl
        authStore.updateUser({ ...data, avatar_url: newAvatarUrl })
        selectedAvatarFile.value = null
        if (avatarPreviewUrl.value) URL.revokeObjectURL(avatarPreviewUrl.value)
        avatarPreviewUrl.value = ''
        if (avatarFileInput.value) avatarFileInput.value.value = ''
        message.value = 'Admin avatar uploaded successfully'
        ok.value = true
        toast.success('Admin avatar uploaded successfully!')
    } catch (e) {
        message.value = e.message || 'Failed to upload avatar'
        ok.value = false
        toast.error(message.value)
    } finally {
        avatarLoading.value = false
    }
}

async function updateAvatar() {
    avatarLoading.value = true
    message.value = ''
    try {
        const res = await put('/auth/admin/profile/update-avatar', { avatar_url: form.value.avatar_url })
        const data = res?.data || res || {}
        const newAvatarUrl = data.avatar_url || form.value.avatar_url
        form.value.avatar_url = newAvatarUrl
        authStore.updateUser({ ...data, avatar_url: newAvatarUrl })
        message.value = 'Admin avatar updated successfully'
        ok.value = true
        toast.success('Admin avatar updated successfully!')
    } catch (e) {
        message.value = e.message || 'Failed to update avatar'
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
        await del('/auth/admin/profile/delete-avatar')
        form.value.avatar_url = ''
        authStore.updateUser({ avatar_url: '' })
        message.value = 'Admin avatar deleted successfully'
        ok.value = true
        toast.success('Admin avatar deleted successfully!')
    } catch (e) {
        message.value = e.message || 'Failed to delete avatar'
        ok.value = false
        toast.error(message.value)
    } finally {
        avatarLoading.value = false
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
    border-color: #2F1F6E;
    background-color: #2F1F6E;
}

.settings-card .btn-primary:hover:not(:disabled),
.settings-card .btn-primary:focus-visible {
    border-color: #241752;
    background-color: #241752;
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
    background: linear-gradient(135deg, #4f2aa8, #6244c4);
}

.upload-photo-button:hover:not(:disabled) {
    color: #ffffff;
    background: linear-gradient(135deg, #41208e, #5534b0);
}

.delete-photo-button {
    color: #51418e;
    border: 1px solid #8174c6;
    background: #ffffff;
}

.delete-photo-button:hover:not(:disabled) {
    color: #3e2e7d;
    background: #f6f4ff;
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

.avatar-initials {
    color: #ffffff;
    background: linear-gradient(135deg, #c48b71 0%, #a86c55 46%, #283040 47%, #1e2533 100%);
}

.avatar-img {
    object-fit: cover;
    background: #f1f5f9;
}

/* Dark theme overrides */
:global([data-theme="dark"] .page-title) {
    color: #f8fafc;
}

:global([data-theme="dark"] .page-subtitle) {
    color: #94a3b8;
}

:global([data-theme="dark"] .settings-card) {
    background: #111827;
    border-color: #1f293d;
}

:global([data-theme="dark"] .card-section-title) {
    color: #f8fafc;
}

:global([data-theme="dark"] .avatar-upload-title),
:global([data-theme="dark"] .avatar-upload-details strong) {
    color: #f8fafc;
}

:global([data-theme="dark"] .delete-photo-button) {
    background: #111827;
}

:global([data-theme="dark"] .form-divider) {
    background: #1f293d;
}
</style>
