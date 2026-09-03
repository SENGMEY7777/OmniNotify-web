<template>
  <AuthLayout
    overline="Account recovery"
    title="Forgot your password?"
    subtitle="Enter your email to receive a password reset code."
  >
    <form @submit.prevent="sendOtp">
      <label>
        Email address
        <input
          v-model.trim="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />
      </label>

      <p class="hint">
        We will send a 6-digit verification code to this email address.
      </p>

      <p v-if="error" class="form-message error">{{ error }}</p>
      <p v-if="success" class="form-message success">{{ success }}</p>

      <button class="submit-button" type="submit" :disabled="loading">
        {{ loading ? 'Sending code…' : 'Send reset code' }}
        <span>→</span>
      </button>
    </form>

    <p class="switch-copy">
      Remember your password?
      <RouterLink :to="{ name: 'login' }">Back to login</RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { apiRequest } from '@/services/api'
import { forgotPasswordSchema, validate } from '@/utils/validation'

const router = useRouter()
const email = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

async function sendOtp() {
  error.value = ''
  success.value = ''

  // Validate email with Joi forgotPasswordSchema
  const { error: validationError } = validate(forgotPasswordSchema, {
    email: email.value,
  })

  if (validationError) {
    error.value = validationError
    return
  }

  loading.value = true

  try {
    await apiRequest('/auth/user/sent-opt', {
      method: 'POST',
      body: JSON.stringify({ email: email.value }),
    })
    success.value = 'Reset code sent! Redirecting to password reset…'
    setTimeout(() => {
      router.push({
        name: 'reset-password',
        query: { email: email.value }
      })
    }, 1200)
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

.hint {
  margin: -5px 0 0;
  color: #858c9d;
  font-size: 12px;
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
