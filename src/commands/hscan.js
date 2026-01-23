import { convertStringToBuffer } from '../commands-utils/convertStringToBuffer'
import { getValidHash } from '../commands-utils/field-expiration'
import { scanHelper } from '../commands-utils/scan-command.common'

export function hscan(key, cursor, ...args) {
  const hash = getValidHash(this, key)
  if (!hash) {
    return ['0', []]
  }
  const entries = Object.entries(hash)
  const [cur, scannedEntries] = scanHelper(entries, 1, cursor, ...args)
  return [cur, scannedEntries.flat()]
}

export function hscanBuffer(...args) {
  const val = hscan.apply(this, args)
  return convertStringToBuffer(val)
}
