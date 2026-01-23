import { hexpireGeneric } from './hexpire'

export function hpexpire(key, milliseconds, ...args) {
  return hexpireGeneric.call(this, key, milliseconds, false, args)
}

export const hpexpireBuffer = hpexpire
