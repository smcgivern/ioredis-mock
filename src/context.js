import { EventEmitter } from 'events'

import { createSharedData } from './data'
import { createSharedExpires } from './expires'
import { createSharedFieldExpires } from './field-expires'

const contextMap = new Map()

export default contextMap

export function createContext(keyPrefix) {
  const expires = createSharedExpires()
  const fieldExpires = createSharedFieldExpires()
  const modifiedKeyEvents = new EventEmitter()

  return {
    channels: new EventEmitter(),
    expires,
    fieldExpires,
    data: createSharedData(expires, fieldExpires, modifiedKeyEvents),
    patternChannels: new EventEmitter(),
    keyPrefix,
    modifiedKeyEvents,
  }
}
