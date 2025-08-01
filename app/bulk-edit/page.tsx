"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X } from "lucide-react"
import { issuesAPI, projectsAPI, usersAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function BulkEditPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [selectedIssues, setSelectedIssues] = useState<number[]>([])
  const [selectedProject, setSelectedProject] = useState("select-project")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [bulkChanges, setBulkChanges] = useState({
    status: "no-change",
    assignee_id: "no-change",
    priority: "no-change",
    type: "no-change"
  })

  useEffect(() => {
    fetchProjects()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (selectedProject && selectedProject !== "select-project") {
      fetchIssues()
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll()
      setProjects(response.projects || [])
    } catch (error) {
      toast.error("Failed to fetch projects")
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll()
      setUsers(response.users || [])
    } catch (error) {
      toast.error("Failed to fetch users")
    }
  }

  const fetchIssues = async () => {
    try {
      const response = await issuesAPI.getAll({ project_id: selectedProject })
      setIssues(response.issues || [])
    } catch (error) {
      toast.error("Failed to fetch issues")
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIssues(issues.map(issue => issue.id))
    } else {
      setSelectedIssues([])
    }
  }

  const handleSelectIssue = (issueId: number, checked: boolean) => {
    if (checked) {
      setSelectedIssues([...selectedIssues, issueId])
    } else {
      setSelectedIssues(selectedIssues.filter(id => id !== issueId))
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedIssues.length === 0) {
      toast.error("Please select at least one issue")
      return
    }

    const changes = Object.entries(bulkChanges).reduce((acc, [key, value]) => {
      if (value && value !== "no-change") acc[key] = value
      return acc
    }, {} as any)

    if (Object.keys(changes).length === 0) {
      toast.error("Please select at least one field to update")
      return
    }

    setLoading(true)
    try {
      for (const issueId of selectedIssues) {
        await issuesAPI.update(issueId, changes)
      }
      
      fetchIssues()
      setSelectedIssues([])
      setBulkChanges({ status: "no-change", assignee_id: "no-change", priority: "no-change", type: "no-change" })
      toast.success(`Updated ${selectedIssues.length} issues successfully`)
    } catch (error) {
      toast.error("Failed to update issues")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Bulk Edit Issues</h1>
            <p className="text-muted-foreground">Select multiple issues and update them at once</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Project Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select-project">Select a project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedProject && selectedProject !== "select-project" && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Bulk Changes</span>
                    <Badge variant="outline">{selectedIssues.length} selected</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <Select value={bulkChanges.status} onValueChange={(value) => setBulkChanges({...bulkChanges, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="No change" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-change">No change</SelectItem>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Priority</label>
                      <Select value={bulkChanges.priority} onValueChange={(value) => setBulkChanges({...bulkChanges, priority: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="No change" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-change">No change</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select value={bulkChanges.type} onValueChange={(value) => setBulkChanges({...bulkChanges, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="No change" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="no-change">No change</SelectItem>
                          <SelectItem value="Story">Story</SelectItem>
                          <SelectItem value="Task">Task</SelectItem>
                          <SelectItem value="Bug">Bug</SelectItem>
                          <SelectItem value="Epic">Epic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-end">
                      <Button onClick={handleBulkUpdate} disabled={loading || selectedIssues.length === 0} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Updating..." : "Update Issues"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Issues ({issues.length})</span>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedIssues.length === issues.length && issues.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm">Select All</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {issues.map((issue) => (
                      <div key={issue.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-gray-50">
                        <Checkbox
                          checked={selectedIssues.includes(issue.id)}
                          onCheckedChange={(checked) => handleSelectIssue(issue.id, checked as boolean)}
                        />
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{issue.key}</Badge>
                            <Badge variant="secondary">{issue.type}</Badge>
                            <Badge variant="outline">{issue.priority}</Badge>
                            <Badge variant="outline">{issue.status}</Badge>
                          </div>
                          <h3 className="font-medium">{issue.summary}</h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
      </div>
    </AppLayout>
  )
}
