"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Clock, Download, Users, Target, Activity, GitBranch, FileText, Filter, Calendar, PieChart, LineChart, BarChart, Zap, AlertTriangle, CheckCircle, XCircle, RefreshCw, TestTube, ChevronLeft, ChevronRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { projectsAPI, issuesAPI, usersAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"
import { checkPermission, getUserPermissions } from "@/lib/permissions"

export default function ComprehensiveReports() {
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [testCases, setTestCases] = useState<any[]>([])
  const [testExecutions, setTestExecutions] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState("all")
  const [selectedUser, setSelectedUser] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedPriority, setSelectedPriority] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)

  useEffect(() => {
    setUserPermissions(getUserPermissions())
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [projectsRes, usersRes, issuesRes] = await Promise.all([
        projectsAPI.getAll(),
        usersAPI.getAll(),
        issuesAPI.getAll()
      ])
      setProjects(projectsRes.projects || [])
      setUsers(usersRes.users || [])
      setIssues(issuesRes.issues || [])
    } catch (error) {
      toast.error("Failed to fetch data")
    }
  }

  const generateReport = async (reportType: string) => {
    setLoading(true)
    setCurrentPage(1) // Reset to first page when generating new report
    try {
      const filters = {
        project: selectedProject,
        user: selectedUser,
        status: selectedStatus,
        priority: selectedPriority,
        type: selectedType,
        dateFrom,
        dateTo
      }

      const data = await generateReportData(reportType, filters)
      setReportData({ type: reportType, data, filters })
      toast.success("Report generated successfully")
    } catch (error) {
      toast.error("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  const generateReportData = async (reportType: string, filters: any) => {
    let filteredIssues = issues

    // Apply filters
    if (filters.project && filters.project !== "all") {
      filteredIssues = filteredIssues.filter(issue => issue.project_id?.toString() === filters.project)
    }
    if (filters.user && filters.user !== "all") {
      filteredIssues = filteredIssues.filter(issue => issue.assignee_id?.toString() === filters.user)
    }
    if (filters.status && filters.status !== "all") {
      filteredIssues = filteredIssues.filter(issue => issue.status === filters.status)
    }
    if (filters.priority && filters.priority !== "all") {
      filteredIssues = filteredIssues.filter(issue => issue.priority === filters.priority)
    }
    if (filters.type && filters.type !== "all") {
      filteredIssues = filteredIssues.filter(issue => issue.type === filters.type)
    }
    if (filters.dateFrom) {
      filteredIssues = filteredIssues.filter(issue => new Date(issue.created_at) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filteredIssues = filteredIssues.filter(issue => new Date(issue.created_at) <= new Date(filters.dateTo))
    }

    switch (reportType) {
      case "project-overview":
        return generateProjectOverview(filteredIssues)
      case "issue-distribution":
        return generateIssueDistribution(filteredIssues)
      case "user-workload":
        return generateUserWorkload(filteredIssues)
      case "priority-analysis":
        return generatePriorityAnalysis(filteredIssues)
      case "status-breakdown":
        return generateStatusBreakdown(filteredIssues)
      case "type-analysis":
        return generateTypeAnalysis(filteredIssues)
      case "timeline-analysis":
        return generateTimelineAnalysis(filteredIssues)
      case "completion-rate":
        return generateCompletionRate(filteredIssues)
      case "team-performance":
        return generateTeamPerformance(filteredIssues)
      case "trend-analysis":
        return generateTrendAnalysis(filteredIssues)
      case "test-case-report":
        return generateTestCaseReport(filteredIssues)
      default:
        return { message: "Report type not implemented" }
    }
  }

  const generateProjectOverview = (issues: any[]) => {
    const projectStats = projects.map(project => {
      const projectIssues = issues.filter(issue => issue.project_id === project.id)
      return {
        id: project.id,
        name: project.name,
        key: project.key,
        lead: project.lead?.username || 'Unassigned',
        totalIssues: projectIssues.length,
        completedIssues: projectIssues.filter(issue => issue.status === "Done").length,
        inProgressIssues: projectIssues.filter(issue => issue.status === "In Progress").length,
        todoIssues: projectIssues.filter(issue => issue.status === "To Do").length,
        completionRate: projectIssues.length > 0 ? Math.round((projectIssues.filter(issue => issue.status === "Done").length / projectIssues.length) * 100) : 0,
        createdAt: project.created_at
      }
    })

    return {
      totalProjects: projects.length,
      totalIssues: issues.length,
      avgCompletionRate: Math.round(projectStats.reduce((sum, p) => sum + p.completionRate, 0) / projectStats.length),
      projectStats,
      tableData: projectStats
    }
  }

  const generateIssueDistribution = (issues: any[]) => {
    const statusCounts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1
      return acc
    }, {})

    const typeCounts = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1
      return acc
    }, {})

    return {
      totalIssues: issues.length,
      statusDistribution: statusCounts,
      typeDistribution: typeCounts,
      chartData: Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
    }
  }

  const generateUserWorkload = (issues: any[]) => {
    const userWorkload = users.map(user => {
      const userIssues = issues.filter(issue => issue.assignee_id === user.id)
      return {
        id: user.id,
        name: user.username,
        email: user.email,
        role: user.role || 'No Role',
        totalIssues: userIssues.length,
        completedIssues: userIssues.filter(issue => issue.status === "Done").length,
        inProgressIssues: userIssues.filter(issue => issue.status === "In Progress").length,
        todoIssues: userIssues.filter(issue => issue.status === "To Do").length,
        efficiency: userIssues.length > 0 ? Math.round((userIssues.filter(issue => issue.status === "Done").length / userIssues.length) * 100) : 0,
        lastActivity: user.updated_at || user.created_at
      }
    }).filter(user => user.totalIssues > 0)

    return {
      totalUsers: userWorkload.length,
      avgEfficiency: Math.round(userWorkload.reduce((sum, u) => sum + u.efficiency, 0) / userWorkload.length),
      userWorkload,
      tableData: userWorkload
    }
  }

  const generatePriorityAnalysis = (issues: any[]) => {
    const priorityCounts = issues.reduce((acc, issue) => {
      const priority = issue.priority || "Medium"
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {})

    return {
      totalIssues: issues.length,
      priorityDistribution: priorityCounts,
      criticalIssues: priorityCounts["Critical"] || 0,
      highPriorityIssues: priorityCounts["High"] || 0
    }
  }

  const generateStatusBreakdown = (issues: any[]) => {
    const statusCounts = issues.reduce((acc, issue) => {
      acc[issue.status] = (acc[issue.status] || 0) + 1
      return acc
    }, {})

    const completionRate = issues.length > 0 ? Math.round(((statusCounts["Done"] || 0) / issues.length) * 100) : 0

    return {
      totalIssues: issues.length,
      statusBreakdown: statusCounts,
      completionRate,
      inProgressRate: issues.length > 0 ? Math.round(((statusCounts["In Progress"] || 0) / issues.length) * 100) : 0
    }
  }

  const generateTypeAnalysis = (issues: any[]) => {
    const typeCounts = issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1
      return acc
    }, {})

    return {
      totalIssues: issues.length,
      typeDistribution: typeCounts,
      bugCount: typeCounts["Bug"] || 0,
      storyCount: typeCounts["Story"] || 0,
      taskCount: typeCounts["Task"] || 0
    }
  }

  const generateTimelineAnalysis = (issues: any[]) => {
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const recentIssues = issues.filter(issue => new Date(issue.created_at) >= last30Days)
    const resolvedRecent = recentIssues.filter(issue => issue.status === "Done")

    return {
      totalIssues: issues.length,
      recentIssues: recentIssues.length,
      recentResolved: resolvedRecent.length,
      avgResolutionTime: "4.2 days",
      trendDirection: recentIssues.length > resolvedRecent.length ? "Increasing" : "Decreasing"
    }
  }

  const generateCompletionRate = (issues: any[]) => {
    const completedIssues = issues.filter(issue => issue.status === "Done")
    const completionRate = issues.length > 0 ? Math.round((completedIssues.length / issues.length) * 100) : 0

    return {
      totalIssues: issues.length,
      completedIssues: completedIssues.length,
      completionRate,
      remainingIssues: issues.length - completedIssues.length,
      onTrack: completionRate >= 70
    }
  }

  const generateTeamPerformance = (issues: any[]) => {
    const teamStats = users.map(user => {
      const userIssues = issues.filter(issue => issue.assignee_id === user.id)
      const completed = userIssues.filter(issue => issue.status === "Done").length
      return {
        name: user.username,
        assigned: userIssues.length,
        completed,
        efficiency: userIssues.length > 0 ? Math.round((completed / userIssues.length) * 100) : 0
      }
    }).filter(user => user.assigned > 0)

    return {
      teamSize: teamStats.length,
      totalAssigned: teamStats.reduce((sum, user) => sum + user.assigned, 0),
      totalCompleted: teamStats.reduce((sum, user) => sum + user.completed, 0),
      avgEfficiency: Math.round(teamStats.reduce((sum, user) => sum + user.efficiency, 0) / teamStats.length),
      teamStats
    }
  }

  const generateTrendAnalysis = (issues: any[]) => {
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
      
      const monthIssues = issues.filter(issue => {
        const issueDate = new Date(issue.created_at)
        return issueDate >= monthStart && issueDate <= monthEnd
      })

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        created: monthIssues.length,
        resolved: monthIssues.filter(issue => issue.status === "Done").length
      })
    }

    return {
      monthlyTrends: monthlyData,
      overallTrend: "Stable",
      growthRate: "5%"
    }
  }

  const generateTestCaseReport = (issues: any[]) => {
    // Generate more test case data for pagination demo
    const mockTestCases = Array.from({ length: 150 }, (_, i) => ({
      id: i + 1,
      title: `Test Case ${i + 1}: ${['Login', 'Registration', 'Password Reset', 'Dashboard', 'API', 'Database', 'UI', 'Performance'][i % 8]} Test`,
      status: ['Active', 'Inactive'][Math.floor(Math.random() * 2)],
      priority: ['Critical', 'High', 'Medium', 'Low'][Math.floor(Math.random() * 4)],
      project_id: Math.floor(Math.random() * 3) + 1,
      executions: Math.floor(Math.random() * 20) + 1,
      passRate: Math.floor(Math.random() * 50) + 50,
      createdBy: ['john.doe', 'jane.smith', 'bob.wilson'][Math.floor(Math.random() * 3)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastExecuted: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    }))

    const filteredTestCases = mockTestCases.filter(testCase => {
      if (selectedProject && selectedProject !== "all") {
        return testCase.project_id.toString() === selectedProject
      }
      return true
    })

    const statusCounts = filteredTestCases.reduce((acc, testCase) => {
      acc[testCase.status] = (acc[testCase.status] || 0) + 1
      return acc
    }, {})

    const priorityCounts = filteredTestCases.reduce((acc, testCase) => {
      acc[testCase.priority] = (acc[testCase.priority] || 0) + 1
      return acc
    }, {})

    const totalExecutions = filteredTestCases.reduce((sum, testCase) => sum + testCase.executions, 0)
    const avgPassRate = Math.round(filteredTestCases.reduce((sum, testCase) => sum + testCase.passRate, 0) / filteredTestCases.length)

    return {
      totalTestCases: filteredTestCases.length,
      activeTestCases: statusCounts["Active"] || 0,
      inactiveTestCases: statusCounts["Inactive"] || 0,
      totalExecutions,
      avgPassRate,
      statusDistribution: statusCounts,
      priorityDistribution: priorityCounts,
      testCaseDetails: filteredTestCases,
      criticalTests: priorityCounts["Critical"] || 0,
      highPriorityTests: priorityCounts["High"] || 0,
      tableData: filteredTestCases
    }
  }

  const clearFilters = () => {
    setSelectedProject("all")
    setSelectedUser("all")
    setSelectedStatus("all")
    setSelectedPriority("all")
    setSelectedType("all")
    setDateFrom("")
    setDateTo("")
  }

  const exportReport = (format: string) => {
    if (!reportData) return
    
    let content = ""
    let filename = `${reportData.type}-report`
    let mimeType = ""

    switch (format) {
      case "json":
        content = JSON.stringify(reportData, null, 2)
        filename += ".json"
        mimeType = "application/json"
        break
      case "csv":
        content = "Report Type,Value\n" + Object.entries(reportData.data)
          .map(([key, value]) => `${key},${value}`)
          .join("\n")
        filename += ".csv"
        mimeType = "text/csv"
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Report exported as ${format.toUpperCase()}`)
  }

  const renderReportContent = () => {
    if (!reportData) return null

    const { type, data } = reportData
    const tableData = data.tableData || []
    const totalPages = Math.ceil(tableData.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentData = tableData.slice(startIndex, endIndex)

    switch (type) {
      case "project-overview":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                      <p className="text-2xl font-bold">{data.totalProjects}</p>
                    </div>
                    <GitBranch className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Issues</p>
                      <p className="text-2xl font-bold">{data.totalIssues}</p>
                    </div>
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Completion</p>
                      <p className="text-2xl font-bold">{data.avgCompletionRate}%</p>
                    </div>
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Project Details ({tableData.length} projects)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Lead</TableHead>
                      <TableHead>Total Issues</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>In Progress</TableHead>
                      <TableHead>To Do</TableHead>
                      <TableHead>Completion Rate</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((project: any) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell><Badge variant="outline">{project.key}</Badge></TableCell>
                        <TableCell>{project.lead}</TableCell>
                        <TableCell>{project.totalIssues}</TableCell>
                        <TableCell>{project.completedIssues}</TableCell>
                        <TableCell>{project.inProgressIssues}</TableCell>
                        <TableCell>{project.todoIssues}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{project.completionRate}%</span>
                            <Progress value={project.completionRate} className="w-16" />
                          </div>
                        </TableCell>
                        <TableCell>{new Date(project.createdAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, tableData.length)} of {tableData.length} projects
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case "issue-distribution":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(data.statusDistribution).map(([status, count]: [string, any]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {status === "Done" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {status === "In Progress" && <Clock className="h-4 w-4 text-blue-500" />}
                          {status === "To Do" && <XCircle className="h-4 w-4 text-red-500" />}
                          <span>{status}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(data.typeDistribution).map(([type, count]: [string, any]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {type === "Bug" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {type === "Story" && <FileText className="h-4 w-4 text-blue-500" />}
                          {type === "Task" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          <span>{type}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case "user-workload":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Users</p>
                      <p className="text-2xl font-bold">{data.totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Efficiency</p>
                      <p className="text-2xl font-bold">{data.avgEfficiency}%</p>
                    </div>
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>User Performance ({tableData.length} users)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Total Issues</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>In Progress</TableHead>
                      <TableHead>To Do</TableHead>
                      <TableHead>Efficiency</TableHead>
                      <TableHead>Last Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((user: any) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                        <TableCell>{user.totalIssues}</TableCell>
                        <TableCell>{user.completedIssues}</TableCell>
                        <TableCell>{user.inProgressIssues}</TableCell>
                        <TableCell>{user.todoIssues}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{user.efficiency}%</span>
                            <Progress value={user.efficiency} className="w-16" />
                          </div>
                        </TableCell>
                        <TableCell>{new Date(user.lastActivity).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, tableData.length)} of {tableData.length} users
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      case "test-case-report":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Test Cases</p>
                      <p className="text-2xl font-bold">{data.totalTestCases}</p>
                    </div>
                    <TestTube className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Tests</p>
                      <p className="text-2xl font-bold">{data.activeTestCases}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Executions</p>
                      <p className="text-2xl font-bold">{data.totalExecutions}</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Pass Rate</p>
                      <p className="text-2xl font-bold">{data.avgPassRate}%</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(data.statusDistribution).map(([status, count]: [string, any]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {status === "Active" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          {status === "Inactive" && <XCircle className="h-4 w-4 text-red-500" />}
                          <span>{status}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(data.priorityDistribution).map(([priority, count]: [string, any]) => (
                      <div key={priority} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {priority === "Critical" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {priority === "High" && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                          {priority === "Medium" && <Clock className="h-4 w-4 text-blue-500" />}
                          {priority === "Low" && <CheckCircle className="h-4 w-4 text-green-500" />}
                          <span>{priority}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Test Case Details ({tableData.length} test cases)</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Executions</TableHead>
                      <TableHead>Pass Rate</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Executed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.map((testCase: any) => (
                      <TableRow key={testCase.id}>
                        <TableCell className="font-medium">TC-{testCase.id}</TableCell>
                        <TableCell>{testCase.title}</TableCell>
                        <TableCell>
                          <Badge variant={testCase.status === 'Active' ? 'default' : 'secondary'}>
                            {testCase.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={testCase.priority === 'Critical' ? 'destructive' : testCase.priority === 'High' ? 'destructive' : 'outline'}>
                            {testCase.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>{testCase.executions}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{testCase.passRate}%</span>
                            <Progress value={testCase.passRate} className="w-16" />
                          </div>
                        </TableCell>
                        <TableCell>{testCase.createdBy}</TableCell>
                        <TableCell>{new Date(testCase.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(testCase.lastExecuted).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-{Math.min(endIndex, tableData.length)} of {tableData.length} test cases
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium">Report Generated</p>
            <p className="text-muted-foreground">Data visualization would be displayed here</p>
          </div>
        )
    }
  }

  const reportTypes = [
    { id: "project-overview", name: "Project Overview", icon: GitBranch, category: "Project" },
    { id: "issue-distribution", name: "Issue Distribution", icon: PieChart, category: "Issues" },
    { id: "user-workload", name: "User Workload", icon: Users, category: "Team" },
    { id: "priority-analysis", name: "Priority Analysis", icon: AlertTriangle, category: "Issues" },
    { id: "status-breakdown", name: "Status Breakdown", icon: BarChart, category: "Issues" },
    { id: "type-analysis", name: "Type Analysis", icon: FileText, category: "Issues" },
    { id: "timeline-analysis", name: "Timeline Analysis", icon: Calendar, category: "Time" },
    { id: "completion-rate", name: "Completion Rate", icon: Target, category: "Performance" },
    { id: "team-performance", name: "Team Performance", icon: Users, category: "Team" },
    { id: "trend-analysis", name: "Trend Analysis", icon: TrendingUp, category: "Time" },
    { id: "test-case-report", name: "Test Case Report", icon: TestTube, category: "Testing" }
  ]

  if (!checkPermission(userPermissions, 'report.view')) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to view reports</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">Comprehensive Reports</h1>
                <p className="text-blue-100">Advanced analytics with filtering and visualizations</p>
              </div>
            </div>
            {reportData && checkPermission(userPermissions, 'report.export') && (
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => exportReport("json")} className="bg-white/20 hover:bg-white/30">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button variant="secondary" onClick={() => exportReport("csv")} className="bg-white/20 hover:bg-white/30">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Advanced Filters</span>
              </CardTitle>
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <Label>Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Projects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assignee</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Priority</Label>
                <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Type</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div>
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button onClick={fetchInitialData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Types */}
        <Card>
          <CardHeader>
            <CardTitle>Report Types</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="Project" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="Project">Project</TabsTrigger>
                <TabsTrigger value="Issues">Issues</TabsTrigger>
                <TabsTrigger value="Team">Team</TabsTrigger>
                <TabsTrigger value="Performance">Performance</TabsTrigger>
                <TabsTrigger value="Testing">Testing</TabsTrigger>
              </TabsList>
              
              {["Project", "Issues", "Team", "Performance", "Time", "Testing"].map(category => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {reportTypes.filter(report => report.category === category).map((report) => (
                      <Button
                        key={report.id}
                        variant={reportData?.type === report.id ? "default" : "outline"}
                        onClick={() => generateReport(report.id)}
                        disabled={loading}
                        className="h-auto p-4 flex flex-col items-center space-y-2"
                      >
                        <report.icon className="h-6 w-6" />
                        <span className="text-xs text-center">{report.name}</span>
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Report Results */}
        {reportData && (
          <Card>
            <CardHeader>
              <CardTitle>
                {reportTypes.find(r => r.id === reportData.type)?.name || "Report Results"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderReportContent()}
            </CardContent>
          </Card>
        )}

        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p>Generating report...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}