export interface User {
  id: string  // UUID from backend
  name: string  // Full name from backend
  email: string
  type: 'STUDENT' | 'COMPANY' | 'SCHOOL'  // Backend uses uppercase enum
}

export interface StudentProfile {
  id: string
  userId: string
  bio?: string
  skills?: string[]
  education?: string
  lookingFor?: string
  cv?: string
  profilePicture?: string
}

export interface CompanyProfile {
  id: string
  userId: string
  companyName: string
  description?: string
  industry?: string
  website?: string
  logo?: string
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
  workLocationType: 'ONSITE' | 'REMOTE' | 'HYBRID'
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
  workLocationType: 'ONSITE' | 'REMOTE' | 'HYBRID'
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
  student?: any  // StudentProfile
  company?: any  // CompanyProfile
  offer?: any  // Offer
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

