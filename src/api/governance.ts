import client from './client'

export async function getPendingDrafts(status?: string) {
  const response = await client.get('/governance/pending-drafts', { params: { status } })
  return response.data
}

export async function approveDraft(id: string, type: string, dept: string) {
  const response = await client.post(`/governance/pending-drafts/${id}/approve`, { type, dept })
  return response.data
}

export async function rejectDraft(id: string) {
  const response = await client.post(`/governance/pending-drafts/${id}/reject`)
  return response.data
}

export async function getSearchGaps(status?: string) {
  const response = await client.get('/governance/gaps', { params: { status } })
  return response.data
}

export async function assignSearchGap(id: string, dept: string) {
  const response = await client.post(`/governance/gaps/${id}/assign`, { dept })
  return response.data
}

export async function dismissSearchGap(id: string) {
  const response = await client.post(`/governance/gaps/${id}/dismiss`)
  return response.data
}

export async function getAuditLogs() {
  const response = await client.get('/governance/audit-log')
  return response.data
}

export async function getHealthMetrics() {
  const response = await client.get('/governance/health-metrics')
  return response.data
}

export async function getEvalRuns() {
  const response = await client.get('/governance/eval-runs')
  return response.data
}
