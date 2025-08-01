"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, Search, Filter, Download, Upload, FileText, 
  FileSpreadsheet, User, Calendar, CheckCircle, Clock, 
  XCircle, AlertTriangle, GitBranch
} from "lucide-react"
import { issuesAPI, projectsAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"
import { checkPermission, getUserPermissions } from "@/lib/permissions"

export default function IssuesPage() {
  const router = useRouter()
  const [issues, setIssues] = useState<any[]>([])
  const [filteredIssues, setFilteredIssues] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(25)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  
  // Dialogs
  const [isImportOpen, setIsImportOpen] = useState(false)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  useEffect(() => {
    setUserPermissions(getUserPermissions())
  }, [])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [issues, searchTerm, statusFilter, typeFilter, priorityFilter, projectFilter, assigneeFilter])

  const fetchData = async () => {
    try {
      const [issuesResponse, projectsResponse] = await Promise.all([
        issuesAPI.getAll(),
        projectsAPI.getAll()
      ])
      
      setIssues(issuesResponse.issues || [])
      setProjects(projectsResponse.projects || [])
    } catch (error) {
      toast.error("Failed to fetch issues")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = issues.filter(issue => {
      const matchesSearch = !searchTerm || 
        issue.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.key.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter
      const matchesType = typeFilter === 'all' || issue.type === typeFilter
      const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter
      const matchesProject = projectFilter === 'all' || issue.project_id?.toString() === projectFilter
      const matchesAssignee = assigneeFilter === 'all' || 
        (assigneeFilter === 'unassigned' ? !issue.assignee : issue.assignee_id?.toString() === assigneeFilter)
      
      return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesProject && matchesAssignee
    })
    
    setFilteredIssues(filtered)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setTypeFilter('all')
    setPriorityFilter('all')
    setProjectFilter('all')
    setAssigneeFilter('all')
  }

  // Pagination
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentIssues = filteredIssues.slice(startIndex, endIndex)

  // Export functions
  const exportToCSV = () => {
    const headers = ['Key', 'Summary', 'Type', 'Status', 'Priority', 'Project', 'Assignee', 'Reporter', 'Created Date']
    const csvData = filteredIssues.map(issue => [
      issue.key,
      issue.summary,
      issue.type,
      issue.status,
      issue.priority || 'Medium',
      issue.project?.name || '',
      issue.assignee?.username || 'Unassigned',
      issue.reporter?.username || '',
      new Date(issue.created_at).toLocaleDateString()
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `issues-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('CSV exported successfully')
  }

  // Import CSV
  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/issues/import/csv', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success('Issues imported successfully')
        fetchData()
        setIsImportOpen(false)
      } else {
        toast.error('Failed to import issues')
      }
    } catch (error) {
      toast.error('Failed to import issues')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'To Do': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Bug': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'Epic': return <GitBranch className="h-4 w-4 text-purple-500" />
      default: return <CheckCircle className="h-4 w-4 text-blue-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive'
      case 'High': return 'destructive'
      case 'Medium': return 'secondary'
      case 'Low': return 'outline'
      default: return 'secondary'
    }
  }

  // Get unique assignees for filter
  const uniqueAssignees = Array.from(new Set(issues.filter(i => i.assignee).map(i => i.assignee)))

  // Statistics
  const stats = {
    total: issues.length,
    todo: issues.filter(i => i.status === 'To Do').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    done: issues.filter(i => i.status === 'Done').length
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700 text-white rounded-xl p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <GitBranch className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">All Issues</h1>
                <p className="text-blue-100">Manage and track all project issues</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {checkPermission(userPermissions, 'issue.create') && (
                <Button variant="outline" className="bg-white/20 hover:bg-white/30 border-white/30" onClick={() => setIsImportOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              )}
              {checkPermission(userPermissions, 'report.export') && (
                <Button variant="outline" className="bg-white/20 hover:bg-white/30 border-white/30" onClick={exportToCSV}>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              )}
              {checkPermission(userPermissions, 'issue.create') && (
                <Button 
                  variant="secondary" 
                  className="bg-white/20 hover:bg-white/30 border-white/30"
                  onClick={() => router.push("/issues/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Issue
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Issues</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <GitBranch className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">To Do</p>
                  <p className="text-2xl font-bold">{stats.todo}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Done</p>
                  <p className="text-2xl font-bold">{stats.done}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>Priority</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>Project</Label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Issues ({filteredIssues.length})</CardTitle>
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredIssues.length)} of {filteredIssues.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentIssues.map((issue) => (
                  <TableRow 
                    key={issue.id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/issues/${issue.id}`)}
                  >
                    <TableCell className="font-medium">{issue.key}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(issue.type)}
                        <span>{issue.summary}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{issue.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(issue.status)}
                        <span>{issue.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPriorityColor(issue.priority)}>
                        {issue.priority || 'Medium'}
                      </Badge>
                    </TableCell>
                    <TableCell>{issue.project?.name}</TableCell>
                    <TableCell>
                      {issue.assignee ? (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {issue.assignee.username}
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(issue.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredIssues.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500 mb-4">
                <GitBranch className="h-12 w-12 mx-auto mb-2" />
                <p>No issues found</p>
              </div>
              {checkPermission(userPermissions, 'issue.create') && (
                <Button onClick={() => router.push("/issues/new")}>
                  Create First Issue
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Import CSV Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Issues from CSV</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>CSV File</Label>
              <Input
                type="file"
                accept=".csv"
                ref={csvInputRef}
                onChange={handleCSVImport}
              />
              <p className="text-sm text-gray-500 mt-1">
                CSV should have columns: Summary, Description, Type, Priority, Project, Assignee
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}