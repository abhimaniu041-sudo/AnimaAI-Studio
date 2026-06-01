import React, { useState, useRef, useEffect } from 'react'
import { drawScene } from '../animation/sceneBuilder'
import { drawCharacter } from '../animation/characterEngine'

export default function ExportPanel({ projectData }) {
  const [exporting, setExporting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)
  const [videoUrl, setVideoUrl] = useState(null)
  const canvasRef = useRef(null)

  const totalDuration = (projectData.scenes?.length || 5) * 5
  const fileSize = `~${Math.round(totalDuration * 0.4)} MB`

  async function exportVideo() {
    setExporting(true)
    setProgress(0)
    setDone(false)
    setVideoUrl(null)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    try {
      const stream = canvas.captureStream(24)
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
          ? 'video/webm;codecs=vp9' : 'video/webm'
      })

      const chunks = []
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setVideoUrl(url)
        setDone(true)
        setExporting(false)
        localStorage.setItem('videos_today', (parseInt(localStorage.getItem('videos_today') || '0') + 1).toString())
      }

      recorder.start()

      // Render frames
      const fps = 24
      const totalFrames = totalDuration * fps
      let frame = 0

      const theme = projectData.theme || 'classroom'
      const char = projectData.character || { style: 'anime', color: '#ff6b9d', expression: 'happy' }

      function renderFrame() {
        if (frame >= totalFrames) {
          recorder.stop()
          return
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawScene(ctx, theme, canvas.width, canvas.height, frame)
        const bounce = Math.sin(frame * 0.15) * 5
        drawCharacter(ctx, canvas.width * 0.35, canvas.height * 0.62 + bounce, char.style, char.expression, 0.85, char.color)

        // Title overlay
        if (frame < fps * 3) {
          ctx.fillStyle = 'rgba(0,0,0,0.6)'
          ctx.fillRect(0, canvas.height * 0.35, canvas.width, 70)
          ctx.fillStyle = '#00f5d4'
          ctx.font = "bold 16px 'Rajdhani', sans-serif"
          ctx.textAlign = 'center'
          ctx.fillText(projectData.title || 'AnimaAI Video', canvas.width / 2, canvas.height * 0.35 + 40)
        }

        frame++
        setProgress(Math.round((frame / totalFrames) * 100))
        setTimeout(renderFrame, 1000 / fps)
      }

      renderFrame()
    } catch (err) {
      alert('Export failed: ' + err.message)
      setExporting(false)
    }
  }

  function downloadVideo() {
    if (!videoUrl) return
    const a = document.createElement('a')
    a.href = videoUrl
    a.download = `${projectData.title || 'animaai-video'}-${Date.now()}.webm`
    a.click()
  }

  return (
    <div className="p-4 grid-bg min-h-full">
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: '#a29bfe', marginBottom: 16 }}>
        📤 Export Panel
      </h2>

      {/* Hidden Canvas */}
      <canvas ref={canvasRef} width={1280} height={720}
        style={{ display: 'none' }} />

      {/* Project Summary */}
      <div className="glass rounded-xl p-4 mb-4" style={{ border: '1px solid rgba(162,155,254,0.3)' }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 15, color: '#a29bfe', marginBottom: 10 }}>
          📋 PROJECT SUMMARY
        </div>
        {[
          { label: 'Title', val: projectData.title || 'Untitled Video' },
          { label: 'Scenes', val: `${projectData.scenes?.length || 0} scenes` },
          { label: 'Duration', val: `~${totalDuration} seconds` },
          { label: 'Resolution', val: '1280 x 720 (HD)' },
          { label: 'Format', val: 'WebM Video' },
          { label: 'Est. Size', val: fileSize },
        ].map((item, i) => (
          <div key={i} className="flex justify-between py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)' }}>{item.label}</span>
            <span style={{ fontSize: 12, color: '#e0e0ff' }}>{item.val}</span>
          </div>
        ))}
      </div>

      {/* Script Status */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          { icon: '📝', label: 'Script', ready: !!projectData.script },
          { icon: '🎭', label: 'Character', ready: !!projectData.character },
          { icon: '🎬', label: 'Theme', ready: !!projectData.theme },
          { icon: '🎵', label: 'Ready', ready: !!(projectData.script && projectData.theme) },
        ].map((item, i) => (
          <div key={i} className="glass rounded-xl p-3 flex items-center gap-2"
            style={{ border: `1px solid ${item.ready ? 'rgba(0,245,212,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ fontSize: 12, fontFamily: "'Rajdhani', sans-serif", color: item.ready ? 'var(--neon)' : 'rgba(224,224,255,0.3)' }}>
              {item.label}
            </span>
            <span className="ml-auto" style={{ fontSize: 14 }}>{item.ready ? '✅' : '⏳'}</span>
          </div>
        ))}
      </div>

      {/* Progress */}
      {exporting && (
        <div className="glass neon-border rounded-xl p-4 mb-4">
          <div className="flex justify-between mb-2">
            <span style={{ fontSize: 13, fontFamily: "'Rajdhani', sans-serif", color: 'var(--neon)' }}>Export Progress</span>
            <span style={{ fontSize: 13, color: 'var(--neon)', fontWeight: 700 }}>{progress}%</span>
          </div>
          <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--neon), var(--glow))', borderRadius: 4, transition: 'width 0.3s ease' }} />
          </div>
          <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', marginTop: 8, textAlign: 'center' }}>
            Frame rendering... please wait
          </div>
        </div>
      )}

      {/* Done */}
      {done && (
        <div className="glass rounded-xl p-4 mb-4" style={{ border: '1px solid rgba(0,245,212,0.4)', background: 'rgba(0,245,212,0.05)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--neon)' }}>
              Video Ready!
            </div>
            <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.5)', margin: '4px 0 12px' }}>
              YouTube upload ke liye ready hai
            </div>
            <button onClick={downloadVideo} className="btn-neon py-3 px-8 rounded-xl" style={{ fontSize: 14 }}>
              ⬇️ Download Video
            </button>
          </div>
        </div>
      )}

      {/* Export Button */}
      {!done && (
        <button onClick={exportVideo} disabled={exporting}
          className="btn-neon w-full py-4 rounded-xl mb-3"
          style={{ fontSize: 16, opacity: exporting ? 0.6 : 1 }}>
          {exporting ? `⏳ Exporting... ${progress}%` : '🚀 Video Export Karo (HD)'}
        </button>
      )}

      {done && (
        <button onClick={() => { setDone(false); setVideoUrl(null); setProgress(0) }}
          className="w-full py-3 rounded-xl glass"
          style={{ fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(224,224,255,0.6)' }}>
          🔄 Naya Video Banao
        </button>
      )}

      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: 'rgba(224,224,255,0.3)' }}>
        Daily target: 10-15 videos 🎯
      </div>
    </div>
  )
}
