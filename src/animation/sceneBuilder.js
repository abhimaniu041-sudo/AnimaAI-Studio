// ============================================
// SCENE BUILDER - Background Themes
// ============================================

export const SCENE_THEMES = [
  {
    id: 'classroom',
    label: 'Classroom',
    emoji: '🏫',
    colors: { sky: '#87ceeb', ground: '#8B4513', wall: '#f5deb3' }
  },
  {
    id: 'space',
    label: 'Space',
    emoji: '🚀',
    colors: { sky: '#0a0a2e', ground: '#1a1a3e', wall: '#0d0d1f' }
  },
  {
    id: 'city',
    label: 'City',
    emoji: '🌆',
    colors: { sky: '#ff6b35', ground: '#2d2d2d', wall: '#404040' }
  },
  {
    id: 'nature',
    label: 'Nature',
    emoji: '🌿',
    colors: { sky: '#87ceeb', ground: '#228B22', wall: '#90EE90' }
  },
  {
    id: 'studio',
    label: 'Studio',
    emoji: '🎬',
    colors: { sky: '#1a1a2e', ground: '#16213e', wall: '#0f3460' }
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    emoji: '🏰',
    colors: { sky: '#6c3483', ground: '#8e44ad', wall: '#9b59b6' }
  }
]

export function drawScene(ctx, theme, width, height, frame = 0) {
  const t = SCENE_THEMES.find(s => s.id === theme) || SCENE_THEMES[0]
  
  // Background
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, t.colors.sky)
  gradient.addColorStop(0.7, t.colors.ground)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  if (theme === 'space') drawSpaceScene(ctx, width, height, frame)
  else if (theme === 'nature') drawNatureScene(ctx, width, height, frame)
  else if (theme === 'city') drawCityScene(ctx, width, height, frame)
  else if (theme === 'classroom') drawClassroomScene(ctx, width, height)
  else if (theme === 'studio') drawStudioScene(ctx, width, height)
  else drawFantasyScene(ctx, width, height, frame)

  // Ground floor
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillRect(0, height * 0.75, width, height * 0.25)
}

