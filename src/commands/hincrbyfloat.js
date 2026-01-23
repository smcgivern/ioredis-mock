import { isFieldValid } from '../commands-utils/field-expiration'

export function hincrbyfloat(key, field, increment) {
  if (!this.data.has(key)) {
    this.data.set(key, { [field]: '0' })
  }
  const hash = this.data.get(key)

  const fieldExists =
    {}.hasOwnProperty.call(hash, field) && isFieldValid(this, key, field)

  if (!fieldExists) {
    hash[field] = '0'
  }

  const curVal = parseFloat(hash[field])
  hash[field] = (curVal + parseFloat(increment)).toString()

  if (this.fieldExpires.has(key, field)) {
    this.fieldExpires.delete(key, field)
  }

  this.data.set(key, hash)
  return hash[field]
}

export const hincrbyfloatBuffer = hincrbyfloat
