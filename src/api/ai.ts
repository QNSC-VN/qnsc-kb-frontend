import client from './client'

export async function askAI(question: string, conversation_id?: string) {
  const response = await client.post('/ai/ask', { question, conversation_id })
  return response.data
}

export async function getConversations() {
  const response = await client.get('/ai/conversations')
  return response.data
}

export async function createConversation(title?: string) {
  const response = await client.post('/ai/conversations', title ? { title } : {})
  return response.data
}

export async function getConversationMessages(id: string) {
  const response = await client.get(`/ai/conversations/${id}/messages`)
  return response.data
}

export async function deleteConversation(id: string) {
  await client.delete(`/ai/conversations/${id}`)
}

export async function submitAIFeedback(data: { ai_usage_log_id: string; rating: number; comment?: string }) {
  const response = await client.post('/ai/feedback', data)
  return response.data
}
