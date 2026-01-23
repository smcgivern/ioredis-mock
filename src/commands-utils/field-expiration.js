export function isFieldValid(context, key, field) {
  const { data, fieldExpires } = context

  const hash = data.get(key)
  if (!hash || !{}.hasOwnProperty.call(hash, field)) {
    return false
  }

  if (fieldExpires.has(key, field) && fieldExpires.isExpired(key, field)) {
    delete hash[field]
    data.set(key, hash)
    fieldExpires.delete(key, field)

    if (Object.keys(hash).length === 0) {
      data.delete(key)
    }
    return false
  }

  return true
}

export function getValidHash(context, key) {
  const { data, fieldExpires } = context

  const hash = data.get(key)
  if (!hash) {
    return null
  }

  const result = {}
  let hasExpired = false

  for (const field of Object.keys(hash)) {
    if (fieldExpires.has(key, field) && fieldExpires.isExpired(key, field)) {
      hasExpired = true
      fieldExpires.delete(key, field)
    } else {
      result[field] = hash[field]
    }
  }

  if (hasExpired) {
    if (Object.keys(result).length === 0) {
      data.delete(key)
    } else {
      data.set(key, result)
    }
  }

  return Object.keys(result).length > 0 ? result : null
}
