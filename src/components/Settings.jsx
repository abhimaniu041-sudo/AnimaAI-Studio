import React, { useState, useEffect } from 'react'
import { getApiStatus } from '../ai/tokenRotator'

export default function Settings() {
  const [geminiKey, setGeminiKey] = useState(localStorage.getItem('GEMINI_KEY') || '')
  const [groqKey, setGroqKey]     = useState(localStorage.getItem('GROQ_KEY') || '')
  const [hfKey, setHfKey]         = useState(localStorage.getItem('HF_KEY') || '')
  const [saved, setSaved]         = useState(false)
  const [apiStatus, setApiStatus] = useState([])
  const [testResult, setTestResult] = useState('')

  useEffect(() => { setApiStatus(getApiStatus()) }, [])

  function saveKeys() {
    localStorage.setItem('GEMINI_KEY', geminiKey)
    localStorage.setItem('GROQ_KEY', groqKey)
    localStorage.setItem('HF_KEY', hfKey)
    setSaved(true)
    setTimeout(() => { setSaved(false); window.location.reload() }, 1500)
  }

  async function testHF() {
    if (!hfKey) { setTestResult('❌ HF key enter karein pehle'); return }
    setTestResult('⏳ Testing...')
    try {
      const res = await fetch('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${hfKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: 'cartoon cat, 2D flat design', parameters: { width: 64, height: 64 } })
      })
      if (res.ok) setTestResult('✅ HuggingFace working!')
      else setTestResult(`⚠️ Status: ${res.status} - Model loading, retry karein`)
    } catch { setTestResult('❌ Network error') }
  }

  const APIS = [
    { name: 'Google Gemini', url: 'https://aistudio.google.com/apikey', free: '1,500 req/day', color: '#4285f4', note: 'Script generation' },
    { name: 'Groq', url: 'https://console.groq.com/keys', free: '14,400 req/day', color: '#f72585', note: 'Fast script fallback' },
    { name: 'HuggingFace', url: 'https://huggingface.co/settings/tokens', free: '500 req/day', color: '#ffd60a', note: 'Image generation ⭐ IMPORTANT' },
  ]

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 22, fontWeight: 700, color: 'rgba(224,224,255,0.8)', marginBottom: 4 }}>⚙️ Settings</h2>
      <p style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', marginBottom: 20 }}>API keys enter karein — sab free hai!</p>

      {/* Important note */}
      <div style={{ background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.3)', borderRadius: 12, padding: 12, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: '#ffd60a', fontWeight: 700, marginBottom: 4 }}>⭐ IMPORTANT</div>
        <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.6)', lineHeight: 1.6 }}>
          HuggingFace key sabse zaroori hai — isse hi AI real cartoon images banayega. Gemini/Groq text script ke liye hai.
        </div>
      </div>

      {/* API Links */}
      <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, marginBottom: 10 }}>
        FREE KEYS KAHAN SE LEIN
      </div>
      {APIS.map((api, i) => (
        <a key={i} href={api.url} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: `1px solid ${api.color}25`, marginBottom: 8, textDecoration: 'none' }}>
          <div>
            <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, color: api.color, fontSize: 14 }}>{api.name}</div>
            <div style={{ fontSize: 10, color: 'rgba(224,224,255,0.4)' }}>{api.free} • {api.note}</div>
          </div>
          <span style={{ color: api.color, fontSize: 16 }}>↗</span>
        </a>
      ))}

      {/* Input fields */}
      <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, marginBottom: 10, marginTop: 20 }}>
        KEYS PASTE KAREIN
      </div>
      {[
        { label: 'Google Gemini API Key', val: geminiKey, set: setGeminiKey, color: '#4285f4' },
        { label: 'Groq API Key', val: groqKey, set: setGroqKey, color: '#f72585' },
        { label: 'HuggingFace Token ⭐', val: hfKey, set: setHfKey, color: '#ffd60a' },
      ].map((f, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani',sans-serif" }}>{f.label}</label>
          <input type="password" value={f.val} onChange={e => f.set(e.target.value)}
            placeholder="Paste key here..."
            style={{ width: '100%', marginTop: 4, padding: '12px', borderRadius: 10, background: `${f.color}08`, border: `1px solid ${f.color}35`, color: '#e0e0ff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      ))}

      {/* HF Test */}
      <button onClick={testHF}
        style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'rgba(255,214,10,0.1)', border: '1px solid rgba(255,214,10,0.3)', color: '#ffd60a', fontSize: 13, cursor: 'pointer', marginBottom: 8, fontFamily: "'Rajdhani',sans-serif" }}>
        🧪 HuggingFace Test Karo
      </button>
      {testResult && <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.7)', marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,255,255,0.04)' }}>{testResult}</div>}

      {saved && (
        <div style={{ background: 'rgba(0,245,212,0.1)', border: '1px solid rgba(0,245,212,0.4)', borderRadius: 10, padding: 12, marginBottom: 12, textAlign: 'center', color: '#00f5d4', fontSize: 13, fontFamily: "'Rajdhani',sans-serif" }}>
          ✅ Saved! Reloading...
        </div>
      )}

      <button onClick={saveKeys}
        style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg,#00f5d4,#7209b7)', border: 'none', color: '#fff', fontSize: 17, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, cursor: 'pointer', marginBottom: 20 }}>
        💾 KEYS SAVE KARO
      </button>

      {/* API Status */}
      <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, marginBottom: 10 }}>API STATUS TODAY</div>
      {apiStatus.map((api, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${api.exhausted ? 'rgba(255,255,255,0.05)' : api.color + '30'}`, marginBottom: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: api.exhausted ? 'rgba(224,224,255,0.3)' : api.color, fontFamily: "'Rajdhani',sans-serif" }}>{api.name}</span>
          <span style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)' }}>{api.used}/{api.limit} {api.exhausted ? '❌' : '✅'}</span>
        </div>
      ))}

      <button onClick={() => { if (confirm('Sab data clear?')) { localStorage.clear(); window.location.reload() } }}
        style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(247,37,133,0.08)', border: '1px solid rgba(247,37,133,0.25)', color: 'rgba(247,37,133,0.7)', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
        🗑️ Data Clear
      </button>
    </div>
  )
}
