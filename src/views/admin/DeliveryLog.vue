<template>
    <section>
        <h1>Delivery Logs</h1>
        <p class="text-muted">Track provider attempts and delivery failures.</p>
        <p v-if="error" class="alert alert-danger">{{ error }}</p>
        <div class="card p-3">
            <BaseTable :columns="columns" :rows="rows" :loading="loading" row-key="log_id" /><button
                class="btn btn-outline-secondary mt-3" :disabled="loading || !hasMore" @click="load(page + 1)">{{
                    hasMore ? 'Load more' :'No more logs' }}</button>
        </div>
    </section>
</template>
<script setup>
import { onMounted, ref } from 'vue'; import BaseTable from '@/components/ui/BaseTable.vue'; import { get } from '@/services/api'
const loading = ref(false), error = ref(''), rows = ref([]), page = ref(1), hasMore = ref(true)
const columns = [{ key: 'notification_title', label: 'Notification' }, { key: 'sent_to_user', label: 'Recipient' }, { key: 'channel', label: 'Channel' }, { key: 'provider', label: 'Provider' }, { key: 'log_status', label: 'Status' }, { key: 'attempt_count', label: 'Attempts' }, { key: 'executed_at', label: 'Executed' }]
async function load(next = 1) { loading.value = true; try { const result = await get(`/admin/notification/getLog?page=${next}&limit=20`); rows.value = next === 1 ? result.data : [...rows.value, ...result.data]; page.value = next; hasMore.value = next < result.pagination.total_pages } catch (e) { error.value = e.message } finally { loading.value = false } } onMounted(load)
</script>
