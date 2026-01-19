'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '@/services/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'agent' | 'student'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token')
      setToken(storedToken)
      if (storedToken) {
        authService.setToken(storedToken)
        fetchProfile()
      } else {
        setLoading(false)
      }
    }
  }, [])

  const fetchProfile = async () => {
    try {
      const profile = await authService.getProfile()
      setUser(profile)
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
      }
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password)
    setToken(response.access_token)
    setUser(response.user)
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', response.access_token)
    }
    authService.setToken(response.access_token)
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
    }
    authService.setToken(null)
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
