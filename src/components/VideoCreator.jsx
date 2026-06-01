import React, { useState, useRef, useEffect } from 'react'
import { smartAICall } from '../ai/tokenRotator'

// ─── STEP DEFINITIONS ───────────────────────────────────────────────────────
const STEPS = [
  { id: 'input',     icon: '📝', label: 'Topic'     },
  { id: 'script',    icon: '🤖', label: 'AI Script'  },
  { id: 'images',    icon: '🎨', label: 'AI Images'  },
  { id: 'assemble',  icon: '🎬', label: 'Video'      },
  { id: 'export',    icon: '📤', label: 'Export'     },
]

// ─── CARTOON STYLE PROMPTS ───────────────────────────────────────────────────
const CHAR_PROMPT = (name, emotion) =>
  `2D cartoon character ${name}, ${emotion} expression, flat design illustration, clean lines, bright colors, white background, anime style, full body, high quality`

const BG_PROMPT = (scene) =>
  `2D cartoon background ${scene}, flat design illustration, colorful, clean, anime style, no characters, landscape orientation, high quality`

// ─── HuggingFace Image Generation ───────────────────────────────────────────
async function generateImage(prompt, hfKey) {
  // Use multiple free HF models with fallback
  const MODELS = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-2-1',
    'runwayml/stable-diffusion-v1-5',
  ]
  
  for (const model of MODELS) {
    try {
      const res = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${hfKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt, parameters: { width: 512, height: 512 } })
      })
      
      if (!res.ok) continue
      const blob = await res.blob()
      if (blob.size < 1000) continue
      return URL.createObjectURL(blob)
    } catch { continue }
  }
  return null
}

// ─── PARSE AI SCRIPT INTO SCENES ─────────────────────────────────────────────
function parseScriptToScenes(scriptText) {
  const scenes = []
  const lines = scriptText.split('\n').filter(l => l.trim())
  
  let currentScene = null
  for (const line of lines) {
    const sceneMatch = line.match(/^(HOOK|INTRO|SCENE\s*\d+|OUTRO)\s*[:–-]\s*(.+)/i)
    const bgMatch    = line.match(/^BACKGROUND\s*[:–-]\s*(.+)/i)
    const charMatch  = line.match(/^CHARACTER\s*[:–-]\s*(.+)/i)
    const textMatch  = line.match(/^(DIALOGUE|NARRATION|TEXT)\s*[:–-]\s*(.+)/i)
    const emotionMatch = line.match(/^EMOTION\s*[:–-]\s*(.+)/i)
    
    if (sceneMatch) {
      if (currentScene) scenes.push(currentScene)
      currentScene = {
        label: sceneMatch[1].toUpperCase(),
        description: sceneMatch[2],
        background: 'colorful classroom with chalkboard',
        character: 'friendly teacher cartoon',
        emotion: 'happy',
        dialogue: sceneMatch[2],
        duration: 8,
        bgImage: null,
        charImage: null,
      }
    } else if (currentScene) {
      if (bgMatch)      currentScene.background = bgMatch[1]
      if (charMatch)    currentScene.character   = charMatch[1]
      if (textMatch)    currentScene.dialogue    = textMatch[2]
      if (emotionMatch) currentScene.emotion     = emotionMatch[1]
    }
  }
  if (currentScene) scenes.push(currentScene)
  
  // Fallback: if parsing failed, create default scenes
  if (scenes.length === 0) {
    const parts = scriptText.split(/\n\n+/).filter(p => p.trim().length > 20).slice(0, 5)
    parts.forEach((part, i) => {
      const labels = ['HOOK', 'INTRO', 'SCENE 1', 'SCENE 2', 'OUTRO']
      scenes.push({
        label: labels[i] || `SCENE ${i+1}`,
        description: part.trim().substring(0, 100),
        background: ['colorful classroom', 'bright park', 'modern city', 'space galaxy', 'cozy studio'][i % 5],
        character: 'friendly animated character',
        emotion: ['excited', 'happy', 'thinking', 'surprised', 'happy'][i % 5],
        dialogue: part.trim().substring(0, 200),
        duration: 8,
        bgImage: null, charImage: null,
      })
    })
  }
  return scenes
}

