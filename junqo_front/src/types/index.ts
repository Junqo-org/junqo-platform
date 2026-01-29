export interface User {
  id: string  // UUID from backend
  name: string  // Full name from backend
  email: string
  type: 'STUDENT' | 'COMPANY' | 'SCHOOL'  // Backend uses uppercase enum
}

export interface Experience {
  id: string
  title: string
  company: string
  startDate: string
  endDate?: string
  description?: string
  skills?: string[]
  studentProfileId: string
}

export interface StudentProfile {
  userId: string
  name: string
  avatar?: string
  bio?: string
  phoneNumber?: string
  linkedinUrl?: string
  educationLevel?: string
  skills?: string[]
  experiences?: Experience[]
}

export interface CompanyProfile {
  userId: string
  name: string
  avatar?: string
  description?: string
  phoneNumber?: string
  address?: string
  websiteUrl?: string
  logoUrl?: string
  industry?: string
}

export interface Offer {
  id: string  // UUID
  userId: string  // UUID
  title: string
  description: string
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED'
  viewCount: number
  offerType: 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'
  duration?: number
  salary?: number
  workLocationType: 'ON_SITE' | 'TELEWORKING' | 'HYBRID'
  skills?: string[]
  benefits?: string[]
  educationLevel?: number
  createdAt: string | Date
  updatedAt: string | Date
  deletedAt?: string | Date
}

export interface CreateOfferInput {
  title: string
  description: string
  status: 'ACTIVE' | 'INACTIVE' | 'CLOSED'
  offerType: 'INTERNSHIP' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT'
  duration?: number
  salary?: number
  workLocationType: 'ON_SITE' | 'TELEWORKING' | 'HYBRID'
  skills?: string[]
  benefits?: string[]
  educationLevel?: number
}

export interface Application {
  id: string  // UUID
  studentId: string  // UUID
  companyId: string  // UUID
  offerId: string  // UUID
  status: 'NOT_OPENED' | 'PENDING' | 'ACCEPTED' | 'DENIED'  // Updated to match backend
  createdAt: string | Date
  updatedAt: string | Date
  deletedAt?: string | Date
  student?: StudentProfile  // StudentProfile
  company?: CompanyProfile  // CompanyProfile
  offer?: Offer  // Offer
}

export interface Message {
  id: string  // UUID
  conversationId: string  // UUID
  senderId: string  // UUID
  content: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

export interface Conversation {
  id: string  // UUID
  participantsIds: string[]  // Array of user UUIDs
  lastMessage?: Message
  title?: string
  createdAt: string | Date
  updatedAt: string | Date
}

export interface CVAnalysis {
  strengths: string[]
  improvements: string[]
  score: number
  suggestions: string[]
}

export interface InterviewQuestion {
  id: number
  question: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

// Statistics
export interface DashboardStatistics {
  totalActive: number
  totalViews: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  inProgressApplications: number
  totalConversations: number
  unreadMessages: number
  responseRate: number
  profileCompletion: number
}

// Profile Completion
export interface ProfileFieldStatus {
  fieldName: string
  label: string
  completed: boolean
  weight: number
  hint?: string
}

export interface ProfileCompletion {
  completionPercentage: number
  fields: ProfileFieldStatus[]
  completedFields: number
  totalFields: number
}

