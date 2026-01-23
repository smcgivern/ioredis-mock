import { parseFieldsArgs } from './hexpiretime'

export function hpersist(key, ...args) {
  const hash = this.data.get(key)
  const fields = parseFieldsArgs(args)

  if (!hash) {
    return fields.map(() => -2)
  }

  return fields.map(field => {
    if (!{}.hasOwnProperty.call(hash, field)) {
      return -2
    }

    if (!this.fieldExpires.has(key, field)) {
      return -1
    }

    this.fieldExpires.delete(key, field)
    return 1
  })
}

export const hpersistBuffer = hpersist
