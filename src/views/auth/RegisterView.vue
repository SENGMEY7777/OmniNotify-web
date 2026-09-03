<template>
  <AuthLayout
    overline="Get started"
    title="Create your account"
    subtitle="A few details and you will be ready to go."
  >
    <div class="mode-switch" role="tablist" aria-label="Authentication mode">
      <button type="button" @click="$router.push({ name: 'login' })">Log in</button>
      <button type="button" class="active">Register</button>
    </div>

    <form @submit.prevent="submit">
      <label>
        Full name
        <input
          v-model.trim="form.full_name"
          type="text"
          autocomplete="name"
          placeholder="John Doe"
          required
        />
      </label>

      <label>
        Phone number
        <input
          v-model.trim="form.phone_number"
          type="tel"
          autocomplete="tel"
          placeholder="012 345 678"
          required
        />
      </label>

      <label>
        Email
        <input
          v-model.trim="form.email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />
      </label>

      <label>
        Password
        <input
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          placeholder="••••••••••••"
          required
        />
      </label>
      <p class="hint">
        Use 12+ characters with uppercase, lowercase, number, and symbol.
      </p>

      <p v-if="error" class="form-message error">{{ error }}</p>
      <p v-if="success" class="form-message success">{{ success }}</p>

      <button
        v-if="success"
        class="resend-link"
        type="button"
        @click="resendVerification"
      >
        Resend verification email
      </button>

      <button class="submit-button" type="submit" :disabled="loading">
        {{ loading ? 'Please wait…' : 'Create account' }}
        <span>→</span>
      </button>
    </form>

    <p class="switch-copy">
      Already have an account?
      <RouterLink :to="{ name: 'login' }">Log in</RouterLink>
    </p>
  </AuthLayout>
</template>

<script setup>
import { ref } from 'vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { apiRequest } from '@/services/api'
import { registerSchema, validate } from '@/utils/validation'

const loading = ref(false)
const error = ref('')
const success = ref('')
const form = ref({
  full_name: '',
  phone_number: '',
  email: '',
  password: '',
})

async function submit() {
  error.value = ''
  success.value = ''

  // Validate inputs with Joi registerSchema
  const { error: validationError } = validate(registerSchema, {
    full_name: form.value.full_name,
    phone_number: form.value.phone_number,
    email: form.value.email,
    password: form.value.password,
  })

  if (validationError) {
    error.value = validationError
    return
  }

  loading.value = true

  try {
    await apiRequest('/auth/user/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: form.value.full_name,
        phone_number: form.value.phone_number,
        email: form.value.email,
        password_hash: form.value.password,
      }),
    })
    success.value = 'Account created. Check your email to verify it before logging in.'
    form.value.password = ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function resendVerification() {
  try {
    await apiRequest('/auth/user/resent-verification', {
      method: 'POST',
      body: JSON.stringify({ email: form.value.email }),
    })
    success.value = 'A new verification email has been sent.'
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
.mode-switch {
  display: flex;
  gap: 4px;
  margin: 32px 0 26px;
  padding: 4px;
  border-radius: 10px;
  background: #f4f3f8;
}

.mode-switch button {
  flex: 1;
  padding: 11px;
  border: 0;
  border-radius: 7px;
  color: #7d8495;
  background: transparent;
  font-weight: 600;
  cursor: pointer;
}

.mode-switch button.active {
  color: #5330c4;
  background: #fff;
  box-shadow: 0 2px 9px #2d1d6614;
}

form {
  display: grid;
  gap: 16px;
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

.resend-link {
  justify-self: start;
  border: 0;
  color: #6737d7;
  background: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.resend-link:hover {
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
