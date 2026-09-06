import { ref } from 'vue'
import { defineStore } from 'pinia'
import { playMessageSound, playSuccessSound, playAlertSound, playSecurityAlertSound } from '@/utils/sound'

let nextToastId = 1
const recentToastKeys = new Set()

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  /**
   * Add a toast notification with built-in deduplication
   * @param {object} toast - { type, title, message, duration, sound }
   */
  function addToast({
    type = 'info', // 'success' | 'error' | 'warning' | 'info'
    title = '',
    message = '',
    duration = 4000,
    sound = true,
  }) {
    const finalTitle = title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Notice')
    const finalMessage = String(message || '').trim()

    // Deduplication Key
    const dedupeKey = `${type}_${finalTitle}_${finalMessage}`.toLowerCase()

    // Prevent duplicate toasts within 3.5 seconds
    if (recentToastKeys.has(dedupeKey)) {
      return null
    }

    // Also check if an identical toast is currently visible in the active list
    const isAlreadyVisible = toasts.value.some(
      (t) => t.title === finalTitle && String(t.message || '').trim() === finalMessage
    )
    if (isAlreadyVisible) {
      return null
    }

    recentToastKeys.add(dedupeKey)
    setTimeout(() => {
      recentToastKeys.delete(dedupeKey)
    }, 3500)

    const id = nextToastId++
    const toast = {
      id,
      type,
      title: finalTitle,
      message,
      duration,
    }

    if (sound) {
      const lowerTitle = String(finalTitle).toLowerCase()
      const lowerMsg = String(finalMessage).toLowerCase()
      const isSecurity = lowerTitle.includes('security') || lowerTitle.includes('login') || lowerTitle.includes('otp') || lowerTitle.includes('fraud') || lowerTitle.includes('lock') || lowerMsg.includes('security') || lowerMsg.includes('login')

      if (isSecurity) {
        playSecurityAlertSound()
      } else if (type === 'success') {
        playSuccessSound()
      } else if (type === 'error' || type === 'warning') {
        playAlertSound()
      } else {
        playMessageSound()
      }
    }

    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }

    return id
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function clearAll() {
    toasts.value = []
  }

  // Convenient helper methods
  function success(message, title = 'Success', duration = 4000) {
    return addToast({ type: 'success', title, message, duration })
  }

  function error(message, title = 'Error', duration = 5000) {
    return addToast({ type: 'error', title, message, duration })
  }

  function warning(message, title = 'Warning', duration = 4500) {
    return addToast({ type: 'warning', title, message, duration })
  }

  function info(message, title = 'Info', duration = 4000) {
    return addToast({ type: 'info', title, message, duration })
  }

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  }
})
