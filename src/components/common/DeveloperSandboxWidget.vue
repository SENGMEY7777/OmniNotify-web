<template>
  <div class="developer-sandbox-widget">
    <!-- Floating Trigger Button -->
    <button
      v-if="!isOpen"
      type="button"
      class="sandbox-floating-btn"
      :class="{ 'pulse-glow': pulse }"
      title="Open Developer Sandbox"
      @click="isOpen = true"
    >
      <span class="btn-icon">⚡</span>
      <div class="btn-text">
        <span class="title">Developer Sandbox</span>
        <span class="badge-sub">1-Click Live Test 🚀</span>
      </div>
    </button>

    <!-- Sandbox Popover Modal -->
    <transition name="sandbox-pop">
      <div v-if="isOpen" class="sandbox-card">
        <!-- Clean Header -->
        <div class="card-header-clean">
          <div class="d-flex align-items-center gap-2">
            <div class="icon-avatar">⚡</div>
            <div>
              <div class="d-flex align-items-center gap-2">
                <h4 class="header-title">Developer Sandbox</h4>
                <span class="live-pill">LIVE</span>
              </div>
              <p class="header-desc">Simulate instant real-time banking alerts</p>
            </div>
          </div>
          <button
            type="button"
            class="btn-close-clean"
            aria-label="Close"
            @click="isOpen = false"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Telegram Link Hint Banner (If Telegram Channel is selected) -->
        <div class="telegram-hint-banner d-flex align-items-center justify-content-between mb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="telegram-hint-icon">✈️</span>
            <span class="telegram-hint-text">To receive live alerts on your phone:</span>
          </div>
          <button type="button" class="btn-link-tg" @click="openTelegramConnect">
            Link Bot →
          </button>
        </div>

        <!-- Modern Segmented Tabs -->
        <div class="segmented-tabs">
          <button
            type="button"
            class="tab-item"
            :class="{ active: activeTab === 'transaction' }"
            @click="activeTab = 'transaction'"
          >
            <span>💳</span>
            <span>Transaction</span>
          </button>
          <button
            type="button"
            class="tab-item"
            :class="{ active: activeTab === 'otp' }"
            @click="activeTab = 'otp'"
          >
            <span>🔐</span>
            <span>OTP Auth</span>
          </button>
          <button
            type="button"
            class="tab-item"
            :class="{ active: activeTab === 'security' }"
            @click="activeTab = 'security'"
          >
            <span>🛡️</span>
            <span>Security</span>
          </button>
        </div>

        <!-- TAB 1: TRANSACTION ALERT -->
        <div v-show="activeTab === 'transaction'" class="tab-body">
          <div class="row g-2 mb-2">
            <div class="col-7">
              <label class="field-label">Amount</label>
              <div class="input-currency-wrap">
                <span class="currency-sign">$</span>
                <input
                  v-model="transactionForm.amount"
                  type="number"
                  step="0.01"
                  class="clean-input ps-4"
                  placeholder="150.00"
                />
              </div>
            </div>
            <div class="col-5">
              <label class="field-label">Type</label>
              <select v-model="transactionForm.type" class="clean-select">
                <option value="CREDIT">Credit (+)</option>
                <option value="DEBIT">Debit (-)</option>
              </select>
            </div>
          </div>

          <div class="mb-2">
            <label class="field-label">Account Number</label>
            <input
              v-model="transactionForm.accountNumber"
              type="text"
              class="clean-input"
              placeholder="001 892 410 (Fundex Pay)"
            />
          </div>

          <div class="mb-3">
            <label class="field-label">Channel (មធ្យោបាយផ្ញើ)</label>
            <select v-model="transactionForm.channel" class="clean-select">
              <option value="TELEGRAM">Telegram Bot (t.me)</option>
              <option value="SMS">SMS Message</option>
              <option value="IN_APP">In-App Notification</option>
              <option value="PUSH">Mobile Push</option>
              <option value="EMAIL">Email Statement</option>
            </select>
          </div>

          <!-- Quick Presets -->
          <div class="presets-row mb-3">
            <span class="presets-tag">Quick:</span>
            <button type="button" class="preset-chip" @click="setTransactionPreset(50, 'DEBIT', 'SMS')">
              -$50 Coffee
            </button>
            <button type="button" class="preset-chip" @click="setTransactionPreset(500, 'CREDIT', 'TELEGRAM')">
              +$500 Salary
            </button>
            <button type="button" class="preset-chip" @click="setTransactionPreset(1200, 'CREDIT', 'TELEGRAM')">
              +$1.2k Transfer
            </button>
          </div>

          <button
            type="button"
            class="btn-trigger btn-emerald w-100"
            :disabled="sending"
            @click="sendTransactionTest"
          >
            <span v-if="sending" class="spinner-border spinner-border-sm me-1"></span>
            <span v-else>⚡</span>
            <span>{{ sending ? 'Dispatching...' : 'Fire Transaction Alert' }}</span>
          </button>
        </div>

        <!-- TAB 2: OTP VERIFICATION -->
        <div v-show="activeTab === 'otp'" class="tab-body">
          <div class="mb-2">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="field-label mb-0">6-Digit OTP Code</label>
              <button type="button" class="btn-link-action" @click="generateNewOtp">
                🔄 Generate Random
              </button>
            </div>
            <input
              v-model="otpForm.code"
              type="text"
              maxlength="6"
              class="clean-input text-center otp-input"
              placeholder="892104"
            />
          </div>

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="field-label">Expiry</label>
              <select v-model="otpForm.expiry" class="clean-select">
                <option value="2 minutes">2 minutes</option>
                <option value="5 minutes">5 minutes</option>
                <option value="10 minutes">10 minutes</option>
              </select>
            </div>
            <div class="col-6">
              <label class="field-label">Channel</label>
              <select v-model="otpForm.channel" class="clean-select">
                <option value="TELEGRAM">Telegram Bot (t.me)</option>
                <option value="SMS">SMS Message</option>
                <option value="EMAIL">Email</option>
                <option value="IN_APP">In-App</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="field-label">Purpose</label>
            <select v-model="otpForm.purpose" class="clean-select">
              <option value="Login Verification">Login Verification</option>
              <option value="Fund Transfer Authorization">Fund Transfer Authorization</option>
              <option value="Password Reset">Password Reset</option>
              <option value="Change Security Phone">Change Security Phone</option>
            </select>
          </div>

          <button
            type="button"
            class="btn-trigger btn-purple w-100"
            :disabled="sending"
            @click="sendOtpTest"
          >
            <span v-if="sending" class="spinner-border spinner-border-sm me-1"></span>
            <span v-else>🔐</span>
            <span>{{ sending ? 'Sending OTP...' : 'Send Test OTP Code' }}</span>
          </button>
        </div>

        <!-- TAB 3: SECURITY LOGIN ALERT -->
        <div v-show="activeTab === 'security'" class="tab-body">
          <div class="row g-2 mb-2">
            <div class="col-7">
              <label class="field-label">User Email</label>
              <input
                v-model="securityForm.email"
                type="email"
                class="clean-input"
                placeholder="sengmey@omninotify.com"
              />
            </div>
            <div class="col-5">
              <label class="field-label">Channel</label>
              <select v-model="securityForm.channel" class="clean-select">
                <option value="TELEGRAM">Telegram</option>
                <option value="EMAIL">Email</option>
                <option value="IN_APP">In-App</option>
                <option value="SMS">SMS</option>
              </select>
            </div>
          </div>

          <div class="row g-2 mb-2">
            <div class="col-6">
              <label class="field-label">IP Address</label>
              <input
                v-model="securityForm.ip"
                type="text"
                class="clean-input"
                placeholder="103.21.244.15"
              />
            </div>
            <div class="col-6">
              <label class="field-label">Location</label>
              <input
                v-model="securityForm.location"
                type="text"
                class="clean-input"
                placeholder="Tokyo, JP"
              />
            </div>
          </div>

          <div class="mb-3">
            <label class="field-label">Device & Browser</label>
            <select v-model="securityForm.device" class="clean-select">
              <option value="Chrome / macOS 14.5 (Sonoma)">Chrome / macOS 14.5 (Sonoma)</option>
              <option value="Safari / iOS 17.5 (iPhone 15 Pro)">Safari / iOS 17.5 (iPhone 15 Pro)</option>
              <option value="Edge / Windows 11">Edge / Windows 11</option>
              <option value="Firefox / Linux x86_64">Firefox / Linux x86_64</option>
            </select>
          </div>

          <button
            type="button"
            class="btn-trigger btn-rose w-100"
            :disabled="sending"
            @click="sendSecurityTest"
          >
            <span v-if="sending" class="spinner-border spinner-border-sm me-1"></span>
            <span v-else>🚨</span>
            <span>{{ sending ? 'Triggering...' : 'Trigger Security Alert' }}</span>
          </button>
        </div>

        <!-- Clean Footer -->
        <div class="card-footer-clean">
          <button
            type="button"
            class="btn-sound-toggle"
            :class="{ muted: !soundEnabled }"
            @click="soundEnabled = !soundEnabled"
          >
            <span>{{ soundEnabled ? '🔊 Sound ON' : '🔇 Sound Muted' }}</span>
          </button>
          <button
            type="button"
            class="btn-dismiss-text"
            @click="isOpen = false"
          >
            Close
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { playMessageSound, playSuccessSound, playAlertSound } from '@/utils/sound'
import { useToastStore } from '@/stores/toast'
import { useNotificationStore } from '@/stores/notification'
import { useAuthStore } from '@/stores/auth'
import { get, post, apiRequest } from '@/services/api'

