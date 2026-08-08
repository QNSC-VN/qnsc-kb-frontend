import client from './client'
import type { BrowseResponse } from '../types/search'
import type { HomeSummary } from '../types/governance'
import type { SourceRecord } from '../types/knowledge'

export async function getHomeSummary(): Promise<HomeSummary> { return (await client.get('/knowledge/home')).data }
export async function browseKnowledge(params: { dept?: string } = {}): Promise<BrowseResponse> { return (await client.get('/knowledge/browse', { params })).data }
export async function getSources(): Promise<SourceRecord[]> { return (await client.get('/knowledge/sources')).data }
export async function requestContent(query: string, dept?: string) { return (await client.post('/knowledge/content-requests', { query, dept })).data }
export async function createRolePreview(role: string, dept?: string) { return (await client.post('/knowledge/role-preview', { role, dept })).data }
