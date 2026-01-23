import { isFieldValid } from '../commands-utils/field-expiration'

export function hincrby(key, field, increment = 0) {
  if (!this.data.has(key)) {
    this.data.set(key, { [field]: '0' })
  }
  const hash = this.data.get(key)

  const fieldExists =
    {}.hasOwnProperty.call(hash, field) && isFieldValid(this, key, field)

  if (!fieldExists) {
    hash[field] = '0'
  }

  const curVal = Number(hash[field])
  const nextVal = curVal + parseInt(increment, 10)
  hash[field] = nextVal.toString()

  if (this.fieldExpires.has(key, field)) {
    this.fieldExpires.delete(key, field)
  }

  this.data.set(key, hash)

  return nextVal
}

export const hincrbyBuffer = hincrby
