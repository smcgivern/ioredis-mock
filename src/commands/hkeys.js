import { convertStringToBuffer } from '../commands-utils/convertStringToBuffer'
import { getValidHash } from '../commands-utils/field-expiration'

export function hkeys(key) {
  const hash = getValidHash(this, key)
  return hash ? Object.keys(hash) : []
}

export function hkeysBuffer(globString) {
  const val = hkeys.call(this, globString)
  return convertStringToBuffer(val)
}
