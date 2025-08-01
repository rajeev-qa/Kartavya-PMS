"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { GitBranch, Plus, Edit, Trash2, ArrowRight } from "lucide-react"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function WorkflowManagement() {
  const [workflows, setWorkflows] = useState<any[]>([])
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    statuses: ["To Do", "In Progress", "Done"],
    transitions: [
      { from: "To Do", to: "In Progress", name: "Start Progress" },
      { from: "In Progress", to: "Done", name: "Complete" },
      { from: "Done", to: "In Progress", name: "Reopen" }
    ]
  })

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const fetchWorkflows = async () => {
    // Mock data - in real app would fetch from API
    setWorkflows([
      {
        id: 1,
        name: "Default Workflow",
        description: "Standard workflow for most projects",
        statuses: ["To Do", "In Progress", "Done"],
        transitions: [
          { from: "To Do", to: "In Progress", name: "Start Progress" },
          { from: "In Progress", to: "Done", name: "Complete" },
          { from: "Done", to: "In Progress", name: "Reopen" }
        ],
        created_by: "System",
        created_at: "2024-01-01T00:00:00Z"
      },
      {
        id: 2,
        name: "Bug Workflow",
        description: "Specialized workflow for bug tracking",
        statuses: ["Open", "In Progress", "Testing", "Closed"],
        transitions: [
          { from: "Open", to: "In Progress", name: "Start Work" },
          { from: "In Progress", to: "Testing", name: "Ready for Testing" },
          { from: "Testing", to: "Closed", name: "Verified" },
          { from: "Testing", to: "In Progress", name: "Failed Testing" }
        ],
        created_by: "Admin",
        created_at: "2024-01-15T10:00:00Z"
      }
    ])
  }

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const newWorkflow = {
        id: Date.now(),
        ...createForm,
        created_by: "Current User",
        created_at: new Date().toISOString()
      }
      
      setWorkflows([...workflows, newWorkflow])
      setCreateForm({
        name: "",
        description: "",
        statuses: ["To Do", "In Progress", "Done"],
        transitions: [
          { from: "To Do", to: "In Progress", name: "Start Progress" },
          { from: "In Progress", to: "Done", name: "Complete" }
        ]
      })
      setIsCreateOpen(false)
      toast.success("Workflow created successfully")
    } catch (error) {
      toast.error("Failed to create workflow")
    }
  }

  const handleDeleteWorkflow = async (workflowId: number) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return
    
    try {
      setWorkflows(workflows.filter(w => w.id !== workflowId))
      if (selectedWorkflow?.id === workflowId) {
        setSelectedWorkflow(null)
      }
      toast.success("Workflow deleted successfully")
    } catch (error) {
      toast.error("Failed to delete workflow")
    }
  }

  const addStatus = () => {
    const statusName = prompt("Enter status name:")
    if (statusName && !createForm.statuses.includes(statusName)) {
      setCreateForm({
        ...createForm,
        statuses: [...createForm.statuses, statusName]
      })
    }
  }

  const removeStatus = (status: string) => {
    setCreateForm({
      ...createForm,
      statuses: createForm.statuses.filter(s => s !== status),
      transitions: createForm.transitions.filter(t => t.from !== status && t.to !== status)
    })
  }

  const addTransition = () => {
    if (createForm.statuses.length < 2) {
      toast.error("Add at least 2 statuses first")
      return
    }
    
    const from = createForm.statuses[0]
    const to = createForm.statuses[1]
    const name = `${from} to ${to}`
    
    setCreateForm({
      ...createForm,
      transitions: [...createForm.transitions, { from, to, name }]
    })
  }

  const removeTransition = (index: number) => {
    setCreateForm({
      ...createForm,
      transitions: createForm.transitions.filter((_, i) => i !== index)
    })
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <GitBranch className="h-8 w-8 mr-3 text-blue-600" />
                  Workflow Management
                </h1>
                <p className="text-slate-600 mt-2">Create and manage custom workflows for your projects</p>
              </div>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Workflow</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateWorkflow} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Workflow Name</Label>
                      <Input
                        id="name"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Statuses</Label>
                      <Button type="button" size="sm" onClick={addStatus}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Status
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {createForm.statuses.map((status, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {status}
                          <button
                            type="button"
                            onClick={() => removeStatus(status)}
                            className="ml-1 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Transitions</Label>
                      <Button type="button" size="sm" onClick={addTransition}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Transition
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {createForm.transitions.map((transition, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{transition.from}</Badge>
                            <ArrowRight className="h-4 w-4" />
                            <Badge variant="outline">{transition.to}</Badge>
                            <span className="text-sm text-muted-foreground">({transition.name})</span>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeTransition(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Workflow</Button>
                  </div>
                </form>
              </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex space-x-6">
          {/* Workflow List */}
          <div className="w-80 space-y-4">
            <h2 className="font-semibold">Available Workflows</h2>
            {workflows.map((workflow) => (
              <Card
                key={workflow.id}
                className={`cursor-pointer transition-colors ${
                  selectedWorkflow?.id === workflow.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{workflow.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteWorkflow(workflow.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm">
                    <span>{workflow.statuses.length} statuses</span>
                    <span>{workflow.transitions.length} transitions</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Workflow Details */}
          <div className="flex-1">
            {selectedWorkflow ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedWorkflow.name}</CardTitle>
                        <p className="text-muted-foreground">{selectedWorkflow.description}</p>
                      </div>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Workflow
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Created by:</span>
                        <span className="ml-2">{selectedWorkflow.created_by}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <span className="ml-2">{new Date(selectedWorkflow.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statuses ({selectedWorkflow.statuses.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedWorkflow.statuses.map((status: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {status}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Transitions ({selectedWorkflow.transitions.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedWorkflow.transitions.map((transition: any, index: number) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Badge variant="outline">{transition.from}</Badge>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline">{transition.to}</Badge>
                          <span className="text-sm text-muted-foreground">
                            "{transition.name}"
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Workflow Diagram</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Workflow diagram visualization would be rendered here
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No workflow selected</h3>
                <p className="text-gray-500">Select a workflow from the sidebar to view details</p>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}