<template><section><h1>Audit Logs</h1><p class="text-muted">Review administrative activity and changes.</p><p v-if="error" class="alert alert-danger">{{ error }}</p><div class="row g-3 mb-3"><div v-for="(value,key) in stats" :key="key" class="col-md-3"><div class="card p-3"><small class="text-muted">{{ key }}</small><strong>{{ value }}</strong></div></div></div><div class="card p-3"><BaseTable :columns="columns" :rows="rows" :loading="loading" row-key="audit_id" /></div></section></template>
<script setup>
import { onMounted, ref } from 'vue'; import BaseTable from '@/components/common/BaseTable.vue'; import { get } from '@/services/api'
const loading=ref(false),error=ref(''),rows=ref([]),stats=ref({})
const columns=[{key:'action',label:'Action'},{key:'entity_type',label:'Entity'},{key:'entity_id',label:'Entity ID'},{key:'ip_address',label:'IP address'},{key:'created_at',label:'Created'}]
onMounted(async()=>{loading.value=true;try{const [logs,summary]=await Promise.all([get('/admin/audit/audit-logs?page=1&limit=50'),get('/admin/audit/audit-logs/stats')]);rows.value=logs.audit_logs||logs.data||[];stats.value=summary||{}}catch(e){error.value=e.message}finally{loading.value=false}})
</script>