function drawSpaceScene(ctx, w, h, frame) {
  // Stars
  ctx.fillStyle = '#fff'
  for (let i = 0; i < 80; i++) {
    const x = (i * 137.5 + frame * 0.5) % w
    const y = (i * 73.1) % (h * 0.7)
    const size = (i % 3) + 0.5
    const twinkle = Math.sin(frame * 0.1 + i) * 0.4 + 0.6
    ctx.globalAlpha = twinkle
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Planet
  const planetGrad = ctx.createRadialGradient(w * 0.8, h * 0.2, 10, w * 0.8, h * 0.2, 60)
  planetGrad.addColorStop(0, '#a29bfe')
  planetGrad.addColorStop(1, '#6c5ce7')
  ctx.fillStyle = planetGrad
  ctx.beginPath()
  ctx.arc(w * 0.8, h * 0.2, 60, 0, Math.PI * 2)
  ctx.fill()

  // Planet ring
  ctx.strokeStyle = 'rgba(162, 155, 254, 0.5)'
  ctx.lineWidth = 8
  ctx.beginPath()
  ctx.ellipse(w * 0.8, h * 0.2, 90, 20, -0.3, 0, Math.PI * 2)
  ctx.stroke()
}

function drawNatureScene(ctx, w, h, frame) {
  // Sun
  const sunGrad = ctx.createRadialGradient(w * 0.15, h * 0.12, 5, w * 0.15, h * 0.12, 45)
  sunGrad.addColorStop(0, '#ffd60a')
  sunGrad.addColorStop(1, 'rgba(255,214,10,0)')
  ctx.fillStyle = sunGrad
  ctx.beginPath()
  ctx.arc(w * 0.15, h * 0.12, 45, 0, Math.PI * 2)
  ctx.fill()

  // Clouds
  const cloudX = (frame * 0.3) % (w + 100)
  drawCloud(ctx, cloudX, h * 0.15, 1)
  drawCloud(ctx, cloudX - 300, h * 0.25, 0.7)

  // Trees
  for (let i = 0; i < 5; i++) {
    drawTree(ctx, (w / 5) * i + 30, h * 0.65, 0.6 + i * 0.1)
  }
}

function drawCloud(ctx, x, y, scale) {
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.beginPath()
  ctx.arc(0, 0, 25, 0, Math.PI * 2)
  ctx.arc(30, -10, 30, 0, Math.PI * 2)
  ctx.arc(65, 0, 22, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}

function drawTree(ctx, x, y, scale) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#5d4037'
  ctx.fillRect(-6, 0, 12, 50)
  ctx.fillStyle = '#2e7d32'
  ctx.beginPath()
  ctx.moveTo(0, -80)
  ctx.lineTo(-35, 10)
  ctx.lineTo(35, 10)
  ctx.closePath()
  ctx.fill()
  ctx.beginPath()
  ctx.moveTo(0, -110)
  ctx.lineTo(-25, -30)
  ctx.lineTo(25, -30)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawCityScene(ctx, w, h, frame) {
  const buildings = [
    { x: 0, width: 80, height: 200, color: '#404040' },
    { x: 90, width: 100, height: 280, color: '#505050' },
    { x: 200, width: 70, height: 180, color: '#454545' },
    { x: 280, width: 120, height: 320, color: '#383838' },
    { x: w - 200, width: 90, height: 240, color: '#484848' },
    { x: w - 100, width: 100, height: 200, color: '#404040' },
  ]

  buildings.forEach(b => {
    ctx.fillStyle = b.color
    ctx.fillRect(b.x, h * 0.75 - b.height, b.width, b.height)

    // Windows
    ctx.fillStyle = `rgba(255, 214, 10, ${Math.sin(frame * 0.05) * 0.3 + 0.5})`
    for (let wy = 20; wy < b.height - 20; wy += 25) {
      for (let wx = 8; wx < b.width - 8; wx += 18) {
        if (Math.random() > 0.3) {
          ctx.fillRect(b.x + wx, h * 0.75 - b.height + wy, 10, 14)
        }
      }
    }
  })
}

function drawClassroomScene(ctx, w, h) {
  ctx.fillStyle = '#f5deb3'
  ctx.fillRect(0, 0, w, h * 0.75)
  
  // Blackboard
  ctx.fillStyle = '#1a3a1a'
  ctx.fillRect(w * 0.1, h * 0.05, w * 0.8, h * 0.35)
  ctx.strokeStyle = '#8B6914'
  ctx.lineWidth = 8
  ctx.strokeRect(w * 0.1, h * 0.05, w * 0.8, h * 0.35)

  // Board text
  ctx.fillStyle = '#90EE90'
  ctx.font = 'bold 18px Rajdhani, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('AnimaAI Studio', w / 2, h * 0.25)
}

function drawStudioScene(ctx, w, h) {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, w, h)
  
  // Spotlight
  const spotGrad = ctx.createRadialGradient(w / 2, 0, 0, w / 2, h * 0.5, h * 0.6)
  spotGrad.addColorStop(0, 'rgba(0, 245, 212, 0.15)')
  spotGrad.addColorStop(1, 'transparent')
  ctx.fillStyle = spotGrad
  ctx.fillRect(0, 0, w, h)

  // Camera icon top right
  ctx.fillStyle = 'rgba(0,245,212,0.3)'
  ctx.fillRect(w - 70, 10, 60, 35)
  ctx.fillStyle = 'rgba(0,245,212,0.5)'
  ctx.beginPath()
  ctx.arc(w - 40, 27, 12, 0, Math.PI * 2)
  ctx.fill()
}

function drawFantasyScene(ctx, w, h, frame) {
  const grad = ctx.createLinearGradient(0, 0, 0, h)
  grad.addColorStop(0, '#1a0533')
  grad.addColorStop(1, '#4a0080')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, w, h)

  // Magic particles
  ctx.fillStyle = '#ffd60a'
  for (let i = 0; i < 30; i++) {
    const x = (i * 97 + frame * 1.5) % w
    const y = h * 0.1 + Math.sin(frame * 0.05 + i) * h * 0.3
    ctx.globalAlpha = Math.sin(frame * 0.1 + i) * 0.5 + 0.5
    ctx.beginPath()
    ctx.arc(x, y, 2, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1

  // Castle silhouette
  ctx.fillStyle = '#0d0020'
  ctx.fillRect(w * 0.35, h * 0.3, w * 0.3, h * 0.45)
  ctx.fillRect(w * 0.33, h * 0.22, w * 0.07, h * 0.1)
  ctx.fillRect(w * 0.6, h * 0.22, w * 0.07, h * 0.1)
  ctx.fillRect(w * 0.44, h * 0.1, w * 0.12, h * 0.22)
}

export function getSceneById(id) {
  return SCENE_THEMES.find(s => s.id === id) || SCENE_THEMES[0]
}
