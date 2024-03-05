import EventEmitter from 'eventemitter3'
import { Trade } from './types'

type EventTypes = {
  trade: [Trade]
}

export const eventBus = new EventEmitter<EventTypes>()
