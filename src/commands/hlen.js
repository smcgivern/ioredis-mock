import { getValidHash } from '../commands-utils/field-expiration'

export function hlen(key) {
  const hash = getValidHash(this, key)
  return hash ? Object.keys(hash).length : 0
}

export const hlenBuffer = hlen
