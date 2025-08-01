"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, User, Calendar, Flag, Tag, Paperclip } from "lucide-react"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

interface Issue {
  id: number
  key: string
  summary: string
  description: string
  type: string
  priority: string
  status: string
  story_points?: number
  due_date?: string
  created_at: string
  updated_at: string
  project: {
    name: string
    key: string
  }
  assignee: {
    username: string
    email: string
  } | null
  reporter: {
    username: string
    email: string
  }
  comments?: any[]
  attachments?: any[]
  work_logs?: any[]
  source_links?: any[]
  target_links?: any[]
}

export default function IssueDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [issue, setIssue] = useState<Issue | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIssue()
  }, [params.id])

  const fetchIssue = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/issues/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setIssue(data.issue)
      } else {
        toast.error("Issue not found")
        router.push("/issues")
      }
    } catch (error) {
      toast.error("Failed to fetch issue")
      router.push("/issues")
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase().replace(' ', '_')) {
      case 'done': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'to_do': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'bug': return 'bg-red-100 text-red-800'
      case 'story': return 'bg-blue-100 text-blue-800'
      case 'task': return 'bg-purple-100 text-purple-800'
      case 'epic': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading issue...</div>
        </div>
      </AppLayout>
    )
  }

  if (!issue) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Issue not found</div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{issue.project.key}-{issue.id}</h1>
              <p className="text-muted-foreground">{issue.project.name}</p>
            </div>
          </div>
          <Button onClick={() => router.push(`/issues/${issue.id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{issue.summary}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getTypeColor(issue.type)}>
                    <Tag className="h-3 w-3 mr-1" />
                    {issue.type}
                  </Badge>
                  <Badge className={getPriorityColor(issue.priority)}>
                    <Flag className="h-3 w-3 mr-1" />
                    {issue.priority}
                  </Badge>
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {issue.description || "No description provided"}
                    </p>
                  </div>

                  {issue.comments && issue.comments.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Comments ({issue.comments.length})</h3>
                      <div className="space-y-3">
                        {issue.comments.map((comment: any) => (
                          <div key={comment.id} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-sm">{comment.user.username}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.created_at).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {issue.attachments && issue.attachments.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Attachments ({issue.attachments.length})</h3>
                      <div className="space-y-2">
                        {issue.attachments.map((attachment: any) => (
                          <div key={attachment.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                              <Paperclip className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{attachment.filename}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(attachment.file_size / 1024).toFixed(1)} KB • Uploaded by {attachment.user?.username || 'Unknown'}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const token = localStorage.getItem('token')
                                  try {
                                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/issues/attachments/${attachment.id}/download?view=true`, {
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    })
                                    if (response.ok) {
                                      const blob = await response.blob()
                                      const url = URL.createObjectURL(blob)
                                      window.open(url, '_blank')
                                    }
                                  } catch (error) {
                                    toast.error('Failed to view file')
                                  }
                                }}
                              >
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const token = localStorage.getItem('token')
                                  try {
                                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/issues/attachments/${attachment.id}/download`, {
                                      headers: { 'Authorization': `Bearer ${token}` }
                                    })
                                    if (response.ok) {
                                      const blob = await response.blob()
                                      const url = URL.createObjectURL(blob)
                                      const a = document.createElement('a')
                                      a.href = url
                                      a.download = attachment.filename
                                      a.click()
                                      URL.revokeObjectURL(url)
                                    }
                                  } catch (error) {
                                    toast.error('Failed to download file')
                                  }
                                }}
                              >
                                Download
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {issue.work_logs && issue.work_logs.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3">Work Log ({issue.work_logs.length} entries)</h3>
                      <div className="space-y-2">
                        {issue.work_logs.map((log: any) => (
                          <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                            <div>
                              <span className="text-sm font-medium">{log.user.username}</span>
                              <span className="text-xs text-muted-foreground ml-2">{log.description}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm">{log.time_spent}h</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(log.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Assignee</p>
                    <p className="text-sm text-muted-foreground">
                      {issue.assignee ? issue.assignee.username : "Unassigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Reporter</p>
                    <p className="text-sm text-muted-foreground">
                      {issue.reporter.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(issue.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Updated</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(issue.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {issue.due_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Due Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(issue.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {issue.story_points && (
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Story Points</p>
                      <p className="text-sm text-muted-foreground">{issue.story_points}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Issue Key</p>
                    <p className="text-sm text-muted-foreground">{issue.key}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}