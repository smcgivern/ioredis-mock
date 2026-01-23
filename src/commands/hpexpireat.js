import { hexpireGeneric } from './hexpire'

export function hpexpireat(key, unixTimeMs, ...args) {
  return hexpireGeneric.call(this, key, unixTimeMs, true, args)
}

export const hpexpireatBuffer = hpexpireat
