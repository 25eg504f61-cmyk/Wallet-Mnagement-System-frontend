import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axiosInstance'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('wallet_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem('wallet_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('wallet_user')
    }
  }, [user])

  async function login(email, password) {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('wallet_token', data.token)
      const loggedInUser = { userId: data.userId, name: data.name, email: data.email, role: data.role }
      setUser(loggedInUser)
      return loggedInUser
    } finally {
      setLoading(false)
    }
  }
  async function register(name, email, password) {
    setLoading(true)
    try {
      const { data } = await api.post('/users', {   // yahan users
        name,
        email,
        password,
      })

      localStorage.setItem('wallet_token', data.token)

      const registeredUser = {
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role
      }

      setUser(registeredUser)
      return registeredUser
    } finally {
      setLoading(false)
    }
  }
  function logout() {
    localStorage.removeItem('wallet_token')
    localStorage.removeItem('wallet_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
