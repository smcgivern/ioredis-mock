import { isFieldValid } from '../commands-utils/field-expiration'

export function hsetnx(key, hashKey, hashVal) {
  if (!this.data.has(key)) {
    this.data.set(key, {})
  }

  const hash = this.data.get(key)
  const fieldExists =
    {}.hasOwnProperty.call(hash, hashKey) && isFieldValid(this, key, hashKey)

  if (!fieldExists) {
    hash[hashKey] = hashVal
    if (this.fieldExpires.has(key, hashKey)) {
      this.fieldExpires.delete(key, hashKey)
    }
    this.data.set(key, hash)
    return 1
  }

  return 0
}

export const hsetnxBuffer = hsetnx