const isOpen = ref(false)
const pulse = ref(true)
const sending = ref(false)
const soundEnabled = ref(true)
const activeTab = ref('transaction')
const cachedTemplateId = ref('')

const toast = useToastStore()
const notifStore = useNotificationStore()
const authStore = useAuthStore()

// 1. Transaction Form State
const transactionForm = reactive({
  amount: '150.00',
  type: 'CREDIT',
  accountNumber: '001 892 410',
  channel: 'TELEGRAM'
})

// 2. OTP Form State
const otpForm = reactive({
  code: '892104',
  expiry: '5 minutes',
  purpose: 'Login Verification',
  channel: 'TELEGRAM'
})

// 3. Security Form State
const securityForm = reactive({
  email: authStore.user?.email || 'sengmey2004+199@gmail.com',
  ip: '103.21.244.15',
  location: 'Tokyo, JP',
  device: 'Chrome / macOS 14.5 (Sonoma)',
  channel: 'TELEGRAM'
})

async function fetchDefaultTemplate() {
  if (!authStore.isAdmin) return
  try {
    const res = await get('/admin/template/getAll')
    const list = res?.data || res?.templates || res || []
    if (Array.isArray(list) && list.length > 0) {
      cachedTemplateId.value = list[0].template_id || list[0].id || ''
    }
  } catch (_) {}
}

