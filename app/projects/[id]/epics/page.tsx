"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Target } from "lucide-react"
import { epicsAPI, projectsAPI, issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import Navbar from "@/components/layout/Navbar"

export default function EpicManagement() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  
  const [project, setProject] = useState<any>(null)
  const [epics, setEpics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    summary: "",
    description: "",
    priority: "medium"
  })
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false)
  const [selectedEpicId, setSelectedEpicId] = useState<number | null>(null)
  const [availableIssues, setAvailableIssues] = useState<any[]>([])
  const [selectedIssues, setSelectedIssues] = useState<number[]>([])

  useEffect(() => {
    fetchEpicData()
  }, [projectId])

  const fetchEpicData = async () => {
    try {
      const [projectResponse, epicsResponse, issuesResponse] = await Promise.all([
        projectsAPI.getById(projectId),
        epicsAPI.getAll({ project_id: projectId }),
        issuesAPI.getAll({ project_id: projectId })
      ])
      setProject(projectResponse.project)
      setEpics(epicsResponse.epics || [])
      setAvailableIssues(issuesResponse.issues?.filter((issue: any) => issue.type !== 'epic' && !issue.epic_id) || [])
    } catch (error) {
      toast.error("Failed to fetch epic data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEpic = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await epicsAPI.create({
        ...createForm,
        project_id: projectId,
        type: "epic"
      })
      setCreateForm({ summary: "", description: "", priority: "medium" })
      setIsCreateOpen(false)
      fetchEpicData()
      toast.success("Epic created successfully")
    } catch (error) {
      toast.error("Failed to create epic")
    }
  }

  const handleAddIssuesToEpic = async () => {
    if (!selectedEpicId || selectedIssues.length === 0) {
      toast.error("Please select issues to add")
      return
    }

    try {
      for (const issueId of selectedIssues) {
        await epicsAPI.addIssue(selectedEpicId, issueId)
      }
      setSelectedIssues([])
      setIsAddIssueOpen(false)
      fetchEpicData()
      toast.success(`Added ${selectedIssues.length} issues to epic`)
    } catch (error) {
      toast.error("Failed to add issues to epic")
    }
  }

  const handleRemoveIssueFromEpic = async (epicId: number, issueId: number) => {
    try {
      await epicsAPI.removeIssue(epicId, issueId)
      fetchEpicData()
      toast.success("Issue removed from epic")
    } catch (error) {
      toast.error("Failed to remove issue from epic")
    }
  }

  const generateEpicReport = async (epicId: number) => {
    try {
      const response = await epicsAPI.generateReport(epicId)
      // Create and download report
      const reportData = JSON.stringify(response.report, null, 2)
      const blob = new Blob([reportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `epic-${epicId}-report.json`
      link.click()
      URL.revokeObjectURL(url)
      toast.success("Epic report generated")
    } catch (error) {
      toast.error("Failed to generate epic report")
    }
  }

  const calculateProgress = (epic: any) => {
    if (!epic.linked_issues || epic.linked_issues.length === 0) return 0
    const completed = epic.linked_issues.filter((issue: any) => issue.status === "Done").length
    return Math.round((completed / epic.linked_issues.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}/board`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Board
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Epic Management</h1>
                <p className="text-muted-foreground">Project: {project?.name}</p>
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Epic
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Epic</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEpic} className="space-y-4">
                  <div>
                    <Label htmlFor="summary">Epic Summary</Label>
                    <Input
                      id="summary"
                      value={createForm.summary}
                      onChange={(e) => setCreateForm({ ...createForm, summary: e.target.value })}
                      placeholder="As a user, I want to..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      placeholder="Detailed description of the epic..."
                      rows={4}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Epic</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {epics.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No epics yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first epic to group related issues</p>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Epic
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              epics.map((epic) => {
                const progress = calculateProgress(epic)
                return (
                  <Card key={epic.id} className="cursor-pointer hover:shadow-md">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{epic.key}</Badge>
                            <Badge variant="secondary">Epic</Badge>
                            <Badge variant="outline">{epic.priority}</Badge>
                          </div>
                          <CardTitle className="text-lg">{epic.summary}</CardTitle>
                          {epic.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {epic.description}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedEpicId(epic.id)
                              setIsAddIssueOpen(true)
                            }}
                          >
                            Add Issues
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateEpicReport(epic.id)}
                          >
                            Generate Report
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/projects/${projectId}/epics/${epic.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Issues:</span>
                            <p className="font-medium">{epic.linked_issues?.length || 0}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Completed:</span>
                            <p className="font-medium">
                              {epic.linked_issues?.filter((issue: any) => issue.status === "Done").length || 0}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">In Progress:</span>
                            <p className="font-medium">
                              {epic.linked_issues?.filter((issue: any) => issue.status === "In Progress").length || 0}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Story Points:</span>
                            <p className="font-medium">
                              {epic.linked_issues?.reduce((sum: number, issue: any) => sum + (issue.story_points || 0), 0) || 0}
                            </p>
                          </div>
                        </div>
                        
                        {epic.linked_issues && epic.linked_issues.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Linked Issues:</h4>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {epic.linked_issues.map((issue: any) => (
                                <div key={issue.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{issue.key}</span>
                                    <span>{issue.summary}</span>
                                    <Badge variant="outline" className="text-xs">{issue.status}</Badge>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemoveIssueFromEpic(epic.id, issue.id)}
                                    className="text-red-600"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>

          {/* Add Issues to Epic Dialog */}
          <Dialog open={isAddIssueOpen} onOpenChange={setIsAddIssueOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add Issues to Epic</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Available Issues</Label>
                  <div className="max-h-64 overflow-y-auto border rounded p-2 space-y-2">
                    {availableIssues.map((issue) => (
                      <div key={issue.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedIssues.includes(issue.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIssues([...selectedIssues, issue.id])
                            } else {
                              setSelectedIssues(selectedIssues.filter(id => id !== issue.id))
                            }
                          }}
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{issue.key}</span>
                            <Badge variant="secondary">{issue.type}</Badge>
                            <Badge variant="outline">{issue.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{issue.summary}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsAddIssueOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddIssuesToEpic}>
                    Add {selectedIssues.length} Issues
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}