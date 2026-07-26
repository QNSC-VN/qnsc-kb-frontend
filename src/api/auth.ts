import client from './client'

export async function login(form: FormData) {
  const response = await client.post('/auth/login', form, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  return response.data
}

export async function register(data: any) {
  const response = await client.post('/auth/register', data)
  return response.data
}

export async function getMe() {
  const response = await client.get('/auth/me')
  return response.data
}

export async function listUsers() {
  const response = await client.get('/auth/users')
  return response.data
}

export async function updateUser(userId: string, data: { name?: string; dept?: string; role?: string; password?: string }) {
  const response = await client.patch(`/auth/users/${userId}`, data)
  return response.data
}

export async function createManagedUser(data: { email: string; name: string; password?: string; dept?: string; role: string }) {
  const response = await client.post('/auth/users', data)
  return response.data
}

export async function deactivateUser(userId: string) {
  const response = await client.delete(`/auth/users/${userId}`)
  return response.data
}

export async function assignCompanyCeo(companyDomain: string, userId: string) {
  const response = await client.post(`/auth/companies/${encodeURIComponent(companyDomain)}/ceo`, null, { params: { user_id: userId } })
  return response.data
}
