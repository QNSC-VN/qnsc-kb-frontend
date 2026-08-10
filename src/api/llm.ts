import client from './client'

export type LLMProvider = 'openai' | 'glm' | 'groq'

export type LLMConfig = {
  configured: boolean
  source: 'admin' | 'none'
  enabled: boolean
  provider: LLMProvider
  model: string
  base_url: string
  allow_custom_base_url: boolean
  api_key_configured: boolean
  api_key_hint?: string | null
}

export async function getLLMConfig() {
  return (await client.get<LLMConfig>('/admin/llm/config')).data
}

export async function updateLLMConfig(data: {
  enabled: boolean
  provider: LLMProvider
  model: string
  base_url: string
  api_key?: string
}) {
  return (await client.put<LLMConfig>('/admin/llm/config', data)).data
}
