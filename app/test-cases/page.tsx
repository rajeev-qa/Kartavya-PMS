"use client"

import { useState, useEffect, useRef } from 'react'
import { Plus, Play, Bug, CheckCircle, XCircle, Clock, Search, Filter, Download, Upload, FileText, FileSpreadsheet, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { testCaseApi, TestCase } from '@/lib/testCaseApi'
import { projectsApi } from '@/lib/api'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'
import { toast } from 'react-hot-toast'

export default function TestCasesPage() {
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [filteredTestCases, setFilteredTestCases] = useState<TestCase[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  
  // Dialogs
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null)
  
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
  }, [testCases, searchTerm, statusFilter, priorityFilter, projectFilter])

  const fetchData = async () => {
    try {
      const [testCasesRes, projectsRes, statsRes] = await Promise.all([
        testCaseApi.getAll(),
        projectsApi.getAll(),
        testCaseApi.getStats()
      ])
      setTestCases(testCasesRes.data.testCases)
      setProjects(projectsRes.projects)
      setStats(statsRes.data.stats)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch test cases')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = testCases.filter(testCase => {
      const matchesSearch = !searchTerm || 
        testCase.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `TC-${testCase.id}`.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || testCase.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || testCase.priority === priorityFilter
      const matchesProject = projectFilter === 'all' || testCase.project_id.toString() === projectFilter
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject
    })
    
    setFilteredTestCases(filtered)
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setProjectFilter('all')
  }

  // Pagination
  const totalPages = Math.ceil(filteredTestCases.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTestCases = filteredTestCases.slice(startIndex, endIndex)

  // Export functions
  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/test-cases/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testCaseIds: filteredTestCases.map(tc => tc.id) })
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `test-cases-${new Date().toISOString().split('T')[0]}.pdf`
        a.click()
        toast.success('PDF exported successfully')
      }
    } catch (error) {
      toast.error('Failed to export PDF')
    }
  }

  const exportToCSV = () => {
    const headers = ['Test Case ID', 'Title', 'Description', 'Priority', 'Status', 'Project', 'Created By', 'Created Date']
    const csvData = filteredTestCases.map(tc => [
      `TC-${tc.id}`,
      tc.title,
      tc.description || '',
      tc.priority,
      tc.status,
      tc.project?.name || '',
      tc.creator?.username || '',
      new Date(tc.created_at).toLocaleDateString()
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `test-cases-${new Date().toISOString().split('T')[0]}.csv`
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
      const response = await fetch('/api/test-cases/import/csv', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success('Test cases imported successfully')
        fetchData()
        setIsImportOpen(false)
      } else {
        toast.error('Failed to import test cases')
      }
    } catch (error) {
      toast.error('Failed to import test cases')
    }
  }

  // File upload for failed test cases
  const handleFileUpload = async () => {
    if (!uploadFile || !selectedTestCase) return

    const formData = new FormData()
    formData.append('file', uploadFile)
    formData.append('testCaseId', selectedTestCase.id.toString())
    formData.append('notes', uploadNotes)

    try {
      const response = await fetch('/api/test-cases/upload-evidence', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success('Evidence uploaded successfully')
        setIsUploadOpen(false)
        setUploadFile(null)
        setUploadNotes('')
        setSelectedTestCase(null)
      } else {
        toast.error('Failed to upload evidence')
      }
    } catch (error) {
      toast.error('Failed to upload evidence')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Passed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'Failed': return <XCircle className="h-4 w-4 text-red-500" />
      case 'Active': return <Clock className="h-4 w-4 text-blue-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Test Cases</h1>
            <p className="text-gray-600">Manage and execute test cases</p>
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
            <Link href="/test-cases/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Test Case
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold">{stats.totalTests || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.passedTests || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedTests || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pass Rate</p>
                  <p className="text-2xl font-bold">{stats.passRate || 0}%</p>
                </div>
                <div className="text-2xl">📊</div>
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search test cases..."
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
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Passed">Passed</SelectItem>
                    <SelectItem value="Failed">Failed</SelectItem>
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

        {/* Test Cases Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Test Cases ({filteredTestCases.length})</CardTitle>
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredTestCases.length)} of {filteredTestCases.length}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Case ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTestCases.map((testCase) => (
                  <TableRow key={testCase.id}>
                    <TableCell className="font-medium">TC-{testCase.id}</TableCell>
                    <TableCell>
                      <Link href={`/test-cases/${testCase.id}`} className="hover:text-blue-600">
                        {testCase.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(testCase.priority)}>
                        {testCase.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(testCase.status)}
                        <span>{testCase.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>{testCase.project?.name}</TableCell>
                    <TableCell>{testCase.creator?.username}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/test-cases/${testCase.id}/execute`}>
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4 mr-1" />
                            Execute
                          </Button>
                        </Link>
                        {testCase.status === 'Failed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedTestCase(testCase)
                              setIsUploadOpen(true)
                            }}
                          >
                            <Paperclip className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        )}
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

        {filteredTestCases.length === 0 && !loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-gray-500 mb-4">
                <Clock className="h-12 w-12 mx-auto mb-2" />
                <p>No test cases found</p>
              </div>
              <Link href="/test-cases/new">
                <Button>Create your first test case</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Import CSV Dialog */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Test Cases from CSV</DialogTitle>
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
                CSV should have columns: Title, Description, Priority, Project, Steps, Expected Result
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Evidence Dialog */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Test Evidence</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Test Case</Label>
              <Input value={selectedTestCase ? `TC-${selectedTestCase.id} - ${selectedTestCase.title}` : ''} disabled />
            </div>
            <div>
              <Label>Evidence File</Label>
              <Input
                type="file"
                accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                ref={fileInputRef}
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Add notes about the failure..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFileUpload} disabled={!uploadFile}>
                Upload Evidence
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}