"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart3, TrendingUp, Clock, Download, Calendar, Users } from "lucide-react"
import { reportsAPI, projectsAPI, sprintsAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function ReportsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedSprint, setSelectedSprint] = useState("")
  const [reportType, setReportType] = useState("burndown")
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchSprints()
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll()
      setProjects(response.projects || [])
    } catch (error) {
      toast.error("Failed to fetch projects")
    }
  }

  const fetchSprints = async () => {
    try {
      const response = await sprintsAPI.getAll(parseInt(selectedProject))
      setSprints(response.sprints || [])
    } catch (error) {
      console.error("Failed to fetch sprints")
    }
  }

  const generateReport = async () => {
    if (!selectedProject) {
      toast.error("Please select a project")
      return
    }

    setLoading(true)
    try {
      let response
      switch (reportType) {
        case "burndown":
          if (!selectedSprint) {
            toast.error("Please select a sprint for burndown chart")
            return
          }
          response = await reportsAPI.burndown(parseInt(selectedSprint))
          break
        case "velocity":
          response = await reportsAPI.velocity(parseInt(selectedProject))
          break
        case "time_tracking":
          response = await reportsAPI.timeTracking({ project_id: selectedProject })
          break
        default:
          toast.error("Invalid report type")
          return
      }
      setReportData(response)
    } catch (error) {
      toast.error("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    if (!reportData) return
    
    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${reportType}-report.json`
    link.click()
    URL.revokeObjectURL(url)
    toast.success("Report exported successfully")
  }

  const renderBurndownChart = (data: any) => {
    if (!data.burndownData) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Sprint Burndown Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Sprint: {data.sprint?.name}</span>
              <Badge variant="outline">
                {data.sprint?.start_date} - {data.sprint?.end_date}
              </Badge>
            </div>
            
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Burndown chart visualization would be rendered here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Data points: {data.burndownData.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {data.burndownData[0]?.remaining || 0}
                </div>
                <div className="text-sm text-muted-foreground">Story Points Remaining</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {data.burndownData.length}
                </div>
                <div className="text-sm text-muted-foreground">Days Tracked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(((data.burndownData[0]?.remaining || 0) / (data.burndownData[0]?.ideal || 1)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Progress vs Ideal</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderVelocityChart = (data: any) => {
    if (!data.velocityData) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Team Velocity Chart
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Velocity chart visualization would be rendered here
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sprints analyzed: {data.velocityData.length}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(data.averageVelocity || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Average Velocity</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {data.velocityData.length}
                </div>
                <div className="text-sm text-muted-foreground">Completed Sprints</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Recent Sprint Performance</h4>
              {data.velocityData.slice(-5).map((sprint: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{sprint.sprintName}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{sprint.committed} committed</Badge>
                    <Badge variant="default">{sprint.completed} completed</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderTimeTrackingReport = (data: any) => {
    if (!data.worklogs) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Time Tracking Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{data.totalTime || 0}h</div>
                <div className="text-sm text-muted-foreground">Total Time Logged</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{data.worklogs.length}</div>
                <div className="text-sm text-muted-foreground">Work Log Entries</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{data.userStats?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">User Time Summary</h4>
              {data.userStats?.map((userStat: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{userStat.user.username}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{userStat.totalTime}h logged</Badge>
                    <Badge variant="secondary">{userStat.issueCount} issues</Badge>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Recent Work Logs</h4>
              {data.worklogs.slice(0, 5).map((worklog: any) => (
                <div key={worklog.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium">{worklog.user.username}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      on {worklog.issue.key}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{worklog.time_spent}h</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(worklog.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Report Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="burndown">Burndown Chart</SelectItem>
                      <SelectItem value="velocity">Velocity Chart</SelectItem>
                      <SelectItem value="time_tracking">Time Tracking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Project</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {reportType === "burndown" && (
                  <div>
                    <label className="text-sm font-medium">Sprint</label>
                    <Select value={selectedSprint} onValueChange={setSelectedSprint}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sprint" />
                      </SelectTrigger>
                      <SelectContent>
                        {sprints.map((sprint) => (
                          <SelectItem key={sprint.id} value={sprint.id.toString()}>
                            {sprint.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-end space-x-2">
                  <Button onClick={generateReport} disabled={loading}>
                    {loading ? "Generating..." : "Generate Report"}
                  </Button>
                  {reportData && (
                    <Button variant="outline" onClick={exportReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Display */}
          {reportData && (
            <div className="space-y-6">
              {reportType === "burndown" && renderBurndownChart(reportData)}
              {reportType === "velocity" && renderVelocityChart(reportData)}
              {reportType === "time_tracking" && renderTimeTrackingReport(reportData)}
            </div>
          )}

          {/* Report Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Available Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Burndown Chart</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Track sprint progress and remaining work over time
                  </p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-2 mb-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium">Velocity Chart</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Analyze team velocity across multiple sprints
                  </p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <h3 className="font-medium">Time Tracking</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    View time spent on issues and user workload
                  </p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium">Created vs Resolved</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Compare issue creation and resolution rates
                  </p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <h3 className="font-medium">Workload Report</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Analyze team workload distribution
                  </p>
                </div>

                <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-red-600" />
                    <h3 className="font-medium">Control Chart</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Identify inefficiencies in issue resolution
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