// ─── DRAW FRAME ON CANVAS ────────────────────────────────────────────────────
function drawFrame(ctx, W, H, scene, frame, bgImg, charImg) {
  ctx.clearRect(0, 0, W, H)

  // Background
  if (bgImg) {
    ctx.drawImage(bgImg, 0, 0, W, H)
    // Overlay for readability
    ctx.fillStyle = 'rgba(0,0,0,0.15)'
    ctx.fillRect(0, 0, W, H)
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, H)
    grad.addColorStop(0, '#1a0a2e')
    grad.addColorStop(1, '#0d0620')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, W, H)
    // Grid
    ctx.strokeStyle = 'rgba(0,245,212,0.05)'
    ctx.lineWidth = 1
    for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke() }
    for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke() }
  }

  // Character with bounce
  const bounce = Math.sin(frame * 0.12) * 6
  if (charImg) {
    const cw = H * 0.55, ch = H * 0.55
    const cx = W * 0.25 - cw / 2
    const cy = H * 0.38 - ch / 2 + bounce
    // Drop shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)'
    ctx.shadowBlur = 20
    ctx.shadowOffsetY = 10
    ctx.drawImage(charImg, cx, cy, cw, ch)
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0
  } else {
    drawFallbackChar(ctx, W * 0.25, H * 0.52 + bounce, H * 0.28)
  }

  // Scene label badge
  ctx.fillStyle = 'rgba(0,245,212,0.9)'
  ctx.font = `bold ${W*0.025}px Rajdhani, sans-serif`
  ctx.textAlign = 'left'
  ctx.fillText(scene.label, 12, 28)

  // Dialogue box
  const boxH = H * 0.28
  const boxY = H - boxH - 4
  ctx.fillStyle = 'rgba(5,3,15,0.88)'
  roundRect(ctx, 8, boxY, W - 16, boxH, 12)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0,245,212,0.4)'
  ctx.lineWidth = 1.5
  roundRect(ctx, 8, boxY, W - 16, boxH, 12)
  ctx.stroke()

  // Dialogue text (word-wrapped)
  ctx.fillStyle = '#e8e8ff'
  ctx.font = `${W*0.032}px Exo 2, sans-serif`
  ctx.textAlign = 'left'
  const maxW = W - 50
  const words = (scene.dialogue || '').split(' ')
  let line = '', y = boxY + 28, lineH = W * 0.038
  for (const word of words) {
    const test = line + word + ' '
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), 20, y)
      line = word + ' '; y += lineH
      if (y > boxY + boxH - 10) break
    } else { line = test }
  }
  if (line) ctx.fillText(line.trim(), 20, y)
}

