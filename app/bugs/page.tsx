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
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Plus, Bug, User, Calendar, AlertTriangle, Search, Filter, 
  Download, Upload, FileText, FileSpreadsheet, Paperclip, 
  CheckCircle, XCircle, Clock
} from "lucide-react"
import { issuesAPI, projectsAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function BugsPage() {
  const router = useRouter()
  const [bugs, setBugs] = useState<any[]>([])
  const [filteredBugs, setFilteredBugs] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  
  // Dialogs
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedBug, setSelectedBug] = useState<any>(null)
  
  // File uploads
  const fileInputRef = useRef<HTMLInputElement>(null)
  const csvInputRef = useRef<HTMLInputElement>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadNotes, setUploadNotes] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [bugs, searchTerm, statusFilter, priorityFilter, severityFilter, projectFilter, assigneeFilter])

  const fetchData = async () => {
    try {
      const [bugsResponse, projectsResponse] = await Promise.all([
        issuesAPI.getAll(),
        projectsAPI.getAll()
      ])
      
      // Filter for bugs only
      const bugItems = bugsResponse.issues?.filter((item: any) => 
        item.type === 'Bug'
      ) || []
      setBugs(bugItems)
      setProjects(projectsResponse.projects || [])
    } catch (error) {
      toast.error("Failed to fetch bugs")
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = bugs.filter(bug => {
      const matchesSearch = !searchTerm || 
        bug.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bug.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `BUG-${bug.id}`.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || bug.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter
      const matchesSeverity = severityFilter === 'all' || (bug.severity || 'Medium') === severityFilter
      const matchesProject = projectFilter === 'all' || bug.project_id?.toString() === projectFilter
      const matchesAssignee = assigneeFilter === 'all' || 
        (assigneeFilter === 'unassigned' ? !bug.assignee : bug.assignee_id?.toString() === assigneeFilter)
      
      return matchesSearch && matchesStatus && matchesPriority && matchesSeverity && matchesProject && matchesAssignee
    })
    
    setFilteredBugs(filtered)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setSeverityFilter('all')
    setProjectFilter('all')
    setAssigneeFilter('all')
  }

  // Pagination
  const totalPages = Math.ceil(filteredBugs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentBugs = filteredBugs.slice(startIndex, endIndex)

  // Export functions
  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/bugs/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bugIds: filteredBugs.map(bug => bug.id) })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bug-reports-${new Date().toISOString().split('T')[0]}.pdf`
        a.click()
        toast.success('PDF exported successfully')
      }
    } catch (error) {
      toast.error('Failed to export PDF')
    }
  }

  const exportToCSV = () => {
    const headers = ['Bug ID', 'Key', 'Summary', 'Description', 'Status', 'Priority', 'Severity', 'Project', 'Assignee', 'Reporter', 'Created Date']
    const csvData = filteredBugs.map(bug => [
      `BUG-${bug.id}`,
      bug.key,
      bug.summary,
      bug.description || '',
      bug.status,
      bug.priority || 'Medium',
      bug.severity || 'Medium',
      bug.project?.name || '',
      bug.assignee?.username || 'Unassigned',
      bug.reporter?.username || '',
      new Date(bug.created_at).toLocaleDateString()
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bug-reports-${new Date().toISOString().split('T')[0]}.csv`
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
      const response = await fetch('/api/bugs/import/csv', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success('Bug reports imported successfully')
        fetchData()
        setIsImportOpen(false)
      } else {
        toast.error('Failed to import bug reports')
      }
    } catch (error) {
      toast.error('Failed to import bug reports')
    }
  }

  // File upload for bugs
  const handleFileUpload = async () => {
    if (!uploadFile || !selectedBug) return

    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('bugId', selectedBug.id.toString())
    formData.append('notes', uploadNotes)

    try {
      const response = await fetch('/api/bugs/upload-attachment', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success('Attachment uploaded successfully')
        setIsUploadOpen(false)
        setUploadFile(null)
        setUploadNotes('')
        setSelectedBug(null)
      } else {
        toast.error('Failed to upload attachment')
      }
    } catch (error) {
      toast.error('Failed to upload attachment')
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'to do': return 'destructive'
      case 'in progress': return 'default'
      case 'done': return 'secondary'
      default: return 'outline'
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

  // Get unique assignees for filter
  const uniqueAssignees = Array.from(new Set(bugs.filter(b => b.assignee).map(b => b.assignee)))

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Bug className="h-6 w-6 mr-2 text-red-600" />
              Bug Reports
            </h1>
            <p className="text-muted-foreground">Bug lifecycle management and tracking</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => router.push("/bugs/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Report Bug
            </Button>
          </div>
        </div>

        {/* Bug Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Bugs</p>
                  <p className="text-2xl font-bold">{bugs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Open</p>
                  <p className="text-2xl font-bold">{bugs.filter(b => b.status === 'To Do').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{bugs.filter(b => b.status === 'In Progress').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{bugs.filter(b => b.status === 'Done').length}</p>
                </div>
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
                    placeholder="Search bugs..."
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
                    <SelectItem value="To Do">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Resolved</SelectItem>
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
                <Label>Severity</Label>
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
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

        {/* Bugs Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Bug Reports ({filteredBugs.length})</CardTitle>
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredBugs.length)} of {filteredBugs.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bug ID</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentBugs.map((bug) => (
                  <TableRow key={bug.id}>
                    <TableCell className="font-medium">BUG-{bug.id}</TableCell>
                    <TableCell>{bug.key}</TableCell>
                    <TableCell>
                      <div 
                        className="flex items-center space-x-2 cursor-pointer hover:text-blue-600"
                        onClick={() => router.push(`/issues/${bug.id}`)}
                      >
                        <Bug className="h-4 w-4 text-red-600" />
                        <span>{bug.summary}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(bug.status)}
                        <Badge variant={getStatusColor(bug.status)}>
                          {bug.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={bug.priority === 'Critical' || bug.priority === 'High' ? 'destructive' : 'secondary'}>
                        {bug.priority || 'Medium'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(bug.severity || 'Medium')}>
                        {bug.severity || 'Medium'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bug.assignee ? (
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {bug.assignee.username}
                        </div>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(bug.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedBug(bug)
                            setIsUploadOpen(true)
                          }}
                        >
                          <Paperclip className="h-4 w-4 mr-1" />
                          Attach
                        </Button>
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

        {filteredBugs.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500 mb-4">
                <Bug className="h-12 w-12 mx-auto mb-2" />
                <p>No bugs found</p>
              </div>
              <Button onClick={() => router.push("/bugs/new")}>
                Report First Bug
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Import CSV Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Bug Reports from CSV</DialogTitle>
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
                CSV should have columns: Summary, Description, Priority, Severity, Project, Assignee
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Attachment Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Bug Attachment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Bug Report</Label>
              <Input value={selectedBug ? `BUG-${selectedBug.id} - ${selectedBug.summary}` : ''} disabled />
            </div>
            <div>
              <Label>Attachment File</Label>
              <Input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx,.txt,.log"
                ref={fileInputRef}
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Add notes about this attachment..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFileUpload} disabled={!uploadFile}>
                Upload Attachment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}