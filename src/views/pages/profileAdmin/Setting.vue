<template>
    <section>
        <h1>Settings</h1>
        <p class="text-muted">Manage your administrator profile.</p>
        <p v-if="message" class="alert" :class="ok ? 'alert-success' : 'alert-danger'">{{ message }}</p>
        <form class="card p-4" @submit.prevent="save"><label class="form-label">Full name<input v-model="form.full_name"
                    class="form-control" required></label><label class="form-label">Email<input v-model="form.email"
                    type="email" class="form-control" required></label><label class="form-label">Phone number<input
                    v-model="form.phone_number" class="form-control"></label><label class="form-label">Gender<select
                    v-model.number="form.gender" class="form-select">
                    <option :value="0">Female</option>
                    <option :value="1">Male</option>
                </select></label><label class="form-label">Avatar URL<input v-model="form.avatar_url" type="url"
                    class="form-control"></label>
            <div><button class="btn btn-primary" :disabled="loading">Save profile</button><button type="button"
                    class="btn btn-outline-primary ms-2" @click="updateAvatar">Save avatar</button><button type="button"
                    class="btn btn-outline-danger ms-2" @click="deleteAvatar">Delete avatar</button></div>
        </form>
    </section>
</template>
<script setup>
import { onMounted, ref } from 'vue'; import { get, put, del } from '@/services/api'
const form = ref({ full_name: '', email: '', phone_number: '', gender: 0, avatar_url: '' }), loading = ref(false), message = ref(''), ok = ref(false)
onMounted(async () => { try { Object.assign(form.value, await get('/auth/admin/profile')) } catch (e) { message.value = e.message } })
async function save() { loading.value = true; try { Object.assign(form.value, await put('/auth/admin/profile/update-profile', form.value)); message.value = 'Profile updated'; ok.value = true; localStorage.setItem('user', JSON.stringify(form.value)) } catch (e) { message.value = e.message; ok.value = false } finally { loading.value = false } }
async function updateAvatar() { try { await put('/auth/admin/profile/update-avatar', { avatar_url: form.value.avatar_url }); message.value = 'Avatar updated'; ok.value = true } catch (e) { message.value = e.message; ok.value = false } }
async function deleteAvatar() { try { await del('/auth/admin/profile/delete-avatar'); message.value = 'Avatar deleted'; ok.value = true } catch (e) { message.value = e.message; ok.value = false } }
</script>
