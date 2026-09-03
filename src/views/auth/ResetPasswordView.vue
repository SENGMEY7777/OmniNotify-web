<template>
  <AuthLayout
    overline="Account recovery"
    title="Set new password"
    subtitle="Enter your verification code and choose a new password."
  >
    <form @submit.prevent="resetPassword">
      <label>
        Email address
        <input
          v-model.trim="form.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />
      </label>

      <label>
        Verification code
        <input
          v-model.trim="form.otp"
          type="text"
          inputmode="numeric"
          placeholder="6-digit code"
          required
        />
      </label>

      <label>
        New password
        <input
          v-model="form.new_password"
          type="password"
          autocomplete="new-password"
          placeholder="••••••••••••"
          required
        />
      </label>

      <label>
        Confirm password
        <input
          v-model="form.confirm_password"
          type="password"
          autocomplete="new-password"
          placeholder="••••••••••••"
          required
        />
      </label>

      <p v-if="error" class="form-message error">{{ error }}</p>
      <p v-if="success" class="form-message success">{{ success }}</p>

      <button class="submit-button" type="submit" :disabled="loading">
        {{ loading ? 'Updating password…' : 'Reset password' }}
        <span>→</span>
      </button>
    </form>

    <p class="switch-copy">
      Need a new code?
      <RouterLink :to="{ name: 'forgot' }">Resend code</RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { apiRequest } from '@/services/api'
import { resetPasswordSchema, validate } from '@/utils/validation'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const success = ref('')
const form = ref({
  email: '',
  otp: '',
  new_password: '',
  confirm_password: '',
})

onMounted(() => {
  if (route.query.email) {
    form.value.email = String(route.query.email)
  }
})

async function resetPassword() {
  error.value = ''
  success.value = ''

  // Validate inputs with Joi resetPasswordSchema
  const { error: validationError } = validate(resetPasswordSchema, {
    email: form.value.email,
    otp: form.value.otp,
    new_password: form.value.new_password,
    confirm_password: form.value.confirm_password,
  })

  if (validationError) {
    error.value = validationError
    return
  }

  loading.value = true

  try {
    await apiRequest('/auth/user/verify-opt', {
      method: 'POST',
      body: JSON.stringify({
        email: form.value.email,
        otp: form.value.otp,
      }),
    })

    await apiRequest('/auth/user/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        email: form.value.email,
        otp: form.value.otp,
        new_password: form.value.new_password,
        confirm_password: form.value.confirm_password,
      }),
    })

    success.value = 'Password reset successfully! Redirecting to login…'
    setTimeout(() => {
      router.push({ name: 'login' })
    }, 1500)
  } catch (err) {
    error.value = err.message
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

input {
  width: 100%;
  padding: 14px 15px;
  border: 1px solid #dedfe7;
  border-radius: 9px;
  outline: 0;
  color: #222638;
  background: #fff;
  font: 400 15px inherit;
}

input:focus {
  border-color: #8455ec;
  box-shadow: 0 0 0 4px #8455ec18;
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
  font-size: 20px;
  line-height: 0;
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
