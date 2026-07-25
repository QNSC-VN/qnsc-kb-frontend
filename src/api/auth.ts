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
