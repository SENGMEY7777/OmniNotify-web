<template>
  <div class="toast-viewport" aria-live="assertive">
    <transition-group name="toast-anim" tag="div" class="toast-list">
      <div
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        class="toast-card"
        :class="`toast-${toast.type || 'info'}`"
        role="alert"
      >
        <div class="toast-icon">
          <svg
            v-if="toast.type === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12l5 5l10 -10" />
          </svg>
          <svg
            v-else-if="toast.type === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <svg
            v-else-if="toast.type === 'warning'"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 9v4" />
            <path d="M10.363 3.591l-8.106 13.534a1.914 1.914 0 0 0 1.636 2.871h16.214a1.914 1.914 0 0 0 1.636 -2.87l-8.106 -13.536a1.914 1.914 0 0 0 -3.274 0z" />
            <path d="M12 16h.01" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <div class="toast-body">
          <h4 v-if="toast.title" class="toast-title">{{ toast.title }}</h4>
          <p class="toast-message">{{ toast.message }}</p>
        </div>

        <button
          type="button"
          class="toast-close-btn"
          aria-label="Close notification"
          @click="toastStore.removeToast(toast.id)"
        >
          ✕
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()
</script>

<style scoped>
/* Positioned below the navbar/profile header (min-height 75px) */
.toast-viewport {
  position: fixed;
  top: 86px;
  right: 24px;
  z-index: 999999;
  pointer-events: none;
  width: min(100% - 40px, 380px);
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.toast-card {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #eef0f5;
  box-shadow: 0 12px 30px -6px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.04);
  transition: all 0.25s ease;
}

.toast-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Success variant */
.toast-success {
  border-left: 4px solid #10b981;
}
.toast-success .toast-icon {
  background: #ecfdf5;
  color: #059669;
}

/* Error variant */
.toast-error {
  border-left: 4px solid #f43f5e;
}
.toast-error .toast-icon {
  background: #fff1f2;
  color: #e11d48;
}

/* Warning variant */
.toast-warning {
  border-left: 4px solid #f59e0b;
}
.toast-warning .toast-icon {
  background: #fffbeb;
  color: #d97706;
}

/* Info variant */
.toast-info {
  border-left: 4px solid #6366f1;
}
.toast-info .toast-icon {
  background: #eef2ff;
  color: #4f46e5;
}

.toast-body {
  flex: 1;
  min-width: 0;
}

.toast-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
}

.toast-message {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.45;
  word-break: break-word;
  white-space: pre-line;
}

.toast-close-btn {
  flex-shrink: 0;
  background: transparent;
  border: 0;
  padding: 2px 4px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toast-close-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

/* Dark mode */
:global([data-theme="dark"] .toast-card) {
  background: #111827 !important;
  border-color: #1f293d !important;
  box-shadow: 0 12px 30px -6px rgba(0, 0, 0, 0.5) !important;
}

:global([data-theme="dark"] .toast-title) {
  color: #f8fafc !important;
}

:global([data-theme="dark"] .toast-message) {
  color: #cbd5e1 !important;
}

:global([data-theme="dark"] .toast-close-btn:hover) {
  background: #1a2234 !important;
  color: #f8fafc !important;
}

:global([data-theme="dark"] .toast-info .toast-icon) {
  background: #2e1065 !important;
  color: #c084fc !important;
}

:global([data-theme="dark"] .toast-success .toast-icon) {
  background: #064e3b !important;
  color: #34d399 !important;
}

:global([data-theme="dark"] .toast-error .toast-icon) {
  background: #450a0a !important;
  color: #f87171 !important;
}

:global([data-theme="dark"] .toast-warning .toast-icon) {
  background: #431407 !important;
  color: #fb923c !important;
}

/* Animation */
.toast-anim-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-anim-leave-active {
  transition: all 0.25s ease-in;
}

.toast-anim-enter-from {
  opacity: 0;
  transform: translateX(40px) scale(0.95);
}

.toast-anim-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(-10px);
}

@media (max-width: 640px) {
  .toast-viewport {
    top: 76px;
    right: 16px;
    left: 16px;
    width: auto;
  }
}
</style>
