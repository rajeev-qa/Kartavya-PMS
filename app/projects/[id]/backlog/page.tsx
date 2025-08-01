"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Plus, ArrowLeft, Edit, Trash2, User, Flag, 
  Calendar, Target, Filter, Search, GripVertical
} from "lucide-react"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"
import { projectsAPI, issuesAPI, sprintsAPI, usersAPI } from "@/lib/api"

export default function BacklogPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [backlogIssues, setBacklogIssues] = useState<any[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false)
  const [isEditIssueOpen, setIsEditIssueOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [issueForm, setIssueForm] = useState({
    summary: "", description: "", type: "Story", priority: "Medium", 
    assignee_id: "unassigned", story_points: ""
  })
  const [filterType, setFilterType] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchBacklogData()
    }
  }, [params.id])

  const fetchBacklogData = async () => {
    try {
      // Fetch project details
      const projectResponse = await projectsAPI.getById(parseInt(params.id))
      setProject(projectResponse.project)

      // Fetch all issues not in any sprint (backlog)
      const issuesResponse = await issuesAPI.getAll({ project_id: parseInt(params.id) })
      const allIssues = issuesResponse.issues || []

      // Fetch sprints to filter out issues already in sprints
      const sprintsResponse = await sprintsAPI.getAll({ project_id: parseInt(params.id) })
      const sprintData = sprintsResponse.sprints || []
      setSprints(sprintData)

      // Get all issue IDs that are in sprints
      const sprintIssueIds = new Set()
      sprintData.forEach((sprint: any) => {
        sprint.issues?.forEach((si: any) => {
          sprintIssueIds.add(si.issue.id)
        })
      })

      // Filter backlog issues (not in any sprint)
      const backlog = allIssues.filter((issue: any) => !sprintIssueIds.has(issue.id))
      setBacklogIssues(backlog)

      // Fetch users
      const usersResponse = await usersAPI.getAll()
      setUsers(usersResponse.users || [])

    } catch (error) {
      toast.error("Failed to fetch backlog data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIssue = async () => {
    if (!issueForm.summary) {
      toast.error("Issue summary is required")
      return
    }

    try {
      await issuesAPI.create({
        project_id: parseInt(params.id),
        summary: issueForm.summary,
        description: issueForm.description,
        type: issueForm.type,
        priority: issueForm.priority,
        assignee_id: issueForm.assignee_id !== "unassigned" ? parseInt(issueForm.assignee_id) : undefined,
        story_points: issueForm.story_points ? parseInt(issueForm.story_points) : undefined
      })
      toast.success("Issue created successfully")
      setIsCreateIssueOpen(false)
      setIssueForm({ summary: "", description: "", type: "Story", priority: "Medium", assignee_id: "unassigned", story_points: "" })
      fetchBacklogData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create issue")
    }
  }

  const handleEditIssue = async () => {
    if (!selectedIssue || !issueForm.summary) return

    try {
      await issuesAPI.update(selectedIssue.id, {
        summary: issueForm.summary,
        description: issueForm.description,
        priority: issueForm.priority,
        assignee_id: issueForm.assignee_id !== "unassigned" ? parseInt(issueForm.assignee_id) : undefined,
        story_points: issueForm.story_points ? parseInt(issueForm.story_points) : undefined
      })
      toast.success("Issue updated successfully")
      setIsEditIssueOpen(false)
      setSelectedIssue(null)
      fetchBacklogData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update issue")
    }
  }

  const handleDeleteIssue = async (issueId: number) => {
    if (!confirm("Are you sure you want to delete this issue?")) return

    try {
      await issuesAPI.delete(issueId)
      toast.success("Issue deleted successfully")
      fetchBacklogData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete issue")
    }
  }

  const handleAddToSprint = async (issueId: number, sprintId: number) => {
    try {
      await sprintsAPI.addIssue(sprintId, issueId)
      toast.success("Issue added to sprint successfully")
      fetchBacklogData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add issue to sprint")
    }
  }

  const openEditIssue = (issue: any) => {
    setSelectedIssue(issue)
    setIssueForm({
      summary: issue.summary,
      description: issue.description || "",
      type: issue.type,
      priority: issue.priority || "Medium",
      assignee_id: issue.assignee_id?.toString() || "unassigned",
      story_points: issue.story_points?.toString() || ""
    })
    setIsEditIssueOpen(true)
  }

  const filteredIssues = backlogIssues.filter(issue => {
    const matchesType = filterType === "all" || issue.type === filterType
    const matchesPriority = filterPriority === "all" || issue.priority === filterPriority
    const matchesSearch = !searchTerm || 
      issue.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.key.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesPriority && matchesSearch
  })

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
          <Button className="mt-4" onClick={() => router.back()}>Go Back</Button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-600 via-blue-600 to-purple-700 text-white rounded-xl p-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Target className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Product Backlog</h1>
                <p className="text-blue-100">{project.name} - {project.key}</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 border-white/30"
              onClick={() => setIsCreateIssueOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Issue
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters & Search</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <Label>Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
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
                <Select value={filterPriority} onValueChange={setFilterPriority}>
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
              <div className="flex items-end">
                <Button variant="outline" onClick={() => {
                  setFilterType("all")
                  setFilterPriority("all")
                  setSearchTerm("")
                }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backlog Issues */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Backlog Issues ({filteredIssues.length})</CardTitle>
              <div className="text-sm text-gray-500">
                Total Story Points: {filteredIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0)}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No backlog issues</h3>
                <p className="text-gray-500 mb-4">Create your first issue to start building your backlog</p>
                <Button onClick={() => setIsCreateIssueOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Issue
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <div key={issue.id} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                          <span className="text-sm font-medium text-gray-500">{issue.key}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{issue.summary}</h3>
                          <div className="flex items-center space-x-3">
                            <Badge variant="outline">{issue.type}</Badge>
                            <Badge variant={
                              issue.priority === 'Critical' ? 'destructive' :
                              issue.priority === 'High' ? 'default' :
                              issue.priority === 'Medium' ? 'secondary' : 'outline'
                            }>
                              {issue.priority}
                            </Badge>
                            {issue.story_points && (
                              <Badge variant="outline">{issue.story_points} SP</Badge>
                            )}
                            {issue.assignee && (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{issue.assignee.username}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select onValueChange={(sprintId) => handleAddToSprint(issue.id, parseInt(sprintId))}>
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Add to Sprint" />
                          </SelectTrigger>
                          <SelectContent>
                            {sprints.filter(s => s.status !== 'Completed').map((sprint) => (
                              <SelectItem key={sprint.id} value={sprint.id.toString()}>
                                {sprint.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="ghost" onClick={() => openEditIssue(issue)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => router.push(`/issues/${issue.id}`)}>
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteIssue(issue.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Issue Dialog */}
      <Dialog open={isCreateIssueOpen} onOpenChange={setIsCreateIssueOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Summary</Label>
              <Input
                value={issueForm.summary}
                onChange={(e) => setIssueForm({...issueForm, summary: e.target.value})}
                placeholder="Enter issue summary"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={issueForm.description}
                onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                placeholder="Enter issue description"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={issueForm.type} onValueChange={(value) => setIssueForm({...issueForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={issueForm.priority} onValueChange={(value) => setIssueForm({...issueForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assignee</Label>
                <Select value={issueForm.assignee_id} onValueChange={(value) => setIssueForm({...issueForm, assignee_id: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Story Points</Label>
                <Input
                  type="number"
                  value={issueForm.story_points}
                  onChange={(e) => setIssueForm({...issueForm, story_points: e.target.value})}
                  placeholder="Points"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateIssueOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateIssue}>Create Issue</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Issue Dialog */}
      <Dialog open={isEditIssueOpen} onOpenChange={setIsEditIssueOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Summary</Label>
              <Input
                value={issueForm.summary}
                onChange={(e) => setIssueForm({...issueForm, summary: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={issueForm.description}
                onChange={(e) => setIssueForm({...issueForm, description: e.target.value})}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={issueForm.priority} onValueChange={(value) => setIssueForm({...issueForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assignee</Label>
                <Select value={issueForm.assignee_id} onValueChange={(value) => setIssueForm({...issueForm, assignee_id: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Story Points</Label>
                <Input
                  type="number"
                  value={issueForm.story_points}
                  onChange={(e) => setIssueForm({...issueForm, story_points: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditIssueOpen(false)}>Cancel</Button>
              <Button onClick={handleEditIssue}>Update Issue</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}