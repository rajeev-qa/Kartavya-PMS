"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Target, Layers, CheckSquare } from "lucide-react"
import { projectsAPI, issuesAPI, usersAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function CreateWorkItem() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [epics, setEpics] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    type: searchParams.get('type') || 'Story',
    project_id: searchParams.get('project') || '',
    summary: '',
    description: '',
    acceptance_criteria: '',
    story_points: '',
    priority: 'Medium',
    assignee_id: '',
    epic_id: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [projectsResponse, usersResponse] = await Promise.all([
        projectsAPI.getAll(),
        usersAPI.getAll()
      ])
      setProjects(projectsResponse.projects || [])
      setUsers(usersResponse.users || [])
      
      if (formData.project_id) {
        fetchEpics(parseInt(formData.project_id))
      }
    } catch (error) {
      toast.error("Failed to fetch data")
    }
  }

  const fetchEpics = async (projectId: number) => {
    try {
      const response = await issuesAPI.getAll({ project_id: projectId, type: 'Epic' })
      setEpics(response.issues || [])
    } catch (error) {
      console.error("Failed to fetch epics")
    }
  }

  const handleProjectChange = (projectId: string) => {
    setFormData({ ...formData, project_id: projectId })
    if (projectId) {
      fetchEpics(parseInt(projectId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const workItemData = {
        project_id: parseInt(formData.project_id),
        summary: formData.summary,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        assignee_id: formData.assignee_id && formData.assignee_id !== 'none' ? parseInt(formData.assignee_id) : undefined,
        epic_id: formData.epic_id && formData.epic_id !== 'none' ? parseInt(formData.epic_id) : undefined,
        story_points: formData.story_points && formData.story_points !== 'none' ? parseInt(formData.story_points) : undefined
      }

      await issuesAPI.create(workItemData)
      toast.success(`${formData.type} created successfully!`)
      router.push(`/projects/${formData.project_id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || `Failed to create ${formData.type.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = () => {
    switch (formData.type) {
      case 'Epic': return <Target className="h-5 w-5" />
      case 'Story': return <Layers className="h-5 w-5" />
      case 'Task': return <CheckSquare className="h-5 w-5" />
      default: return <Layers className="h-5 w-5" />
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            {getIcon()}
            <div>
              <h1 className="text-2xl font-bold">Create {formData.type}</h1>
              <p className="text-muted-foreground">Team task distribution and tracking</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Work Item Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Epic">Epic</SelectItem>
                          <SelectItem value="Story">Story</SelectItem>
                          <SelectItem value="Task">Task</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="project">Project</Label>
                      <Select value={formData.project_id} onValueChange={handleProjectChange} required>
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
                  </div>

                  <div>
                    <Label htmlFor="summary">Summary</Label>
                    <Input
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder={`Brief ${formData.type.toLowerCase()} summary`}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder={`Detailed ${formData.type.toLowerCase()} description`}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="acceptance_criteria">Acceptance Criteria</Label>
                    <Textarea
                      id="acceptance_criteria"
                      value={formData.acceptance_criteria}
                      onChange={(e) => setFormData({ ...formData, acceptance_criteria: e.target.value })}
                      placeholder="Define what needs to be done for completion"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assignment & Planning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="assignee">Assignee</Label>
                    <Select value={formData.assignee_id} onValueChange={(value) => setFormData({ ...formData, assignee_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Unassigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type !== 'Epic' && epics.length > 0 && (
                    <div>
                      <Label htmlFor="epic">Epic</Label>
                      <Select value={formData.epic_id} onValueChange={(value) => setFormData({ ...formData, epic_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="No epic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No epic</SelectItem>
                          {epics.map((epic) => (
                            <SelectItem key={epic.id} value={epic.id.toString()}>
                              {epic.summary}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="story_points">Story Points</Label>
                    <Select value={formData.story_points} onValueChange={(value) => setFormData({ ...formData, story_points: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Not estimated" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not estimated</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="13">13</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : `Create ${formData.type}`}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}