"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Link, Plus, GitBranch, X } from "lucide-react"
import { issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"

interface IssueLinkingProps {
  issueId: number
  projectId: number
  linkedIssues: any[]
  onUpdate: () => void
}

export default function IssueLinking({ issueId, projectId, linkedIssues, onUpdate }: IssueLinkingProps) {
  const [isLinkOpen, setIsLinkOpen] = useState(false)
  const [isCreateLinkedOpen, setIsCreateLinkedOpen] = useState(false)
  
  const [linkForm, setLinkForm] = useState({
    issue_key: "",
    link_type: "relates to"
  })

  const [createLinkedForm, setCreateLinkedForm] = useState({
    summary: "",
    description: "",
    type: "task",
    priority: "medium",
    link_type: "relates to"
  })

  const handleLinkIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await issuesAPI.linkIssue(issueId, linkForm)
      setLinkForm({ issue_key: "", link_type: "relates to" })
      setIsLinkOpen(false)
      onUpdate()
      toast.success("Issue linked successfully")
    } catch (error) {
      toast.error("Failed to link issue")
    }
  }

  const handleCreateLinkedIssue = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await issuesAPI.create({
        ...createLinkedForm,
        project_id: projectId
      })
      
      await issuesAPI.linkIssue(issueId, {
        issue_key: response.issue.key,
        link_type: createLinkedForm.link_type
      })
      
      setCreateLinkedForm({ 
        summary: "", 
        description: "", 
        type: "task", 
        priority: "medium", 
        link_type: "relates to" 
      })
      setIsCreateLinkedOpen(false)
      onUpdate()
      toast.success("Linked issue created successfully")
    } catch (error) {
      toast.error("Failed to create linked issue")
    }
  }

  const handleUnlinkIssue = async (linkId: number) => {
    try {
      await issuesAPI.unlinkIssue(linkId)
      onUpdate()
      toast.success("Issue unlinked")
    } catch (error) {
      toast.error("Failed to unlink issue")
    }
  }

  const getLinkTypeBadge = (linkType: string) => {
    const colors = {
      "relates to": "bg-blue-100 text-blue-800",
      "blocks": "bg-red-100 text-red-800",
      "duplicates": "bg-yellow-100 text-yellow-800",
      "depends on": "bg-green-100 text-green-800"
    }
    return (
      <Badge variant="outline" className={colors[linkType as keyof typeof colors] || ""}>
        {linkType}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Linked Issues ({linkedIssues.length})</h3>
        <div className="flex space-x-2">
          <Dialog open={isLinkOpen} onOpenChange={setIsLinkOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Link className="h-4 w-4 mr-2" />
                Link Issue
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Link Existing Issue</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLinkIssue} className="space-y-4">
                <div>
                  <Label>Issue Key</Label>
                  <Input
                    value={linkForm.issue_key}
                    onChange={(e) => setLinkForm({ ...linkForm, issue_key: e.target.value })}
                    placeholder="PROJ-123"
                    required
                  />
                </div>
                <div>
                  <Label>Link Type</Label>
                  <Select value={linkForm.link_type} onValueChange={(value) => setLinkForm({ ...linkForm, link_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relates to">Relates to</SelectItem>
                      <SelectItem value="blocks">Blocks</SelectItem>
                      <SelectItem value="duplicates">Duplicates</SelectItem>
                      <SelectItem value="depends on">Depends on</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsLinkOpen(false)}>Cancel</Button>
                  <Button type="submit">Link Issue</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateLinkedOpen} onOpenChange={setIsCreateLinkedOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <GitBranch className="h-4 w-4 mr-2" />
                Create Linked
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Linked Issue</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateLinkedIssue} className="space-y-4">
                <div>
                  <Label>Summary</Label>
                  <Input
                    value={createLinkedForm.summary}
                    onChange={(e) => setCreateLinkedForm({ ...createLinkedForm, summary: e.target.value })}
                    placeholder="Issue summary"
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={createLinkedForm.description}
                    onChange={(e) => setCreateLinkedForm({ ...createLinkedForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Type</Label>
                    <Select value={createLinkedForm.type} onValueChange={(value) => setCreateLinkedForm({ ...createLinkedForm, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="story">Story</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="bug">Bug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select value={createLinkedForm.priority} onValueChange={(value) => setCreateLinkedForm({ ...createLinkedForm, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Link Type</Label>
                    <Select value={createLinkedForm.link_type} onValueChange={(value) => setCreateLinkedForm({ ...createLinkedForm, link_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relates to">Relates to</SelectItem>
                        <SelectItem value="blocks">Blocks</SelectItem>
                        <SelectItem value="depends on">Depends on</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateLinkedOpen(false)}>Cancel</Button>
                  <Button type="submit">Create & Link</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {linkedIssues.length === 0 ? (
        <p className="text-sm text-muted-foreground">No linked issues</p>
      ) : (
        <div className="space-y-2">
          {linkedIssues.map((link) => (
            <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium">{link.linked_issue.key}</span>
                  {getLinkTypeBadge(link.link_type)}
                  <Badge variant="outline" className="text-xs">{link.linked_issue.status}</Badge>
                </div>
                <p className="text-sm">{link.linked_issue.summary}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleUnlinkIssue(link.id)}
                className="text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}