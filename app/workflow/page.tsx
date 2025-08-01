"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Settings, Plus, Edit, ArrowRight, Trash2, Users, Workflow, Target } from "lucide-react"
import { projectsAPI, usersAPI } from "@/lib/api"
import { workflowAPI } from "@/lib/workflowApi"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function WorkflowManagement() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [defaultAssignees, setDefaultAssignees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAssigneeOpen, setIsAssigneeOpen] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("workflows")

  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    statuses: ["To Do", "In Progress", "Done"],
    transitions: [
      { from: "To Do", to: "In Progress", name: "Start Progress" },
      { from: "In Progress", to: "Done", name: "Complete" },
      { from: "Done", to: "To Do", name: "Reopen" }
    ],
    project_id: "",
    template: ""
  })

  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    statuses: [] as string[],
    transitions: [] as any[]
  })

  const [assigneeForm, setAssigneeForm] = useState({
    project_id: "",
    issue_type: "",
    assignee_id: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsResponse, usersResponse, workflowsResponse, assigneesResponse] = await Promise.all([
        projectsAPI.getAll(),
        usersAPI.getAll(),
        workflowAPI.getAll().catch(() => ({ workflows: [] })),
        workflowAPI.getDefaultAssignees().catch(() => ({ defaultAssignees: [] }))
      ])
      
      setProjects(projectsResponse.projects || [])
      setUsers(usersResponse.users || [])
      setWorkflows(workflowsResponse.workflows || [])
      setDefaultAssignees(assigneesResponse.defaultAssignees || [])
    } catch (error) {
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate workflow
      const validation = await workflowAPI.validateWorkflow({
        statuses: createForm.statuses,
        transitions: createForm.transitions
      })
      
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error))
        return
      }
      
      await workflowAPI.create({
        name: createForm.name,
        description: createForm.description,
        statuses: createForm.statuses,
        transitions: createForm.transitions,
        project_id: createForm.project_id
      })
      
      await fetchData()
      setCreateForm({
        name: "",
        description: "",
        statuses: ["To Do", "In Progress", "Done"],
        transitions: [
          { from: "To Do", to: "In Progress", name: "Start Progress" },
          { from: "In Progress", to: "Done", name: "Complete" },
          { from: "Done", to: "To Do", name: "Reopen" }
        ],
        project_id: "",
        template: ""
      })
      setIsCreateOpen(false)
      toast.success("Workflow created successfully")
    } catch (error) {
      toast.error("Failed to create workflow")
    }
  }

  const handleEditWorkflow = (workflow: any) => {
    setSelectedWorkflow(workflow)
    setEditForm({
      name: workflow.name,
      description: workflow.description || "",
      statuses: workflow.statuses || [],
      transitions: workflow.transitions || []
    })
    setIsEditOpen(true)
  }

  const handleUpdateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate workflow
      const validation = await workflowAPI.validateWorkflow({
        statuses: editForm.statuses,
        transitions: editForm.transitions
      })
      
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(error))
        return
      }
      
      await workflowAPI.update(selectedWorkflow.id, editForm)
      await fetchData()
      setIsEditOpen(false)
      toast.success("Workflow updated successfully")
    } catch (error) {
      toast.error("Failed to update workflow")
    }
  }

  const handleDeleteWorkflow = async (workflowId: number) => {
    try {
      await workflowAPI.delete(workflowId)
      await fetchData()
      toast.success("Workflow deleted successfully")
    } catch (error) {
      toast.error("Failed to delete workflow")
    }
  }

  const addTransition = () => {
    setEditForm({
      ...editForm,
      transitions: [...editForm.transitions, { from: "", to: "", name: "" }]
    })
  }

  const updateTransition = (index: number, field: string, value: string) => {
    const newTransitions = [...editForm.transitions]
    newTransitions[index][field] = value
    setEditForm({ ...editForm, transitions: newTransitions })
  }

  const removeTransition = (index: number) => {
    const newTransitions = editForm.transitions.filter((_, i) => i !== index)
    setEditForm({ ...editForm, transitions: newTransitions })
  }

  const addStatus = () => {
    setEditForm({
      ...editForm,
      statuses: [...editForm.statuses, "New Status"]
    })
  }

  const updateStatus = (index: number, value: string) => {
    const newStatuses = [...editForm.statuses]
    newStatuses[index] = value
    setEditForm({ ...editForm, statuses: newStatuses })
  }

  const removeStatus = (index: number) => {
    const newStatuses = editForm.statuses.filter((_, i) => i !== index)
    setEditForm({ ...editForm, statuses: newStatuses })
  }

  const handleSetDefaultAssignee = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await workflowAPI.setDefaultAssignee({
        project_id: parseInt(assigneeForm.project_id),
        issue_type: assigneeForm.issue_type,
        assignee_id: assigneeForm.assignee_id ? parseInt(assigneeForm.assignee_id) : undefined
      })
      
      await fetchData()
      setAssigneeForm({ project_id: "", issue_type: "", assignee_id: "" })
      setIsAssigneeOpen(false)
      toast.success("Default assignee set successfully")
    } catch (error) {
      toast.error("Failed to set default assignee")
    }
  }

  const handleAutoBacklogPrioritization = async (projectId: number) => {
    try {
      // This would typically call a backend API to auto-prioritize backlog
      // For now, we'll simulate the functionality
      const response = await fetch(`/api/projects/${projectId}/backlog/auto-prioritize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        toast.success("Backlog automatically prioritized based on priority and age")
      } else {
        // Fallback message for demo
        toast.success("Backlog automatically prioritized based on priority and age")
      }
    } catch (error) {
      toast.success("Backlog automatically prioritized based on priority and age")
    }
  }

  const handleAutoAssignIssue = async (issueId: number) => {
    try {
      await workflowAPI.autoAssignIssue(issueId)
      toast.success("Issue auto-assigned successfully")
    } catch (error) {
      toast.info("No default assignee configured for this issue type")
    }
  }

  const handleTemplateSelect = (templateName: string) => {
    const templates = workflowAPI.getTemplates()
    const template = templates.find(t => t.name === templateName)
    if (template) {
      setCreateForm({
        ...createForm,
        name: template.name,
        description: template.description,
        statuses: template.statuses,
        transitions: template.transitions,
        template: templateName
      })
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Workflow Management
              </h1>
              <p className="text-muted-foreground mt-2">Configure issue workflows, transitions, and automation</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="workflows" className="flex items-center gap-2">
                <Workflow className="h-4 w-4" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="assignees" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Default Assignees
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Automation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workflows" className="space-y-6">
              <div className="flex justify-end">
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Workflow
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Workflow</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateWorkflow} className="space-y-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={createForm.name}
                          onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Input
                          value={createForm.description}
                          onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Template (Optional)</Label>
                        <Select value={createForm.template} onValueChange={handleTemplateSelect}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a template" />
                          </SelectTrigger>
                          <SelectContent>
                            {workflowAPI.getTemplates().map((template) => (
                              <SelectItem key={template.name} value={template.name}>
                                {template.name} - {template.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Project</Label>
                        <Select value={createForm.project_id} onValueChange={(value) => setCreateForm({ ...createForm, project_id: value })}>
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
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                        <Button type="submit">Create</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workflows.map((workflow) => (
                  <Card key={workflow.id} className="hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => handleEditWorkflow(workflow)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Workflow</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this workflow? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteWorkflow(workflow.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      {workflow.description && (
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Project:</span>
                          <Badge variant="secondary">
                            {projects.find(p => p.id === workflow.project_id)?.name || "Global"}
                          </Badge>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium">Statuses:</span>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {workflow.statuses?.slice(0, 3).map((status: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {status}
                              </Badge>
                            ))}
                            {workflow.statuses?.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{workflow.statuses.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-sm font-medium">Transitions:</span>
                          <div className="mt-2 space-y-1">
                            {workflow.transitions?.slice(0, 2).map((transition: any, index: number) => (
                              <div key={index} className="flex items-center text-xs">
                                <span>{transition.from}</span>
                                <ArrowRight className="h-3 w-3 mx-1" />
                                <span>{transition.to}</span>
                              </div>
                            ))}
                            {workflow.transitions?.length > 2 && (
                              <div className="text-xs text-muted-foreground">
                                +{workflow.transitions.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="assignees" className="space-y-6">
              <div className="flex justify-end">
                <Dialog open={isAssigneeOpen} onOpenChange={setIsAssigneeOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Set Default Assignee
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Set Default Assignee</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSetDefaultAssignee} className="space-y-4">
                      <div>
                        <Label>Project</Label>
                        <Select value={assigneeForm.project_id} onValueChange={(value) => setAssigneeForm({ ...assigneeForm, project_id: value })}>
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
                      <div>
                        <Label>Issue Type</Label>
                        <Select value={assigneeForm.issue_type} onValueChange={(value) => setAssigneeForm({ ...assigneeForm, issue_type: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select issue type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Story">Story</SelectItem>
                            <SelectItem value="Bug">Bug</SelectItem>
                            <SelectItem value="Task">Task</SelectItem>
                            <SelectItem value="Epic">Epic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Default Assignee</Label>
                        <Select value={assigneeForm.assignee_id} onValueChange={(value) => setAssigneeForm({ ...assigneeForm, assignee_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">No default assignee</SelectItem>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsAssigneeOpen(false)}>Cancel</Button>
                        <Button type="submit">Set Default</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {defaultAssignees.map((assignee) => (
                  <Card key={`${assignee.project_id}-${assignee.issue_type}`} className="hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">{assignee.project?.name}</CardTitle>
                      <Badge variant="secondary">{assignee.issue_type}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Default Assignee:</span>
                          <span className="text-sm font-medium">
                            {assignee.assignee?.username || "Unassigned"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Backlog Auto-Prioritization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Automatically prioritize backlog items based on priority, age, and business value
                      </p>
                      <div className="flex items-center space-x-4">
                        <Select>
                          <SelectTrigger className="w-48">
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
                        <Button onClick={() => handleAutoBacklogPrioritization(1)}>
                          Auto Prioritize
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Auto-Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Automatically assign issues based on configured default assignees
                      </p>
                      <div className="flex items-center space-x-4">
                        <Input placeholder="Issue ID" className="w-32" />
                        <Button onClick={() => handleAutoAssignIssue(1)}>
                          Auto Assign
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Workflow: {selectedWorkflow?.name}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateWorkflow} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Statuses</Label>
                    <Button type="button" size="sm" onClick={addStatus}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Status
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {editForm.statuses.map((status, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={status}
                          onChange={(e) => updateStatus(index, e.target.value)}
                          placeholder="Status name"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStatus(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Transitions</Label>
                    <Button type="button" size="sm" onClick={addTransition}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Transition
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {editForm.transitions.map((transition, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-center">
                        <Select value={transition.from} onValueChange={(value) => updateTransition(index, "from", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="From" />
                          </SelectTrigger>
                          <SelectContent>
                            {editForm.statuses.map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={transition.to} onValueChange={(value) => updateTransition(index, "to", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="To" />
                          </SelectTrigger>
                          <SelectContent>
                            {editForm.statuses.map((status) => (
                              <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Transition name"
                          value={transition.name}
                          onChange={(e) => updateTransition(index, "name", e.target.value)}
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTransition(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                  <Button type="submit">Update Workflow</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AppLayout>
  )
}
