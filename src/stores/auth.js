import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getCookie, setCookie, removeCookie } from '@/utils/cookies'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(getCookie('token') || localStorage.getItem('token') || '')
  const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))

  const isAuthenticated = computed(() => Boolean(token.value))
  const isAdmin = computed(() => user.value?.role === 'admin')
  const isUser = computed(() => user.value?.role === 'user')

  function setAuth(newToken, newUser) {
    token.value = newToken
    user.value = newUser || {}
    setCookie('token', newToken, { days: 7 })
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser || {}))
  }

  function clearAuth() {
    token.value = ''
    user.value = {}
    removeCookie('token')
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return {
    token,
    user,
    isAuthenticated,
    isAdmin,
    isUser,
    setAuth,
    clearAuth,
  }
})
