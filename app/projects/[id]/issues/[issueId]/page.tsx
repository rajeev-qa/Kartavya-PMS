"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, MessageSquare, Clock, Paperclip, Edit, Upload, Download, X } from "lucide-react"
import { issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import Navbar from "@/components/layout/Navbar"

export default function IssueDetails() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  const issueId = Number(params.issueId)
  
  const [issue, setIssue] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [workLogs, setWorkLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false)
  const [workLogForm, setWorkLogForm] = useState({
    time_spent: "",
    description: ""
  })
  const [attachments, setAttachments] = useState<any[]>([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    fetchIssueData()
  }, [issueId])

  const fetchIssueData = async () => {
    try {
      const response = await issuesAPI.getById(issueId)
      setIssue(response.issue)
      setComments(response.issue.comments || [])
      setWorkLogs(response.issue.work_logs || [])
      setAttachments(response.issue.attachments || [])
    } catch (error) {
      toast.error("Failed to fetch issue data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    try {
      await issuesAPI.addComment(issueId, { content: newComment })
      setNewComment("")
      fetchIssueData()
      toast.success("Comment added")
    } catch (error) {
      toast.error("Failed to add comment")
    }
  }

  const handleLogWork = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await issuesAPI.logWork(issueId, workLogForm)
      setWorkLogForm({ time_spent: "", description: "" })
      setIsWorkLogOpen(false)
      fetchIssueData()
      toast.success("Work logged successfully")
    } catch (error) {
      toast.error("Failed to log work")
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    try {
      await issuesAPI.updateStatus(issueId, newStatus)
      fetchIssueData()
      toast.success("Status updated")
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      await issuesAPI.uploadAttachment(issueId, formData)
      setSelectedFile(null)
      fetchIssueData()
      toast.success("File uploaded successfully")
    } catch (error) {
      toast.error("Failed to upload file")
    }
  }

  const handleDeleteAttachment = async (attachmentId: number) => {
    try {
      await issuesAPI.deleteAttachment(attachmentId)
      fetchIssueData()
      toast.success("Attachment deleted")
    } catch (error) {
      toast.error("Failed to delete attachment")
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

  if (!issue) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-8">
          <h3 className="text-lg font-medium">Issue not found</h3>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}/board`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Board
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{issue.key}</h1>
              <p className="text-muted-foreground">{issue.summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">
                    {issue.description || "No description provided"}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Comments ({comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">{comment.author?.username}</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                      Add Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Paperclip className="h-5 w-5 mr-2" />
                    Attachments ({attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="flex-1"
                    />
                    <Button onClick={handleFileUpload} disabled={!selectedFile}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm">{attachment.filename}</span>
                          <span className="text-xs text-muted-foreground">({attachment.size} bytes)</span>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteAttachment(attachment.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Issue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Status</Label>
                    <div className="flex space-x-2 mt-1">
                      {["To Do", "In Progress", "Done"].map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant={issue.status === status ? "default" : "outline"}
                          onClick={() => handleStatusChange(status)}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Type</Label>
                    <Badge variant="secondary" className="mt-1">{issue.type}</Badge>
                  </div>
                  
                  <div>
                    <Label>Priority</Label>
                    <Badge variant="outline" className="mt-1">{issue.priority}</Badge>
                  </div>
                  
                  {issue.assignee && (
                    <div>
                      <Label>Assignee</Label>
                      <p className="text-sm mt-1">{issue.assignee.username}</p>
                    </div>
                  )}
                  
                  {issue.story_points && (
                    <div>
                      <Label>Story Points</Label>
                      <p className="text-sm mt-1">{issue.story_points}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Time Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog open={isWorkLogOpen} onOpenChange={setIsWorkLogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Log Work
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Log Work</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleLogWork} className="space-y-4">
                        <div>
                          <Label htmlFor="time_spent">Time Spent (hours)</Label>
                          <Input
                            id="time_spent"
                            type="number"
                            step="0.5"
                            value={workLogForm.time_spent}
                            onChange={(e) => setWorkLogForm({ ...workLogForm, time_spent: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={workLogForm.description}
                            onChange={(e) => setWorkLogForm({ ...workLogForm, description: e.target.value })}
                            placeholder="What did you work on?"
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsWorkLogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Log Work</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                  
                  <div className="space-y-2">
                    {workLogs.map((log) => (
                      <div key={log.id} className="text-sm border-l-2 border-blue-200 pl-3">
                        <div className="flex justify-between">
                          <span className="font-medium">{log.user?.username}</span>
                          <span className="text-muted-foreground">{log.time_spent}h</span>
                        </div>
                        {log.description && (
                          <p className="text-muted-foreground">{log.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
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