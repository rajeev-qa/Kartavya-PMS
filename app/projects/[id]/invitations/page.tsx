"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Mail, Plus, X, ArrowLeft } from "lucide-react"
import { projectsAPI } from "@/lib/api"
import { toast } from "react-hot-toast"

export default function ProjectInvitations() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  
  const [project, setProject] = useState<any>(null)
  const [invitations, setInvitations] = useState<any[]>([])
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "developer",
    message: ""
  })

  useEffect(() => {
    fetchProjectData()
    fetchInvitations()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const response = await projectsAPI.getById(projectId)
      setProject(response.project)
    } catch (error) {
      toast.error("Failed to fetch project data")
    }
  }

  const fetchInvitations = async () => {
    // Mock data - in real app would fetch from API
    setInvitations([
      {
        id: 1,
        email: "newdev@example.com",
        role: "developer",
        status: "pending",
        invited_by: "John Doe",
        invited_at: "2024-01-20T10:00:00Z",
        expires_at: "2024-01-27T10:00:00Z"
      },
      {
        id: 2,
        email: "designer@example.com",
        role: "user",
        status: "accepted",
        invited_by: "Jane Smith",
        invited_at: "2024-01-18T14:30:00Z",
        accepted_at: "2024-01-19T09:15:00Z"
      }
    ])
  }

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Mock invitation sending
      const newInvitation = {
        id: Date.now(),
        email: inviteForm.email,
        role: inviteForm.role,
        status: "pending",
        invited_by: "Current User",
        invited_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
      
      setInvitations([...invitations, newInvitation])
      setInviteForm({ email: "", role: "developer", message: "" })
      setIsInviteOpen(false)
      toast.success("Invitation sent successfully")
    } catch (error) {
      toast.error("Failed to send invitation")
    }
  }

  const handleCancelInvitation = async (invitationId: number) => {
    if (!confirm("Are you sure you want to cancel this invitation?")) return
    
    try {
      setInvitations(invitations.filter(inv => inv.id !== invitationId))
      toast.success("Invitation cancelled")
    } catch (error) {
      toast.error("Failed to cancel invitation")
    }
  }

  const handleResendInvitation = async (invitationId: number) => {
    try {
      setInvitations(invitations.map(inv => 
        inv.id === invitationId 
          ? { ...inv, invited_at: new Date().toISOString(), expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() }
          : inv
      ))
      toast.success("Invitation resent")
    } catch (error) {
      toast.error("Failed to resend invitation")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "accepted":
        return <Badge variant="default">Accepted</Badge>
      case "expired":
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-6">
          <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}/settings`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
          <div className="ml-4 flex items-center space-x-2">
            <Mail className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Team Invitations</h1>
          </div>
          <div className="ml-auto">
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSendInvitation} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                      placeholder="colleague@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={inviteForm.role} onValueChange={(value) => setInviteForm({ ...inviteForm, role: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="developer">Developer</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="message">Personal Message (Optional)</Label>
                    <Input
                      id="message"
                      value={inviteForm.message}
                      onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                      placeholder="Join our team on this project!"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Send Invitation</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project: {project?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage team invitations for this project. Invitations expire after 7 days.
              </p>
            </CardHeader>
            <CardContent>
              {invitations.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations sent</h3>
                  <p className="text-gray-500 mb-4">Start building your team by inviting members</p>
                  <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Send First Invitation
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invited By</TableHead>
                      <TableHead>Invited Date</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">{invitation.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{invitation.role}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(invitation.status)}</TableCell>
                        <TableCell>{invitation.invited_by}</TableCell>
                        <TableCell>{new Date(invitation.invited_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {invitation.status === "pending" ? (
                            <span className={new Date(invitation.expires_at) < new Date() ? "text-red-600" : ""}>
                              {new Date(invitation.expires_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {invitation.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResendInvitation(invitation.id)}
                                >
                                  Resend
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCancelInvitation(invitation.id)}
                                  className="text-red-600"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invitation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Default Role</h4>
                  <Select defaultValue="developer">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Default role assigned to new team members
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Invitation Expiry</h4>
                  <Select defaultValue="7">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    How long invitations remain valid
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}