import React, { useState } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Home from './Home'
import VideoCreator from './VideoCreator'
import Settings from './Settings'

const NAV = [
  { path: '/', icon: '🏠', label: 'Home' },
  { path: '/create', icon: '🎬', label: 'Create' },
  { path: '/settings', icon: '⚙️', label: 'Settings' },
]

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{ background: '#080612', minHeight: '100vh', fontFamily: "'Exo 2', sans-serif", color: '#e0e0ff' }}>
      <header style={{ background: 'rgba(15,10,30,0.95)', borderBottom: '1px solid rgba(0,245,212,0.2)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>🎬</span>
          <span style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 20, background: 'linear-gradient(135deg,#00f5d4,#7209b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AnimaAI Studio</span>
        </div>
        <span style={{ background: 'linear-gradient(135deg,rgba(0,245,212,0.15),rgba(114,9,183,0.15))', border: '1px solid rgba(0,245,212,0.3)', borderRadius: 20, padding: '2px 10px', fontSize: 11, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, color: '#00f5d4' }}>AI POWERED</span>
      </header>

      <main style={{ paddingBottom: 70 }}>
        <Routes>
          <Route path="/" element={<Home navigate={navigate} />} />
          <Route path="/create" element={<VideoCreator />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(8,6,18,0.97)', borderTop: '1px solid rgba(0,245,212,0.15)', display: 'flex', zIndex: 50 }}>
        {NAV.map(item => {
          const active = location.pathname === item.path
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', gap: 2, background: active ? 'rgba(0,245,212,0.08)' : 'transparent', borderTop: active ? '2px solid #00f5d4' : '2px solid transparent', border: 'none', cursor: 'pointer', color: active ? '#00f5d4' : 'rgba(224,224,255,0.35)' }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 9, fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, letterSpacing: 1 }}>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