onMounted(() => {
  if (authStore.isAdmin) {
    fetchDefaultTemplate()
  }
})

function setTransactionPreset(amount, type, channel) {
  transactionForm.amount = Number(amount).toFixed(2)
  transactionForm.type = type
  transactionForm.channel = channel
}

function generateNewOtp() {
  otpForm.code = Math.floor(100000 + Math.random() * 900000).toString()
}

async function openTelegramConnect() {
  try {
    const res = await apiRequest('/auth/user/telegram/link', { method: 'POST' })
    const data = res?.data || res || {}
    if (data.link) {
      window.open(data.link, '_blank')
      toast.info('Opening Telegram Bot! Press START in Telegram to connect.')
    } else {
      toast.info('Please go to My Profile > Connect Telegram Bot.')
    }
  } catch (err) {
    toast.info('Please go to My Profile > Connect Telegram Bot.')
  }
}

async function dispatchLiveNotification(data) {
  sending.value = true

  // 1. Play Audio Tone if enabled
  if (soundEnabled.value) {
    if (data.soundType === 'success') {
      playSuccessSound()
    } else if (data.soundType === 'alert') {
      playAlertSound()
    } else {
      playMessageSound()
    }
  }

  // 2. Trigger Toast Popup
  toast.addToast({
    type: data.toastType || 'info',
    title: data.title,
    message: data.body,
    duration: 7000,
    sound: false
  })

  let serverNotif = null

  // 3. Backend API Call (Dispatches real delivery for Telegram, SMS, Email, and In-App)
  try {
    const res = await post('/auth/user/notifications/simulate', {
      event_type: data.event_type,
      title: data.title,
      body: data.body,
      channel: data.channel,
      priority: data.priority
    })
    serverNotif = res?.data || res
    if (res?.result || res?.success) {
      if (data.channel === 'TELEGRAM') {
        toast.success('Sent to your Telegram bot successfully! ✈️', 'Telegram Delivered')
      }
    }
  } catch (err) {
    if (data.channel === 'TELEGRAM') {
      toast.warning(err.message || "Please click 'Link Bot' above and tap START in Telegram to receive alerts!", 'Telegram Not Linked')
    } else {
      console.warn('Sandbox backend simulation notice:', err.message)
    }
  }

  // 4. Build Payload
  const notificationId = serverNotif?.notification_id || `sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
  const notifPayload = {
    notification_id: notificationId,
    id: notificationId,
    title: data.title,
    body: data.body,
    event_type: data.event_type || 'SYSTEM_ALERT',
    channel: data.channel || 'IN_APP',
    priority: data.priority || 'NORMAL',
    status: 'DELIVERED',
    read_at: null,
    created_at: serverNotif?.created_at || new Date().toISOString(),
    _toastShown: true
  }

  // 5. Increment Pinia Notification Counter
  notifStore.incrementUnread(notifPayload)

  // 6. Broadcast to Event Listeners (Tables, Charts, Navbar)
  window.dispatchEvent(
    new CustomEvent('new-notification', {
      detail: notifPayload
    })
  )

  setTimeout(() => {
    sending.value = false
  }, 350)
}

function formatCurrentTime() {
  return new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Phnom_Penh'
  })
}

function sendTransactionTest() {
  const isCredit = transactionForm.type === 'CREDIT'
  const prefix = isCredit ? '+' : '-'
  const amountStr = `$${Number(transactionForm.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const accountMask = transactionForm.accountNumber
    ? `•••• ${String(transactionForm.accountNumber).slice(-4)}`
    : '•••• 0410'
  const refId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`
  const timeStr = formatCurrentTime()

  const title = isCredit
    ? `💰 [OmniNotify Bank] Money Received (${prefix}${amountStr})`
    : `💸 [OmniNotify Bank] Payment Debited (${prefix}${amountStr})`

  const body = isCredit
    ? [
        `Dear Valued Customer,`,
        `Your account has been successfully credited with funds:`,
        ``,
        `• Account: ${accountMask} (USD)`,
        `• Amount: +${amountStr}`,
        `• Channel: Transfer / KHQR`,
        `• Date & Time: ${timeStr}`,
        `• Ref ID: ${refId}`,
        ``,
        `Thank you for banking with OmniNotify Bank.`
      ].join('\n')
    : [
        `Dear Valued Customer,`,
        `A payment was debited from your account:`,
        ``,
        `• Account: ${accountMask} (USD)`,
        `• Amount: -${amountStr}`,
        `• Date & Time: ${timeStr}`,
        `• Ref ID: ${refId}`,
        ``,
        `If you did not authorize this transaction, please freeze your card or contact Support immediately.`
      ].join('\n')

  dispatchLiveNotification({
    title,
    body,
    event_type: isCredit ? 'TRANSACTION_DEPOSIT' : 'TRANSACTION_TRANSFER',
    channel: transactionForm.channel,
    priority: isCredit ? 'HIGH' : 'NORMAL',
    soundType: isCredit ? 'success' : 'message',
    toastType: isCredit ? 'success' : 'info'
  })
}

function sendOtpTest() {
  const code = otpForm.code || '892104'
  const timeStr = formatCurrentTime()
  const title = `🔐 [OmniNotify Bank] OTP Code: ${code}`
  const body = [
    `Your One-Time Password (OTP) is:`,
    `👉 ${code}`,
    ``,
    `• Purpose: ${otpForm.purpose}`,
    `• Valid For: ${otpForm.expiry}`,
    `• Requested At: ${timeStr}`,
    ``,
    `⚠️ IMPORTANT SECURITY NOTICE:`,
    `Do NOT share this code with anyone, including OmniNotify bank staff. We will NEVER ask for your OTP.`
  ].join('\n')

  dispatchLiveNotification({
    title,
    body,
    event_type: 'OTP_VERIFICATION',
    channel: otpForm.channel,
    priority: 'HIGH',
    soundType: 'message',
    toastType: 'info'
  })
}

function sendSecurityTest() {
  const timeStr = formatCurrentTime()
  const title = `🚨 [OmniNotify Bank] Security Alert: New Login`
  const body = [
    `Dear Valued Customer,`,
    `A new device login was detected for your account:`,
    ``,
    `• User: ${securityForm.email}`,
    `• Device: ${securityForm.device}`,
    `• Location: ${securityForm.location || 'Phnom Penh, KH'} (IP: ${securityForm.ip || '103.21.244.15'})`,
    `• Time: ${timeStr}`,
    ``,
    `If this was YOU, no action is required.`,
    `If you did NOT perform this login, please change your password or contact 24/7 Security Support immediately.`
  ].join('\n')

  dispatchLiveNotification({
    title,
    body,
    event_type: 'SECURITY_ALERT',
    channel: securityForm.channel || 'TELEGRAM',
    priority: 'CRITICAL',
    soundType: 'alert',
    toastType: 'error'
  })
}
</script>

<style scoped>
.developer-sandbox-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  font-family: "Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

/* Floating Action Button */
.sandbox-floating-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px 10px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #4f46e5 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 10px 25px -3px rgba(99, 102, 241, 0.45), 0 4px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.sandbox-floating-btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 16px 32px -4px rgba(99, 102, 241, 0.6);
}

.pulse-glow {
  animation: pulse-glow-anim 2.5s infinite;
}

@keyframes pulse-glow-anim {
  0% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0.6); }
  70% { box-shadow: 0 0 0 14px rgba(124, 58, 237, 0); }
  100% { box-shadow: 0 0 0 0 rgba(124, 58, 237, 0); }
}

.btn-icon {
  font-size: 18px;
  line-height: 1;
}

.btn-text {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.title {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.2px;
}

.badge-sub {
  font-size: 11px;
  opacity: 0.95;
  font-weight: 600;
  color: #fed7aa;
}

/* Modal Card */
.sandbox-card {
  width: 360px;
  max-width: calc(100vw - 32px);
  background: #ffffff;
  border-radius: 20px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 24px 48px -12px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

/* Clean Header */
.card-header-clean {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.icon-avatar {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: #f5f3ff;
  border: 1px solid #ddd6fe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.header-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.3px;
}

.live-pill {
  font-size: 9.5px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
  letter-spacing: 0.04em;
}

.header-desc {
  font-size: 11.5px;
  color: #64748b;
  margin: 2px 0 0;
}

.btn-close-clean {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 0;
  background: #f8fafc;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-close-clean:hover {
  background: #e2e8f0;
  color: #0f172a;
}

/* Telegram Hint Banner */
.telegram-hint-banner {
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 10px;
  padding: 6px 10px;
}

.telegram-hint-icon {
  font-size: 14px;
}

.telegram-hint-text {
  font-size: 11px;
  color: #0369a1;
  font-weight: 500;
}

.btn-link-tg {
  background: #0284c7;
  color: #ffffff;
  border: 0;
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 10.5px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
  white-space: nowrap;
}

.btn-link-tg:hover {
  background: #0369a1;
}

/* Modern Segmented Tabs */
.segmented-tabs {
  display: flex;
  background: #f1f5f9;
  padding: 3px;
  border-radius: 12px;
  gap: 2px;
  margin-bottom: 14px;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 8px;
  border-radius: 9px;
  border: 0;
  background: transparent;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
}

.tab-item:hover:not(.active) {
  color: #1e293b;
}

.tab-item.active {
  background: #ffffff;
  color: #7c3aed;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

/* Form Fields */
.tab-body {
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(3px); }
  to { opacity: 1; transform: translateY(0); }
}

.field-label {
  font-size: 11.5px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 4px;
  display: block;
}

.clean-input,
.clean-select {
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  outline: none;
  transition: all 0.15s ease;
}

.clean-input:focus,
.clean-select:focus {
  background: #ffffff;
  border-color: #8751ff;
  box-shadow: 0 0 0 3px rgba(135, 81, 255, 0.12);
}

.input-currency-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-sign {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
  pointer-events: none;
}

.otp-input {
  letter-spacing: 5px;
  font-size: 16px;
  font-weight: 700;
  color: #7c3aed;
}

.btn-link-action {
  background: transparent;
  border: 0;
  color: #7c3aed;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.btn-link-action:hover {
  text-decoration: underline;
}

/* Quick Presets Row */
.presets-row {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
}

.presets-tag {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
}

.preset-chip {
  padding: 3px 8px;
  border-radius: 7px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preset-chip:hover {
  background: #ede9fe;
  border-color: #c4b5fd;
  color: #6d28d9;
}

/* Primary Trigger Buttons */
.btn-trigger {
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
  border: 0;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-emerald {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
}

.btn-emerald:hover:not(:disabled) {
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
}

.btn-purple {
  background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%);
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
}

.btn-purple:hover:not(:disabled) {
  background: linear-gradient(135deg, #6d28d9 0%, #7c3aed 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(124, 58, 237, 0.45);
}

.btn-rose {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.35);
}

.btn-rose:hover:not(:disabled) {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.45);
}

.btn-trigger:active {
  transform: scale(0.98);
}

.btn-trigger:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Clean Footer */
.card-footer-clean {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.btn-sound-toggle {
  background: transparent;
  border: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #059669;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s ease;
}

.btn-sound-toggle.muted {
  color: #94a3b8;
}

.btn-sound-toggle:hover {
  opacity: 0.8;
}

.btn-dismiss-text {
  background: transparent;
  border: 0;
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
}

.btn-dismiss-text:hover {
  color: #0f172a;
}

/* Animations */
.sandbox-pop-enter-active,
.sandbox-pop-leave-active {
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.sandbox-pop-enter-from,
.sandbox-pop-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

/* Dark Theme Support */
:global([data-theme="dark"] .sandbox-card) {
  background: #111827 !important;
  border-color: #1f293d !important;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.6) !important;
}

:global([data-theme="dark"] .header-title) {
  color: #f8fafc !important;
}

:global([data-theme="dark"] .header-desc) {
  color: #94a3b8 !important;
}

:global([data-theme="dark"] .icon-avatar) {
  background: #1a2234 !important;
  border-color: #2d3748 !important;
}

:global([data-theme="dark"] .btn-close-clean) {
  background: #1a2234 !important;
  color: #94a3b8 !important;
}

:global([data-theme="dark"] .telegram-hint-banner) {
  background: #082f49 !important;
  border-color: #075985 !important;
}

:global([data-theme="dark"] .telegram-hint-text) {
  color: #7dd3fc !important;
}

:global([data-theme="dark"] .segmented-tabs) {
  background: #1a2234 !important;
}

:global([data-theme="dark"] .tab-item) {
  color: #94a3b8 !important;
}

:global([data-theme="dark"] .tab-item.active) {
  background: #0f172a !important;
  color: #c084fc !important;
}

:global([data-theme="dark"] .field-label) {
  color: #cbd5e1 !important;
}

:global([data-theme="dark"] .clean-input),
:global([data-theme="dark"] .clean-select) {
  background: #1a2234 !important;
  border-color: #2d3748 !important;
  color: #f8fafc !important;
}

:global([data-theme="dark"] .preset-chip) {
  background: #1a2234 !important;
  border-color: #2d3748 !important;
  color: #cbd5e1 !important;
}

:global([data-theme="dark"] .card-footer-clean) {
  border-top-color: #1f293d !important;
}
</style>
