/**
 * Secure Cookie Management Utility
 */

/**
 * Set a cookie securely
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 * @param {object} options - Options (days, secure, sameSite, path)
 */
export function setCookie(name, value, options = {}) {
  const {
    days = 7,
    path = '/',
    sameSite = 'Strict',
    secure = typeof window !== 'undefined' && window.location.protocol === 'https:',
  } = options

  let expires = ''
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = `; expires=${date.toUTCString()}`
  }

  const secureFlag = secure ? '; Secure' : ''
  const sameSiteFlag = `; SameSite=${sameSite}`
  const pathFlag = `; path=${path}`

  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value || '')}${expires}${pathFlag}${sameSiteFlag}${secureFlag}`
}

/**
 * Get a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string|null} - Cookie value or null
 */
export function getCookie(name) {
  const nameEQ = `${encodeURIComponent(name)}=`
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length))
    }
  }
  return null
}

/**
 * Remove a cookie
 * @param {string} name - Cookie name
 * @param {object} options - Options (path)
 */
export function removeCookie(name, options = {}) {
  const { path = '/' } = options
  setCookie(name, '', { days: -1, path })
}
