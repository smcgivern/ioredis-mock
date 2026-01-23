import { hexpireGeneric } from './hexpire'

export function hexpireat(key, unixTimeSeconds, ...args) {
  return hexpireGeneric.call(this, key, unixTimeSeconds * 1000, true, args)
}

export const hexpireatBuffer = hexpireat
