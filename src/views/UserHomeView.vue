<template>
    <main class="user-page">
        <header>
            <div>
                <p class="overline">OmniNotify</p>
                <h1>Welcome, {{ user.full_name || 'there' }}</h1>
                <p class="muted">Your latest notifications and account activity.</p>
            </div><button class="logout" @click="logout">Log out</button>
        </header>
        <p v-if="error" class="error">{{ error }}</p>
        <section class="card">
            <h2>Notifications</h2>
            <div v-if="loading" class="muted">Loading…</div>
            <div v-else-if="!notifications.length" class="muted">You have no notifications yet.</div>
            <article v-for="item in notifications" :key="item.notification_id" class="notification">
                <strong>{{ item.title }}</strong><span>{{ item.body }}</span><small>{{ item.created_at ? new
                    Date(item.created_at).toLocaleString() : ''}}</small></article>
        </section>
    </main>
</template>
<script setup>
import { onMounted, ref } from 'vue'; import { useRouter } from 'vue-router'; import { apiRequest } from '@/services/api'
const router = useRouter(), user = ref(JSON.parse(localStorage.getItem('user') || '{}')), notifications = ref([]), loading = ref(false), error = ref('')
onMounted(async () => { loading.value = true; try { const [me, result] = await Promise.all([apiRequest('/auth/user/me'), apiRequest('/auth/user/notifications?page=1&limit=20')]); user.value = me; localStorage.setItem('user', JSON.stringify(me)); notifications.value = result.data || [] } catch (e) { error.value = e.message } finally { loading.value = false } })
async function logout() { try { await apiRequest('/auth/user/logout', { method: 'DELETE' }) } catch (_) { } localStorage.removeItem('token'); localStorage.removeItem('user'); router.push({ name: 'login' }) }
</script>
<style scoped>
.user-page {
    min-height: 100vh;
    padding: clamp(28px, 6vw, 80px);
    background: #f7f7fb;
    color: #171a27
}

.user-page header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    max-width: 1000px;
    margin: 0 auto 30px
}

.overline {
    color: #7650df;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: .12em;
    text-transform: uppercase
}

.user-page h1 {
    margin: 10px 0;
    font-size: 38px
}

.muted {
    color: #778096
}

.logout {
    padding: 11px 18px;
    border: 1px solid #dedfe7;
    border-radius: 9px;
    background: #fff;
    cursor: pointer
}

.card {
    max-width: 1000px;
    margin: auto;
    padding: 24px;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 10px 30px #33216b0d
}

.card h2 {
    margin-top: 0
}

.notification {
    display: grid;
    gap: 5px;
    padding: 18px 0;
    border-top: 1px solid #eef0f3
}

.notification span {
    color: #697086
}

.notification small {
    color: #8a91a3
}

.error {
    max-width: 1000px;
    margin: 0 auto 20px;
    padding: 12px;
    border-radius: 8px;
    color: #ad3045;
    background: #fff0f2
}
</style>
