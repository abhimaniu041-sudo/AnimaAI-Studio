import React, { useEffect, useState } from 'react'
import { getApiStatus } from '../ai/tokenRotator'

export default function Home({ navigate }) {
  const [apiStatus, setApiStatus] = useState([])
  const [videosToday, setVideosToday] = useState(0)

  useEffect(() => {
    setApiStatus(getApiStatus())
    setVideosToday(parseInt(localStorage.getItem('videos_today') || '0'))
  }, [])

  return (
    <div style={{ padding: 16 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🎬</div>
        <h1 style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 30, fontWeight: 700, background: 'linear-gradient(135deg,#00f5d4,#f72585)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: 4 }}>AnimaAI Studio</h1>
        <p style={{ fontSize: 13, color: 'rgba(224,224,255,0.5)' }}>Sirf topic do — AI poori video banayega!</p>
      </div>

      {/* Active AI */}
      <div style={{ background: 'rgba(0,245,212,0.05)', border: '1px solid rgba(0,245,212,0.25)', borderRadius: 14, padding: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#00f5d4', boxShadow: '0 0 10px #00f5d4', flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 10, color: 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1 }}>ACTIVE AI ENGINE</div>
          <div style={{ fontSize: 15, color: '#00f5d4', fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>
            {apiStatus.find(a => a.active)?.name || 'Google Gemini'}
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={{ fontSize: 10, color: 'rgba(224,224,255,0.4)' }}>Auto-switch ON</div>
          <div style={{ fontSize: 11, color: '#ffd60a' }}>3 APIs Ready ✓</div>
        </div>
      </div>

      {/* Big Create Button */}
      <button onClick={() => navigate('/create')}
        style={{ width: '100%', padding: '20px', borderRadius: 16, background: 'linear-gradient(135deg,#00f5d4,#7209b7)', border: 'none', color: '#fff', fontSize: 20, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, letterSpacing: 1, cursor: 'pointer', marginBottom: 20, boxShadow: '0 8px 30px rgba(0,245,212,0.3)' }}>
        🎬 VIDEO BANAO NOW
      </button>

      {/* How it works */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, marginBottom: 10 }}>HOW IT WORKS</div>
        {[
          { n: '1', c: '#00f5d4', t: 'Topic do', s: 'Bas topic type karo' },
          { n: '2', c: '#a29bfe', t: 'AI Script likhta hai', s: 'Gemini/Groq/HF automatic' },
          { n: '3', c: '#f72585', t: 'AI Images banata hai', s: 'HuggingFace se real cartoon' },
          { n: '4', c: '#ffd60a', t: 'Video ready!', s: 'Download & YouTube upload' },
        ].map(item => (
          <div key={item.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: item.c + '20', border: `1px solid ${item.c}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: item.c, flexShrink: 0 }}>{item.n}</div>
            <div>
              <div style={{ fontSize: 14, color: item.c, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>{item.t}</div>
              <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)' }}>{item.s}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Token Status */}
      <div style={{ background: 'rgba(15,10,30,0.7)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, marginBottom: 10 }}>AI TOKEN STATUS</div>
        {apiStatus.map((api, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: api.active ? api.color : 'rgba(224,224,255,0.35)', fontFamily: "'Rajdhani',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                {api.active && <span style={{ fontSize: 8, color: api.color }}>●</span>}
                {api.name}
                {api.active && <span style={{ fontSize: 9, background: api.color, color: '#000', borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>ACTIVE</span>}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(224,224,255,0.35)' }}>{api.used}/{api.limit}</span>
            </div>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${api.percentage}%`, background: api.exhausted ? '#636e72' : api.color, borderRadius: 2 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ background: 'rgba(255,214,10,0.05)', border: '1px solid rgba(255,214,10,0.2)', borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 11, color: '#ffd60a', fontFamily: "'Rajdhani',sans-serif", letterSpacing: 1, marginBottom: 10 }}>📊 TODAY'S STATS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', textAlign: 'center' }}>
          {[{ v: videosToday, l: 'Videos Made' }, { v: '~10 min', l: 'Per Video' }, { v: '15', l: 'Daily Target' }].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'Rajdhani',sans-serif", fontSize: 24, fontWeight: 700, color: '#ffd60a' }}>{s.v}</div>
              <div style={{ fontSize: 10, color: 'rgba(224,224,255,0.4)' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
