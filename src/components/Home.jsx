import React, { useEffect, useState } from 'react'
import { getApiStatus, getCurrentApiName } from '../ai/tokenRotator'

export default function Home({ navigate }) {
  const [apiStatus, setApiStatus] = useState([])
  const [currentApi, setCurrentApi] = useState('')

  useEffect(() => {
    setApiStatus(getApiStatus())
    setCurrentApi(getCurrentApiName())
    const interval = setInterval(() => {
      setApiStatus(getApiStatus())
      setCurrentApi(getCurrentApiName())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const QUICK_ACTIONS = [
    { icon: '📝', label: 'Script likhein', sub: 'AI se ya khud', path: '/script', color: 'var(--neon)' },
    { icon: '🎭', label: 'Character banao', sub: '2D Animation', path: '/character', color: 'var(--plasma)' },
    { icon: '🎬', label: 'Timeline', sub: 'Scenes arrange', path: '/timeline', color: 'var(--gold)' },
    { icon: '📤', label: 'Export karo', sub: 'MP4 download', path: '/export', color: '#a29bfe' },
  ]

  return (
    <div className="p-4 grid-bg min-h-full">
      {/* Hero */}
      <div className="text-center py-6">
        <div style={{ fontSize: 52, marginBottom: 8 }} className="animate-float inline-block">🎬</div>
        <h1 style={{
          fontFamily: "'Rajdhani', sans-serif",
          fontSize: 28,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #00f5d4, #f72585)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1.2
        }}>AnimaAI Studio</h1>
        <p style={{ color: 'rgba(224,224,255,0.5)', fontSize: 13, marginTop: 4 }}>
          Daily 10-15 YouTube Videos banao AI se
        </p>
      </div>

      {/* Active AI Badge */}
      <div className="glass neon-border rounded-xl p-3 mb-4 flex items-center gap-3">
        <div style={{
          width: 10, height: 10, borderRadius: '50%',
          background: 'var(--neon)',
          boxShadow: '0 0 8px var(--neon)',
          animation: 'pulse 2s infinite'
        }} />
        <div>
          <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', fontFamily: "'Rajdhani', sans-serif", letterSpacing: 1 }}>
            ACTIVE AI ENGINE
          </div>
          <div style={{ fontSize: 14, color: 'var(--neon)', fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}>
            {currentApi}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div style={{ fontSize: 10, color: 'rgba(224,224,255,0.4)' }}>Auto-switch ON</div>
          <div style={{ fontSize: 11, color: 'var(--gold)' }}>3 APIs Ready ✓</div>
        </div>
      </div>

      {/* API Status */}
      <div className="glass rounded-xl p-3 mb-4" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, color: 'rgba(224,224,255,0.6)', letterSpacing: 1, marginBottom: 10 }}>
          AI TOKEN STATUS
        </div>
        {apiStatus.map((api, i) => (
          <div key={i} className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                {api.active && <span style={{ fontSize: 8, color: api.color }}>●</span>}
                <span style={{ fontSize: 12, fontFamily: "'Rajdhani', sans-serif", color: api.active ? api.color : 'rgba(224,224,255,0.4)', fontWeight: api.active ? 700 : 400 }}>
                  {api.name}
                </span>
                {api.active && <span style={{ fontSize: 9, background: api.color, color: '#000', borderRadius: 4, padding: '1px 5px', fontWeight: 700 }}>ACTIVE</span>}
                {api.exhausted && <span style={{ fontSize: 9, color: 'rgba(224,224,255,0.3)' }}>EXHAUSTED</span>}
              </div>
              <span style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)' }}>{api.used}/{api.limit}</span>
            </div>
            <div style={{ height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${api.percentage}%`,
                background: api.exhausted ? '#636e72' : api.color,
                borderRadius: 2,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, color: 'rgba(224,224,255,0.6)', letterSpacing: 1, marginBottom: 10 }}>
        QUICK ACTIONS
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {QUICK_ACTIONS.map((action, i) => (
          <button key={i} onClick={() => navigate(action.path)}
            className="glass rounded-xl p-4 text-left transition-all active:scale-95"
            style={{ border: `1px solid ${action.color}30` }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{action.icon}</div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: action.color, fontSize: 14 }}>
              {action.label}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(224,224,255,0.4)', marginTop: 2 }}>{action.sub}</div>
          </button>
        ))}
      </div>

      {/* Daily Stats */}
      <div className="glass rounded-xl p-4" style={{ border: '1px solid rgba(255,214,10,0.2)' }}>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 13, color: 'var(--gold)', letterSpacing: 1, marginBottom: 8 }}>
          📊 TODAY'S STATS
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { val: localStorage.getItem('videos_today') || '0', label: 'Videos' },
            { val: '~10 min', label: 'Per Video' },
            { val: '15', label: 'Daily Target' }
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--gold)' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'rgba(224,224,255,0.4)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
