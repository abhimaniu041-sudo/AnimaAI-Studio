// ============================================
// 2D CHARACTER ENGINE - Canvas Based
// ============================================

export const CHARACTER_STYLES = [
  { id: 'anime', label: 'Anime', emoji: '🎌', colors: ['#ff6b9d', '#c44dff', '#4d79ff'] },
  { id: 'cartoon', label: 'Cartoon', emoji: '🎨', colors: ['#ff9f43', '#ee5a24', '#0abde3'] },
  { id: 'flat', label: 'Flat Design', emoji: '✨', colors: ['#00d2d3', '#ff6b6b', '#feca57'] },
  { id: 'chibi', label: 'Chibi', emoji: '🌸', colors: ['#fd79a8', '#a29bfe', '#55efc4'] },
]

export const EXPRESSIONS = ['happy', 'sad', 'angry', 'surprised', 'thinking', 'excited']

export function drawCharacter(ctx, x, y, style, expression, scale = 1, color = '#ff6b9d') {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)

  const s = color
  const dark = adjustColor(color, -40)
  const light = adjustColor(color, 40)

  // Body
  ctx.fillStyle = s
  ctx.beginPath()
  ctx.ellipse(0, 60, 30, 45, 0, 0, Math.PI * 2)
  ctx.fill()

  // Head
  ctx.fillStyle = '#ffd6b0'
  ctx.beginPath()
  ctx.arc(0, -20, 38, 0, Math.PI * 2)
  ctx.fill()

  // Hair
  ctx.fillStyle = dark
  ctx.beginPath()
  ctx.arc(0, -45, 30, Math.PI, 0)
  ctx.fill()
  ctx.fillRect(-30, -55, 60, 20)

  // Eyes
  drawEyes(ctx, expression)

  // Mouth
  drawMouth(ctx, expression)

  // Arms
  ctx.fillStyle = s
  ctx.beginPath()
  ctx.ellipse(-45, 40, 12, 30, -0.3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.ellipse(45, 40, 12, 30, 0.3, 0, Math.PI * 2)
  ctx.fill()

  // Outfit details
  ctx.fillStyle = light
  ctx.beginPath()
  ctx.arc(0, 40, 8, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawEyes(ctx, expression) {
  ctx.fillStyle = '#2d3436'
  
  if (expression === 'happy' || expression === 'excited') {
    // Happy eyes (curved)
    ctx.beginPath()
    ctx.arc(-14, -18, 8, Math.PI, 0)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(14, -18, 8, Math.PI, 0)
    ctx.fill()
  } else if (expression === 'sad') {
    ctx.beginPath()
    ctx.arc(-14, -14, 8, 0, Math.PI)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(14, -14, 8, 0, Math.PI)
    ctx.fill()
  } else if (expression === 'angry') {
    ctx.fillRect(-22, -26, 16, 10)
    ctx.fillRect(6, -26, 16, 10)
  } else if (expression === 'surprised') {
    ctx.beginPath()
    ctx.arc(-14, -18, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(14, -18, 10, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(-11, -21, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(17, -21, 4, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.beginPath()
    ctx.arc(-14, -18, 8, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(14, -18, 8, 0, Math.PI * 2)
    ctx.fill()
  }

  // Eye shine
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(-11, -22, 3, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(17, -22, 3, 0, Math.PI * 2)
  ctx.fill()
}

function drawMouth(ctx, expression) {
  ctx.strokeStyle = '#636e72'
  ctx.lineWidth = 2.5
  ctx.beginPath()

  if (expression === 'happy' || expression === 'excited') {
    ctx.arc(0, -2, 14, 0.2, Math.PI - 0.2)
    ctx.stroke()
    if (expression === 'excited') {
      ctx.fillStyle = '#ff7675'
      ctx.fill()
    }
  } else if (expression === 'sad') {
    ctx.arc(0, 10, 14, Math.PI + 0.2, -0.2)
    ctx.stroke()
  } else if (expression === 'surprised') {
    ctx.fillStyle = '#636e72'
    ctx.ellipse(0, 4, 8, 10, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (expression === 'thinking') {
    ctx.moveTo(-10, 4)
    ctx.lineTo(10, 4)
    ctx.stroke()
  } else {
    ctx.arc(0, -2, 10, 0.3, Math.PI - 0.3)
    ctx.stroke()
  }
}

function adjustColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

// Animation frames generate karo
export function generateAnimationFrames(expression, totalFrames = 30) {
  const frames = []
  for (let i = 0; i < totalFrames; i++) {
    const bounce = Math.sin((i / totalFrames) * Math.PI * 2) * 5
    const blink = (i % 20 === 18 || i % 20 === 19) ? true : false
    frames.push({ bounce, blink, expression })
  }
  return frames
}