function drawFallbackChar(ctx, cx, cy, size) {
  // Simple cartoon face fallback
  ctx.fillStyle = '#ffd6b0'
  ctx.beginPath(); ctx.arc(cx, cy - size*0.2, size*0.38, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#ff6b9d'
  ctx.beginPath(); ctx.ellipse(cx, cy + size*0.35, size*0.28, size*0.4, 0, 0, Math.PI*2); ctx.fill()
  ctx.fillStyle = '#ff4488'
  ctx.fillRect(cx - size*0.28, cy - size*0.5, size*0.56, size*0.2)
  ctx.fillStyle = '#222'
  ctx.beginPath(); ctx.arc(cx - size*0.12, cy - size*0.22, size*0.07, 0, Math.PI*2); ctx.fill()
  ctx.beginPath(); ctx.arc(cx + size*0.12, cy - size*0.22, size*0.07, 0, Math.PI*2); ctx.fill()
  ctx.strokeStyle = '#555'; ctx.lineWidth = 2
  ctx.beginPath(); ctx.arc(cx, cy - size*0.08, size*0.1, 0.2, Math.PI - 0.2); ctx.stroke()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x+r, y)
  ctx.lineTo(x+w-r, y); ctx.arcTo(x+w, y, x+w, y+r, r)
  ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r)
  ctx.lineTo(x+r, y+h); ctx.arcTo(x, y+h, x, y+h-r, r)
  ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r)
  ctx.closePath()
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function VideoCreator() {
  const [step, setStep]       = useState('input')
  const [topic, setTopic]     = useState('')
  const [scriptType, setScriptType] = useState('educational')
  const [logs, setLogs]       = useState([])
  const [scenes, setScenes]   = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [exportUrl, setExportUrl] = useState(null)
  const [isWorking, setIsWorking] = useState(false)
  const [previewPlaying, setPreviewPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const canvasRef  = useRef(null)
  const animRef    = useRef(null)
  const frameRef   = useRef(0)
  const scenesRef  = useRef([])
  const bgImgsRef  = useRef({})
  const charImgsRef = useRef({})

  const addLog = (msg, type = 'info') => setLogs(p => [...p, { msg, type, t: Date.now() }])

  // ── STEP 1: Generate Script ────────────────────────────────────────────────
  async function handleGenerateScript() {
    if (!topic.trim()) return
    setIsWorking(true)
    setStep('script')
    addLog('🤖 AI script likh raha hai...', 'info')

    const prompt = `
Create a detailed ${scriptType} YouTube animated video script about: "${topic}"

Format EXACTLY like this (use these exact labels):

HOOK: [15-second attention grabbing opening line]
BACKGROUND: [describe background scene, e.g. "bright colorful classroom with chalkboard and books"]
CHARACTER: [describe main character, e.g. "friendly young teacher with glasses, cartoon style"]
EMOTION: excited
DIALOGUE: [exact words the character speaks for hook - 2-3 sentences]

INTRO: [topic introduction]
BACKGROUND: [different background scene]
CHARACTER: [same or different character description]
EMOTION: happy
DIALOGUE: [exact narration - 3-4 sentences about the topic introduction]

SCENE 1: [first main point title]
BACKGROUND: [relevant background]
CHARACTER: [character description]
EMOTION: thinking
DIALOGUE: [explanation - 4-5 sentences with facts]

SCENE 2: [second main point title]
BACKGROUND: [relevant background]
CHARACTER: [character description]
EMOTION: surprised
DIALOGUE: [explanation - 4-5 sentences with facts]

SCENE 3: [third main point]
BACKGROUND: [relevant background]
CHARACTER: [character]
EMOTION: excited
DIALOGUE: [explanation - 3-4 sentences]

OUTRO: [call to action]
BACKGROUND: [studio or colorful background]
CHARACTER: [character waving goodbye]
EMOTION: happy
DIALOGUE: [subscribe/like request - 2-3 sentences, fun and energetic]

Language: Hinglish (mix of Hindi and English)
Make dialogue natural, educational, engaging for YouTube.
`

    try {
      const result = await smartAICall(prompt, (api) => addLog(`🔄 Switching to ${api}...`, 'switch'))
      addLog(`✅ Script ready! (via ${result.usedApi})`, 'success')
      
      const parsed = parseScriptToScenes(result.text)
      addLog(`📋 ${parsed.length} scenes create ho gayi`, 'success')
      setScenes(parsed)
      scenesRef.current = parsed
      
      setStep('images')
      await handleGenerateImages(parsed)
    } catch (err) {
      addLog('❌ Script error: ' + err.message, 'error')
      setIsWorking(false)
    }
  }

  // ── STEP 2: Generate Images for Each Scene ─────────────────────────────────
  async function handleGenerateImages(scenesArr) {
    const hfKey = localStorage.getItem('HF_KEY') || ''
    if (!hfKey) {
      addLog('⚠️ HuggingFace key nahi hai! Fallback cartoon use karega', 'warn')
    }

    const arr = scenesArr || scenes
    addLog(`🎨 ${arr.length} scenes ke liye AI images generate ho rahe hain...`, 'info')

    for (let i = 0; i < arr.length; i++) {
      const scene = arr[i]
      setProgress(Math.round((i / arr.length) * 100))
      addLog(`🖼️ Scene ${i+1}/${arr.length}: "${scene.label}" - Background...`, 'info')

      // Background image
      if (hfKey) {
        const bgUrl = await generateImage(BG_PROMPT(scene.background), hfKey)
        if (bgUrl) {
          bgImgsRef.current[i] = await loadImg(bgUrl)
          addLog(`  ✅ Background ${i+1} ready`, 'success')
        } else {
          addLog(`  ⚠️ BG ${i+1} fallback`, 'warn')
        }

        // Character image
        addLog(`🎭 Scene ${i+1}: Character "${scene.emotion}"...`, 'info')
        const charUrl = await generateImage(CHAR_PROMPT(scene.character, scene.emotion), hfKey)
        if (charUrl) {
          charImgsRef.current[i] = await loadImg(charUrl)
          addLog(`  ✅ Character ${i+1} ready`, 'success')
        } else {
          addLog(`  ⚠️ Char ${i+1} fallback`, 'warn')
        }
      }
    }

    setProgress(100)
    addLog('🎉 Sabhi images ready!', 'success')
    setStep('assemble')
    setIsWorking(false)
    
    // Auto-start preview
    setTimeout(() => {
      setCurrentIdx(0)
      setPreviewPlaying(true)
    }, 500)
  }

  function loadImg(url) {
    return new Promise((res) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => res(img)
      img.onerror = () => res(null)
      img.src = url
    })
  }

  // ── PREVIEW ANIMATION LOOP ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || step !== 'assemble') return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const currentScenes = scenesRef.current

    if (!previewPlaying) {
      // Draw static frame
      const s = currentScenes[currentIdx]
      if (s) drawFrame(ctx, W, H, s, 0, bgImgsRef.current[currentIdx], charImgsRef.current[currentIdx])
      return
    }

    function loop() {
      const sc = currentScenes[currentIdx]
      if (sc) drawFrame(ctx, W, H, sc, frameRef.current, bgImgsRef.current[currentIdx], charImgsRef.current[currentIdx])
      frameRef.current++
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [step, previewPlaying, currentIdx])

  // ── STEP 3: Export Video ────────────────────────────────────────────────────
  async function handleExport() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    const currentScenes = scenesRef.current

    setStep('export')
    setIsWorking(true)
    setProgress(0)
    addLog('🎬 Video export shuru...', 'info')

    const stream = canvas.captureStream(24)
    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2500000 })
    const chunks = []
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data) }

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      setExportUrl(url)
      setIsWorking(false)
      addLog('🎉 Video export complete! Download karein!', 'success')
      localStorage.setItem('videos_today', (parseInt(localStorage.getItem('videos_today') || '0') + 1).toString())
    }

    recorder.start()

    // Render each scene
    const FPS = 24
    const SEC_PER_SCENE = 6

    for (let si = 0; si < currentScenes.length; si++) {
      const scene = currentScenes[si]
      const frames = SEC_PER_SCENE * FPS
      setProgress(Math.round((si / currentScenes.length) * 100))
      addLog(`🎞️ Scene ${si+1}/${currentScenes.length} render...`, 'info')

      for (let f = 0; f < frames; f++) {
        drawFrame(ctx, W, H, scene, f, bgImgsRef.current[si], charImgsRef.current[si])
        await new Promise(r => setTimeout(r, 1000 / FPS))
      }
    }

    recorder.stop()
    setProgress(100)
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  const TYPES = [
    { id: 'educational', label: '📚 Educational' },
    { id: 'story',       label: '📖 Story'       },
    { id: 'facts',       label: '💡 Facts'       },
    { id: 'comedy',      label: '😂 Comedy'      },
    { id: 'motivation',  label: '💪 Motivation'  },
    { id: 'news',        label: '📰 News'        },
  ]

  const SUGGESTIONS = [
    'Chandrayaan mission complete story',
    'AI kaise kaam karta hai',
    'India ke 5 amazing facts',
    'Cricket World Cup history',
    'Space mein kya hota hai',
    'Dino kyun extinct hue',
  ]

  return (
    <div style={{ padding: 16, minHeight: '100vh' }}>

      {/* Step Progress */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {STEPS.map((s, i) => {
          const idx = STEPS.findIndex(x => x.id === step)
          const done = i < idx, active = s.id === step
          return (
            <div key={s.id} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, background: done ? '#00f5d4' : active ? 'rgba(0,245,212,0.2)' : 'rgba(255,255,255,0.05)', border: `2px solid ${done ? '#00f5d4' : active ? '#00f5d4' : 'rgba(255,255,255,0.1)'}`, color: done ? '#000' : active ? '#00f5d4' : 'rgba(224,224,255,0.3)' }}>
                {done ? '✓' : s.icon}
              </div>
              <div style={{ fontSize: 8, color: active ? '#00f5d4' : 'rgba(224,224,255,0.3)', fontFamily: "'Rajdhani',sans-serif", letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          )
        })}
      </div>

      {/* ── INPUT STEP ── */}
      {step === 'input' && (
        <div>
          <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 22, fontWeight: 700, color: '#00f5d4', marginBottom: 4 }}>🎬 Video Topic</h2>
          <p style={{ fontSize: 13, color: 'rgba(224,224,255,0.5)', marginBottom: 16 }}>Sirf topic do — baaki sab AI khud karega!</p>

          <input value={topic} onChange={e => setTopic(e.target.value)}
            placeholder="Jaise: Chandrayaan 3 ki kahani..."
            style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(0,245,212,0.05)', border: '1px solid rgba(0,245,212,0.3)', color: '#e0e0ff', fontSize: 15, outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
          />

          <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>💡 SUGGESTIONS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => setTopic(s)}
                style={{ padding: '6px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,245,212,0.2)', color: 'rgba(224,224,255,0.6)', fontSize: 11, cursor: 'pointer' }}>
                {s}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>VIDEO TYPE</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 20 }}>
            {TYPES.map(t => (
              <button key={t.id} onClick={() => setScriptType(t.id)}
                style={{ padding: '10px 4px', borderRadius: 10, background: scriptType === t.id ? 'rgba(0,245,212,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${scriptType === t.id ? '#00f5d4' : 'rgba(255,255,255,0.08)'}`, color: scriptType === t.id ? '#00f5d4' : 'rgba(224,224,255,0.4)', fontSize: 11, cursor: 'pointer', fontFamily: "'Rajdhani',sans-serif", fontWeight: scriptType === t.id ? 700 : 400 }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* What AI will do */}
          <div style={{ background: 'rgba(0,245,212,0.04)', border: '1px solid rgba(0,245,212,0.15)', borderRadius: 12, padding: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 12, color: '#00f5d4', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, marginBottom: 8 }}>🤖 AI YE SAB KHUD KAREGA:</div>
            {['Script likhega (Gemini/Groq/HF)', 'Har scene ka background generate karega', 'Character expressions banayega', 'Dialogue automatically set karega', 'Animated preview banayega', 'HD video export karega'].map((item, i) => (
              <div key={i} style={{ fontSize: 12, color: 'rgba(224,224,255,0.6)', marginBottom: 4, display: 'flex', gap: 6 }}>
                <span style={{ color: '#00f5d4' }}>✓</span>{item}
              </div>
            ))}
          </div>

          <button onClick={handleGenerateScript} disabled={!topic.trim()}
            style={{ width: '100%', padding: '16px', borderRadius: 14, background: topic.trim() ? 'linear-gradient(135deg,#00f5d4,#7209b7)' : 'rgba(255,255,255,0.05)', border: 'none', color: topic.trim() ? '#fff' : 'rgba(224,224,255,0.2)', fontSize: 17, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: 1, cursor: topic.trim() ? 'pointer' : 'not-allowed' }}>
            🚀 AI SE VIDEO BANAO
          </button>
        </div>
      )}

      {/* ── SCRIPT / IMAGES STEPS (progress) ── */}
      {(step === 'script' || step === 'images') && (
        <div>
          <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 20, fontWeight: 700, color: '#00f5d4', marginBottom: 16 }}>
            {step === 'script' ? '🤖 AI Script Likh Raha Hai...' : '🎨 AI Images Bana Raha Hai...'}
          </h2>

          {/* Progress bar */}
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#00f5d4,#7209b7)', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>

          {/* Live logs */}
          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 12, border: '1px solid rgba(0,245,212,0.1)', maxHeight: 350, overflowY: 'auto' }}>
            {logs.map((log, i) => (
              <div key={i} style={{ fontSize: 12, marginBottom: 6, color: log.type === 'success' ? '#00f5d4' : log.type === 'error' ? '#f72585' : log.type === 'warn' ? '#ffd60a' : log.type === 'switch' ? '#a29bfe' : 'rgba(224,224,255,0.7)', fontFamily: 'monospace', lineHeight: 1.5 }}>
                {log.msg}
              </div>
            ))}
            {isWorking && (
              <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', fontFamily: 'monospace' }}>
                ⠋ Processing...
              </div>
            )}
          </div>

          {step === 'images' && !isWorking && (
            <button onClick={() => { setStep('assemble'); setPreviewPlaying(true) }}
              style={{ width: '100%', marginTop: 16, padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg,#00f5d4,#7209b7)', border: 'none', color: '#fff', fontSize: 16, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, cursor: 'pointer' }}>
              ▶ Preview Dekho
            </button>
          )}
        </div>
      )}

      {/* ── ASSEMBLE STEP (Preview + Export) ── */}
      {step === 'assemble' && (
        <div>
          <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 20, fontWeight: 700, color: '#ffd60a', marginBottom: 12 }}>🎬 Video Preview</h2>

          {/* Canvas */}
          <div style={{ borderRadius: 14, overflow: 'hidden', border: '2px solid rgba(255,214,10,0.3)', marginBottom: 12, position: 'relative', boxShadow: '0 0 30px rgba(255,214,10,0.1)' }}>
            <canvas ref={canvasRef} width={640} height={360} style={{ width: '100%', display: 'block' }} />
          </div>

          {/* Scene navigation */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <button onClick={() => setCurrentIdx(p => Math.max(0, p-1))}
              style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e0e0ff', cursor: 'pointer', fontSize: 18 }}>⏮</button>
            <button onClick={() => setPreviewPlaying(p => !p)}
              style={{ padding: '8px 20px', borderRadius: 8, background: 'rgba(255,214,10,0.15)', border: '1px solid rgba(255,214,10,0.4)', color: '#ffd60a', cursor: 'pointer', fontSize: 18 }}>
              {previewPlaying ? '⏸' : '▶'}
            </button>
            <button onClick={() => setCurrentIdx(p => Math.min(scenesRef.current.length-1, p+1))}
              style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e0e0ff', cursor: 'pointer', fontSize: 18 }}>⏭</button>
          </div>

          {/* Scene pills */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {scenesRef.current.map((s, i) => (
              <button key={i} onClick={() => setCurrentIdx(i)}
                style={{ padding: '4px 10px', borderRadius: 20, background: currentIdx === i ? 'rgba(255,214,10,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${currentIdx === i ? '#ffd60a' : 'rgba(255,255,255,0.08)'}`, color: currentIdx === i ? '#ffd60a' : 'rgba(224,224,255,0.4)', fontSize: 10, cursor: 'pointer', fontFamily: "'Rajdhani',sans-serif" }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Current scene dialogue */}
          {scenesRef.current[currentIdx] && (
            <div style={{ background: 'rgba(255,214,10,0.05)', border: '1px solid rgba(255,214,10,0.2)', borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#ffd60a', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, marginBottom: 6 }}>
                🎭 SCENE: {scenesRef.current[currentIdx].label}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.7)', lineHeight: 1.6 }}>
                {scenesRef.current[currentIdx].dialogue?.substring(0, 150)}...
              </div>
            </div>
          )}

          <button onClick={handleExport}
            style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg,#f72585,#7209b7)', border: 'none', color: '#fff', fontSize: 17, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}>
            🚀 EXPORT HD VIDEO
          </button>
        </div>
      )}

      {/* ── EXPORT STEP ── */}
      {step === 'export' && (
        <div>
          <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 20, fontWeight: 700, color: '#a29bfe', marginBottom: 16 }}>📤 Video Export</h2>

          <canvas ref={canvasRef} width={1280} height={720} style={{ width: '100%', borderRadius: 12, marginBottom: 12, border: '1px solid rgba(162,155,254,0.3)' }} />

          {isWorking && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#a29bfe', fontFamily: "'Rajdhani',sans-serif" }}>Rendering frames...</span>
                <span style={{ fontSize: 13, color: '#a29bfe', fontWeight: 700 }}>{progress}%</span>
              </div>
              <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#a29bfe,#f72585)', borderRadius: 4, transition: 'width 0.3s ease' }} />
              </div>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 12, padding: 12, maxHeight: 200, overflowY: 'auto' }}>
                {logs.slice(-8).map((log, i) => (
                  <div key={i} style={{ fontSize: 11, color: log.type === 'success' ? '#00f5d4' : 'rgba(224,224,255,0.5)', marginBottom: 4, fontFamily: 'monospace' }}>{log.msg}</div>
                ))}
              </div>
            </div>
          )}

          {exportUrl && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 22, fontWeight: 700, color: '#00f5d4', marginBottom: 4 }}>Video Ready!</div>
              <div style={{ fontSize: 13, color: 'rgba(224,224,255,0.5)', marginBottom: 20 }}>YouTube upload ke liye download karein</div>
              
              <a href={exportUrl} download={`${topic.replace(/\s+/g,'-')}-${Date.now()}.webm`}
                style={{ display: 'block', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg,#00f5d4,#7209b7)', color: '#fff', textDecoration: 'none', fontSize: 17, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
                ⬇️ VIDEO DOWNLOAD KARO
              </a>

              <button onClick={() => { setStep('input'); setTopic(''); setLogs([]); setScenes([]); setExportUrl(null); setProgress(0); scenesRef.current = []; bgImgsRef.current = {}; charImgsRef.current = {} }}
                style={{ width: '100%', padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(224,224,255,0.6)', fontSize: 14, cursor: 'pointer' }}>
                🔄 Naya Video Banao
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
