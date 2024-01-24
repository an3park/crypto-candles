interface BinanceMessage {
  e: 'aggTrade' // Event type
  E: number // Event time
  s: string // Symbol
  a: number // Aggregate trade ID
  p: string // Price
  q: string // Quantity
  f: number // First trade ID
  l: number // Last trade ID
  T: number // Trade time
  m: boolean // Is the buyer the market maker?
}

const binance = new WebSocket('wss://fstream.binance.com/ws/btcusdt@aggTrade')

export const onTrade = (cb: (price: number, size: number, buy: boolean) => void) => {
  binance.addEventListener('message', (e) => {
    const data = JSON.parse(e.data) as BinanceMessage
    if (data.e === 'aggTrade') {
      cb(parseFloat(data.p), parseFloat(data.q) * 10000, !data.m)
    }
  })
}
