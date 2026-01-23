import { parseFieldsArgs } from './hexpiretime'

export function httl(key, ...args) {
  const hash = this.data.get(key)
  const fields = parseFieldsArgs(args)

  if (!hash) {
    return fields.map(() => -2)
  }

  const now = Date.now()

  return fields.map(field => {
    if (!{}.hasOwnProperty.call(hash, field)) {
      return -2
    }

    if (!this.fieldExpires.has(key, field)) {
      return -1
    }

    const expirationTime = this.fieldExpires.get(key, field)
    const ttlMs = expirationTime - now

    return Math.max(0, Math.ceil(ttlMs / 1000))
  })
}

export const httlBuffer = httl
