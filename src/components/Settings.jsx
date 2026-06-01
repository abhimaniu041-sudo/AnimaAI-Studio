import React, { useState, useEffect } from 'react'
import { getApiStatus } from '../ai/tokenRotator'

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('GEMINI_KEY') || '')
  const [groqKey, setGroqKey] = useState(localStorage.getItem('GROQ_KEY') || '')
  const [hfKey, setHfKey] = useState(localStorage.getItem('HF_KEY') || '')
  const [saved, setSaved] = useState(false)
  const [apiStatus, setApiStatus] = useState([])

  useEffect(() => { setApiStatus(getApiStatus()) }, [])

  function saveKeys() {
    localStorage.setItem('GEMINI_KEY', geminiKey)
    localStorage.setItem('GROQ_KEY', groqKey)
    localStorage.setItem('HF_KEY', hfKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    window.location.reload()
  }

  function clearData() {
    if (confirm('Sab data delete karein?')) {
      localStorage.clear()
      window.location.reload()
    }
  }

  const API_LINKS = [
    { name: 'Google Gemini', url: 'https://aistudio.google.com', color: '#4285f4', free: '1500 req/day' },
    { name: 'Groq', url: 'https://console.groq.com', color: '#f72585', free: '14400 req/day' },
    { name: 'HuggingFace', url: 'https://huggingface.co/settings/tokens', color: '#ffd60a', free: '500 req/day' },
  ]

  return (
    <div className="p-4 grid-bg min-h-full">
      <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: 'rgba(224,224,255,0.8)', marginBottom: 16 }}>
        ⚙️ Settings
      </h2>

      {/* Free API Links */}
      <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
        FREE API KEYS KAHAN SE LEIN
      </div>
      {API_LINKS.map((api, i) => (
        <a key={i} href={api.url} target="_blank" rel="noreferrer"
          className="glass rounded-xl p-3 mb-2 flex items-center justify-between active:scale-95 transition-all"
          style={{ border: `1px solid ${api.color}30`, textDecoration: 'none', display: 'flex' }}>
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: api.color, fontSize: 14 }}>{api.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)' }}>Free: {api.free}</div>
          </div>
          <span style={{ fontSize: 14, color: api.color }}>↗</span>
        </a>
      ))}

      {/* API Keys Input */}
      <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1, marginTop: 16 }}>
        API KEYS ENTER KAREIN
      </div>

      {[
        { label: 'Google Gemini API Key', val: geminiKey, set: setGeminiKey, color: '#4285f4' },
        { label: 'Groq API Key', val: groqKey, set: setGroqKey, color: '#f72585' },
        { label: 'HuggingFace Token', val: hfKey, set: setHfKey, color: '#ffd60a' },
      ].map((field, i) => (
        <div key={i} className="mb-3">
          <label style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani', sans-serif" }}>{field.label}</label>
          <input
            type="password"
            value={field.val}
            onChange={e => field.set(e.target.value)}
            placeholder="Enter API key..."
            className="w-full mt-1 p-3 rounded-xl glass"
            style={{ border: `1px solid ${field.color}40`, color: '#e0e0ff', fontSize: 13, outline: 'none', background: `${field.color}08` }}
          />
        </div>
      ))}

      {saved && (
        <div className="neon-border rounded-xl p-3 mb-3 text-center" style={{ background: 'rgba(0,245,212,0.1)', color: 'var(--neon)', fontSize: 13, fontFamily: "'Rajdhani', sans-serif" }}>
          ✅ Keys saved! App restart ho rahi hai...
        </div>
      )}

      <button onClick={saveKeys} className="btn-neon w-full py-4 rounded-xl mb-3 mt-2" style={{ fontSize: 16 }}>
        💾 Keys Save Karo
      </button>

      {/* API Status */}
      <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 8, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
        API STATUS TODAY
      </div>
      {apiStatus.map((api, i) => (
        <div key={i} className="glass rounded-xl p-3 mb-2 flex items-center justify-between"
          style={{ border: `1px solid ${api.exhausted ? 'rgba(255,255,255,0.05)' : api.color + '30'}` }}>
          <span style={{ fontSize: 13, color: api.exhausted ? 'rgba(224,224,255,0.3)' : api.color, fontFamily: "'Rajdhani', sans-serif" }}>{api.name}</span>
          <span style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)' }}>{api.used}/{api.limit} {api.exhausted ? '❌' : '✅'}</span>
        </div>
      ))}

      <button onClick={clearData}
        className="w-full py-3 rounded-xl mt-4 glass"
        style={{ border: '1px solid rgba(247,37,133,0.3)', color: 'rgba(247,37,133,0.7)', fontSize: 14 }}>
        🗑️ Sab Data Clear Karo
      </button>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'rgba(224,224,255,0.2)' }}>
        AnimaAI Studio v1.0 • Made for YouTube Creators
      </div>
    </div>
  )
}
