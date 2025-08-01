"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Trash2, Save, X } from "lucide-react"
import { issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"

interface CommentManagerProps {
  comments: any[]
  onUpdate: () => void
}

export default function CommentManager({ comments, onUpdate }: CommentManagerProps) {
  const [editingComment, setEditingComment] = useState<number | null>(null)
  const [editText, setEditText] = useState("")
  const [newComment, setNewComment] = useState("")

  const handleEditComment = (commentId: number, content: string) => {
    setEditingComment(commentId)
    setEditText(content)
  }

  const handleUpdateComment = async (commentId: number) => {
    try {
      await issuesAPI.updateComment(commentId, { content: editText })
      setEditingComment(null)
      setEditText("")
      onUpdate()
      toast.success("Comment updated")
    } catch (error) {
      toast.error("Failed to update comment")
    }
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) return
    
    try {
      await issuesAPI.deleteComment(commentId)
      onUpdate()
      toast.success("Comment deleted")
    } catch (error) {
      toast.error("Failed to delete comment")
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    
    try {
      await issuesAPI.addComment(comments[0]?.issue_id, { content: newComment })
      setNewComment("")
      onUpdate()
      toast.success("Comment added")
    } catch (error) {
      toast.error("Failed to add comment")
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{comment.author?.username}</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(comment.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditComment(comment.id, comment.content)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            {editingComment === comment.id ? (
              <div className="space-y-2">
                <Textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={3}
                />
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleUpdateComment(comment.id)}>
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setEditingComment(null)}>
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm">{comment.content}</p>
            )}
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
    </div>
  )
}