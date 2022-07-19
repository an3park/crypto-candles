export {}

const canvas = document.getElementById('canvas') as HTMLCanvasElement

canvas.width = window.innerWidth
canvas.height = window.innerHeight
canvas.style.backgroundColor = '#232733'

const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

const bars = [
  [200, 220, 140, 180],
  [180, 220, 140, 150],
  [150, 300, 100, 250],
  [250, 320, 140, 200],
  [200, 220, 140, 180],
  [180, 200, 170, 190],
]

let staticOffsetX = canvas.width / 2
let staticOffsetY = canvas.height / 2
let scalableOffsetX = 0
let scalableOffsetY = 0
let scaleY = 1
let scaleX = 1

const render = () => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  ctx.fillStyle = 'red'
  ctx.fillRect(x(0), y(0), 2, 2)

  for (let k = 0; k < bars.length; k++) {
    const [o, h, l, c] = bars[k]
    const i = bars.length - k - 1
    ctx.fillStyle = c > o ? 'green' : 'tomato'
    ctx.beginPath()
    ctx.moveTo(x(12 * i + 0), y(c))
    ctx.lineTo(x(12 * i + 4), y(c))
    ctx.lineTo(x(12 * i + 4), y(l))
    ctx.lineTo(x(12 * i + 6), y(l))
    ctx.lineTo(x(12 * i + 6), y(c))
    ctx.lineTo(x(12 * i + 10), y(c))
    ctx.lineTo(x(12 * i + 10), y(o))
    ctx.lineTo(x(12 * i + 6), y(o))
    ctx.lineTo(x(12 * i + 6), y(h))
    ctx.lineTo(x(12 * i + 4), y(h))
    ctx.lineTo(x(12 * i + 4), y(o))
    ctx.lineTo(x(12 * i + 0), y(o))
    ctx.closePath()
    ctx.fill()
  }
}
render()

canvas.addEventListener('wheel', (e) => {
  const dx = e.deltaY / 2000
  const dy = e.deltaY / 2000
  scaleY -= dx
  scaleX -= dy
  const sumX = scalableOffsetX + staticOffsetX
  const sumY = scalableOffsetY + staticOffsetY
  staticOffsetX = e.offsetX
  staticOffsetY = e.offsetY
  scalableOffsetX = sumX - staticOffsetX 
  scalableOffsetY = sumY - staticOffsetY 

  // offsetX = offsetX + e.offsetX * dx
  // offsetY = offsetY + e.offsetY * dy
  render()
  console.log(scaleX, staticOffsetX, scalableOffsetX)
})

function x(n: number) {
  return staticOffsetX + scaleX * (scalableOffsetX - n)
}
function y(n: number) {
  return staticOffsetY + scaleY * (scalableOffsetY - n)
}

let coords = [0, 0]
let dragging = false
canvas.addEventListener('mousedown', (e) => {
  coords = [e.screenX, e.screenY]
  dragging = true
})
canvas.addEventListener('mouseup', () => (dragging = false))
canvas.addEventListener('mousemove', (e) => {
  if (!dragging) return
  const mx = coords[0] - e.screenX
  const my = coords[1] - e.screenY
  scalableOffsetX -= mx / scaleX
  scalableOffsetY -= my / scaleY
  coords = [e.screenX, e.screenY]
  render()
})
