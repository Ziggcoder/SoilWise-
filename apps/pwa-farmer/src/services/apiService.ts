import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import type { ApiResponse, PaginatedResponse } from '@/types'

class ApiService {
  private api: AxiosInstance
  private baseURL: string

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081'
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add device info
        config.headers['X-Device-Type'] = 'pwa'
        config.headers['X-App-Version'] = '1.0.0'

        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response
      },
      async (error: AxiosError) => {
        // Handle offline scenarios
        if (!navigator.onLine) {
          throw new Error('No internet connection. Data will sync when online.')
        }

        // Handle auth errors
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken')
          // Redirect to login if needed
        }

        // Handle server errors
        if (error.response && error.response.status >= 500) {
          throw new Error('Server error. Please try again later.')
        }

        // Handle client errors
        if (error.response && error.response.status >= 400) {
          const message = (error.response.data as any)?.message || 'Request failed'
          throw new Error(message)
        }

        throw error
      }
    )
  }

  // Generic methods
  async get<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.get<T>(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.post<T>(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.put<T>(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.patch<T>(url, data, config)
  }

  async delete<T = any>(url: string, config?: any): Promise<AxiosResponse<T>> {
    return this.api.delete<T>(url, config)
  }

  // Specific API methods
  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void): Promise<AxiosResponse> {
    const formData = new FormData()
    formData.append('file', file)

    return this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  }

  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.api.get(url, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename || 'download'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.api.get('/health')
      return true
    } catch {
      return false
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await this.api.post('/auth/login', { email, password })
    const { token, user } = response.data
    
    if (token) {
      localStorage.setItem('authToken', token)
    }
    
    return { token, user }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout')
    } finally {
      localStorage.removeItem('authToken')
    }
  }

  async refreshToken(): Promise<string> {
    const response = await this.api.post('/auth/refresh')
    const { token } = response.data
    
    if (token) {
      localStorage.setItem('authToken', token)
    }
    
    return token
  }

  // Sync methods
  async getChanges(since: string): Promise<any> {
    const response = await this.api.get('/sync/changes', {
      params: { since }
    })
    return response.data
  }

  async pushChanges(changes: any): Promise<any> {
    const response = await this.api.post('/sync/push', changes)
    return response.data
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token)
    this.api.defaults.headers.Authorization = `Bearer ${token}`
  }

  clearAuthToken(): void {
    localStorage.removeItem('authToken')
    delete this.api.defaults.headers.Authorization
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken')
  }

  getBaseURL(): string {
    return this.baseURL
  }
}

export const apiService = new ApiService()
