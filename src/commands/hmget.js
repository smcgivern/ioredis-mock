import { convertStringToBuffer } from '../commands-utils/convertStringToBuffer'
import { isFieldValid } from '../commands-utils/field-expiration'

export function hmget(key, ...fields) {
  const hash = this.data.get(key)
  return fields.map(field => {
    if (!hash || hash[field] === undefined) {
      return null
    }
    if (!isFieldValid(this, key, field)) {
      return null
    }
    return hash[field]
  })
}

export function hmgetBuffer(...args) {
  const val = hmget.apply(this, args)
  return convertStringToBuffer(val)
}
