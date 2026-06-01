import React, { useRef, useEffect, useState } from 'react'
import { drawScene, SCENE_THEMES } from '../animation/sceneBuilder'
import { drawCharacter } from '../animation/characterEngine'

export default function VideoTimeline({ projectData, setProjectData }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const frameRef = useRef(0)
  const [theme, setTheme] = useState(projectData.theme || 'classroom')
  const [playing, setPlaying] = useState(false)
  const [scenes, setScenes] = useState(parseScenes(projectData.script))
  const [currentScene, setCurrentScene] = useState(0)
  const [subtitleText, setSubtitleText] = useState('')

  function parseScenes(script) {
    if (!script) return [
      { id: 1, label: 'HOOK', text: 'Introduction scene...', duration: 5 },
      { id: 2, label: 'INTRO', text: 'Welcome scene...', duration: 8 },
      { id: 3, label: 'SCENE 1', text: 'Main content...', duration: 15 },
      { id: 4, label: 'SCENE 2', text: 'More content...', duration: 15 },
      { id: 5, label: 'OUTRO', text: 'Subscribe please!', duration: 5 },
    ]

    const matches = script.match(/(HOOK|INTRO|SCENE \d+|OUTRO):\s*([^\n]+)/g) || []
    return matches.map((m, i) => {
      const [label, ...rest] = m.split(': ')
      return { id: i + 1, label: label.trim(), text: rest.join(': ').trim(), duration: 10 }
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawScene(ctx, theme, canvas.width, canvas.height, frameRef.current)

      const char = projectData.character || { style: 'anime', color: '#ff6b9d', expression: 'happy' }
      const bounce = playing ? Math.sin(frameRef.current * 0.15) * 5 : 0
      drawCharacter(ctx, canvas.width * 0.35, canvas.height * 0.62 + bounce, char.style, char.expression, 0.85, char.color)

      // Subtitle box
      const scene = scenes[currentScene]
      if (scene) {
        const txt = scene.text.substring(0, 60) + (scene.text.length > 60 ? '...' : '')
        ctx.fillStyle = 'rgba(0,0,0,0.75)'
        ctx.fillRect(10, canvas.height - 55, canvas.width - 20, 45)
        ctx.strokeStyle = 'rgba(0,245,212,0.4)'
        ctx.lineWidth = 1
        ctx.strokeRect(10, canvas.height - 55, canvas.width - 20, 45)
        ctx.fillStyle = '#e0e0ff'
        ctx.font = "11px 'Exo 2', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText(txt, canvas.width / 2, canvas.height - 28)

        ctx.fillStyle = 'rgba(0,245,212,0.7)'
        ctx.font = "bold 9px 'Rajdhani', sans-serif"
        ctx.fillText(scene.label, canvas.width / 2, canvas.height - 10)
      }

      if (playing) {
        frameRef.current++
        animRef.current = requestAnimationFrame(render)
      }
    }

    if (animRef.current) cancelAnimationFrame(animRef.current)
    render()
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [theme, playing, currentScene, scenes, projectData.character])

  function togglePlay() { setPlaying(p => !p) }

  function saveProject() {
    setProjectData(prev => ({ ...prev, theme, scenes }))
    localStorage.setItem('videos_today', (parseInt(localStorage.getItem('videos_today') || '0') + 1).toString())
    alert('✅ Project save ho gaya!')
  }

  return (
    <div className="p-4 grid-bg min-h-full">
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--gold)', marginBottom: 16 }}>
        🎬 Video Timeline
      </h2>

      {/* Canvas Preview */}
      <div className="glass gold-border rounded-2xl overflow-hidden mb-4" style={{ position: 'relative' }}>
        <canvas ref={canvasRef} width={340} height={200}
          style={{ width: '100%', height: 200, display: 'block' }} />
        
        {/* Controls */}
        <div className="absolute bottom-14 left-0 right-0 flex justify-center gap-3">
          <button onClick={() => setCurrentScene(p => Math.max(0, p - 1))}
            className="glass rounded-full px-3 py-1"
            style={{ fontSize: 18, border: '1px solid rgba(255,214,10,0.3)' }}>⏮</button>
          <button onClick={togglePlay}
            className="glass rounded-full px-4 py-1"
            style={{ fontSize: 18, border: '1px solid var(--gold)', color: 'var(--gold)' }}>
            {playing ? '⏸' : '▶'}
          </button>
          <button onClick={() => setCurrentScene(p => Math.min(scenes.length - 1, p + 1))}
            className="glass rounded-full px-3 py-1"
            style={{ fontSize: 18, border: '1px solid rgba(255,214,10,0.3)' }}>⏭</button>
        </div>
      </div>

      {/* Scene Theme */}
      <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>BACKGROUND SCENE</div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {SCENE_THEMES.map(t => (
          <button key={t.id} onClick={() => setTheme(t.id)}
            className="py-2 rounded-xl text-center transition-all active:scale-95"
            style={{
              background: theme === t.id ? 'rgba(255,214,10,0.15)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${theme === t.id ? 'var(--gold)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            <div style={{ fontSize: 20 }}>{t.emoji}</div>
            <div style={{ fontSize: 10, color: theme === t.id ? 'var(--gold)' : 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani', sans-serif" }}>{t.label}</div>
          </button>
        ))}
      </div>

      {/* Scenes List */}
      <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
        SCENES ({scenes.length})
      </div>
      <div className="space-y-2 mb-5">
        {scenes.map((scene, i) => (
          <button key={scene.id} onClick={() => setCurrentScene(i)}
            className="w-full glass rounded-xl p-3 text-left transition-all active:scale-95"
            style={{ border: `1px solid ${currentScene === i ? 'var(--gold)' : 'rgba(255,255,255,0.06)'}` }}>
            <div className="flex items-center gap-2">
              <span style={{
                background: currentScene === i ? 'var(--gold)' : 'rgba(255,255,255,0.1)',
                color: currentScene === i ? '#000' : 'rgba(224,224,255,0.5)',
                borderRadius: 4, padding: '1px 6px',
                fontSize: 10, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700
              }}>{scene.label}</span>
              <span style={{ fontSize: 11, color: 'rgba(224,224,255,0.5)' }}>{scene.duration}s</span>
            </div>
            <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.7)', marginTop: 4 }}>
              {scene.text.substring(0, 50)}...
            </div>
          </button>
        ))}
      </div>

      <button onClick={saveProject} className="btn-neon w-full py-4 rounded-xl" style={{ fontSize: 15 }}>
        💾 Project Save Karo → Export Ke Liye
      </button>
    </div>
  )
}
