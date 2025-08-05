"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { BarChart3, Users, FolderOpen, CheckCircle, Clock, TrendingUp, Plus, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { projectsAPI, adminAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function Dashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !user.id) {
      router.push("/login")
      return
    }
    fetchDashboardData()
  }, [user, router])

  const fetchDashboardData = async () => {
    try {
      const [projectsResponse, statsResponse] = await Promise.all([
        projectsAPI.getAll(),
        adminAPI.getStats()
      ])
      
      setProjects(projectsResponse?.data || [])
      setStats(statsResponse?.data || {})
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      setProjects([])
      setStats({})
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Good morning, {user?.username || 'User'}!
              </h1>
              <p className="text-muted-foreground mt-1">Here's what's happening with your projects today.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/projects")}>
                <FolderOpen className="h-4 w-4 mr-2" />
                View All
              </Button>
              <Button onClick={() => router.push("/projects/new")} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Projects</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FolderOpen className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.totalProjects || 0}</div>
                <p className="text-xs text-muted-foreground">Active projects</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Issues</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.totalIssues || 0}</div>
                <p className="text-xs text-muted-foreground">{stats.completedIssues || 0} completed</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Active Issues</CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.activeIssues || 0}</div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Completion Rate</CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.completionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">Overall progress</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200" onClick={() => router.push("/projects")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500 rounded-lg mr-3">
                      <FolderOpen className="h-5 w-5 text-white" />
                    </div>
                    Projects
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Manage your projects and teams</p>
                <div className="mt-2 text-xs text-blue-600 font-medium">{projects.length} active projects</div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200" onClick={() => router.push("/search/advanced")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500 rounded-lg mr-3">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    Search
                  </div>
                  <ArrowRight className="h-4 w-4 text-green-500 group-hover:translate-x-1 transition-transform" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">Find issues and projects quickly</p>
                <div className="mt-2 text-xs text-green-600 font-medium">Advanced search available</div>
              </CardContent>
            </Card>

            <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200" onClick={() => router.push("/reports/enhanced")}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-500 rounded-lg mr-3">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Reports
                  </div>
                  <ArrowRight className="h-4 w-4 text-purple-500 group-hover:translate-x-1 transition-transform" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">View analytics and insights</p>
                <div className="mt-2 text-xs text-purple-600 font-medium">Real-time analytics</div>
              </CardContent>
            </Card>
          </div>
      </div>
    </AppLayout>
  )
}