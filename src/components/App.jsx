import React, { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './Home'
import ScriptEditor from './ScriptEditor'
import CharacterStudio from './CharacterStudio'
import VideoTimeline from './VideoTimeline'
import ExportPanel from './ExportPanel'
import Settings from './Settings'

const NAV_ITEMS = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/script', icon: '📝', label: 'Script' },
  { path: '/character', icon: '🎭', label: 'Character' },
  { path: '/timeline', icon: '🎬', label: 'Timeline' },
  { path: '/export', icon: '📤', label: 'Export' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
]

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [projectData, setProjectData] = useState({
    title: '',
    script: '',
    scenes: [],
    character: { style: 'anime', color: '#ff6b9d', expression: 'happy' },
    theme: 'classroom',
    voiceText: '',
  })

  return (
    <div className="flex flex-col min-h-screen" style={{ background: 'var(--void)', fontFamily: "'Exo 2', sans-serif" }}>
      {/* Header */}
      <header className="glass sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(0,245,212,0.2)' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 22 }}>🎬</span>
          <span style={{
            fontFamily: "'Rajdhani', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            background: 'linear-gradient(135deg, #00f5d4, #7209b7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>AnimaAI Studio</span>
        </div>
        <div className="ai-badge text-neon">AI POWERED</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={<Home projectData={projectData} setProjectData={setProjectData} navigate={navigate} />} />
          <Route path="/script" element={<ScriptEditor projectData={projectData} setProjectData={setProjectData} />} />
          <Route path="/character" element={<CharacterStudio projectData={projectData} setProjectData={setProjectData} />} />
          <Route path="/timeline" element={<VideoTimeline projectData={projectData} setProjectData={setProjectData} />} />
          <Route path="/export" element={<ExportPanel projectData={projectData} />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      <nav className="glass fixed bottom-0 left-0 right-0 z-50"
        style={{ borderTop: '1px solid rgba(0,245,212,0.2)' }}>
        <div className="flex">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path
            return (
              <button key={item.path}
                onClick={() => navigate(item.path)}
                className="flex-1 flex flex-col items-center py-2 gap-0.5 transition-all"
                style={{
                  color: active ? 'var(--neon)' : 'rgba(224,224,255,0.4)',
                  background: active ? 'rgba(0,245,212,0.08)' : 'transparent',
                  borderTop: active ? '2px solid var(--neon)' : '2px solid transparent',
                }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: 1 }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
