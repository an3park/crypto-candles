import { eventBus } from './eventBus'

const socketUrl = 'wss://fstream.binance.com/ws/btcusdt@aggTrade'

type Message = {
  e: 'aggTrade' // event type
  E: number // event time
  a: number // aggregate trade ID
  s: string // symbol
  p: string // price
  q: string // quantity
  f: number // first trade ID
  l: number // last trade ID
  T: number // trade time
  m: boolean // is the buyer the market maker
}

function connect() {
  const socket = new WebSocket(socketUrl)

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data) as Message

    if (message.e === 'aggTrade') {
      eventBus.emit('trade', {
        exchange: 'binance',
        isBuy: !message.m,
        price: parseFloat(message.p),
        quantity: parseFloat(message.q),
        timestamp: message.T,
      })
    }
  }

  socket.onclose = () => {
    connect()
  }
}

connect()
