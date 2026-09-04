import { ref } from 'vue'

const THEME_KEY = 'omni_theme'

export const isDark = ref(false)

export function initTheme() {
  const saved = localStorage.getItem(THEME_KEY)
  if (saved) {
    isDark.value = saved === 'dark'
  } else {
    isDark.value = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  applyTheme(isDark.value)
}

export function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme(isDark.value)
  localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
}

export function applyTheme(dark) {
  if (dark) {
    document.documentElement.setAttribute('data-theme', 'dark')
    document.documentElement.classList.add('dark-theme')
  } else {
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark-theme')
  }
}
