import defaultAvatarImg from '@/assets/images/default-avatar.png'

export const DEFAULT_AVATAR = defaultAvatarImg

/**
 * Returns a valid avatar image URL or the default placeholder avatar.
 * @param {string|null|undefined} url
 * @returns {string}
 */
export function getAvatarUrl(url) {
  if (url && typeof url === 'string' && url.trim() !== '' && url !== 'null' && url !== 'undefined') {
    return url.trim()
  }
  return DEFAULT_AVATAR
}
