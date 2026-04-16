import api from './api'

type LoginPayload = { email: string; password: string }
type RegisterPayload = { email: string; password: string; firstName: string; lastName: string; phone: string; address: string }
type UpdateProfilePayload = { firstName: string; lastName: string; phone: string; address: string }
type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  role: string
  emailVerified: boolean
  profileComplete?: boolean
}

const AUTH_CHANGED_EVENT = 'auth-changed'

const notifyAuthChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
  }
}

const safeSet = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value)
  }
}

const safeGet = (key: string) => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(key)
}

const safeRemove = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key)
  }
}

const storeAuthUser = (user: AuthUser) => {
  safeSet('user', JSON.stringify(user))
  notifyAuthChanged()
}

const isNonEmptyString = (value: unknown) => typeof value === 'string' && value.trim().length > 0

export const authService = {
  AUTH_CHANGED_EVENT,

  async login(data: LoginPayload) {
    const response = await api.post('/auth/login', data)
    if (response.data.token) {
      safeSet('token', response.data.token)
      storeAuthUser(response.data.user)
    }
    return response.data
  },

  async register(data: RegisterPayload) {
    const response = await api.post('/auth/register', data)
    if (response.data.token) {
      safeSet('token', response.data.token)
      storeAuthUser(response.data.user)
    }
    return response.data
  },

  async updateProfile(data: UpdateProfilePayload) {
    const response = await api.patch('/auth/me', data)
    if (response.data.user) {
      storeAuthUser(response.data.user)
    }
    return response.data
  },

  async verifyEmail(token: string) {
    const response = await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`)
    return response.data
  },

  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async resendVerification(email: string) {
    const response = await api.post('/auth/resend-verification', { email })
    return response.data
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response.data
  },

  logout() {
    safeRemove('token')
    safeRemove('user')
    notifyAuthChanged()
  },

  getCurrentUser() {
    const user = safeGet('user')
    return user ? JSON.parse(user) : null
  },

  isProfileComplete(user?: Partial<AuthUser> | null) {
    const currentUser = user ?? authService.getCurrentUser()
    if (!currentUser) return false
    return [currentUser.firstName, currentUser.lastName, currentUser.phone, currentUser.address].every(isNonEmptyString)
  },

  isAuthenticated() {
    return !!safeGet('token')
  }
}