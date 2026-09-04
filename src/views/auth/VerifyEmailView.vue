<template>
  <main class="verify-page">
    <div class="verify-card">
      <div v-if="loading" class="spinner-mark">
        <span class="page-spinner"></span>
      </div>
      <div v-else-if="success" class="verify-mark success-mark">✓</div>
      <div v-else class="verify-mark error-mark">✕</div>

      <h1>
        {{ loading ? 'Verifying email…' : success ? 'Email Verified!' : 'Verification Failed' }}
      </h1>

      <p class="message">{{ message }}</p>

      <p v-if="success" class="redirect-hint">
        Redirecting to login in {{ countdown }}s…
      </p>

      <div class="actions">
        <RouterLink class="verify-button" :to="{ name: 'login' }">
          {{ success ? 'Continue to Login' : 'Back to Login' }}
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest } from '@/services/api'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const toast = useToastStore()

const loading = ref(true)
const success = ref(false)
const message = ref('Please wait while we verify your email address…')
const countdown = ref(2)
let timer = null

onMounted(async () => {
  const token = String(route.query.token || '').trim()

  if (!token) {
    loading.value = false
    success.value = false
    message.value = 'No verification token provided. Please check your verification link.'
    toast.error('Verification token is missing.', 'Verification Failed')
    return
  }

  try {
    await apiRequest(`/auth/user/verify-email?token=${encodeURIComponent(token)}`)
    loading.value = false
    success.value = true
    message.value = 'Your email has been verified successfully! Redirecting you to sign in…'
    toast.success('Your email is verified! Please log in to continue.', 'Email Verified')

    // Start auto-redirect countdown directly to login
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
        router.push({ name: 'login' })
      }
    }, 1000)
  } catch (err) {
    loading.value = false
    success.value = false
    message.value = err.message || 'Verification token is invalid or has expired.'
    toast.error(message.value, 'Verification Failed')
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: #f7f7fb;
  padding: 20px;
}

.verify-card {
  width: min(92%, 460px);
  padding: 48px 36px;
  text-align: center;
  border: 1px solid #eceaf5;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 20px 60px rgba(77, 59, 148, 0.08);
}

.verify-mark {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  border-radius: 50%;
  color: #fff;
  font-size: 28px;
  font-weight: bold;
}

.success-mark {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 10px 24px rgba(34, 197, 94, 0.28);
}

.error-mark {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 10px 24px rgba(239, 68, 68, 0.28);
}

.spinner-mark {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.page-spinner {
  width: 48px;
  height: 48px;
  border: 3.5px solid #e2ddf8;
  border-top-color: #6d3de2;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.verify-card h1 {
  margin: 0 0 12px;
  font-size: 24px;
  color: #222638;
  font-weight: 700;
}

.message {
  margin: 0 0 16px;
  color: #636b80;
  font-size: 15px;
  line-height: 1.5;
}

.redirect-hint {
  margin: 0 0 24px;
  font-size: 13px;
  color: #858c9d;
  font-weight: 500;
}

.actions {
  margin-top: 20px;
}

.verify-button {
  display: inline-block;
  padding: 13px 28px;
  border-radius: 10px;
  color: #fff;
  background: linear-gradient(100deg, #7945e9, #6330d9);
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
  box-shadow: 0 8px 18px rgba(115, 64, 223, 0.25);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.verify-button:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}
</style>
