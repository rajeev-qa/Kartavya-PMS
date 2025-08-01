"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ArrowLeft, Settings, Save, Trash2, GitBranch, Users } from "lucide-react"
import { projectsAPI, usersAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function ProjectSettings() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  
  const [project, setProject] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    key: "",
    description: "",
    lead_user_id: ""
  })
  const [vcsForm, setVcsForm] = useState({
    type: "github",
    url: "",
    token: "",
    webhook_url: ""
  })

  useEffect(() => {
    fetchProjectData()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const [projectResponse, usersResponse] = await Promise.all([
        projectsAPI.getById(projectId),
        usersAPI.getAll()
      ])
      
      setProject(projectResponse.project)
      setUsers(usersResponse.users || [])
      setSettingsForm({
        name: projectResponse.project.name,
        key: projectResponse.project.key,
        description: projectResponse.project.description || "",
        lead_user_id: projectResponse.project.lead_user_id?.toString() || "none"
      })
      setVcsForm(projectResponse.project.vcs_config || {
        type: "github",
        url: "",
        token: "",
        webhook_url: ""
      })
    } catch (error) {
      toast.error("Failed to fetch project data")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await projectsAPI.update(projectId, {
        ...settingsForm,
        lead_user_id: settingsForm.lead_user_id && settingsForm.lead_user_id !== "none" ? parseInt(settingsForm.lead_user_id) : null
      })
      
      fetchProjectData()
      toast.success("Project settings updated successfully")
    } catch (error) {
      toast.error("Failed to update project settings")
    }
  }

  const handleUpdateVCS = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await projectsAPI.updateVCS(projectId, vcsForm)
      toast.success("Version control settings updated successfully")
    } catch (error) {
      toast.error("Failed to update version control settings")
    }
  }

  const handleDeleteProject = async () => {
    try {
      await projectsAPI.delete(projectId)
      toast.success("Project deleted successfully")
      router.push("/projects")
    } catch (error) {
      toast.error("Failed to delete project")
    }
  }

  const testVCSConnection = async () => {
    try {
      await projectsAPI.testVCS(projectId)
      toast.success("Connection test successful")
    } catch (error) {
      toast.error("Connection test failed")
    }
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
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Project Settings</h1>
              <p className="text-muted-foreground">Project: {project?.name}</p>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="vcs">Version Control</TabsTrigger>
              <TabsTrigger value="danger">Danger Zone</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    General Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateSettings} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name">Project Name</Label>
                        <Input
                          id="name"
                          value={settingsForm.name}
                          onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="key">Project Key</Label>
                        <Input
                          id="key"
                          value={settingsForm.key}
                          onChange={(e) => setSettingsForm({ ...settingsForm, key: e.target.value.toUpperCase() })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={settingsForm.description}
                        onChange={(e) => setSettingsForm({ ...settingsForm, description: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label htmlFor="lead">Project Lead</Label>
                      <Select value={settingsForm.lead_user_id} onValueChange={(value) => setSettingsForm({ ...settingsForm, lead_user_id: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project lead" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No lead assigned</SelectItem>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.username} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vcs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GitBranch className="h-5 w-5 mr-2" />
                    Version Control Integration
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Connect your project to a version control system for commit tracking
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateVCS} className="space-y-6">
                    <div>
                      <Label htmlFor="vcs-type">Version Control System</Label>
                      <Select value={vcsForm.type} onValueChange={(value) => setVcsForm({ ...vcsForm, type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="github">GitHub</SelectItem>
                          <SelectItem value="bitbucket">Bitbucket</SelectItem>
                          <SelectItem value="gitlab">GitLab</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="vcs-url">Repository URL</Label>
                      <Input
                        id="vcs-url"
                        value={vcsForm.url}
                        onChange={(e) => setVcsForm({ ...vcsForm, url: e.target.value })}
                        placeholder="https://github.com/username/repository"
                      />
                    </div>

                    <div>
                      <Label htmlFor="vcs-token">Access Token</Label>
                      <Input
                        id="vcs-token"
                        type="password"
                        value={vcsForm.token}
                        onChange={(e) => setVcsForm({ ...vcsForm, token: e.target.value })}
                        placeholder="ghp_xxxxxxxxxxxx"
                      />
                    </div>

                    <div>
                      <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
                      <Input
                        id="webhook-url"
                        value={vcsForm.webhook_url}
                        onChange={(e) => setVcsForm({ ...vcsForm, webhook_url: e.target.value })}
                        placeholder="https://your-domain.com/webhooks/commits"
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button type="button" variant="outline" onClick={testVCSConnection}>
                        Test Connection
                      </Button>
                      <Button type="submit">
                        <Save className="h-4 w-4 mr-2" />
                        Save VCS Settings
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="danger">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <Trash2 className="h-5 w-5 mr-2" />
                    Danger Zone
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Irreversible and destructive actions
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h3 className="font-medium text-red-800 mb-2">Delete Project</h3>
                      <p className="text-sm text-red-700 mb-4">
                        Once you delete a project, there is no going back. This will permanently delete the project, 
                        all issues, sprints, and associated data.
                      </p>
                      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                        <DialogTrigger asChild>
                          <Button variant="destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Project</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                              Are you sure you want to delete <strong>{project?.name}</strong>? 
                              This action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-2">
                              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                                Cancel
                              </Button>
                              <Button variant="destructive" onClick={handleDeleteProject}>
                                Delete Project
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  )
}