<template>
  <div v-if="isRouteLoading" class="top-loading-bar" aria-hidden="true"></div>
  <BaseToast />
  <router-view></router-view>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseToast from '@/components/common/BaseToast.vue'

const router = useRouter()
const isRouteLoading = ref(false)

router.beforeEach(() => {
  isRouteLoading.value = true
})

router.afterEach(() => {
  setTimeout(() => {
    isRouteLoading.value = false
  }, 200)
})
</script>

<style>
.top-loading-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #7945e9, #a855f7, #6366f1);
  z-index: 999999;
  animation: top-bar-anim 1.1s ease-in-out infinite;
  box-shadow: 0 1px 8px rgba(121, 69, 233, 0.4);
}

@keyframes top-bar-anim {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}
</style>
