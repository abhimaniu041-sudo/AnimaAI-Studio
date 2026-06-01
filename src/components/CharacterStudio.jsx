import React, { useRef, useEffect, useState } from 'react'
import { CHARACTER_STYLES, EXPRESSIONS, drawCharacter, generateAnimationFrames } from '../animation/characterEngine'

const COLORS = ['#ff6b9d','#00f5d4','#ffd60a','#a29bfe','#f72585','#0abde3','#ff9f43','#55efc4']

export default function CharacterStudio({ projectData, setProjectData }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const frameRef = useRef(0)
  const [style, setStyle] = useState(projectData.character?.style || 'anime')
  const [color, setColor] = useState(projectData.character?.color || '#ff6b9d')
  const [expression, setExpression] = useState(projectData.character?.expression || 'happy')
  const [isAnimating, setIsAnimating] = useState(true)
  const [frames] = useState(() => generateAnimationFrames('happy', 60))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
      grad.addColorStop(0, '#0f0a1e')
      grad.addColorStop(1, '#080612')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Grid
      ctx.strokeStyle = 'rgba(0,245,212,0.05)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
      }

      const frame = frames[frameRef.current % frames.length]
      const bounce = isAnimating ? frame.bounce : 0

      drawCharacter(ctx, canvas.width / 2, canvas.height / 2 + bounce, style, expression, 1.2, color)

      // Expression label
      ctx.fillStyle = 'rgba(0,245,212,0.8)'
      ctx.font = "bold 12px 'Rajdhani', sans-serif"
      ctx.textAlign = 'center'
      ctx.fillText(expression.toUpperCase(), canvas.width / 2, canvas.height - 15)

      if (isAnimating) {
        frameRef.current++
        animRef.current = requestAnimationFrame(render)
      }
    }

    if (animRef.current) cancelAnimationFrame(animRef.current)
    render()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [style, color, expression, isAnimating, frames])

  function saveCharacter() {
    setProjectData(prev => ({
      ...prev,
      character: { style, color, expression }
    }))
    alert('✅ Character save ho gaya!')
  }

  return (
    <div className="p-4 grid-bg min-h-full">
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--plasma)', marginBottom: 16 }}>
        🎭 Character Studio
      </h2>

      {/* Canvas */}
      <div className="glass plasma-border rounded-2xl overflow-hidden mb-4" style={{ position: 'relative' }}>
        <canvas ref={canvasRef} width={340} height={260}
          style={{ width: '100%', height: 260, display: 'block' }} />
        <button onClick={() => setIsAnimating(p => !p)}
          className="absolute top-3 right-3 glass rounded-full px-3 py-1"
          style={{ fontSize: 11, border: '1px solid rgba(247,37,133,0.4)', color: 'var(--plasma)', fontFamily: "'Rajdhani', sans-serif" }}>
          {isAnimating ? '⏸ Pause' : '▶ Play'}
        </button>
      </div>

      {/* Style */}
      <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>CHARACTER STYLE</div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {CHARACTER_STYLES.map(s => (
          <button key={s.id} onClick={() => setStyle(s.id)}
            className="py-2 rounded-xl text-center transition-all active:scale-95"
            style={{
              background: style === s.id ? 'rgba(247,37,133,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${style === s.id ? 'var(--plasma)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            <div style={{ fontSize: 20 }}>{s.emoji}</div>
            <div style={{ fontSize: 9, color: style === s.id ? 'var(--plasma)' : 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani', sans-serif", marginTop: 2 }}>{s.label}</div>
          </button>
        ))}
      </div>

      {/* Color */}
      <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>CHARACTER COLOR</div>
      <div className="flex gap-2 flex-wrap mb-4">
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)}
            className="rounded-full transition-all active:scale-95"
            style={{
              width: 36, height: 36, background: c,
              border: color === c ? '3px solid #fff' : '3px solid transparent',
              boxShadow: color === c ? `0 0 12px ${c}` : 'none'
            }} />
        ))}
      </div>

      {/* Expression */}
      <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>EXPRESSION</div>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {EXPRESSIONS.map(e => (
          <button key={e} onClick={() => setExpression(e)}
            className="py-2 rounded-xl transition-all active:scale-95"
            style={{
              background: expression === e ? 'rgba(247,37,133,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${expression === e ? 'var(--plasma)' : 'rgba(255,255,255,0.08)'}`,
              color: expression === e ? 'var(--plasma)' : 'rgba(224,224,255,0.5)',
              fontSize: 12, fontFamily: "'Rajdhani', sans-serif", fontWeight: expression === e ? 700 : 400,
              textTransform: 'capitalize'
            }}>
            {e}
          </button>
        ))}
      </div>

      <button onClick={saveCharacter} className="btn-plasma w-full py-4 rounded-xl" style={{ fontSize: 16 }}>
        💾 Character Save Karo
      </button>
    </div>
  )
}
