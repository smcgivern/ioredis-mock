import { convertStringToBuffer } from '../commands-utils/convertStringToBuffer'
import { getValidHash } from '../commands-utils/field-expiration'

export function hvals(key) {
  const hash = getValidHash(this, key)
  return hash ? Object.values(hash) : []
}

export function hvalsBuffer(key) {
  const val = hvals.call(this, key)
  return convertStringToBuffer(val)
}
