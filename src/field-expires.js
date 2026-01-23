export function createSharedFieldExpires() {
  let fieldExpires = {}

  return Object.freeze({
    clear() {
      fieldExpires = {}
    },
    get(hashKey, field) {
      if (!fieldExpires[hashKey]) {
        return undefined
      }
      return fieldExpires[hashKey][field]
    },
    set(hashKey, field, timestamp) {
      if (!fieldExpires[hashKey]) {
        fieldExpires[hashKey] = {}
      }
      fieldExpires[hashKey][field] = +timestamp
    },
    has(hashKey, field) {
      return (
        {}.hasOwnProperty.call(fieldExpires, hashKey) &&
        {}.hasOwnProperty.call(fieldExpires[hashKey], field)
      )
    },
    isExpired(hashKey, field) {
      if (!this.has(hashKey, field)) {
        return false
      }
      return fieldExpires[hashKey][field] <= Date.now()
    },
    delete(hashKey, field) {
      if (fieldExpires[hashKey]) {
        delete fieldExpires[hashKey][field]
        if (Object.keys(fieldExpires[hashKey]).length === 0) {
          delete fieldExpires[hashKey]
        }
      }
    },
    deleteKey(hashKey) {
      delete fieldExpires[hashKey]
    },
  })
}

export function createFieldExpires(sharedFieldExpires, keyPrefix = '') {
  function createInstance(prefix) {
    return {
      clear: () => sharedFieldExpires.clear(),
      get: (hashKey, field) => sharedFieldExpires.get(`${prefix}${hashKey}`, field),
      set: (hashKey, field, timestamp) =>
        sharedFieldExpires.set(`${prefix}${hashKey}`, field, timestamp),
      has: (hashKey, field) => sharedFieldExpires.has(`${prefix}${hashKey}`, field),
      isExpired: (hashKey, field) =>
        sharedFieldExpires.isExpired(`${prefix}${hashKey}`, field),
      delete: (hashKey, field) =>
        sharedFieldExpires.delete(`${prefix}${hashKey}`, field),
      deleteKey: hashKey => sharedFieldExpires.deleteKey(`${prefix}${hashKey}`),
      withKeyPrefix(newPrefix) {
        if (newPrefix === prefix) return this
        return createInstance(newPrefix)
      },
    }
  }

  return createInstance(keyPrefix)
}
