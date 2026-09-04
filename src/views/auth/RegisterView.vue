<template>
  <AuthLayout
    overline="Get started"
    title="Create your account"
    subtitle="A few details and you will be ready to go."
  >
    <form novalidate @submit.prevent="submit">
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
        <div class="phone-input-wrap">
          <span class="phone-prefix" title="Cambodia (+855)">
            <span class="flag-icon" aria-hidden="true">🇰🇭</span>
            <span class="calling-code">+855</span>
          </span>
          <input
            v-model.trim="form.phone_number"
            type="tel"
            autocomplete="tel"
            placeholder="012 345 678"
            required
          />
        </div>
      </label>

      <label>
        Email
        <input
          v-model.trim="form.email"
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
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
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
      <p class="hint">
        Use 8+ characters with uppercase, lowercase, number, and symbol.
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
        <span v-if="loading" class="btn-spinner" aria-hidden="true"></span>
        <span>{{ loading ? 'Creating account…' : 'Create account' }}</span>
        <span v-if="!loading">→</span>
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
import { IconEye, IconEyeOff } from '@tabler/icons-vue'
import AuthLayout from '@/components/layout/AuthLayout.vue'
import { apiRequest } from '@/services/api'
import { registerSchema, validate } from '@/utils/validation'
import { useToastStore } from '@/stores/toast'

const toast = useToastStore()

const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
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
    toast.error(validationError, 'Validation Error')
    return
  }

  loading.value = true

  // Normalize phone number (strip spaces/symbols and ensure standard prefix)
  const cleanPhone = String(form.value.phone_number || '').replace(/[\s\-()]/g, '')
  const normalizedPhone = cleanPhone.startsWith('+855')
    ? cleanPhone
    : cleanPhone.startsWith('855')
    ? '+' + cleanPhone
    : cleanPhone.startsWith('0')
    ? cleanPhone
    : '0' + cleanPhone

  try {
    await apiRequest('/auth/user/register', {
      method: 'POST',
      body: JSON.stringify({
        full_name: form.value.full_name,
        phone_number: normalizedPhone,
        email: form.value.email,
        password_hash: form.value.password,
      }),
    })
    success.value = 'Account created. Check your email to verify it before logging in.'
    toast.success('Account created! Please verify your email.', 'Registration Successful')
    form.value.password = ''
  } catch (err) {
    error.value = err.message
    toast.error(err.message, 'Registration Failed')
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

.phone-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.phone-prefix {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding-right: 9px;
  border-right: 1.5px solid #dedfe7;
  pointer-events: none;
  font-size: 14px;
  user-select: none;
  z-index: 1;
}

.flag-icon {
  font-size: 17px;
  line-height: 1;
}

.calling-code {
  font-size: 13px;
  font-weight: 700;
  color: #3b4154;
}

.phone-input-wrap input {
  padding-left: 92px;
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
