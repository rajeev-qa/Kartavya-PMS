"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, CheckCircle } from "lucide-react"
import { issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"

interface SubTaskManagerProps {
  issueId: number
  subTasks: any[]
  users: any[]
  onUpdate: () => void
}

export default function SubTaskManager({ issueId, subTasks, users, onUpdate }: SubTaskManagerProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    summary: "",
    description: "",
    assignee_id: "",
    priority: "medium"
  })

  const handleCreateSubTask = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await issuesAPI.createSubTask(issueId, {
        ...createForm,
        assignee_id: createForm.assignee_id ? parseInt(createForm.assignee_id) : undefined
      })
      setCreateForm({ summary: "", description: "", assignee_id: "", priority: "medium" })
      setIsCreateOpen(false)
      onUpdate()
      toast.success("Sub-task created successfully")
    } catch (error) {
      toast.error("Failed to create sub-task")
    }
  }

  const handleStatusChange = async (subTaskId: number, newStatus: string) => {
    try {
      await issuesAPI.updateStatus(subTaskId, newStatus)
      onUpdate()
      toast.success("Sub-task status updated")
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Done":
        return <Badge variant="default" className="bg-green-600">Done</Badge>
      case "In Progress":
        return <Badge variant="default" className="bg-blue-600">In Progress</Badge>
      default:
        return <Badge variant="outline">To Do</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Sub-tasks ({subTasks.length})</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Sub-task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Sub-task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSubTask} className="space-y-4">
              <div>
                <Label>Summary</Label>
                <Input
                  value={createForm.summary}
                  onChange={(e) => setCreateForm({ ...createForm, summary: e.target.value })}
                  placeholder="Sub-task summary"
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Priority</Label>
                  <Select value={createForm.priority} onValueChange={(value) => setCreateForm({ ...createForm, priority: value })}>
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
                  <Label>Assignee</Label>
                  <Select value={createForm.assignee_id} onValueChange={(value) => setCreateForm({ ...createForm, assignee_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit">Create Sub-task</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {subTasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No sub-tasks</p>
      ) : (
        <div className="space-y-3">
          {subTasks.map((subTask) => (
            <div key={subTask.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium">{subTask.key}</span>
                    {getStatusBadge(subTask.status)}
                    <Badge variant="outline" className="text-xs">{subTask.priority}</Badge>
                  </div>
                  <h4 className="font-medium mb-1">{subTask.summary}</h4>
                  {subTask.description && (
                    <p className="text-sm text-muted-foreground mb-2">{subTask.description}</p>
                  )}
                  {subTask.assignee && (
                    <p className="text-xs text-muted-foreground">
                      Assigned to: {subTask.assignee.username}
                    </p>
                  )}
                </div>
                <div className="flex space-x-1">
                  {["To Do", "In Progress", "Done"].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={subTask.status === status ? "default" : "outline"}
                      onClick={() => handleStatusChange(subTask.id, status)}
                      className="text-xs"
                    >
                      {status === "Done" && <CheckCircle className="h-3 w-3 mr-1" />}
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}