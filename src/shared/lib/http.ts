import type { ApiResponse } from '@/shared/types/api.types'

export class ApiError extends Error {
  code: string | null

  constructor(message: string, code: string | null = null) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

class HttpClient {
  private isFormData(value: unknown): value is FormData {
    return typeof FormData !== 'undefined' && value instanceof FormData
  }

  private extractErrorCode(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') {
      return null
    }

    const record = payload as Record<string, unknown>
    const candidate = record.code

    return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers = new Headers(options.headers)

    if (!this.isFormData(options.body) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(endpoint, {
      headers,
      credentials: 'include',
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new ApiError(data.message || 'Request failed', this.extractErrorCode(data))
    }

    return data
  }

  get<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, body: unknown, options?: RequestInit) {
    const isFormData = this.isFormData(body)

    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body),
    })
  }

  put<T>(endpoint: string, body: unknown, options?: RequestInit) {
    const isFormData = this.isFormData(body)

    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body),
    })
  }

  delete<T>(endpoint: string, options?: RequestInit) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const http = new HttpClient()
