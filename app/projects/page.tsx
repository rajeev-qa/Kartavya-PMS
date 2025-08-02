"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, MoreHorizontal, Plus, Search, Users, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { projectsApi, issuesApi } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"
import { checkPermission, getUserPermissions } from "@/lib/permissions"

interface Project {
  id: number
  name: string
  key: string
  description?: string
  lead: {
    id: number
    username: string
    email: string
  }
  stats: {
    totalIssues: number
    completedIssues: number
    inProgressIssues: number
    todoIssues: number
    progress: number
    teamSize: number
  }
  created_at: string
  updated_at: string
}

export default function Projects() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: "",
    key: "",
    description: "",
    create_sample_data: false
  })
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  useEffect(() => {
    setUserPermissions(getUserPermissions())
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      // Handle both old and new API response formats
      const projectsData = response.data || response.projects || []
      
      // Transform projects to include stats if missing
      const transformedProjects = projectsData.map((project: any) => ({
        ...project,
        stats: project.stats || {
          totalIssues: 0,
          completedIssues: 0,
          inProgressIssues: 0,
          todoIssues: 0,
          progress: 0,
          teamSize: 1
        },
        lead: project.lead || { id: 1, username: 'Unknown', email: 'unknown@example.com' }
      }))
      
      setProjects(transformedProjects)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error("Failed to fetch projects")
      setProjects([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await projectsApi.create(createForm)
      
      if (createForm.create_sample_data) {
        // Create sample issues for the new project
        const sampleIssues = [
          { summary: "Set up project infrastructure", type: "Task", priority: "High", status: "To Do" },
          { summary: "Design user interface mockups", type: "Story", priority: "Medium", status: "To Do" },
          { summary: "Implement user authentication", type: "Story", priority: "High", status: "In Progress" },
          { summary: "Fix login page styling issue", type: "Bug", priority: "Low", status: "Done" },
          { summary: "Add user profile management", type: "Story", priority: "Medium", status: "To Do" }
        ]
        
        for (const issue of sampleIssues) {
          await issuesApi.create({
            ...issue,
            project_id: response.data?.id || response.project?.id,
            description: `Sample ${issue.type} for demonstration purposes`
          })
        }
        
        toast.success("Project created with sample data!")
      } else {
        toast.success("Project created successfully!")
      }
      
      setIsCreateDialogOpen(false)
      setCreateForm({ name: "", key: "", description: "", create_sample_data: false })
      fetchProjects()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create project")
    }
  }

  const filteredProjects = (projects || []).filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.key.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
            <p className="text-gray-600">Manage and track your project progress</p>
          </div>
          {checkPermission(userPermissions, 'project.create') && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="Enter project name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="key">Project Key</Label>
                    <Input
                      id="key"
                      value={createForm.key}
                      onChange={(e) => setCreateForm({ ...createForm, key: e.target.value.toUpperCase() })}
                      placeholder="e.g., PROJ"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      placeholder="Enter project description"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="sample_data"
                      checked={createForm.create_sample_data}
                      onChange={(e) => setCreateForm({ ...createForm, create_sample_data: e.target.checked })}
                    />
                    <Label htmlFor="sample_data">Create Kanban board with sample data</Label>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Project</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first project</p>
            {checkPermission(userPermissions, 'project.create') && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Button>
                </DialogTrigger>
              </Dialog>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/projects/${project.id}`)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{project.key}</Badge>
                          <Badge variant="default">Active</Badge>
                        </div>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {checkPermission(userPermissions, 'project.view') && (
                            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}`)}>
                              View Project Details
                            </DropdownMenuItem>
                          )}
                          {checkPermission(userPermissions, 'project.view') && (
                            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/board`)}>
                              View Board
                            </DropdownMenuItem>
                          )}
                          {checkPermission(userPermissions, 'issue.create') && (
                            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/epics`)}>
                              Manage Epics
                            </DropdownMenuItem>
                          )}
                          {checkPermission(userPermissions, 'team.add_members') && (
                            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/team`)}>
                              Manage Team
                            </DropdownMenuItem>
                          )}
                          {checkPermission(userPermissions, 'project.edit') && (
                            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/settings`)}>
                              Project Settings
                            </DropdownMenuItem>
                          )}
                          {checkPermission(userPermissions, 'report.view') && (
                            <DropdownMenuItem onClick={() => router.push(`/projects/${project.id}/reports`)}>
                              View Reports
                            </DropdownMenuItem>
                          )}
                          {checkPermission(userPermissions, 'project.delete') && (
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Are you sure you want to delete this project?')) {
                                  // Add delete functionality here
                                  toast.error('Delete functionality not implemented yet')
                                }
                              }}
                              className="text-red-600"
                            >
                              Delete Project
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{project.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.stats.progress}%</span>
                      </div>
                      <Progress value={project.stats.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>
                          {project.stats.completedIssues}/{project.stats.totalIssues} issues
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">Lead:</span>
                        <span className="text-sm font-medium">{project.lead.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{project.stats.teamSize}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
    </AppLayout>
  )
}