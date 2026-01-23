export function hexpiretime(key, ...args) {
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

    const expirationTime = this.fieldExpires.get(key, field)
    return Math.floor(expirationTime / 1000)
  })
}

export const hexpiretimeBuffer = hexpiretime

export function parseFieldsArgs(args) {
  let fieldsKeywordIndex = -1
  for (let i = 0; i < args.length; i++) {
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

  const fields = args.slice(
    fieldsKeywordIndex + 2,
    fieldsKeywordIndex + 2 + numfields
  )

  if (fields.length !== numfields) {
    throw new Error(
      "ERR Parameter 'numFields' is smaller than the number of arguments"
    )
  }

  return fields.map(f => f.toString())
}
