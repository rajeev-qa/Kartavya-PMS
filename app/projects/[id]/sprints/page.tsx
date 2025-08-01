"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, Play, Square } from "lucide-react"
import { sprintsAPI, projectsAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function SprintManagement() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  
  const [project, setProject] = useState<any>(null)
  const [sprints, setSprints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    goal: ""
  })

  useEffect(() => {
    fetchSprintData()
  }, [projectId])

  const fetchSprintData = async () => {
    try {
      const [projectResponse, sprintsResponse] = await Promise.all([
        projectsAPI.getById(projectId),
        sprintsAPI.getAll({ project_id: projectId })
      ])
      setProject(projectResponse.project)
      setSprints(sprintsResponse.sprints || [])
    } catch (error) {
      toast.error("Failed to fetch sprint data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await sprintsAPI.create({
        ...createForm,
        project_id: projectId
      })
      setCreateForm({ name: "", start_date: "", end_date: "", goal: "" })
      setIsCreateOpen(false)
      fetchSprintData()
      toast.success("Sprint created successfully")
    } catch (error) {
      toast.error("Failed to create sprint")
    }
  }

  const handleStartSprint = async (sprintId: number) => {
    try {
      await sprintsAPI.start(sprintId)
      fetchSprintData()
      toast.success("Sprint started")
    } catch (error) {
      toast.error("Failed to start sprint")
    }
  }

  const handleCompleteSprint = async (sprintId: number) => {
    try {
      await sprintsAPI.complete(sprintId)
      fetchSprintData()
      toast.success("Sprint completed")
    } catch (error) {
      toast.error("Failed to complete sprint")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      default:
        return <Badge variant="outline">Planned</Badge>
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
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}/board`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Board
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Sprint Management</h1>
                <p className="text-muted-foreground">Project: {project?.name}</p>
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Sprint
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Sprint</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSprint} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Sprint Name</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="Sprint 1"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="start_date">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={createForm.start_date}
                        onChange={(e) => setCreateForm({ ...createForm, start_date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="end_date">End Date</Label>
                      <Input
                        id="end_date"
                        type="date"
                        value={createForm.end_date}
                        onChange={(e) => setCreateForm({ ...createForm, end_date: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="goal">Sprint Goal</Label>
                    <Input
                      id="goal"
                      value={createForm.goal}
                      onChange={(e) => setCreateForm({ ...createForm, goal: e.target.value })}
                      placeholder="What do you want to achieve?"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Sprint</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {sprints.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No sprints yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first sprint to get started</p>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Sprint
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              sprints.map((sprint) => (
                <Card key={sprint.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <CardTitle>{sprint.name}</CardTitle>
                          {getStatusBadge(sprint.status)}
                        </div>
                        {sprint.goal && (
                          <p className="text-sm text-muted-foreground">{sprint.goal}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {sprint.status === "planned" && (
                          <Button size="sm" onClick={() => handleStartSprint(sprint.id)}>
                            <Play className="h-4 w-4 mr-2" />
                            Start Sprint
                          </Button>
                        )}
                        {sprint.status === "active" && (
                          <Button size="sm" variant="outline" onClick={() => handleCompleteSprint(sprint.id)}>
                            <Square className="h-4 w-4 mr-2" />
                            Complete Sprint
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Start Date:</span>
                        <p className="font-medium">{new Date(sprint.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">End Date:</span>
                        <p className="font-medium">{new Date(sprint.end_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Issues:</span>
                        <p className="font-medium">{sprint._count?.issues || 0}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Story Points:</span>
                        <p className="font-medium">{sprint.total_story_points || 0}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}