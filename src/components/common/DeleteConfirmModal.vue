<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  notificationTitle: {
    type: String,
    default: ''
  },
  isSecurityAlert: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  deleting: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'confirm'])
</script>

<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="isOpen" class="delete-modal-overlay" @click.self="emit('close')">
        <div class="delete-modal-box" role="dialog" aria-modal="true" :aria-labelledby="isSecurityAlert ? 'sec-title' : 'del-title'">
          
          <!-- Top Close Button -->
          <button
            type="button"
            class="modal-close-btn"
            aria-label="Close modal"
            @click="emit('close')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <!-- Icon Badge -->
          <div 
            class="delete-modal-icon"
            :class="isSecurityAlert ? 'icon-warning' : 'icon-danger'"
          >
            <!-- Lock Shield Icon for Security / Financial Alert -->
            <svg v-if="isSecurityAlert" class="modal-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>

            <!-- Trash Icon for Standard Delete / Archive -->
            <svg v-else class="modal-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>

          <!-- Content: If Security Alert (Locked) -->
          <div v-if="isSecurityAlert" class="modal-body-content">
            <h3 id="sec-title" class="delete-modal-title">Security Record Locked</h3>
            <p class="delete-modal-desc">
              For account protection and banking fraud prevention, financial transactions, OTP codes, and security audit records cannot be removed.
            </p>
            <div class="delete-modal-actions mt-4">
              <button 
                type="button"
                class="btn-understood"
                @click="emit('close')"
              >
                Understood
              </button>
            </div>
          </div>

          <!-- Content: If Normal Alert (Allowed Remove / Archive) -->
          <div v-else class="modal-body-content">
            <h3 id="del-title" class="delete-modal-title">
              {{ isAdmin ? 'Archive Notification?' : 'Remove from Inbox?' }}
            </h3>
            <p class="delete-modal-desc">
              Are you sure you want to {{ isAdmin ? 'archive' : 'remove' }} <strong>"{{ notificationTitle || 'this notification' }}"</strong>? 
              {{ isAdmin 
                ? 'It will be hidden from active records. All compliance and delivery audit logs remain securely preserved.' 
                : 'It will disappear from your inbox view, but financial records remain securely preserved.' 
              }}
            </p>
            
            <!-- Action Buttons -->
            <div class="delete-modal-actions">
              <button 
                type="button"
                class="btn-cancel"
                :disabled="deleting"
                @click="emit('close')"
              >
                Cancel
              </button>
              <button 
                type="button"
                class="btn-confirm-remove"
                :disabled="deleting"
                @click="emit('confirm')"
              >
                <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
                <span>{{ deleting ? (isAdmin ? 'Archiving...' : 'Removing...') : (isAdmin ? 'Yes, Archive' : 'Yes, Remove') }}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.delete-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.delete-modal-box {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 24px;
  padding: 32px 28px 26px;
  text-align: center;
  box-shadow: 0 25px 60px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

:global([data-theme="dark"] .delete-modal-box) {
  background: #111827 !important;
  border-color: #1f293d !important;
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7) !important;
}

/* Close button */
.modal-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 0;
  background: #f8fafc;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.modal-close-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

:global([data-theme="dark"] .modal-close-btn) {
  background: #1e293b !important;
  color: #94a3b8 !important;
}

:global([data-theme="dark"] .modal-close-btn:hover) {
  background: #334155 !important;
  color: #f8fafc !important;
}

/* Icon Badge */
.delete-modal-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 18px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px -6px rgba(0, 0, 0, 0.08);
}

.modal-svg {
  width: 26px;
  height: 26px;
}

.icon-warning {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

:global([data-theme="dark"] .icon-warning) {
  background: rgba(217, 119, 6, 0.18) !important;
  border-color: rgba(217, 119, 6, 0.3) !important;
  color: #fbbf24 !important;
}

.icon-danger {
  background: #fff1f2;
  color: #e11d48;
  border: 1px solid #fecdd3;
}

:global([data-theme="dark"] .icon-danger) {
  background: rgba(225, 29, 72, 0.18) !important;
  border-color: rgba(225, 29, 72, 0.3) !important;
  color: #fb7185 !important;
}

/* Typography */
.delete-modal-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 10px;
  letter-spacing: -0.4px;
}

:global([data-theme="dark"] .delete-modal-title) {
  color: #f8fafc !important;
}

.delete-modal-desc {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0 0 24px;
}

.delete-modal-desc strong {
  color: #1e293b;
  font-weight: 700;
}

:global([data-theme="dark"] .delete-modal-desc) {
  color: #94a3b8 !important;
}

:global([data-theme="dark"] .delete-modal-desc strong) {
  color: #f1f5f9 !important;
}

/* Action Buttons */
.delete-modal-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.btn-understood {
  width: 100%;
  height: 46px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #6366f1;
  border: 0;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3);
  transition: all 0.15s ease;
}

.btn-understood:hover {
  background: #4f46e5;
  transform: translateY(-1px);
}

.btn-cancel {
  flex: 1;
  height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #475569;
  transition: all 0.15s ease;
}

.btn-cancel:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

:global([data-theme="dark"] .btn-cancel) {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #cbd5e1 !important;
}

:global([data-theme="dark"] .btn-cancel:hover) {
  background: #334155 !important;
  color: #f8fafc !important;
}

.btn-confirm-remove {
  flex: 1;
  height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);
  border: 0;
  color: #ffffff;
  box-shadow: 0 6px 16px rgba(225, 29, 72, 0.35);
  transition: all 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm-remove:hover {
  background: linear-gradient(135deg, #be123c 0%, #9f1239 100%);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(225, 29, 72, 0.45);
}

.btn-confirm-remove:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes modalPop {
  0% { transform: scale(0.94); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
