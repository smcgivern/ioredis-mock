import { parseFieldsArgs } from './hexpiretime'

export function hpexpiretime(key, ...args) {
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

    return this.fieldExpires.get(key, field)
  })
}

export const hpexpiretimeBuffer = hpexpiretime
