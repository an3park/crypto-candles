import './binance'
import { eventBus } from './eventBus'

const colors = {
  buy: '#009688',
  sell: '#fe4a49',
  accent: '#1e1f26',
} as const

const canvas = document.getElementById('canvas') as HTMLCanvasElement

canvas.width = window.innerWidth * 0.93
canvas.height = window.innerHeight
document.body.style.backgroundColor = '#232733'

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

const _bars = localStorage.getItem('bars')
const bars = ((_bars && JSON.parse(_bars)) || []) as number[][]

setInterval(() => {
  const del = bars.length - 1000
  if (del > 0) {
    bars.splice(0, del)
  }
}, 20000)

let price = (bars[bars.length - 1] && bars[bars.length - 1][3]) || 0

const layoutConfig = JSON.parse(localStorage.getItem('layoutConfig') || '{}')

let offsetX: number = layoutConfig.offsetX || ctx.canvas.width * 0.6
let offsetY: number = layoutConfig.offsetY || 0
let scaleY: number = layoutConfig.scaleY || 6
let scaleX: number = layoutConfig.scaleX || 0.5

window.onbeforeunload = () => {
  localStorage.setItem('bars', JSON.stringify(bars))
  localStorage.setItem('layoutConfig', JSON.stringify({ offsetX, offsetY, scaleX, scaleY }))
}

let autoMode = true

const draw = () => {
  if (autoMode) {
    positionAuto()
  }

  ctx.beginPath()
  ctx.strokeStyle = '#999'
  ctx.lineWidth = 0.5
  ctx.setLineDash([2, 4])
  ctx.moveTo(0, y(price))
  ctx.lineTo(ctx.canvas.width, y(price))
  ctx.stroke()

  ctx.fillStyle = 'red'
  ctx.fillRect(x(0), y(0), 2, 2)

  for (let k = 0; k < bars.length; k++) {
    if (bars[k].length < 4) continue
    let o, h, l, c
    if (bars[k][3] > bars[k][0]) {
      ;[o, l, h, c] = bars[k]
    } else {
      ;[o, h, l, c] = bars[k]
    }
    const i = bars.length - k - 1
    ctx.fillStyle = c > o ? colors.buy : colors.sell
    ctx.beginPath()
    ctx.moveTo(x(12 * i + 0), y(c)) // 1
    ctx.lineTo(x(12 * i + 4), y(c)) // 2
    ctx.lineTo(x(12 * i + 4), y(l)) // 3
    ctx.lineTo(x(12 * i + 6), y(l)) // 4
    ctx.lineTo(x(12 * i + 6), y(c)) // 5
    ctx.lineTo(x(12 * i + 10), y(c)) // 6
    ctx.lineTo(x(12 * i + 10), y(o)) // 7
    ctx.lineTo(x(12 * i + 6), y(o)) // 8
    ctx.lineTo(x(12 * i + 6), y(h)) // 9
    ctx.lineTo(x(12 * i + 4), y(h)) // 10
    ctx.lineTo(x(12 * i + 4), y(o)) // 11
    ctx.lineTo(x(12 * i + 0), y(o)) // 12
    ctx.closePath()
    ctx.fill()
  }

  ctx.font = '20px sans-serif'
  ctx.fillText(price.toString(), ctx.canvas.width - 140, y(price))
}

const clear = () => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

canvas.addEventListener('wheel', (e) => {
  if (e.deltaY > 0 && scaleX < 0.2) return
  const dx = e.deltaY / 2000
  scaleX -= dx
  // offsetX += ((e.offsetX - offsetY) * dx) / 2
})

function x(n: number) {
  return offsetX - scaleX * n
}
function y(n: number) {
  return offsetY - scaleY * n
}

let dragging = false
canvas.addEventListener('mousedown', (e) => (dragging = true))
window.addEventListener('mouseleave', () => (dragging = false))
window.addEventListener('mouseup', () => (dragging = false))
window.addEventListener('mousemove', (e) => {
  if (!dragging) return
  offsetX += e.movementX
  if (!autoMode) {
    offsetY += e.movementY
  }
})

function positionAuto() {
  // const min = Math.min(...bars.map((x) => x[2]).filter((x) => x))
  // const max = Math.max(...bars.map((x) => x[1]).filter((x) => x))
  // const size = max - min
  // const center = min + size / 2
  // scaleY = (ctx.canvas.height / size) * 0.7
  offsetY = ctx.canvas.height / 2 + price * scaleY
  // offsetX = ctx.canvas.width * 0.6
}

document.getElementById('autobtn')?.addEventListener('click', function () {
  autoMode = !autoMode
  this.style.backgroundColor = autoMode ? '' : colors.sell
})

// SIDE

const pricebar = document.getElementById('pricebar') as HTMLDivElement

let dragside = false
pricebar.addEventListener('mousedown', () => (dragside = true))
window.addEventListener('mouseleave', () => (dragside = false))
window.addEventListener('mouseup', () => (dragside = false))
window.addEventListener('mousemove', (e) => {
  if (!dragside) return
  const dy = e.movementY / 100
  scaleY -= dy
  offsetY -= dy * price
})

