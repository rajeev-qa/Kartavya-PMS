"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Download, Plus, X } from "lucide-react"
import { epicsAPI, issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import Navbar from "@/components/layout/Navbar"

export default function EpicDetails() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  const epicId = Number(params.epicId)
  
  const [epic, setEpic] = useState<any>(null)
  const [linkedIssues, setLinkedIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEpicData()
  }, [epicId])

  const fetchEpicData = async () => {
    try {
      const response = await epicsAPI.getById(epicId)
      setEpic(response.epic)
      setLinkedIssues(response.epic.linked_issues || [])
    } catch (error) {
      toast.error("Failed to fetch epic data")
    } finally {
      setLoading(false)
    }
  }

  const calculateProgress = () => {
    if (linkedIssues.length === 0) return 0
    const completed = linkedIssues.filter(issue => issue.status === "Done").length
    return Math.round((completed / linkedIssues.length) * 100)
  }

  const generateReport = async () => {
    try {
      const reportData = {
        epic: {
          key: epic.key,
          summary: epic.summary,
          description: epic.description,
          priority: epic.priority
        },
        progress: calculateProgress(),
        totalIssues: linkedIssues.length,
        completedIssues: linkedIssues.filter(issue => issue.status === "Done").length,
        inProgressIssues: linkedIssues.filter(issue => issue.status === "In Progress").length,
        todoIssues: linkedIssues.filter(issue => issue.status === "To Do").length,
        totalStoryPoints: linkedIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0),
        completedStoryPoints: linkedIssues
          .filter(issue => issue.status === "Done")
          .reduce((sum, issue) => sum + (issue.story_points || 0), 0),
        issues: linkedIssues.map(issue => ({
          key: issue.key,
          summary: issue.summary,
          status: issue.status,
          type: issue.type,
          priority: issue.priority,
          storyPoints: issue.story_points,
          assignee: issue.assignee?.username
        })),
        generatedAt: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `epic-${epic.key}-report.json`
      link.click()
      URL.revokeObjectURL(url)
      toast.success("Epic report generated and downloaded")
    } catch (error) {
      toast.error("Failed to generate report")
    }
  }

  const removeIssueFromEpic = async (issueId: number) => {
    try {
      await epicsAPI.removeIssue(epicId, issueId)
      fetchEpicData()
      toast.success("Issue removed from epic")
    } catch (error) {
      toast.error("Failed to remove issue")
    }
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

  if (!epic) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">Epic not found</h3>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}/epics`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Epics
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{epic.key}</h1>
                <p className="text-muted-foreground">{epic.summary}</p>
              </div>
            </div>
            <Button onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {epic.description || "No description provided"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Linked Issues ({linkedIssues.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {linkedIssues.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No issues linked to this epic</p>
                  ) : (
                    <div className="space-y-3">
                      {linkedIssues.map((issue) => (
                        <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{issue.key}</span>
                              <Badge variant="secondary">{issue.type}</Badge>
                              <Badge variant="outline">{issue.status}</Badge>
                              <Badge variant="outline">{issue.priority}</Badge>
                              {issue.story_points && (
                                <Badge variant="outline">{issue.story_points} SP</Badge>
                              )}
                            </div>
                            <p className="text-sm">{issue.summary}</p>
                            {issue.assignee && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Assigned to: {issue.assignee.username}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/projects/${projectId}/issues/${issue.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeIssueFromEpic(issue.id)}
                              className="text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Epic Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Priority:</span>
                    <Badge variant="outline" className="ml-2">{epic.priority}</Badge>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">Created:</span>
                    <p className="text-sm">{new Date(epic.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Completion</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Issues:</span>
                      <p className="font-medium">{linkedIssues.length}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <p className="font-medium">
                        {linkedIssues.filter(issue => issue.status === "Done").length}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">In Progress:</span>
                      <p className="font-medium">
                        {linkedIssues.filter(issue => issue.status === "In Progress").length}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">To Do:</span>
                      <p className="font-medium">
                        {linkedIssues.filter(issue => issue.status === "To Do").length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Story Points:</span>
                        <p className="font-medium">
                          {linkedIssues.reduce((sum, issue) => sum + (issue.story_points || 0), 0)}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completed SP:</span>
                        <p className="font-medium">
                          {linkedIssues
                            .filter(issue => issue.status === "Done")
                            .reduce((sum, issue) => sum + (issue.story_points || 0), 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}