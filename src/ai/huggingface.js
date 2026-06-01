export async function generateWithHuggingFace(prompt, apiKey) {
  const res = await fetch(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        inputs: `[INST] ${prompt} [/INST]`,
        parameters: { max_new_tokens: 1024, temperature: 0.9, return_full_text: false }
      })
    }
  )
  const data = await res.json()
  return Array.isArray(data) ? data[0]?.generated_text || '' : ''
}
