"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FolderOpen, Users, Settings, BarChart3, Kanban, 
  Target, GitBranch, Calendar, User, Plus, Clock, CheckCircle 
} from "lucide-react"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { projectsAPI, usersAPI, sprintsAPI, rolesAPI } from "@/lib/api"
import { Input } from "@/components/ui/input"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [issues, setIssues] = useState<any[]>([])
  const [team, setTeam] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [epics, setEpics] = useState<any[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const [sprintName, setSprintName] = useState("")
  const [sprintStartDate, setSprintStartDate] = useState("")
  const [sprintEndDate, setSprintEndDate] = useState("")

  useEffect(() => {
    if (params.id) {
      fetchProjectDetails()
    }
  }, [params.id])

  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch project details
      const projectResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/projects/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (projectResponse.ok) {
        const projectData = await projectResponse.json()
        setProject(projectData.project)
      }

      // Fetch project issues
      const issuesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/issues?project_id=${params.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (issuesResponse.ok) {
        const issuesData = await issuesResponse.json()
        setIssues(issuesData.issues || [])
        
        // Filter epics from issues (case-insensitive)
        const epicIssues = issuesData.issues?.filter(issue => 
          issue.type?.toLowerCase() === 'epic'
        ) || []
        setEpics(epicIssues)
      }

      // Fetch team data
      const teamResponse = await projectsAPI.getTeamMembers(parseInt(params.id))
      setTeam(teamResponse.teamMembers || [])
      
      // Fetch all users for adding team members
      const usersResponse = await usersAPI.getAll()
      setUsers(usersResponse.users || [])

      // Fetch roles for team member assignment
      const rolesResponse = await rolesAPI.getAll()
      setRoles(rolesResponse || [])

      // Fetch sprints
      const sprintsResponse = await sprintsAPI.getAll({ project_id: parseInt(params.id) })
      setSprints(sprintsResponse.sprints || [])

    } catch (error) {
      toast.error("Failed to fetch project details")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSprint = async () => {
    if (!sprintName) {
      toast.error("Sprint name is required")
      return
    }

    try {
      await sprintsAPI.create({
        project_id: parseInt(params.id),
        name: sprintName,
        start_date: sprintStartDate || undefined,
        end_date: sprintEndDate || undefined
      })
      toast.success("Sprint created successfully")
      setIsCreateSprintOpen(false)
      setSprintName("")
      setSprintStartDate("")
      setSprintEndDate("")
      fetchProjectDetails() // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create sprint")
    }
  }

  const handleStartSprint = async (sprintId: number) => {
    try {
      await sprintsAPI.update(sprintId, { status: "Active" })
      toast.success("Sprint started successfully")
      fetchProjectDetails()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to start sprint")
    }
  }

  const handleCompleteSprint = async (sprintId: number) => {
    try {
      await sprintsAPI.update(sprintId, { status: "Completed" })
      toast.success("Sprint completed successfully")
      fetchProjectDetails()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to complete sprint")
    }
  }

  const handleAddTeamMember = async () => {
    if (!selectedUser) {
      toast.error("Please select a user")
      return
    }

    try {
      await projectsAPI.addTeamMember(parseInt(params.id), parseInt(selectedUser), selectedRole)
      toast.success("Team member added successfully")
      setIsAddMemberOpen(false)
      setSelectedUser("")
      setSelectedRole(roles.length > 0 ? roles[0].name : "")
      fetchProjectDetails() // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add team member")
    }
  }

  const handleRemoveTeamMember = async (userId: number) => {
    try {
      await projectsAPI.removeTeamMember(parseInt(params.id), userId)
      toast.success("Team member removed successfully")
      fetchProjectDetails() // Refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to remove team member")
    }
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

  if (!project) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Project not found</h1>
          <Button className="mt-4" onClick={() => router.push('/projects')}>
            Back to Projects
          </Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Project Header */}
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <FolderOpen className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{project.name}</h1>
                <div className="flex items-center space-x-4 text-blue-100">
                  <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">{project.key}</span>
                  <span>•</span>
                  <span>{project.description}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/30" onClick={() => router.push(`/work-items/new?project=${project.id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Work Item
              </Button>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/30" onClick={() => router.push(`/bugs/new?project=${project.id}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Bug Report
              </Button>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-white/30" onClick={() => router.push(`/projects/${project.id}/settings`)}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{issues.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <GitBranch className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Epics</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{epics.length}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Team Members</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{team.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-orange-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Sprints</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{sprints.filter(s => s.status === 'Active').length}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Management Tabs */}
        <Tabs defaultValue="board" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="board">View Board</TabsTrigger>
            <TabsTrigger value="sprints">Manage Sprints</TabsTrigger>
            <TabsTrigger value="epics">Manage Epics</TabsTrigger>
            <TabsTrigger value="team">Manage Team</TabsTrigger>
            <TabsTrigger value="settings">Project Settings</TabsTrigger>
            <TabsTrigger value="reports">View Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Kanban className="h-5 w-5 mr-2" />
                  Project Board
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-red-800 text-lg">To Do</h3>
                      <Badge variant="secondary" className="bg-red-200 text-red-800">
                        {issues.filter(issue => issue.status === 'To Do').length}
                      </Badge>
                    </div>
                    <div className="space-y-3 min-h-[120px]">
                      {issues.filter(issue => issue.status === 'To Do').slice(0, 3).length > 0 ? (
                        issues.filter(issue => issue.status === 'To Do').slice(0, 3).map(issue => (
                          <div key={issue.id} className="bg-white p-4 rounded-lg border border-red-100 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-red-300">
                            <p className="font-semibold text-gray-900 text-sm mb-2">{issue.summary}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                              <span className="text-xs text-gray-500">{issue.key}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-red-600 py-8">
                          <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <GitBranch className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium">No issues in To Do</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-yellow-800 text-lg">In Progress</h3>
                      <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                        {issues.filter(issue => issue.status === 'In Progress').length}
                      </Badge>
                    </div>
                    <div className="space-y-3 min-h-[120px]">
                      {issues.filter(issue => issue.status === 'In Progress').slice(0, 3).length > 0 ? (
                        issues.filter(issue => issue.status === 'In Progress').slice(0, 3).map(issue => (
                          <div key={issue.id} className="bg-white p-4 rounded-lg border border-yellow-100 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-yellow-300">
                            <p className="font-semibold text-gray-900 text-sm mb-2">{issue.summary}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                              <span className="text-xs text-gray-500">{issue.key}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-yellow-600 py-8">
                          <div className="w-12 h-12 bg-yellow-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Clock className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium">No issues in progress</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-green-800 text-lg">Done</h3>
                      <Badge variant="secondary" className="bg-green-200 text-green-800">
                        {issues.filter(issue => issue.status === 'Done').length}
                      </Badge>
                    </div>
                    <div className="space-y-3 min-h-[120px]">
                      {issues.filter(issue => issue.status === 'Done').slice(0, 3).length > 0 ? (
                        issues.filter(issue => issue.status === 'Done').slice(0, 3).map(issue => (
                          <div key={issue.id} className="bg-white p-4 rounded-lg border border-green-100 cursor-pointer hover:shadow-md transition-all duration-200 hover:border-green-300">
                            <p className="font-semibold text-gray-900 text-sm mb-2">{issue.summary}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                              <span className="text-xs text-gray-500">{issue.key}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-green-600 py-8">
                          <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <CheckCircle className="h-6 w-6" />
                          </div>
                          <p className="text-sm font-medium">No completed issues</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center space-x-2">
                  <Button onClick={() => router.push(`/projects/${project.id}/board`)}>
                    View Board
                  </Button>
                  <Button variant="outline" onClick={() => router.push(`/projects/${project.id}/backlog`)}>
                    Manage Backlog
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sprints" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Sprint Management
                  </CardTitle>
                  <Button onClick={() => setIsCreateSprintOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Sprint
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {sprints.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sprints yet</h3>
                    <p className="text-gray-500 mb-4">Create your first sprint to start organizing work</p>
                    <Button onClick={() => setIsCreateSprintOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Sprint
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sprints.map(sprint => (
                      <div key={sprint.id} className="border rounded-lg p-6 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{sprint.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span>Status: <Badge variant={sprint.status === 'Active' ? 'default' : sprint.status === 'Completed' ? 'secondary' : 'outline'}>{sprint.status}</Badge></span>
                              {sprint.start_date && <span>Start: {new Date(sprint.start_date).toLocaleDateString()}</span>}
                              {sprint.end_date && <span>End: {new Date(sprint.end_date).toLocaleDateString()}</span>}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {sprint.status === 'Planning' && (
                              <Button size="sm" onClick={() => handleStartSprint(sprint.id)}>
                                Start Sprint
                              </Button>
                            )}
                            {sprint.status === 'Active' && (
                              <Button size="sm" variant="outline" onClick={() => handleCompleteSprint(sprint.id)}>
                                Complete Sprint
                              </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={() => router.push(`/sprints/${sprint.id}`)}>
                              View Details
                            </Button>
                          </div>
                        </div>
                        
                        {sprint.stats && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                            <div className="text-center">
                              <p className="text-2xl font-bold text-blue-600">{sprint.stats.totalIssues}</p>
                              <p className="text-xs text-gray-500">Total Issues</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-green-600">{sprint.stats.completedIssues}</p>
                              <p className="text-xs text-gray-500">Completed</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-yellow-600">{sprint.stats.inProgressIssues}</p>
                              <p className="text-xs text-gray-500">In Progress</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold text-gray-600">{sprint.stats.progress}%</p>
                              <p className="text-xs text-gray-500">Progress</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="epics" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Epic Management
                  </CardTitle>
                  <Button onClick={() => router.push(`/issues/new?type=Epic&project=${project.id}`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Epic
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {epics.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No epics found</p>
                    <Button className="mt-4" onClick={() => router.push(`/issues/new?type=Epic&project=${project.id}`)}>
                      Create First Epic
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {epics.map(epic => (
                      <div key={epic.id} className="border rounded-lg p-4 hover:shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{epic.summary}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{epic.key}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">Epic</Badge>
                            <Button variant="outline" size="sm" onClick={() => router.push(`/issues/${epic.id}`)}>
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Team Management
                  </CardTitle>
                  <Button onClick={() => setIsAddMemberOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {team.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No team members yet</h3>
                    <p className="text-gray-500 mb-4">Add team members to collaborate on this project</p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Member
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {team.map(member => (
                      <div key={member.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                              {member.avatar}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900">{member.username}</h3>
                              <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                            </div>
                          </div>
                          {member.role !== 'lead' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveTeamMember(member.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  Project Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium">Project Name</label>
                        <p className="text-sm text-muted-foreground">{project.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Project Key</label>
                        <p className="text-sm text-muted-foreground">{project.key}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{project.description}</p>
                  </div>
                  
                  <Button>Edit Project Settings</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Project Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Burndown Chart</h3>
                      <p className="text-sm text-gray-600">Track sprint progress</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <GitBranch className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Issue Summary</h3>
                      <p className="text-sm text-gray-600">Overview of all issues</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Users className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Team Workload</h3>
                      <p className="text-sm text-gray-600">Analyze team capacity</p>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-4">
                  <Link href="/reports/enhanced">
                    <Button>View All Reports</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Team Member Dialog */}
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user">Select User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(user => !team.some(member => member.id === user.id)).map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name} {role.isSystem && '(System)'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTeamMember}>
                Add Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Sprint Dialog */}
      <Dialog open={isCreateSprintOpen} onOpenChange={setIsCreateSprintOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="sprintName">Sprint Name</Label>
              <Input
                id="sprintName"
                value={sprintName}
                onChange={(e) => setSprintName(e.target.value)}
                placeholder="Enter sprint name"
              />
            </div>
            <div>
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="date"
                value={sprintStartDate}
                onChange={(e) => setSprintStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={sprintEndDate}
                onChange={(e) => setSprintEndDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateSprintOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSprint}>
                Create Sprint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}