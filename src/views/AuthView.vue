<template>
  <main class="auth-shell">
    <section class="auth-showcase">
      <div class="showcase-mark"><i></i></div>

      <div class="showcase-copy">
        <p class="overline">OmniNotify</p>
        <h1>
          Notifications that<br />
          <em>move business forward.</em>
        </h1>
        <p>
          Manage every customer alert, delivery channel, and event from one
          calm workspace.
        </p>
      </div>

      <div class="quote-card">
        <span class="quote-mark">“</span>
        <p>
          OmniNotify gives our team the clarity to deliver the right message at
          the right time.
        </p>
        <strong>Operations team</strong>
        <small>OmniNotify workspace</small>
      </div>
    </section>

    <section class="auth-panel">
      <div class="auth-form-wrap">
        <div class="auth-heading">
          <p class="overline">{{ heading.overline }}</p>
          <h2>{{ heading.title }}</h2>
          <p>{{ heading.subtitle }}</p>
        </div>

        <div
          v-if="formMode !== 'forgot'"
          class="mode-switch"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            :class="{ active: formMode === 'login' }"
            @click="setMode('login')"
          >
            Log in
          </button>
          <button
            type="button"
            :class="{ active: formMode === 'register' }"
            @click="setMode('register')"
          >
            Register
          </button>
        </div>

        <form @submit.prevent="submit">
          <template v-if="formMode === 'register'">
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
          </template>

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

          <template v-if="formMode === 'login'">
            <label>
              Account type
              <select v-model="accountType">
                <option value="admin">Administrator</option>
                <option value="user">User</option>
              </select>
            </label>

            <label>
              Password
              <input
                v-model="form.password"
                type="password"
                autocomplete="current-password"
                placeholder="••••••••••••"
                required
              />
            </label>

            <button class="forgot-link" type="button" @click="setMode('forgot')">
              Forgot password?
            </button>
          </template>

          <template v-else-if="formMode === 'register'">
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
          </template>

          <template v-else>
            <template v-if="forgotStep === 2">
              <label>
                Verification code
                <input
                  v-model.trim="form.otp"
                  inputmode="numeric"
                  placeholder="6-digit code"
                  required
                />
              </label>

              <label>
                New password
                <input
                  v-model="form.password"
                  type="password"
                  autocomplete="new-password"
                  placeholder="••••••••••••"
                  required
                />
              </label>
            </template>

            <p v-if="forgotStep === 1" class="hint">
              We will send a password reset code to your email.
            </p>
          </template>

          <p v-if="error" class="form-message error">{{ error }}</p>
          <p v-if="success" class="form-message success">{{ success }}</p>

          <button
            v-if="formMode === 'register' && success"
            class="forgot-link"
            type="button"
            @click="resendVerification"
          >
            Resend verification email
          </button>

          <button class="submit-button" type="submit" :disabled="loading">
            {{ loading ? 'Please wait…' : submitLabel }}
            <span>→</span>
          </button>
        </form>

        <p v-if="formMode === 'login'" class="switch-copy">
          Don't have an account?
          <button type="button" @click="setMode('register')">Register</button>
        </p>
        <p v-else-if="formMode === 'register'" class="switch-copy">
          Already have an account?
          <button type="button" @click="setMode('login')">Log in</button>
        </p>
        <p v-else class="switch-copy">
          <button type="button" @click="setMode('login')">Back to login</button>
        </p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiRequest } from '@/services/api'

const route = useRoute()
const router = useRouter()

const formMode = ref(
  route.name === 'register'
    ? 'register'
    : route.name === 'forgot'
      ? 'forgot'
      : 'login',
)
const accountType = ref('admin')
const forgotStep = ref(1)
const loading = ref(false)
const error = ref('')
const success = ref('')
const form = ref({
  full_name: '',
  phone_number: '',
  email: '',
  password: '',
  otp: '',
})

const heading = computed(() => {
  if (formMode.value === 'register') {
    return {
      overline: 'Get started',
      title: 'Create your account',
      subtitle: 'A few details and you will be ready to go.',
    }
  }

  if (formMode.value === 'forgot') {
    return {
      overline: 'Account recovery',
      title: 'Reset your password',
      subtitle: 'We will help you get back into your account.',
    }
  }

  return {
    overline: 'Welcome back',
    title: 'Sign in to your workspace',
    subtitle: 'Enter your details to continue.',
  }
})

const submitLabel = computed(() => {
  if (formMode.value === 'register') return 'Create account'
  if (formMode.value === 'forgot') {
    return forgotStep.value === 1 ? 'Send code' : 'Reset password'
  }
  return 'Continue'
})

function setMode(mode) {
  formMode.value = mode
  forgotStep.value = 1
  error.value = ''
  success.value = ''
  router.replace({ name: mode === 'forgot' ? 'forgot' : mode })
}

