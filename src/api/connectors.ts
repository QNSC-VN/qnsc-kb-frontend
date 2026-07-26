import client from './client'

export async function listConnectors() { return (await client.get('/connectors')).data }
export async function createConnector(data: { name: string; system: string; path: string }) { return (await client.post('/connectors', data)).data }
export async function syncConnector(id: string) { return (await client.post(`/connectors/${id}/sync`)).data }
