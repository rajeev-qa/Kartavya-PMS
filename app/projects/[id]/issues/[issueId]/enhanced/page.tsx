"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, MessageSquare, Clock, Paperclip, Upload, Download, X, Shield } from "lucide-react"
import { issuesAPI, usersAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import Navbar from "@/components/layout/Navbar"
import CommentManager from "@/components/issue/CommentManager"
import SubTaskManager from "@/components/issue/SubTaskManager"
import IssueLinking from "@/components/issue/IssueLinking"

export default function EnhancedIssueDetails() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  const issueId = Number(params.issueId)
  
  const [issue, setIssue] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [workLogs, setWorkLogs] = useState<any[]>([])
  const [attachments, setAttachments] = useState<any[]>([])
  const [linkedIssues, setLinkedIssues] = useState<any[]>([])
  const [subTasks, setSubTasks] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isWorkLogOpen, setIsWorkLogOpen] = useState(false)
  const [isConvertOpen, setIsConvertOpen] = useState(false)
  const [isSecurityOpen, setIsSecurityOpen] = useState(false)
  
  const [workLogForm, setWorkLogForm] = useState({
    time_spent: "",
    description: ""
  })
  
  const [convertForm, setConvertForm] = useState({
    parent_issue_key: ""
  })
  
  const [securityForm, setSecurityForm] = useState({
    security_level: "public"
  })

  useEffect(() => {
    fetchIssueData()
  }, [issueId])

  const fetchIssueData = async () => {
    try {
      const [issueResponse, usersResponse] = await Promise.all([
        issuesAPI.getById(issueId),
        usersAPI.getAll()
      ])
      
      setIssue(issueResponse.issue)
      setComments(issueResponse.issue.comments || [])
      setWorkLogs(issueResponse.issue.work_logs || [])
      setAttachments(issueResponse.issue.attachments || [])
      setLinkedIssues(issueResponse.issue.linked_issues || [])
      setSubTasks(issueResponse.issue.sub_tasks || [])
      setUsers(usersResponse.users || [])
    } catch (error) {
      toast.error("Failed to fetch issue data")
    } finally {
      setLoading(false)
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

  const handleConvertToSubTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await issuesAPI.convertToSubTask(issueId, convertForm)
      setConvertForm({ parent_issue_key: "" })
      setIsConvertOpen(false)
      fetchIssueData()
      toast.success("Issue converted to sub-task")
    } catch (error) {
      toast.error("Failed to convert issue")
    }
  }

  const handleUpdateSecurity = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await issuesAPI.updateSecurity(issueId, securityForm)
      setIsSecurityOpen(false)
      fetchIssueData()
      toast.success("Security settings updated")
    } catch (error) {
      toast.error("Failed to update security")
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
              <h1 className="text-2xl font-bold">{issue?.key}</h1>
              <p className="text-muted-foreground">{issue?.summary}</p>
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
                    {issue?.description || "No description provided"}
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
                <CardContent>
                  <CommentManager comments={comments} onUpdate={fetchIssueData} />
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <SubTaskManager 
                    issueId={issueId} 
                    subTasks={subTasks} 
                    users={users} 
                    onUpdate={fetchIssueData} 
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <IssueLinking 
                    issueId={issueId} 
                    projectId={projectId} 
                    linkedIssues={linkedIssues} 
                    onUpdate={fetchIssueData} 
                  />
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
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
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
                          variant={issue?.status === status ? "default" : "outline"}
                          onClick={() => handleStatusChange(status)}
                        >
                          {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label>Type</Label>
                    <Badge variant="secondary" className="mt-1">{issue?.type}</Badge>
                  </div>
                  
                  <div>
                    <Label>Priority</Label>
                    <Badge variant="outline" className="mt-1">{issue?.priority}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Dialog open={isConvertOpen} onOpenChange={setIsConvertOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        Convert to Sub-task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Convert to Sub-task</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleConvertToSubTask} className="space-y-4">
                        <div>
                          <Label>Parent Issue Key</Label>
                          <Input
                            value={convertForm.parent_issue_key}
                            onChange={(e) => setConvertForm({ ...convertForm, parent_issue_key: e.target.value })}
                            placeholder="PROJ-123"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsConvertOpen(false)}>Cancel</Button>
                          <Button type="submit">Convert</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isSecurityOpen} onOpenChange={setIsSecurityOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Shield className="h-4 w-4 mr-2" />
                        Security Settings
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Issue Security</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleUpdateSecurity} className="space-y-4">
                        <div>
                          <Label>Security Level</Label>
                          <Select value={securityForm.security_level} onValueChange={(value) => setSecurityForm({ ...securityForm, security_level: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="public">Public</SelectItem>
                              <SelectItem value="private">Private</SelectItem>
                              <SelectItem value="restricted">Restricted</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsSecurityOpen(false)}>Cancel</Button>
                          <Button type="submit">Update</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}