async function submit() {
  loading.value = true
  error.value = ''
  success.value = ''

  try {
    if (formMode.value === 'register') {
      await apiRequest('/auth/user/register', {
        method: 'POST',
        body: JSON.stringify({
          full_name: form.value.full_name,
          phone_number: form.value.phone_number,
          email: form.value.email,
          password_hash: form.value.password,
        }),
      })
      success.value =
        'Account created. Check your email to verify it before logging in.'
      form.value.password = ''
      return
    }

    if (formMode.value === 'forgot') {
      if (forgotStep.value === 1) {
        await apiRequest('/auth/user/sent-opt', {
          method: 'POST',
          body: JSON.stringify({ email: form.value.email }),
        })
        forgotStep.value = 2
        success.value = 'Reset code sent. Check your email.'
        return
      }

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
          new_password: form.value.password,
          confirm_password: form.value.password,
        }),
      })
      setMode('login')
      success.value = 'Password reset successfully. You can now log in.'
      return
    }

    const isAdmin = accountType.value === 'admin'
    const endpoint = isAdmin ? '/auth/admin/login' : '/auth/user/login'
    const body = isAdmin
      ? { email: form.value.email, password: form.value.password }
      : { email: form.value.email, password_hash: form.value.password }
    const data = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user || {}))
    await router.push({ name: isAdmin ? 'admin-dashboard' : 'user-home' })
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
.auth-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f7f7fb;
  color: #141827;
}

.auth-showcase {
  position: relative;
  overflow: hidden;
  padding: clamp(40px, 7vw, 100px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: linear-gradient(145deg, #f1edff, #fff 58%);
}

.auth-showcase::before,
.auth-showcase::after {
  content: "";
  position: absolute;
  border: 1px solid #ddd4ff;
  border-radius: 50%;
  opacity: 0.8;
}

.auth-showcase::before {
  width: 680px;
  height: 680px;
  right: -250px;
  top: -220px;
}

.auth-showcase::after {
  width: 520px;
  height: 520px;
  left: -260px;
  bottom: -250px;
}

.showcase-mark {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(145deg, #a77bff, #6430df);
  box-shadow: 0 10px 25px #8458ec55;
}

.showcase-mark::before,
.showcase-mark::after,
.showcase-mark i {
  content: "";
  position: absolute;
  background: #fff;
  border-radius: 3px;
  transform: skewY(-20deg);
}

.showcase-mark::before,
.showcase-mark::after {
  width: 25px;
  height: 7px;
  left: 11px;
}

.showcase-mark::before {
  top: 15px;
}

.showcase-mark::after {
  top: 27px;
}

.showcase-mark i {
  width: 12px;
  height: 7px;
  left: 11px;
  top: 27px;
  background: #8b5cf6;
}

.showcase-copy,
.quote-card {
  position: relative;
  z-index: 1;
  max-width: 560px;
}

.overline {
  color: #7650df;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.showcase-copy h1 {
  margin: 22px 0;
  color: #171a27;
  font-size: clamp(38px, 4.5vw, 64px);
  line-height: 1.05;
  letter-spacing: -0.055em;
}

.showcase-copy h1 em {
  color: #7950e9;
  font-style: normal;
}

.showcase-copy > p:last-child {
  max-width: 420px;
  color: #697086;
  font-size: 18px;
  line-height: 1.65;
}

.quote-card {
  padding: 26px 30px;
  border: 1px solid #eceaf5;
  border-radius: 18px;
  background: #fffffff0;
  box-shadow: 0 20px 50px #4d3b9412;
}

.quote-mark {
  color: #8053ed;
  font-size: 40px;
  line-height: 0.5;
}

.quote-card p {
  margin: 14px 0 20px;
  font-size: 17px;
  line-height: 1.55;
}

.quote-card strong,
.quote-card small {
  display: block;
}

.quote-card small {
  margin-top: 4px;
  color: #8a91a3;
}

.auth-panel {
  display: grid;
  place-items: center;
  padding: 40px 28px;
  background: #fff;
}

.auth-form-wrap {
  width: min(100%, 440px);
}

.auth-heading h2 {
  margin: 12px 0 8px;
  font-size: 34px;
  letter-spacing: -0.04em;
}

.auth-heading > p:last-child {
  color: #778096;
}

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

.hint {
  margin: -5px 0 0;
  color: #858c9d;
  font-size: 12px;
}

.forgot-link {
  justify-self: end;
  margin-top: -9px;
  padding: 0;
  border: 0;
  color: #6737d7;
  background: none;
  font-size: 13px;
  cursor: pointer;
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

.switch-copy button {
  padding: 0;
  border: 0;
  color: #6737d7;
  background: none;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 800px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-showcase {
    display: none;
  }

  .auth-panel {
    min-height: 100vh;
    padding: 28px 20px;
  }

  .auth-heading h2 {
    font-size: 30px;
  }
}
</style>
