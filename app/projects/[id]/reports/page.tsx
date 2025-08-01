"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BarChart3, TrendingUp, Users, Clock } from "lucide-react"
import { projectsAPI, issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"

import AppLayout from "@/components/layout/AppLayout"

export default function ProjectReports() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  
  const [project, setProject] = useState<any>(null)
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    progress: 0
  })

  useEffect(() => {
    fetchData()
  }, [projectId])

  const fetchData = async () => {
    try {
      const [projectResponse, issuesResponse] = await Promise.all([
        projectsAPI.getById(projectId),
        issuesAPI.getAll({ project_id: projectId })
      ])
      
      setProject(projectResponse.project)
      const issuesList = issuesResponse.issues || []
      setIssues(issuesList)
      
      const total = issuesList.length
      const completed = issuesList.filter((i: any) => i.status === "Done").length
      const inProgress = issuesList.filter((i: any) => i.status === "In Progress").length
      const todo = issuesList.filter((i: any) => i.status === "To Do").length
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0
      
      setStats({ total, completed, inProgress, todo, progress })
    } catch (error) {
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={() => router.push("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project?.name} - Reports</h1>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To Do</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.todo}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{stats.progress}%</span>
                </div>
                <Progress value={stats.progress} className="h-3" />
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{stats.completed} issues</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">In Progress</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">{stats.inProgress} issues</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">To Do</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm">{stats.todo} issues</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Project Key</span>
                <p className="font-medium">{project?.key}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Project Lead</span>
                <p className="font-medium">{project?.lead?.username}</p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Created</span>
                <p className="font-medium">
                  {new Date(project?.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <span className="text-sm text-muted-foreground">Last Updated</span>
                <p className="font-medium">
                  {new Date(project?.updated_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}