// const displayCoords = document.getElementById('coords') as HTMLDivElement
// ctx.canvas.addEventListener('mousemove', (e) => {
//   displayCoords.innerText = `${e.offsetX}\t${e.offsetY}\n${~~x(e.offsetX)}\t${~~y(e.offsetY)}`
// })

interface WSData {
  table: string
  action: string
  data: {
    timestamp: Date
    symbol: string
    side: string
    size: number
    price: number
    tickDirection: string
    trdMatchID: string
    grossValue: number
    homeNotional: number
    foreignNotional: number
  }[]
}

let balls = [] as {
  ts: number
  buy: boolean
  size: number
  x: number
  y: number
  price: number
  quantity: number
  rand: number
}[]

function addBall(buy: boolean, quantity: number, price: number) {
  const size = quantity * 4
  balls.push({
    ts: Date.now(),
    buy,
    size: size > 40 ? 40 : size < 1 ? 1 : size,
    x: offsetX,
    y: offsetY,
    price,
    quantity,
    rand: Math.random() / 2 + 0.25,
  })
}

setInterval(() => {
  const now = Date.now()
  balls = balls.filter((x) => now - x.ts < 5000)
}, 5000)

function ball() {
  const now = Date.now()

  for (let i = 0; i < balls.length; i++) {
    const b = balls[i]
    const dts = now - b.ts
    ctx.beginPath()
    ctx.fillStyle = b.buy ? colors.buy : colors.sell
    const x = b.x + (dts * (1 - b.rand)) / 5
    const y = b.y - scaleY * b.price + (b.rand * (b.buy ? 1 : -1) * dts) / 5
    ctx.arc(x, y, b.size, 0, 2 * Math.PI)
    ctx.fill()
  }
  for (let i = 0; i < balls.length; i++) {
    const b = balls[i]
    const dts = now - b.ts
    const x = b.x + (dts * (1 - b.rand)) / 5
    const y = b.y - scaleY * b.price + (b.rand * (b.buy ? 1 : -1) * dts) / 5
    const newtworth = (b.quantity * b.price) / 1000
    if (newtworth > 500) {
      ctx.fillStyle = colors.accent
      ctx.textAlign = 'center'
      const text = newtworth > 999 ? `${~~(newtworth / 1000)}M` : `${~~newtworth}K`
      ctx.fillText(text, x, y + 8)
    }
  }
}

const trades = [] as {
  p: number
  t: number
  b: boolean
  q: number
}[]

let volumeLimit = 0

document
  .getElementById('volumeLimit')
  ?.addEventListener('input', function (this: HTMLInputElement) {
    volumeLimit = +this.value
  })
document.getElementById('resetbtn')?.addEventListener('click', function () {
  trades.length = 0
})

function frame() {
  clear()
  draw()
  ball()

  let buyes = 0
  let sells = 0
  for (let i = 0; i < trades.length; i++) {
    if (trades[i].q > volumeLimit) {
      if (trades[i].b) {
        buyes += trades[i].q
      } else {
        sells += trades[i].q
      }
    }
  }

  ctx.fillStyle = 'white'
  ctx.font = '20px sans-serif'
  ctx.fillText(`b ${~~buyes} s ${~~sells}`, 100, 50)

  requestAnimationFrame(frame)
}
frame()

const createBar = () => {
  bars[bars.length] = []
}
createBar()
setInterval(createBar, 5000)

// const ws = new WebSocket('wss://www.bitmex.com/realtime?subscribe=trade:XBTUSD')
// ws.addEventListener('message', (e) => {
//   const data = JSON.parse(e.data) as WSData
//   if (data.action === 'insert') {
//     data.data.forEach((x) => {
//       insert(x.price, x.size, x.side === 'Buy')
//     })
//   }
// })

// setInterval(() => {
//   const r = Math.random()
//   insert([
//     {
//       price: price + ~~((r - 0.5) * 10),
//       side: r > 0.5 ? 'Buy' : 'Sell',
//       size: ~~(Math.random() * 100),
//     },
//   ])
// }, 100)

function insert(_price: number, quantity: number, buyer: boolean) {
  price = _price

  // size in usd
  addBall(buyer, quantity, price)

  bars[bars.length - 1][3] = price
  !bars[bars.length - 1][0] && (bars[bars.length - 1][0] = price)
  if (!bars[bars.length - 1][1] || price > bars[bars.length - 1][1]) {
    bars[bars.length - 1][1] = price
  }
  if (!bars[bars.length - 1][2] || price < bars[bars.length - 1][2]) {
    bars[bars.length - 1][2] = price
  }
}

eventBus.on('trade', (data) => {
  insert(data.price, data.quantity, data.isBuy)
  trades.push({
    p: data.price,
    t: data.timestamp,
    b: data.isBuy,
    q: data.quantity,
  })
})
