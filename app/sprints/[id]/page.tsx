"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, Clock, Target, BarChart3, Plus, 
  CheckCircle, AlertCircle, User, ArrowLeft, Edit, 
  MessageSquare, Timer, Flag, Users
} from "lucide-react"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { sprintsAPI, issuesAPI, usersAPI, commentsAPI, worklogAPI } from "@/lib/api"

export default function SprintDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [sprint, setSprint] = useState<any>(null)
  const [availableIssues, setAvailableIssues] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [isCommentOpen, setIsCommentOpen] = useState(false)
  const [isTimeLogOpen, setIsTimeLogOpen] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState("")
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [taskForm, setTaskForm] = useState({ summary: "", description: "", type: "Task", priority: "Medium", assignee_id: "unassigned" })
  const [comment, setComment] = useState("")
  const [timeSpent, setTimeSpent] = useState("")
  const [timeComment, setTimeComment] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchSprintDetails()
    }
  }, [params.id])

  const fetchSprintDetails = async () => {
    try {
      // Fetch sprint details
      const sprintResponse = await sprintsAPI.getById(parseInt(params.id))
      setSprint(sprintResponse.sprint)

      // Fetch available issues (not in any sprint)
      const issuesResponse = await issuesAPI.getAll({ 
        project_id: sprintResponse.sprint.project_id 
      })
      
      // Filter out issues already in sprints
      const sprintIssueIds = sprintResponse.sprint.issues?.map((si: any) => si.issue.id) || []
      const available = issuesResponse.issues?.filter((issue: any) => 
        !sprintIssueIds.includes(issue.id)
      ) || []
      setAvailableIssues(available)

      // Fetch users for assignment
      const usersResponse = await usersAPI.getAll()
      setUsers(usersResponse.users || [])

    } catch (error) {
      toast.error("Failed to fetch sprint details")
    } finally {
      setLoading(false)
    }
  }

  const handleAddIssue = async () => {
    if (!selectedIssue) {
      toast.error("Please select an issue")
      return
    }

    try {
      await sprintsAPI.addIssue(parseInt(params.id), parseInt(selectedIssue))
      toast.success("Issue added to sprint successfully")
      setIsAddIssueOpen(false)
      setSelectedIssue("")
      fetchSprintDetails()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add issue to sprint")
    }
  }

  const handleRemoveIssue = async (issueId: number) => {
    try {
      await sprintsAPI.removeIssue(parseInt(params.id), issueId)
      toast.success("Issue removed from sprint successfully")
      fetchSprintDetails()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to remove issue from sprint")
    }
  }

  const handleUpdateIssueStatus = async (issueId: number, status: string) => {
    try {
      await issuesAPI.update(issueId, { status })
      toast.success("Issue status updated successfully")
      fetchSprintDetails()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update issue status")
    }
  }

  const handleCreateTask = async () => {
    if (!taskForm.summary) {
      toast.error("Task summary is required")
      return
    }

    try {
      const newTask = await issuesAPI.create({
        project_id: sprint.project_id,
        summary: taskForm.summary,
        description: taskForm.description,
        type: taskForm.type,
        priority: taskForm.priority,
        assignee_id: taskForm.assignee_id && taskForm.assignee_id !== "unassigned" ? parseInt(taskForm.assignee_id) : undefined
      })
      
      await sprintsAPI.addIssue(parseInt(params.id), newTask.issue.id)
      toast.success("Task created and added to sprint successfully")
      setIsCreateTaskOpen(false)
      setTaskForm({ summary: "", description: "", type: "Task", priority: "Medium", assignee_id: "unassigned" })
      fetchSprintDetails()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create task")
    }
  }

  const handleEditTask = async () => {
    if (!selectedTask || !taskForm.summary) return

    try {
      await issuesAPI.update(selectedTask.id, {
        summary: taskForm.summary,
        description: taskForm.description,
        priority: taskForm.priority,
        assignee_id: taskForm.assignee_id && taskForm.assignee_id !== "unassigned" ? parseInt(taskForm.assignee_id) : undefined
      })
      toast.success("Task updated successfully")
      setIsEditTaskOpen(false)
      setSelectedTask(null)
      fetchSprintDetails()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update task")
    }
  }

  const handleAddComment = async () => {
    if (!selectedTask || !comment) return

    try {
      await commentsAPI.add(selectedTask.id, comment)
      toast.success("Comment added successfully")
      setIsCommentOpen(false)
      setComment("")
      setSelectedTask(null)
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add comment")
    }
  }

  const handleLogTime = async () => {
    if (!selectedTask || !timeSpent) return

    try {
      await worklogAPI.log(selectedTask.id, parseInt(timeSpent), timeComment)
      toast.success("Time logged successfully")
      setIsTimeLogOpen(false)
      setTimeSpent("")
      setTimeComment("")
      setSelectedTask(null)
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to log time")
    }
  }

  const openEditTask = (task: any) => {
    setSelectedTask(task)
    setTaskForm({
      summary: task.summary,
      description: task.description || "",
      type: task.type,
      priority: task.priority || "Medium",
      assignee_id: task.assignee_id?.toString() || "unassigned"
    })
    setIsEditTaskOpen(true)
  }

  const openCommentDialog = (task: any) => {
    setSelectedTask(task)
    setIsCommentOpen(true)
  }

  const openTimeLogDialog = (task: any) => {
    setSelectedTask(task)
    setIsTimeLogOpen(true)
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

  if (!sprint) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900">Sprint not found</h1>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </AppLayout>
    )
  }

  const sprintIssues = sprint.issues?.map((si: any) => si.issue) || []
  const todoIssues = sprintIssues.filter((issue: any) => issue.status === 'To Do')
  const inProgressIssues = sprintIssues.filter((issue: any) => issue.status === 'In Progress')
  const doneIssues = sprintIssues.filter((issue: any) => issue.status === 'Done')

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Sprint Header */}
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 text-white rounded-xl p-8 shadow-2xl">
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
                <Calendar className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">{sprint.name}</h1>
                <div className="flex items-center space-x-4 text-blue-100">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    {sprint.status}
                  </Badge>
                  {sprint.start_date && (
                    <span>Start: {new Date(sprint.start_date).toLocaleDateString()}</span>
                  )}
                  {sprint.end_date && (
                    <span>End: {new Date(sprint.end_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 border-white/30"
                onClick={() => setIsCreateTaskOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 border-white/30"
                onClick={() => setIsAddIssueOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Existing
              </Button>
            </div>
          </div>
        </div>

        {/* Sprint Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Issues</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{sprintIssues.length}</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{inProgressIssues.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{doneIssues.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {sprintIssues.length > 0 ? Math.round((doneIssues.length / sprintIssues.length) * 100) : 0}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sprint Board */}
        <Tabs defaultValue="board" className="w-full">
          <TabsList>
            <TabsTrigger value="board">Sprint Board</TabsTrigger>
            <TabsTrigger value="issues">Issue List</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sprint Board</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* To Do Column */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-red-800 text-lg">To Do</h3>
                      <Badge variant="secondary" className="bg-red-200 text-red-800">
                        {todoIssues.length}
                      </Badge>
                    </div>
                    <div className="space-y-3 min-h-[300px]">
                      {todoIssues.map((issue: any) => (
                        <div key={issue.id} className="bg-white p-4 rounded-lg border border-red-100 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">{issue.key}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateIssueStatus(issue.id, 'In Progress')}
                            >
                              Start
                            </Button>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm mb-2">{issue.summary}</p>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                            {issue.assignee && (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{issue.assignee.username}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditTask(issue)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openCommentDialog(issue)}>
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openTimeLogDialog(issue)}>
                              <Timer className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRemoveIssue(issue.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* In Progress Column */}
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-yellow-800 text-lg">In Progress</h3>
                      <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
                        {inProgressIssues.length}
                      </Badge>
                    </div>
                    <div className="space-y-3 min-h-[300px]">
                      {inProgressIssues.map((issue: any) => (
                        <div key={issue.id} className="bg-white p-4 rounded-lg border border-yellow-100 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">{issue.key}</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleUpdateIssueStatus(issue.id, 'Done')}
                            >
                              Complete
                            </Button>
                          </div>
                          <p className="font-semibold text-gray-900 text-sm mb-2">{issue.summary}</p>
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">{issue.type}</Badge>
                            {issue.assignee && (
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{issue.assignee.username}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={() => openEditTask(issue)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openCommentDialog(issue)}>
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openTimeLogDialog(issue)}>
                              <Timer className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRemoveIssue(issue.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Done Column */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-green-800 text-lg">Done</h3>
                      <Badge variant="secondary" className="bg-green-200 text-green-800">
                        {doneIssues.length}
                      </Badge>
                    </div>
                    <div className="space-y-3 min-h-[300px]">
                      {doneIssues.map((issue: any) => (
                        <div key={issue.id} className="bg-white p-4 rounded-lg border border-green-100 hover:shadow-md transition-all duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">{issue.key}</span>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="font-semibold text-gray-900 text-sm mb-2">{issue.summary}</p>
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
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sprint Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {sprintIssues.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No issues in this sprint</h3>
                    <p className="text-gray-500 mb-4">Add issues to start working on this sprint</p>
                    <Button onClick={() => setIsAddIssueOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Issue
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sprintIssues.map((issue: any) => (
                      <div key={issue.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-500">{issue.key}</span>
                            <h3 className="font-semibold text-gray-900">{issue.summary}</h3>
                            <Badge variant="outline">{issue.type}</Badge>
                            <Badge variant={
                              issue.status === 'Done' ? 'default' : 
                              issue.status === 'In Progress' ? 'secondary' : 'outline'
                            }>
                              {issue.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            {issue.assignee && (
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-600">{issue.assignee.username}</span>
                              </div>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => openEditTask(issue)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openCommentDialog(issue)}>
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => openTimeLogDialog(issue)}>
                              <Timer className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => router.push(`/issues/${issue.id}`)}
                            >
                              View
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRemoveIssue(issue.id)}
                            >
                              Remove
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
        </Tabs>
      </div>

      {/* Add Issue Dialog */}
      <Dialog open={isAddIssueOpen} onOpenChange={setIsAddIssueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Issue to Sprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="issue">Select Issue</Label>
              <Select value={selectedIssue} onValueChange={setSelectedIssue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an issue" />
                </SelectTrigger>
                <SelectContent>
                  {availableIssues.map((issue) => (
                    <SelectItem key={issue.id} value={issue.id.toString()}>
                      {issue.key} - {issue.summary}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddIssueOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddIssue}>
                Add Issue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Summary</Label>
              <Input
                value={taskForm.summary}
                onChange={(e) => setTaskForm({...taskForm, summary: e.target.value})}
                placeholder="Enter task summary"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                placeholder="Enter task description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={taskForm.type} onValueChange={(value) => setTaskForm({...taskForm, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Task">Task</SelectItem>
                    <SelectItem value="Story">Story</SelectItem>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assignee</Label>
                <Select value={taskForm.assignee_id} onValueChange={(value) => setTaskForm({...taskForm, assignee_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
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
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Task Summary</Label>
              <Input
                value={taskForm.summary}
                onChange={(e) => setTaskForm({...taskForm, summary: e.target.value})}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={(value) => setTaskForm({...taskForm, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assignee</Label>
                <Select value={taskForm.assignee_id} onValueChange={(value) => setTaskForm({...taskForm, assignee_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
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
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>Cancel</Button>
              <Button onClick={handleEditTask}>Update Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog open={isCommentOpen} onOpenChange={setIsCommentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Comment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Comment</Label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Enter your comment"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCommentOpen(false)}>Cancel</Button>
              <Button onClick={handleAddComment}>Add Comment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Time Dialog */}
      <Dialog open={isTimeLogOpen} onOpenChange={setIsTimeLogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Work Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Time Spent (hours)</Label>
              <Input
                type="number"
                value={timeSpent}
                onChange={(e) => setTimeSpent(e.target.value)}
                placeholder="Enter hours worked"
              />
            </div>
            <div>
              <Label>Work Description (Optional)</Label>
              <Textarea
                value={timeComment}
                onChange={(e) => setTimeComment(e.target.value)}
                placeholder="Describe the work done"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsTimeLogOpen(false)}>Cancel</Button>
              <Button onClick={handleLogTime}>Log Time</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  )
}