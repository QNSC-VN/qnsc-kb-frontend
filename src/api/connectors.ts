import client from './client'

export async function listConnectors() { return (await client.get('/connectors')).data }
export async function createConnector(data: { name: string; system: string; path?: string; config?: Record<string, unknown> }) { return (await client.post('/connectors', data)).data }
export async function syncConnector(id: string) { return (await client.post(`/connectors/${id}/sync`)).data }
export async function updateConnector(id: string, data: { sync_mode: string }) { return (await client.patch(`/connectors/${id}`, data)).data }
export async function startConnectorOAuth(id: string) { return (await client.get(`/connectors/${id}/oauth/start`)).data }
export async function listConnectorScopes(id: string) { return (await client.get(`/connectors/${id}/scopes`)).data }
export async function selectConnectorScopes(id: string, scope_ids: string[]) { return (await client.put(`/connectors/${id}/scopes`, { scope_ids })).data }
export async function subscribeConnectorWebhooks(id: string) { return (await client.post(`/connectors/${id}/webhooks/subscribe`)).data }
