import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { config } from '@/config/env'
import { useAuthStore } from '@/store/authStore'

class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: config.apiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = useAuthStore.getState().token
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          useAuthStore.getState().logout()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password })
    return response.data
  }

  async register(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    userType: string
  }) {
    // Transform data to match backend DTO
    const name = `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'User'
    const type = data.userType.toUpperCase() // Convert to enum format: STUDENT, COMPANY, SCHOOL
    
    const response = await this.client.post('/auth/register', {
      email: data.email,
      password: data.password,
      name,
      type,
    })
    return response.data
  }

  async logout() {
    const response = await this.client.post('/auth/logout')
    return response.data
  }

  async getCurrentUser() {
    const response = await this.client.get('/users/me')
    return response.data
  }

  // User endpoints
  async updateUser(id: string, data: any) {
    const response = await this.client.patch(`/users/${id}`, data)
    return response.data
  }

  // Student Profile endpoints
  async getStudentProfile(userId: string) {
    const response = await this.client.get(`/student-profiles/${userId}`)
    return response.data
  }

  async getMyStudentProfile() {
    const response = await this.client.get('/student-profiles/my')
    return response.data
  }

  async updateStudentProfile(data: any) {
    const response = await this.client.patch('/student-profiles/my', data)
    return response.data
  }

  // Company Profile endpoints
  async getCompanyProfile(userId: string) {
    const response = await this.client.get(`/company-profiles/${userId}`)
    return response.data
  }

  async getMyCompanyProfile() {
    const response = await this.client.get('/company-profiles/my')
    return response.data
  }

  async updateCompanyProfile(data: any) {
    const response = await this.client.patch('/company-profiles/my', data)
    return response.data
  }

  // Offers endpoints
  async getOffers(query?: Record<string, any>) {
    const response = await this.client.get('/offers', { params: query })
    return response.data
  }

  async getMyOffers() {
    const response = await this.client.get('/offers/my')
    return response.data
  }

  async getOffer(id: string) {
    const response = await this.client.get(`/offers/${id}`)
    return response.data
  }

  async createOffer(data: any) {
    const response = await this.client.post('/offers', data)
    return response.data
  }

  async updateOffer(id: string, data: any) {
    const response = await this.client.patch(`/offers/${id}`, data)
    return response.data
  }

  async deleteOffer(id: string) {
    const response = await this.client.delete(`/offers/${id}`)
    return response.data
  }

  // Applications endpoints
  async applyToOffer(offerId: string) {
    const response = await this.client.post(`/applications/apply/${offerId}`)
    return response.data
  }

  async getMyApplications() {
    const response = await this.client.get('/applications/my')
    return response.data
  }

  async getApplications(query?: Record<string, any>) {
    const response = await this.client.get('/applications', { params: query })
    return response.data
  }

  async updateApplication(id: string, data: { status: string }) {
    const response = await this.client.patch(`/applications/${id}`, data)
    return response.data
  }

  async bulkUpdateApplications(applicationIds: string[], status: string) {
    const response = await this.client.post('/applications/bulk/update-status', {
      applicationIds,
      status,
    })
    return response.data
  }

  // CV endpoints
  async uploadCV(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const response = await this.client.post('/cv/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  }

  async analyzeCV() {
    const response = await this.client.post('/cv/analyze')
    return response.data
  }

  async improvCV() {
    const response = await this.client.post('/cv/improve')
    return response.data
  }

  // Conversations endpoints
  async getConversations(query?: Record<string, any>) {
    const response = await this.client.get('/conversations', { params: query })
    return response.data
  }

  async getMyConversations() {
    const response = await this.client.get('/conversations/my')
    return response.data
  }

  async getConversation(id: string) {
    const response = await this.client.get(`/conversations/${id}`)
    return response.data
  }

  async createConversation(participantsIds: string[], title?: string) {
    const response = await this.client.post('/conversations', {
      participantsIds,
      title,
    })
    return response.data
  }

  // Messages endpoints
  async getMessages(conversationId: string, query?: Record<string, any>) {
    const response = await this.client.get(`/conversations/${conversationId}/messages`, {
      params: query,
    })
    return response.data
  }

  async createMessage(conversationId: string, content: string) {
    // Use the conversation endpoint to send messages
    const response = await this.client.post(`/conversations/${conversationId}/messages`, {
      content,
    })
    return response.data
  }

  async updateMessage(messageId: string, content: string) {
    const response = await this.client.patch(`/messages/${messageId}`, {
      content,
    })
    return response.data
  }

  async deleteMessage(messageId: string) {
    const response = await this.client.delete(`/messages/${messageId}`)
    return response.data
  }

  private getCurrentUserId(): string {
    return useAuthStore.getState().user?.id || ''
  }

  // Interview endpoints
  async sendInterviewMessage(message: string, context?: string) {
    const response = await this.client.post('/interview-simulation', {
      message,
      context,
    })
    return response.data
  }

  // CV Improvement endpoints
  async analyzeCvContent(cvContent: string, jobContext?: string) {
    const response = await this.client.post('/cv-improvement/analyze', {
      cvContent,
      jobContext,
    })
    return response.data
  }

  // Statistics endpoints
  async getDashboardStatistics() {
    const response = await this.client.get('/users/me/statistics')
    return response.data
  }

  // Profile Completion endpoints
  async getStudentProfileCompletion() {
    const response = await this.client.get('/student-profiles/completion')
    return response.data
  }

  async getCompanyProfileCompletion() {
    const response = await this.client.get('/company-profiles/completion')
    return response.data
  }

  // Experiences endpoints
  async getMyExperiences() {
    const response = await this.client.get('/experiences/my')
    return response.data
  }

  async getExperience(id: string) {
    const response = await this.client.get(`/experiences/${id}`)
    return response.data
  }

  async createExperience(data: any) {
    const response = await this.client.post('/experiences/my', data)
    return response.data
  }

  async updateExperience(id: string, data: any) {
    const response = await this.client.patch(`/experiences/my/${id}`, data)
    return response.data
  }

  async deleteExperience(id: string) {
    const response = await this.client.delete(`/experiences/my/${id}`)
    return response.data
  }

  async getAllOffersAnalytics() {
    const response = await this.client.get('/offers/analytics/all')
    return response.data
  }

  async getOfferAnalytics(offerId: string) {
    const response = await this.client.get(`/offers/${offerId}/analytics`)
    return response.data
  }
}

export const apiService = new ApiService()

