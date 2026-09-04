import { ref } from 'vue'
import { defineStore } from 'pinia'
import { playMessageSound, playSuccessSound, playAlertSound } from '@/utils/sound'

let nextToastId = 1

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  /**
   * Add a toast notification
   * @param {object} toast - { type, title, message, duration }
   */
  function addToast({
    type = 'info', // 'success' | 'error' | 'warning' | 'info'
    title = '',
    message = '',
    duration = 4000,
    sound = true,
  }) {
    const id = nextToastId++
    const toast = {
      id,
      type,
      title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Notice'),
      message,
      duration,
    }

    if (sound) {
      if (type === 'success') {
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
