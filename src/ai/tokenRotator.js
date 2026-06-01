// ============================================
// SMART TOKEN ROTATOR - 3 AI API Fallback
// ============================================

const API_CONFIG = {
  gemini: {
    name: 'Google Gemini',
    key: import.meta.env.VITE_GEMINI_API_KEY || '',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    dailyLimit: 1500,
    used: 0,
    exhausted: false,
    color: '#4285f4'
  },
  groq: {
    name: 'Groq LLaMA',
    key: import.meta.env.VITE_GROQ_API_KEY || '',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    dailyLimit: 14400,
    used: 0,
    exhausted: false,
    color: '#f72585'
  },
  huggingface: {
    name: 'HuggingFace',
    key: import.meta.env.VITE_HF_API_KEY || '',
    endpoint: 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    dailyLimit: 500,
    used: 0,
    exhausted: false,
    color: '#ffd60a'
  }
}

let currentApiIndex = 0
const API_ORDER = ['gemini', 'groq', 'huggingface']

// LocalStorage se usage load karo
function loadUsageFromStorage() {
  const today = new Date().toDateString()
  const stored = localStorage.getItem('ai_usage')
  if (stored) {
    const data = JSON.parse(stored)
    if (data.date === today) {
      API_ORDER.forEach(key => {
        if (data[key]) {
          API_CONFIG[key].used = data[key].used || 0
          API_CONFIG[key].exhausted = data[key].exhausted || false
        }
      })
    } else {
      // Naya din - reset
      resetAllUsage()
    }
  }
}

function saveUsageToStorage() {
  const today = new Date().toDateString()
  const data = { date: today }
  API_ORDER.forEach(key => {
    data[key] = {
      used: API_CONFIG[key].used,
      exhausted: API_CONFIG[key].exhausted
    }
  })
  localStorage.setItem('ai_usage', JSON.stringify(data))
}

function resetAllUsage() {
  API_ORDER.forEach(key => {
    API_CONFIG[key].used = 0
    API_CONFIG[key].exhausted = false
  })
  currentApiIndex = 0
  saveUsageToStorage()
}

// Current active API ka naam return karo
export function getCurrentApiName() {
  loadUsageFromStorage()
  const key = API_ORDER[currentApiIndex]
  return API_CONFIG[key]?.name || 'No API Available'
}

// API Status return karo
export function getApiStatus() {
  loadUsageFromStorage()
  return API_ORDER.map((key, idx) => ({
    name: API_CONFIG[key].name,
    used: API_CONFIG[key].used,
    limit: API_CONFIG[key].dailyLimit,
    exhausted: API_CONFIG[key].exhausted,
    active: idx === currentApiIndex && !API_CONFIG[key].exhausted,
    color: API_CONFIG[key].color,
    percentage: Math.min((API_CONFIG[key].used / API_CONFIG[key].dailyLimit) * 100, 100)
  }))
}

// Gemini API Call
async function callGemini(prompt) {
  const config = API_CONFIG.gemini
  if (!config.key) throw new Error('GEMINI_KEY_MISSING')

  const response = await fetch(`${config.endpoint}?key=${config.key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      }
    })
  })

  if (response.status === 429 || response.status === 403) {
    throw new Error('RATE_LIMIT')
  }

  const data = await response.json()
  if (data.error) throw new Error('RATE_LIMIT')
  
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

// Groq API Call
async function callGroq(prompt) {
  const config = API_CONFIG.groq
  if (!config.key) throw new Error('GROQ_KEY_MISSING')

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.key}`
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'system', content: 'You are AnimaAI, a helpful assistant for creating YouTube animation scripts.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2048,
      temperature: 0.8
    })
  })

  if (response.status === 429 || response.status === 401) {
    throw new Error('RATE_LIMIT')
  }

  const data = await response.json()
  if (data.error) throw new Error('RATE_LIMIT')

  return data.choices?.[0]?.message?.content || ''
}

// HuggingFace API Call
async function callHuggingFace(prompt) {
  const config = API_CONFIG.huggingface
  if (!config.key) throw new Error('HF_KEY_MISSING')

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.key}`
    },
    body: JSON.stringify({
      inputs: `[INST] ${prompt} [/INST]`,
      parameters: {
        max_new_tokens: 1024,
        temperature: 0.8,
        return_full_text: false
      }
    })
  })

  if (response.status === 429 || response.status === 503) {
    throw new Error('RATE_LIMIT')
  }

  const data = await response.json()
  if (data.error) throw new Error('RATE_LIMIT')

  return Array.isArray(data) ? data[0]?.generated_text || '' : data?.generated_text || ''
}

// ⭐ MAIN SMART CALL FUNCTION
export async function smartAICall(prompt, onSwitch = null) {
  loadUsageFromStorage()

  const callers = [callGemini, callGroq, callHuggingFace]

  // current se start karke loop
  for (let i = 0; i < API_ORDER.length; i++) {
    const idx = (currentApiIndex + i) % API_ORDER.length
    const key = API_ORDER[idx]
    const config = API_CONFIG[key]

    if (config.exhausted) continue
    if (!config.key) continue

    try {
      if (onSwitch && idx !== currentApiIndex) {
        onSwitch(config.name)
      }
      currentApiIndex = idx

      const result = await callers[idx](prompt)
      
      config.used++
      if (config.used >= config.dailyLimit) {
        config.exhausted = true
      }
      saveUsageToStorage()
      
      return {
        text: result,
        usedApi: config.name,
        apiColor: config.color
      }
    } catch (err) {
      if (err.message === 'RATE_LIMIT') {
        config.exhausted = true
        saveUsageToStorage()
        continue
      }
      throw err
    }
  }

  throw new Error('ALL_APIS_EXHAUSTED')
}

export { API_CONFIG, API_ORDER, loadUsageFromStorage }
