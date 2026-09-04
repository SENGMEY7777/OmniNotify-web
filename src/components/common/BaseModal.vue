<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div
        v-if="isOpen"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? 'modal-title' : undefined"
        @click.self="onBackdropClick"
      >
        <div class="modal-container" :class="`size-${size}`">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-header-lead">
              <div v-if="icon || $slots.icon" class="modal-icon-badge">
                <slot name="icon">
                  <TablerIcon :name="icon" size="20" />
                </slot>
              </div>
              <div class="modal-header-text">
                <h3 v-if="title" id="modal-title" class="modal-title">{{ title }}</h3>
                <p v-if="subtitle" class="modal-subtitle">{{ subtitle }}</p>
              </div>
            </div>
            <button
              type="button"
              class="btn-close-modal"
              aria-label="Close dialog"
              @click="close"
            >
              <TablerIcon name="x" size="18" />
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <slot />
          </div>

          <!-- Modal Footer (Optional) -->
          <div v-if="$slots.footer || $slots['footer-left'] || $slots['footer-right']" class="modal-footer">
            <div v-if="$slots['footer-left']" class="modal-footer-left">
              <slot name="footer-left" />
            </div>
            <div class="modal-footer-right ms-auto d-flex align-items-center gap-2">
              <slot name="footer-right" />
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue'
import TablerIcon from '@/components/common/TablerIcon.vue'

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  size: { type: String, default: 'md' }, // 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop: { type: Boolean, default: true },
})

const emit = defineEmits(['update:isOpen', 'close'])

function close() {
  emit('update:isOpen', false)
  emit('close')
}

function onBackdropClick() {
  if (props.closeOnBackdrop) {
    close()
  }
}

function onKeyDown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    close()
  }
}

watch(() => props.isOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  font-family: inherit;
}

.modal-container {
  width: 100%;
  max-width: 580px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #eef2f6;
  box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

.modal-container::-webkit-scrollbar {
  width: 6px;
}

.modal-container::-webkit-scrollbar-track {
  background: transparent;
}

.modal-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 999px;
}

.modal-container.size-sm {
  max-width: 460px;
}

.modal-container.size-md {
  max-width: 640px;
}

.modal-container.size-lg {
  max-width: 840px;
}

.modal-container.size-xl {
  max-width: 980px;
}


.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 10;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.modal-header-lead {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.modal-icon-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modal-header-text {
  min-width: 0;
  flex: 1;
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.2px;
  line-height: 1.3;
}

.modal-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
}

.btn-close-modal {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  border: 0;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
  margin-left: 12px;
}

.btn-close-modal:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 24px;
  flex: 1;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 24px 20px;
  border-top: 1px solid #f1f5f9;
  background: #ffffff;
  position: sticky;
  bottom: 0;
  z-index: 10;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
}

.modal-footer-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-footer-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: modal-pop 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-fade-leave-active .modal-container {
  animation: modal-pop 0.16s cubic-bezier(0.16, 1, 0.3, 1) reverse;
}

@keyframes modal-pop {
  0% {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Dark Mode Overrides */
:global([data-theme="dark"] .modal-container) {
  background: #0f172a !important;
  border-color: #1e293b !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7) !important;
  scrollbar-color: #334155 transparent;
}

:global([data-theme="dark"] .modal-header),
:global([data-theme="dark"] .modal-footer) {
  background: #0f172a !important;
  border-color: #1e293b !important;
}

:global([data-theme="dark"] .modal-icon-badge) {
  background: #1e293b !important;
  border-color: #334155 !important;
  color: #94a3b8 !important;
}

:global([data-theme="dark"] .modal-title) {
  color: #f8fafc !important;
}

:global([data-theme="dark"] .modal-subtitle) {
  color: #94a3b8 !important;
}

:global([data-theme="dark"] .btn-close-modal) {
  color: #94a3b8 !important;
}

:global([data-theme="dark"] .btn-close-modal:hover) {
  background: #1e293b !important;
  color: #f8fafc !important;
}

@media (max-width: 576px) {
  .modal-backdrop {
    padding: 12px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-title {
    font-size: 16px;
  }

  .modal-body {
    padding: 16px;
  }

  .modal-footer {
    padding: 12px 16px 16px;
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .modal-footer-left,
  .modal-footer-right {
    width: 100%;
    justify-content: stretch;
  }

  .modal-footer-left > *,
  .modal-footer-right > * {
    flex: 1;
  }
}
</style>

