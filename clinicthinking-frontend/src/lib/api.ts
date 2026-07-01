const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

type ApiResponse<T> = {
  success: boolean
  data: T
  meta?: { total: number; page: number; limit: number }
  error?: { code: string; message: string }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json = await res.json()
  return json as ApiResponse<T>
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
  
  sendEvent: async (sessionId: string, eventData: any) => {
    return request<any>('POST', `/api/sessions/${sessionId}/events`, eventData);
  },

  getLiveKitToken: async (sessionId: string, username: string) => {
      // Pastikan endpoint ini benar dan backend memang mengharapkan POST ke /api/token
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, username }),
      });
      
      if (!response.ok) throw new Error(`Gagal ambil token: ${response.statusText}`);
      return response.json(); 
  }
};
