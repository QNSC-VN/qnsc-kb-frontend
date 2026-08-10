import client from './client'

export async function search(params: {
  q: string
  dept?: string
  tag?: string
  status?: string
  date_from?: string
  date_to?: string
  limit?: number
}) {
  const response = await client.get('/search', { params })
  return response.data
}

// Meta queries placed here for search/browse synergy
export async function getTags() {
  const response = await client.get('/meta/tags')
  return response.data
}

export async function getGlossary() {
  const response = await client.get('/meta/glossary')
  return response.data
}
