"use client"

import React, { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { authAPI } from "@/lib/api"
import { toast } from "react-hot-toast"

interface User {
  id: number
  username: string
  email: string
  role: string
  permissions?: string[]
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")

    if (storedToken && storedUser) {
      setToken(storedToken)
      const userData = JSON.parse(storedUser)
      console.log('Loaded user from storage:', userData)
      setUser(userData)
    }

    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password)
      const { user: userData, token: userToken } = response

      console.log('Login response user data:', userData)
      setUser(userData)
      setToken(userToken)

      localStorage.setItem("token", userToken)
      localStorage.setItem("user", JSON.stringify(userData))

      toast.success("Login successful!")
    } catch (error: any) {
      const message = error.response?.data?.error || "Login failed"
      toast.error(message)
      throw error
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authAPI.register(username, email, password)
      const { user: userData, token: userToken } = response

      setUser(userData)
      setToken(userToken)

      localStorage.setItem("token", userToken)
      localStorage.setItem("user", JSON.stringify(userData))

      toast.success("Registration successful!")
    } catch (error: any) {
      const message = error.response?.data?.error || "Registration failed"
      toast.error(message)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    toast.success("Logged out successfully")
  }

  const hasPermission = (permission: string): boolean => {
    // Allow access if no permission is required
    if (!permission) return true
    
    // Deny access if user is not logged in
    if (!user) return false
    
    // If no permissions array, deny access to protected resources
    if (!user?.permissions || !Array.isArray(user.permissions)) {
      console.warn('User has no permissions array:', user)
      return false
    }
    
    // Check if user has the specific permission
    const hasAccess = user.permissions.includes(permission)
    
    if (!hasAccess) {
      console.log(`Permission denied: User ${user.username} lacks permission '${permission}'. User permissions:`, user.permissions)
    }
    
    return hasAccess
  }

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    hasPermission
  }

  return React.createElement(AuthContext.Provider, { value: contextValue }, children)
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}