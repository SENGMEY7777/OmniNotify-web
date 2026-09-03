<template><section><h1>Users</h1><p class="text-muted">All registered users and account status.</p><p v-if="error" class="alert alert-danger">{{ error }}</p><div class="card p-3"><BaseTable :columns="columns" :rows="rows" :loading="loading" row-key="user_id" /></div></section></template>
<script setup>
import { onMounted, ref } from 'vue'; import BaseTable from '@/components/ui/BaseTable.vue'; import { get } from '@/services/api'
const loading=ref(false), error=ref(''), rows=ref([])
const columns=[{key:'full_name',label:'Name'},{key:'email',label:'Email'},{key:'phone_number',label:'Phone'},{key:'role',label:'Role'},{key:'status',label:'Status'},{key:'created_at',label:'Created'}]
onMounted(async()=>{loading.value=true;try{const result=await get('/auth/admin/getAll');rows.value=(result.users||[]).map(u=>({...u,status:u.status?'Active':'Inactive',created_at:u.created_at?new Date(u.created_at).toLocaleDateString():'—'}))}catch(e){error.value=e.message}finally{loading.value=false}})
</script>
