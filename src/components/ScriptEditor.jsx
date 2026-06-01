import React, { useState, useRef } from 'react'
import { smartAICall, getApiStatus } from '../ai/tokenRotator'

const AI_SUGGESTIONS = [
  "Cricket World Cup highlights explained",
  "Desi food science - why chai is special",
  "Ancient Indian mathematics secrets",
  "Space exploration in next 10 years",
  "How social media affects your brain",
  "Indian startup success stories",
  "Yoga science explained simply",
  "Climate change - what India can do",
]

const SCRIPT_TYPES = [
  { id: 'educational', label: '📚 Educational', prompt: 'educational YouTube video script' },
  { id: 'story', label: '📖 Story', prompt: 'animated story video script' },
  { id: 'facts', label: '💡 Facts', prompt: 'interesting facts video script' },
  { id: 'news', label: '📰 News', prompt: 'news explanation video script' },
  { id: 'comedy', label: '😂 Comedy', prompt: 'funny animated video script' },
  { id: 'motivation', label: '💪 Motivation', prompt: 'motivational video script' },
]

export default function ScriptEditor({ projectData, setProjectData }) {
  const [topic, setTopic] = useState(projectData.title || '')
  const [scriptType, setScriptType] = useState('educational')
  const [script, setScript] = useState(projectData.script || '')
  const [loading, setLoading] = useState(false)
  const [activeApi, setActiveApi] = useState('')
  const [mode, setMode] = useState('choose') // 'choose' | 'write' | 'ai'
  const [error, setError] = useState('')

  async function generateScript() {
    if (!topic.trim()) { setError('Topic daalen pehle!'); return }
    setError('')
    setLoading(true)
    setActiveApi('...')

    const type = SCRIPT_TYPES.find(t => t.id === scriptType)
    const prompt = `
Create a compelling ${type.prompt} about "${topic}".
Format:
TITLE: [catchy title]
HOOK: [first 15 seconds - attention grabbing]
INTRO: [30 seconds introduction]
SCENE 1: [main content part 1 - 60 seconds]
SCENE 2: [main content part 2 - 60 seconds]  
SCENE 3: [main content part 3 - 60 seconds]
OUTRO: [30 seconds - call to action]
TOTAL DURATION: ~5 minutes
Language: Mix of Hindi and English (Hinglish)
Make it engaging, educational, and suitable for animated YouTube video.
Character: One main 2D animated character who explains everything.
`

    try {
      const result = await smartAICall(prompt, (apiName) => {
        setActiveApi(apiName)
      })
      setActiveApi(result.usedApi)
      setScript(result.text)
      
      const title = result.text.match(/TITLE:\s*(.+)/)?.[1] || topic
      setProjectData(prev => ({ ...prev, script: result.text, title, voiceText: result.text }))
    } catch (err) {
      if (err.message === 'ALL_APIS_EXHAUSTED') {
        setError('Aaj ke saare AI tokens khatam ho gaye. Kal try karein!')
      } else {
        setError('Kuch error aayi. API keys check karein Settings mein.')
      }
    }
    setLoading(false)
  }

  function saveManualScript() {
    if (!script.trim()) { setError('Script likhein pehle!'); return }
    setProjectData(prev => ({ ...prev, script, title: topic, voiceText: script }))
    setError('')
    alert('✅ Script save ho gayi!')
  }

  return (
    <div className="p-4 min-h-full grid-bg">
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--neon)', marginBottom: 16 }}>
        📝 Script Editor
      </h2>

      {/* Mode chooser */}
      {mode === 'choose' && (
        <div>
          <p style={{ color: 'rgba(224,224,255,0.6)', fontSize: 13, marginBottom: 16 }}>
            Aap kaise script banana chahte hain?
          </p>
          <div className="grid grid-cols-1 gap-3">
            <button onClick={() => setMode('ai')} className="glass neon-border rounded-xl p-5 text-left active:scale-95 transition-all">
              <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--neon)' }}>AI Se Generate Karein</div>
              <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.5)', marginTop: 4 }}>Topic dein, AI poori script banayega • Auto API switching</div>
            </button>
            <button onClick={() => setMode('write')} className="glass plasma-border rounded-xl p-5 text-left active:scale-95 transition-all">
              <div style={{ fontSize: 28, marginBottom: 8 }}>✍️</div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--plasma)' }}>Khud Likhein</div>
              <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.5)', marginTop: 4 }}>Apni script manually type karein</div>
            </button>
          </div>
        </div>
      )}

      {/* AI Mode */}
      {mode === 'ai' && (
        <div>
          <button onClick={() => setMode('choose')} style={{ color: 'var(--neon)', fontSize: 12, marginBottom: 12 }}>← Wapas</button>

          {/* Topic Input */}
          <label style={{ fontSize: 12, color: 'rgba(224,224,255,0.5)', letterSpacing: 1, fontFamily: "'Rajdhani', sans-serif" }}>VIDEO TOPIC</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Jaise: Chandrayaan 3 ki kahani..."
            className="w-full mt-1 mb-4 p-3 rounded-xl glass neon-border"
            style={{ color: '#e0e0ff', fontSize: 14, outline: 'none', background: 'rgba(0,245,212,0.03)' }}
          />

          {/* AI Suggestions */}
          <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
            AI SUGGESTIONS (tap karein)
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {AI_SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => setTopic(s)}
                className="px-3 py-1.5 rounded-full glass transition-all active:scale-95"
                style={{ fontSize: 11, border: '1px solid rgba(0,245,212,0.2)', color: 'rgba(224,224,255,0.6)' }}>
                {s}
              </button>
            ))}
          </div>

          {/* Script Type */}
          <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
            SCRIPT TYPE
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {SCRIPT_TYPES.map(t => (
              <button key={t.id} onClick={() => setScriptType(t.id)}
                className="p-2 rounded-xl text-center transition-all active:scale-95"
                style={{
                  background: scriptType === t.id ? 'rgba(0,245,212,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${scriptType === t.id ? 'var(--neon)' : 'rgba(255,255,255,0.08)'}`,
                  fontSize: 11, color: scriptType === t.id ? 'var(--neon)' : 'rgba(224,224,255,0.5)',
                  fontFamily: "'Rajdhani', sans-serif", fontWeight: scriptType === t.id ? 700 : 400
                }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Active API indicator */}
          {loading && (
            <div className="glass neon-border rounded-xl p-3 mb-4 flex items-center gap-3">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neon)', animation: 'pulse 1s infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--neon)', fontFamily: "'Rajdhani', sans-serif" }}>
                {activeApi} likhh raha hai...
              </span>
            </div>
          )}

          {error && <div className="plasma-border rounded-xl p-3 mb-4" style={{ background: 'rgba(247,37,133,0.1)', color: 'var(--plasma)', fontSize: 13 }}>{error}</div>}

          <button onClick={generateScript} disabled={loading}
            className="btn-neon w-full py-4 rounded-xl mb-4"
            style={{ fontSize: 16, opacity: loading ? 0.6 : 1 }}>
            {loading ? '⏳ AI Likh Raha Hai...' : '🤖 Script Generate Karo'}
          </button>

          {/* Generated Script */}
          {script && (
            <div>
              <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
                GENERATED SCRIPT — {activeApi}
              </div>
              <textarea
                value={script}
                onChange={e => setScript(e.target.value)}
                className="w-full glass neon-border rounded-xl p-3"
                rows={12}
                style={{ color: '#e0e0ff', fontSize: 12, resize: 'vertical', outline: 'none', background: 'rgba(0,245,212,0.03)', lineHeight: 1.6 }}
              />
              <button onClick={saveManualScript} className="btn-neon w-full py-3 rounded-xl mt-3" style={{ fontSize: 14 }}>
                ✅ Script Save Karo
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual Write Mode */}
      {mode === 'write' && (
        <div>
          <button onClick={() => setMode('choose')} style={{ color: 'var(--plasma)', fontSize: 12, marginBottom: 12 }}>← Wapas</button>

          <label style={{ fontSize: 12, color: 'rgba(224,224,255,0.5)', letterSpacing: 1, fontFamily: "'Rajdhani', sans-serif" }}>VIDEO TITLE</label>
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="Video ka title..."
            className="w-full mt-1 mb-4 p-3 rounded-xl glass plasma-border"
            style={{ color: '#e0e0ff', fontSize: 14, outline: 'none', background: 'rgba(247,37,133,0.03)' }}
          />

          <label style={{ fontSize: 12, color: 'rgba(224,224,255,0.5)', letterSpacing: 1, fontFamily: "'Rajdhani', sans-serif" }}>APNI SCRIPT LIKHEIN</label>
          <textarea
            value={script}
            onChange={e => setScript(e.target.value)}
            placeholder={`HOOK: Kya aap jaante hain...

INTRO: Aaj hum baat karenge...

SCENE 1: Pehle samajhte hain...

SCENE 2: Ab dekhte hain...

OUTRO: Subscribe karna mat bhoolein!`}
            className="w-full mt-1 glass plasma-border rounded-xl p-3"
            rows={14}
            style={{ color: '#e0e0ff', fontSize: 13, resize: 'vertical', outline: 'none', background: 'rgba(247,37,133,0.03)', lineHeight: 1.6 }}
          />

          {error && <div style={{ color: 'var(--plasma)', fontSize: 13, marginTop: 8 }}>{error}</div>}

          <button onClick={saveManualScript} className="btn-plasma w-full py-4 rounded-xl mt-4" style={{ fontSize: 16 }}>
            ✅ Script Save Karo
          </button>
        </div>
      )}
    </div>
  )
}
