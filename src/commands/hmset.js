import { convertStringToBuffer } from '../commands-utils/convertStringToBuffer'

export function hmset(key, ...args) {
  if (!this.data.has(key)) {
    this.data.set(key, {})
  }

  const hash = this.data.get(key)
  for (let i = 0; i < args.length; i += 2) {
    const field = args[i]
    hash[field] = args[i + 1]

    if (this.fieldExpires.has(key, field)) {
      this.fieldExpires.delete(key, field)
    }
  }

  this.data.set(key, hash)

  return 'OK'
}

export function hmsetBuffer(...args) {
  const val = hmset.apply(this, args)
  return convertStringToBuffer(val)
}
