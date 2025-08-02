"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Bug, AlertTriangle } from "lucide-react"
import { projectsAPI, issuesAPI, usersAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

function CreateBugForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    project_id: searchParams.get('project') || '',
    summary: '',
    description: '',
    steps_to_reproduce: '',
    expected_behavior: '',
    actual_behavior: '',
    environment: '',
    browser: '',
    os: '',
    severity: 'Medium',
    priority: 'Medium',
    assignee_id: '',
    affects_version: '',
    fix_version: '',
    component: '',
    labels: ''
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
    } catch (error) {
      toast.error("Failed to fetch data")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const bugData = {
        project_id: parseInt(formData.project_id),
        summary: formData.summary,
        description: formData.description,
        type: 'Bug',
        priority: formData.priority,
        assignee_id: formData.assignee_id && formData.assignee_id !== 'unassigned' ? parseInt(formData.assignee_id) : undefined,
        // Bug-specific fields
        steps_to_reproduce: formData.steps_to_reproduce,
        expected_behavior: formData.expected_behavior,
        actual_behavior: formData.actual_behavior,
        environment: formData.environment,
        browser: formData.browser,
        os: formData.os,
        severity: formData.severity,
        affects_version: formData.affects_version,
        fix_version: formData.fix_version,
        component: formData.component,
        labels: formData.labels
      }

      await issuesAPI.create(bugData)
      toast.success("Bug reported successfully!")
      router.push(`/projects/${formData.project_id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create bug report")
    } finally {
      setLoading(false)
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
            <Bug className="h-5 w-5 text-red-600" />
            <div>
              <h1 className="text-2xl font-bold">Report Bug</h1>
              <p className="text-muted-foreground">Bug lifecycle management and tracking</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                    Bug Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="project">Project</Label>
                    <Select value={formData.project_id} onValueChange={(value) => setFormData({ ...formData, project_id: value })} required>
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
                    <Label htmlFor="summary">Bug Summary</Label>
                    <Input
                      id="summary"
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Brief description of the bug"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Detailed description of the issue"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="steps_to_reproduce">Steps to Reproduce</Label>
                    <Textarea
                      id="steps_to_reproduce"
                      value={formData.steps_to_reproduce}
                      onChange={(e) => setFormData({ ...formData, steps_to_reproduce: e.target.value })}
                      placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expected_behavior">Expected Behavior</Label>
                      <Textarea
                        id="expected_behavior"
                        value={formData.expected_behavior}
                        onChange={(e) => setFormData({ ...formData, expected_behavior: e.target.value })}
                        placeholder="What should happen"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="actual_behavior">Actual Behavior</Label>
                      <Textarea
                        id="actual_behavior"
                        value={formData.actual_behavior}
                        onChange={(e) => setFormData({ ...formData, actual_behavior: e.target.value })}
                        placeholder="What actually happens"
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Environment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="browser">Browser</Label>
                      <Select value={formData.browser} onValueChange={(value) => setFormData({ ...formData, browser: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select browser" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Chrome">Chrome</SelectItem>
                          <SelectItem value="Firefox">Firefox</SelectItem>
                          <SelectItem value="Safari">Safari</SelectItem>
                          <SelectItem value="Edge">Edge</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="os">Operating System</Label>
                      <Select value={formData.os} onValueChange={(value) => setFormData({ ...formData, os: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select OS" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Windows">Windows</SelectItem>
                          <SelectItem value="macOS">macOS</SelectItem>
                          <SelectItem value="Linux">Linux</SelectItem>
                          <SelectItem value="iOS">iOS</SelectItem>
                          <SelectItem value="Android">Android</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="component">Component</Label>
                      <Input
                        id="component"
                        value={formData.component}
                        onChange={(e) => setFormData({ ...formData, component: e.target.value })}
                        placeholder="UI, API, Database..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="environment">Environment Details</Label>
                    <Textarea
                      id="environment"
                      value={formData.environment}
                      onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                      placeholder="Version numbers, device info, network conditions..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Bug Classification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={formData.severity} onValueChange={(value) => setFormData({ ...formData, severity: value })}>
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
                    <Select value={formData.assignee_id || "unassigned"} onValueChange={(value) => setFormData({ ...formData, assignee_id: value === "unassigned" ? "" : value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned" />
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
                    <Label htmlFor="affects_version">Affects Version</Label>
                    <Input
                      id="affects_version"
                      value={formData.affects_version}
                      onChange={(e) => setFormData({ ...formData, affects_version: e.target.value })}
                      placeholder="v1.0.0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fix_version">Fix Version</Label>
                    <Input
                      id="fix_version"
                      value={formData.fix_version}
                      onChange={(e) => setFormData({ ...formData, fix_version: e.target.value })}
                      placeholder="v1.0.1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="labels">Labels</Label>
                    <Input
                      id="labels"
                      value={formData.labels}
                      onChange={(e) => setFormData({ ...formData, labels: e.target.value })}
                      placeholder="ui, regression, mobile"
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Reporting...' : 'Report Bug'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  )
}

export default function CreateBug() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateBugForm />
    </Suspense>
  )
}