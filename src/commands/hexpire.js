export function hexpire(key, seconds, ...args) {
  return hexpireGeneric.call(this, key, seconds * 1000, false, args)
}

export const hexpireBuffer = hexpire

export function hexpireGeneric(key, ttlOrTimestamp, isAbsolute, args) {
  const hash = this.data.get(key)
  const { option, fields } = parseArgs(args)

  if (!hash) {
    return fields.map(() => -2)
  }

  const now = Date.now()
  const ttlOrTimestampNum = Number(ttlOrTimestamp)
  const expirationTime = isAbsolute ? ttlOrTimestampNum : now + ttlOrTimestampNum

  return fields.map(field => {
    if (!{}.hasOwnProperty.call(hash, field)) {
      return -2
    }

    const hasExpiration = this.fieldExpires.has(key, field)
    const currentExpiration = hasExpiration
      ? this.fieldExpires.get(key, field)
      : null

    if (option === 'NX' && hasExpiration) {
      return 0
    }
    if (option === 'XX' && !hasExpiration) {
      return 0
    }
    if (option === 'GT') {
      if (!hasExpiration) {
        return 0
      }
      if (expirationTime <= currentExpiration) {
        return 0
      }
    }
    if (option === 'LT') {
      if (hasExpiration && expirationTime >= currentExpiration) {
        return 0
      }
    }

    this.fieldExpires.set(key, field, expirationTime)
    return 1
  })
}

function parseArgs(args) {
  let option = null
  let fieldsStartIndex = 0

  const firstArg = args[0]?.toString().toUpperCase()
  if (['NX', 'XX', 'GT', 'LT'].includes(firstArg)) {
    option = firstArg
    fieldsStartIndex = 1
  }

  let fieldsKeywordIndex = -1
  for (let i = fieldsStartIndex; i < args.length; i++) {
    if (args[i].toString().toUpperCase() === 'FIELDS') {
      fieldsKeywordIndex = i
      break
    }
  }

  if (fieldsKeywordIndex === -1) {
    throw new Error(
      "ERR Mandatory argument 'FIELDS' is missing or not at the right position"
    )
  }

  const numfields = parseInt(args[fieldsKeywordIndex + 1], 10)
  if (isNaN(numfields) || numfields < 1) {
    throw new Error(
      "ERR Parameter 'numFields' is smaller than the number of arguments"
    )
  }

  const fields = args.slice(fieldsKeywordIndex + 2, fieldsKeywordIndex + 2 + numfields)

  if (fields.length !== numfields) {
    throw new Error(
      "ERR Parameter 'numFields' is smaller than the number of arguments"
    )
  }

  return { option, fields: fields.map(f => f.toString()) }
}
