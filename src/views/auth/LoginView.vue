<template>
  <AuthLayout
    overline="Welcome back"
    title="Sign in to your workspace"
    subtitle="Enter your details to continue."
  >
    <form novalidate @submit.prevent="submit">
      <label>
        Account type
        <select v-model="accountType">
          <option value="admin">Administrator</option>
          <option value="user">User</option>
        </select>
      </label>

      <label>
        Email
        <input
          v-model.trim="email"
          type="email"
          autocomplete="email"
          placeholder="johndoe@gmail.com"
          required
        />
      </label>

      <label>
        Password
        <div class="password-input-wrap">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            class="toggle-password-btn"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            <IconEye v-if="!showPassword" :size="18" />
            <IconEyeOff v-else :size="18" />
          </button>
        </div>
      </label>

      <RouterLink :to="{ name: 'forgot' }" class="forgot-link">
        Forgot password?
      </RouterLink>

      <p v-if="error" class="form-message error">{{ error }}</p>
      <p v-if="success" class="form-message success">{{ success }}</p>

      <button class="submit-button" type="submit" :disabled="loading">
        <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
        <span>{{ loading ? 'Signing in…' : 'Continue' }}</span>
        <span v-if="!loading">→</span>
      </button>
    </form>

    <p class="switch-copy">
      Don't have an account?
      <RouterLink :to="{ name: 'register' }">Register</RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { IconEye, IconEyeOff } from '@tabler/icons-vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { apiRequest } from '@/services/api'
import { loginSchema, validate } from '@/utils/validation'
import { setCookie } from '@/utils/cookies'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { initSocket } from '@/services/socket'

const router = useRouter()
const toast = useToastStore()
const authStore = useAuthStore()
const notifStore = useNotificationStore()

const accountType = ref('admin')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref('')

async function submit() {
  error.value = ''
  success.value = ''

  // Validate inputs with Joi schema
  const { error: validationError } = validate(loginSchema, {
    email: email.value,
    password: password.value,
    accountType: accountType.value,
  })

  if (validationError) {
    error.value = validationError
    toast.error(validationError, 'Validation Error')
    return
  }

  loading.value = true

  try {
    const isAdmin = accountType.value === 'admin'
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/user/login'
    const body = isAdmin
      ? { email: email.value, password: password.value }
      : { email: email.value, password_hash: password.value }

    const data = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    // Store in Secure Cookie (7 days) and localStorage
    if (data.token) {
      setCookie('token', data.token, { days: 7 })
      localStorage.setItem('token', data.token)
    }
    localStorage.setItem('user', JSON.stringify(data.user || {}))

    // Sync Pinia Stores
    authStore.setAuth(data.token, data.user)
    initSocket(true)
    notifStore.startPolling()   // immediate fetch + burst syncs + 6s polling

    success.value = 'Welcome back! You’re now securely signed in.'
    toast.success('Welcome back! You’re now securely signed in.', 'Login successful!')
    await router.push({ name: isAdmin ? 'admin-dashboard' : 'user-home' })
  } catch (err) {
    error.value = err.message
    toast.error(err.message, 'Login Failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
form {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

label {
  display: grid;
  gap: 8px;
  color: #303546;
  font-size: 14px;
  font-weight: 600;
}

input,
select {
  width: 100%;
  padding: 14px 15px;
  border: 1px solid #dedfe7;
  border-radius: 9px;
  outline: 0;
  color: #222638;
  background: #fff;
  font: 400 15px inherit;
}

input:focus,
select:focus {
  border-color: #8455ec;
  box-shadow: 0 0 0 4px #8455ec18;
}

.password-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.password-input-wrap input {
  padding-right: 44px;
}

.toggle-password-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: 0;
  padding: 4px;
  color: #858c9d;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: color 0.15s ease;
}

.toggle-password-btn:hover {
  color: #5330c4;
}

.forgot-link {
  justify-self: end;
  margin-top: -9px;
  color: #6737d7;
  font-size: 13px;
  text-decoration: none;
  font-weight: 600;
}

.forgot-link:hover {
  text-decoration: underline;
}

.form-message {
  margin: 0;
  padding: 11px 13px;
  border-radius: 8px;
  font-size: 13px;
}

.error {
  color: #ad3045;
  background: #fff0f2;
}

.success {
  color: #187652;
  background: #eafaf2;
}

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 15px;
  border: 0;
  border-radius: 9px;
  color: #fff;
  background: linear-gradient(100deg, #7945e9, #6330d9);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 8px 18px #7340df35;
}

.submit-button:disabled {
  cursor: wait;
  opacity: 0.65;
}

.submit-button span {
  font-size: 15px;
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.65s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.switch-copy {
  margin-top: 25px;
  color: #7c8495;
  text-align: center;
  font-size: 14px;
}

.switch-copy a {
  color: #6737d7;
  font-weight: 700;
  text-decoration: none;
  margin-left: 4px;
}

.switch-copy a:hover {
  text-decoration: underline;
}
</style>
