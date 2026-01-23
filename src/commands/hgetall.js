import { convertStringToBuffer } from '../commands-utils/convertStringToBuffer'
import { getValidHash } from '../commands-utils/field-expiration'

export function hgetall(key) {
  return getValidHash(this, key) || {}
}

export function hgetallBuffer(key) {
  const val = hgetall.apply(this, [key])
  Object.keys(val).forEach(keyInObject => {
    val[keyInObject] = convertStringToBuffer(val[keyInObject])
  })

  return val
}
