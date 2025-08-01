"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Kanban, Plus, Filter, Search, User, Calendar, 
  CheckCircle, Clock, XCircle, ArrowRight
} from "lucide-react"
import { projectsAPI, issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function BoardsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [issues, setIssues] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchIssues()
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll()
      setProjects(response.projects || [])
      if (response.projects?.length > 0) {
        setSelectedProject(response.projects[0].id.toString())
      }
    } catch (error) {
      toast.error("Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }

  const fetchIssues = async () => {
    if (!selectedProject) return
    
    try {
      const response = await issuesAPI.getAll({ project_id: parseInt(selectedProject) })
      setIssues(response.issues || [])
    } catch (error) {
      toast.error("Failed to fetch issues")
    }
  }

  const handleStatusUpdate = async (issueId: number, newStatus: string) => {
    try {
      await issuesAPI.update(issueId, { status: newStatus })
      toast.success("Issue status updated")
      fetchIssues()
    } catch (error) {
      toast.error("Failed to update issue status")
    }
  }

  const filteredIssues = issues.filter(issue =>
    !searchTerm || 
    issue.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    issue.key.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const todoIssues = filteredIssues.filter(issue => issue.status === 'To Do')
  const inProgressIssues = filteredIssues.filter(issue => issue.status === 'In Progress')
  const doneIssues = filteredIssues.filter(issue => issue.status === 'Done')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'In Progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'To Do': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const selectedProjectData = projects.find(p => p.id.toString() === selectedProject)

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
        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-xl p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Kanban className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Project Boards</h1>
                <p className="text-blue-100">Kanban-style project management</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 border-white/30"
              onClick={() => router.push("/issues/new")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Issue
            </Button>
          </div>
        </div>

        {/* Project Selection & Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Board Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Select Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name} ({project.key})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Search Issues</Label>
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
              <div className="flex items-end">
                {selectedProjectData && (
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/projects/${selectedProject}`)}
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    View Project
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        {selectedProject ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-red-800">
                    <XCircle className="h-5 w-5 mr-2" />
                    To Do
                  </CardTitle>
                  <Badge variant="secondary" className="bg-red-200 text-red-800">
                    {todoIssues.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 min-h-[400px]">
                  {todoIssues.map((issue) => (
                    <div 
                      key={issue.id} 
                      className="bg-white p-4 rounded-lg border border-red-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => router.push(`/issues/${issue.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium">{issue.key}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(issue.id, 'In Progress')
                          }}
                        >
                          Start
                        </Button>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">{issue.summary}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                        {issue.assignee && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{issue.assignee.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {todoIssues.length === 0 && (
                    <div className="text-center text-red-600 py-8">
                      <XCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No issues in To Do</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* In Progress Column */}
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-yellow-800">
                    <Clock className="h-5 w-5 mr-2" />
                    In Progress
                  </CardTitle>
                  <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                    {inProgressIssues.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 min-h-[400px]">
                  {inProgressIssues.map((issue) => (
                    <div 
                      key={issue.id} 
                      className="bg-white p-4 rounded-lg border border-yellow-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => router.push(`/issues/${issue.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium">{issue.key}</span>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusUpdate(issue.id, 'Done')
                          }}
                        >
                          Complete
                        </Button>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">{issue.summary}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                        {issue.assignee && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{issue.assignee.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {inProgressIssues.length === 0 && (
                    <div className="text-center text-yellow-600 py-8">
                      <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No issues in progress</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Done Column */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center text-green-800">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Done
                  </CardTitle>
                  <Badge variant="secondary" className="bg-green-200 text-green-800">
                    {doneIssues.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 min-h-[400px]">
                  {doneIssues.map((issue) => (
                    <div 
                      key={issue.id} 
                      className="bg-white p-4 rounded-lg border border-green-100 hover:shadow-md transition-all duration-200 cursor-pointer"
                      onClick={() => router.push(`/issues/${issue.id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium">{issue.key}</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">{issue.summary}</h3>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                        {issue.assignee && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{issue.assignee.username}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {doneIssues.length === 0 && (
                    <div className="text-center text-green-600 py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No completed issues</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Kanban className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Project Selected</h3>
              <p className="text-gray-500 mb-4">Select a project to view its board</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}