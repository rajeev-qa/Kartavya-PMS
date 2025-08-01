"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, TrendingUp, Target } from "lucide-react"
import { projectsAPI, issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function ProjectStatus() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  
  const [project, setProject] = useState<any>(null)
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const [projectResponse, issuesResponse] = await Promise.all([
        projectsAPI.getById(projectId),
        issuesAPI.getAll({ project_id: projectId })
      ])
      
      setProject(projectResponse.project)
      setIssues(issuesResponse.issues || [])
    } catch (error) {
      toast.error("Failed to fetch project data")
    } finally {
      setLoading(false)
    }
  }

  const getIssueStats = () => {
    const total = issues.length
    const completed = issues.filter(issue => issue.status === "Done").length
    const inProgress = issues.filter(issue => issue.status === "In Progress").length
    const todo = issues.filter(issue => issue.status === "To Do").length
    
    return { total, completed, inProgress, todo }
  }

  const getTypeBreakdown = () => {
    const types = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1
      return acc
    }, {})
    return types
  }

  const renderBarChart = (data: any[], title: string, color: string) => (
    <div className="space-y-3">
      <h4 className="font-medium">{title}</h4>
      <div className="space-y-2">
        {Object.entries(data).map(([key, value]: [string, any]) => (
          <div key={key} className="flex items-center space-x-3">
            <span className="text-sm w-20 capitalize">{key}:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full ${color}`}
                style={{ width: `${(value / Math.max(...Object.values(data))) * 100}%` }}
              />
            </div>
            <span className="text-sm w-8 font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderBurndownChart = () => {
    const data = Array.from({length: 10}, (_, i) => ({
      day: i + 1,
      remaining: Math.max(0, 100 - (i * 12) + Math.random() * 10),
      ideal: 100 - (i * 10)
    }))

    return (
      <div className="space-y-3">
        <h4 className="font-medium">Sprint Burndown</h4>
        <div className="h-40 bg-gray-50 rounded-lg flex items-end justify-between p-4">
          {data.map((point, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div className="flex flex-col items-center">
                <div 
                  className="bg-blue-500 rounded-t w-2"
                  style={{ height: `${(point.remaining / 100) * 120}px` }}
                />
                <div 
                  className="bg-gray-400 rounded-t w-1 -mt-1"
                  style={{ height: `${(point.ideal / 100) * 120}px` }}
                />
              </div>
              <span className="text-xs">{point.day}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Actual</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded"></div>
            <span>Ideal</span>
          </div>
        </div>
      </div>
    )
  }

  const renderVelocityChart = () => {
    const data = Array.from({length: 6}, (_, i) => ({
      sprint: i + 1,
      completed: Math.floor(Math.random() * 25) + 15,
      committed: Math.floor(Math.random() * 30) + 20
    }))

    return (
      <div className="space-y-3">
        <h4 className="font-medium">Velocity Trend</h4>
        <div className="h-40 bg-gray-50 rounded-lg flex items-end justify-between p-4">
          {data.map((sprint, index) => (
            <div key={index} className="flex flex-col items-center space-y-1">
              <div className="flex space-x-1">
                <div 
                  className="bg-green-500 rounded-t w-3"
                  style={{ height: `${(sprint.completed / 50) * 120}px` }}
                />
                <div 
                  className="bg-blue-300 rounded-t w-3"
                  style={{ height: `${(sprint.committed / 50) * 120}px` }}
                />
              </div>
              <span className="text-xs">S{sprint.sprint}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-300 rounded"></div>
            <span>Committed</span>
          </div>
        </div>
      </div>
    )
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

  const stats = getIssueStats()
  const typeBreakdown = getTypeBreakdown()
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push("/projects")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{project?.name} - Status</h1>
              <p className="text-muted-foreground">Project analytics and progress overview</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Target className="h-4 w-4 mr-2" />
                  Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <Progress value={completionRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.completed} of {stats.total} issues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">In Progress</p>
                <Badge variant="outline" className="mt-1">{stats.todo} To Do</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">All Issues</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project?.team_members?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Members</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Burndown Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderBurndownChart()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Velocity Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderVelocityChart()}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Issue Types</CardTitle>
              </CardHeader>
              <CardContent>
                {renderBarChart(typeBreakdown, "Type Distribution", "bg-blue-500")}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completed</span>
                    <span className="font-medium">{stats.completed}</span>
                  </div>
                  <Progress value={(stats.completed / stats.total) * 100} className="bg-green-100">
                    <div className="bg-green-500 h-full rounded-full" />
                  </Progress>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">In Progress</span>
                    <span className="font-medium">{stats.inProgress}</span>
                  </div>
                  <Progress value={(stats.inProgress / stats.total) * 100} className="bg-blue-100">
                    <div className="bg-blue-500 h-full rounded-full" />
                  </Progress>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">To Do</span>
                    <span className="font-medium">{stats.todo}</span>
                  </div>
                  <Progress value={(stats.todo / stats.total) * 100} className="bg-gray-100">
                    <div className="bg-gray-500 h-full rounded-full" />
                  </Progress>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}