"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, UserPlus, Mail, Trash2 } from "lucide-react"
import { projectsAPI, usersAPI, rolesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function ProjectTeam() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  
  const [project, setProject] = useState<any>(null)
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState("")
  const [memberRole, setMemberRole] = useState("")

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const [projectResponse, usersResponse, rolesResponse] = await Promise.all([
        projectsAPI.getById(projectId),
        usersAPI.getAll(),
        rolesAPI.getAll()
      ])
      
      setProject(projectResponse.project)
      setTeamMembers(projectResponse.project.users || [])
      setAllUsers(usersResponse.users || [])
      setRoles(rolesResponse || [])
      
      // Set default role to first available role
      if (rolesResponse && rolesResponse.length > 0 && !memberRole) {
        setMemberRole(rolesResponse[0].name)
      }
    } catch (error) {
      toast.error("Failed to fetch project data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    try {
      await projectsAPI.addTeamMember(projectId, parseInt(selectedUser), memberRole)
      
      setSelectedUser("")
      setMemberRole(roles.length > 0 ? roles[0].name : "")
      setIsAddOpen(false)
      fetchProjectData()
      toast.success("Team member added successfully")
    } catch (error) {
      toast.error("Failed to add team member")
    }
  }

  const availableUsers = allUsers.filter(user => 
    !teamMembers.some(member => member.user?.id === user.id)
  )

  const getRoleBadge = (role: string) => {
    const roleObj = roles.find(r => r.name === role)
    if (roleObj) {
      return <Badge variant={roleObj.isSystem ? "destructive" : "default"}>{roleObj.name}</Badge>
    }
    return <Badge variant="secondary">{role}</Badge>
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Team Management</h1>
                <p className="text-muted-foreground">Project: {project?.name}</p>
              </div>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <Label htmlFor="user">Select User</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.username} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select value={memberRole} onValueChange={setMemberRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name} {role.isSystem && '(System)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Member</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Members ({teamMembers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                  <p className="text-muted-foreground mb-4">Add team members to collaborate on this project</p>
                  <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add First Member
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {member.user?.username?.substring(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">{member.user?.username || "Unknown"}</h3>
                          <p className="text-sm text-muted-foreground">{member.user?.email || ""}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {getRoleBadge(member.role)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}