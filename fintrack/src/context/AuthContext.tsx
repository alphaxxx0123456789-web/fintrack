import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User, AuthState } from '../types'
import { mockUser } from '../utils/data'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  resetPassword: (email: string) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
  })

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    setState(s => ({ ...s, loading: true }))
    await new Promise(r => setTimeout(r, 1000))
    // Simulation : n'importe quel email/mdp fonctionne
    const user: User = { ...mockUser, email }
    setState({ user, isAuthenticated: true, loading: false })
    return true
  }, [])

  const register = useCallback(async (name: string, email: string, _password: string): Promise<boolean> => {
    setState(s => ({ ...s, loading: true }))
    await new Promise(r => setTimeout(r, 1200))
    const user: User = { ...mockUser, name, email }
    setState({ user, isAuthenticated: true, loading: false })
    return true
  }, [])

  const logout = useCallback(() => {
    setState({ user: null, isAuthenticated: false, loading: false })
  }, [])

  const resetPassword = useCallback(async (_email: string): Promise<boolean> => {
    setState(s => ({ ...s, loading: true }))
    await new Promise(r => setTimeout(r, 800))
    setState(s => ({ ...s, loading: false }))
    return true
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
