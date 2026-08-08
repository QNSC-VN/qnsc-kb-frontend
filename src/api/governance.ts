import client from './client'

export async function uploadSource(file: File, tags: string[] = [], dept?: string, departmentIds: string[] = []) {
  const form = new FormData()
  form.append('file', file)
  form.append('tags', JSON.stringify(tags))
  if (dept) form.append('dept', dept)
  if (departmentIds.length) form.append('department_ids', JSON.stringify(departmentIds))
  const response = await client.post('/articles/upload-source', form)
  return response.data
}

export async function uploadSources(files: File[], tagsByFile: string[][] = [], dept?: string, departmentIds: string[] = []) {
  const form = new FormData()
  files.forEach((file) => form.append('files', file))
  tagsByFile.forEach((tags) => form.append('tags', JSON.stringify(tags)))
  if (dept) form.append('dept', dept)
  if (departmentIds.length) form.append('department_ids', JSON.stringify(departmentIds))
  const response = await client.post('/articles/upload-sources', form)
  return response.data
}

export async function getPendingDrafts(status?: string) {
  const response = await client.get('/governance/pending-drafts', { params: { status } })
  return response.data
}

export async function approveDraft(id: string, dept: string, updateArticleId?: string, treatAsNew = false) {
  const response = await client.post(`/governance/pending-drafts/${id}/approve`, { dept, update_article_id: updateArticleId || null, treat_as_new: treatAsNew })
  return response.data
}

export async function assignDraftApprover(id: string, approverId: string) {
  const response = await client.post(`/governance/pending-drafts/${id}/assign-approver`, { approver_id: approverId })
  return response.data
}

export async function getEligibleApprovers(id: string) {
  const response = await client.get(`/governance/pending-drafts/${id}/eligible-approvers`)
  return response.data
}

export async function rejectDraft(id: string, reviewNote: string) {
  const response = await client.post(`/governance/pending-drafts/${id}/reject`, { review_note: reviewNote })
  return response.data
}

export async function restructureDraft(id: string) {
  const response = await client.post(`/governance/pending-drafts/${id}/restructure`)
  return response.data
}

export async function getDraftComparison(draftId: string, articleId: string) {
  const response = await client.get(`/governance/pending-drafts/${draftId}/comparison`, { params: { article_id: articleId } })
  return response.data
}

export async function getFeatureFlags() {
  const response = await client.get('/governance/feature-flags')
  return response.data
}

export async function updateFeatureFlag(key: string, enabled: boolean) {
  const response = await client.put(`/governance/feature-flags/${encodeURIComponent(key)}`, {
    enabled,
    rollout_percent: 100,
    role: null,
    department: null,
  })
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

export async function verifyReviewDeadlines() {
  const response = await client.post('/governance/reviews/verify')
  return response.data
}
