import { EventEmitter } from 'events'

export function createSharedData(
  sharedExpires,
  sharedFieldExpiresOrModifiedKeyEvents = null,
  modifiedKeyEventsArg = null
) {
  let sharedFieldExpires
  let modifiedKeyEvents
  if (sharedFieldExpiresOrModifiedKeyEvents instanceof EventEmitter) {
    sharedFieldExpires = null
    modifiedKeyEvents = sharedFieldExpiresOrModifiedKeyEvents
  } else {
    sharedFieldExpires = sharedFieldExpiresOrModifiedKeyEvents
    modifiedKeyEvents = modifiedKeyEventsArg || new EventEmitter()
  }

  let raw = {}

  return Object.freeze({
    clear() {
      raw = {}
    },
    delete(key) {
      if (sharedExpires.has(key)) {
        sharedExpires.delete(key)
      }
      if (sharedFieldExpires) {
        sharedFieldExpires.deleteKey(key)
      }
      delete raw[key]
      modifiedKeyEvents.emit('modified', key)
    },
    get(key) {
      if (sharedExpires.has(key) && sharedExpires.isExpired(key)) {
        this.delete(key)
      }

      const value = raw[key]

      if (Array.isArray(value)) {
        return value.slice()
      }

      if (Buffer.isBuffer(value)) {
        return Buffer.from(value)
      }

      if (value instanceof Set) {
        return new Set(value)
      }

      if (value instanceof Map) {
        return new Map(value)
      }

      if (typeof value === 'object' && value) {
        return { ...value }
      }

      return value
    },
    has(key) {
      if (sharedExpires.has(key) && sharedExpires.isExpired(key)) {
        this.delete(key)
      }

      return {}.hasOwnProperty.call(raw, key)
    },
    keys(prefix) {
      const allKeys = Object.keys(raw)
      const validKeys = allKeys.filter(key => {
        if (!sharedExpires.has(key)) {
          return true
        }
        return !sharedExpires.isExpired(key)
      })

      if (!prefix) return validKeys

      return validKeys.filter(key => key.startsWith(prefix))
    },
    set(key, val) {
      let item = val

      if (Array.isArray(val)) {
        item = val.slice()
      } else if (Buffer.isBuffer(val)) {
        item = Buffer.from(val)
      } else if (val instanceof Set) {
        item = new Set(val)
      } else if (val instanceof Map) {
        item = new Map(val)
      } else if (typeof val === 'object' && val) {
        item = { ...val }
      }

      raw[key] = item
      modifiedKeyEvents.emit('modified', key)
    },
  })
}

export function createData(
  sharedData,
  expiresInstance,
  fieldExpiresInstanceOrInitial = {},
  initialOrKeyPrefix = {},
  keyPrefixArg = ''
) {
  let fieldExpiresInstance
  let initial
  let keyPrefix
  if (
    fieldExpiresInstanceOrInitial &&
    typeof fieldExpiresInstanceOrInitial.withKeyPrefix === 'function'
  ) {
    fieldExpiresInstance = fieldExpiresInstanceOrInitial
    initial = initialOrKeyPrefix
    keyPrefix = keyPrefixArg
  } else {
    fieldExpiresInstance = null
    initial = fieldExpiresInstanceOrInitial
    keyPrefix = typeof initialOrKeyPrefix === 'string' ? initialOrKeyPrefix : ''
  }

  function createInstance(prefix, expires, fieldExpires) {
    return Object.freeze({
      clear: () => sharedData.clear(),
      delete: key => sharedData.delete(`${prefix}${key}`),
      get: key => sharedData.get(`${prefix}${key}`),
      has: key => sharedData.has(`${prefix}${key}`),
      keys: () => sharedData.keys(prefix),
      set: (key, val) => sharedData.set(`${prefix}${key}`, val),
      withKeyPrefix(newKeyPrefix) {
        if (newKeyPrefix === prefix) return this
        return createInstance(
          newKeyPrefix,
          expires.withKeyPrefix(newKeyPrefix),
          fieldExpires ? fieldExpires.withKeyPrefix(newKeyPrefix) : null
        )
      },
    })
  }

  const data = createInstance(keyPrefix, expiresInstance, fieldExpiresInstance)

  Object.keys(initial).forEach(key => data.set(key, initial[key]))

  return data
}
