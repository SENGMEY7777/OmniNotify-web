import { ref } from 'vue'

const COLLAPSED_KEY = 'omni_sidebar_collapsed'

export const isSidebarCollapsed = ref(localStorage.getItem(COLLAPSED_KEY) === 'true')
export const isMobileSidebarOpen = ref(false)

export function toggleSidebarCollapse() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  localStorage.setItem(COLLAPSED_KEY, isSidebarCollapsed.value ? 'true' : 'false')
}

export function toggleMobileSidebar() {
  isMobileSidebarOpen.value = !isMobileSidebarOpen.value
}

export function closeMobileSidebar() {
  isMobileSidebarOpen.value = false
}
