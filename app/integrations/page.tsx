"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { GitBranch, Play, Code, FileText, Settings, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { integrationsAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function Integrations() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [commits, setCommits] = useState<any[]>([])
  const [builds, setBuilds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isBuildDialogOpen, setIsBuildDialogOpen] = useState(false)
  const [isBranchDialogOpen, setIsBranchDialogOpen] = useState(false)
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false)
  const [isConfluenceDialogOpen, setIsConfluenceDialogOpen] = useState(false)

  const [buildForm, setBuildForm] = useState({
    project: "",
    branch: "main",
    version: ""
  })

  const [branchForm, setBranchForm] = useState({
    issueKey: "",
    branchName: "",
    repository: ""
  })

  const [commitForm, setCommitForm] = useState({
    issueKey: "",
    message: "",
    repository: "",
    smartCommands: ""
  })

  const [confluenceForm, setConfluenceForm] = useState({
    issueKey: "",
    pageTitle: "",
    spaceKey: "",
    content: ""
  })

  useEffect(() => {
    fetchIntegrationData()
  }, [])

  const fetchIntegrationData = async () => {
    try {
      // Try to fetch real integration data
      const response = await integrationsAPI.getAll()
      setIntegrations(response.integrations || [])
      
      // If no integrations exist, create some sample ones
      if (!response.integrations || response.integrations.length === 0) {
        // Create sample integrations for demo
        const sampleIntegrations = [
          {
            type: "repository",
            name: "GitHub Integration",
            config: {
              url: "https://github.com/company/project",
              status: "connected",
              lastSync: new Date().toISOString()
            }
          },
          {
            type: "build",
            name: "Bamboo CI",
            config: {
              url: "https://bamboo.company.com",
              status: "connected",
              lastSync: new Date().toISOString()
            }
          }
        ]
        
        // Note: In a real app, you wouldn't auto-create integrations
        // This is just for demo purposes
        setIntegrations(sampleIntegrations.map((integration, index) => ({
          id: index + 1,
          ...integration,
          status: integration.config.status,
          url: integration.config.url,
          lastSync: integration.config.lastSync
        })))
      }
    } catch (error) {
      console.error("Integration fetch error:", error)
      // Fallback to mock data if API fails
      setIntegrations([
        {
          id: 1,
          name: "GitHub",
          type: "repository",
          status: "connected",
          url: "https://github.com/company/project",
          lastSync: "2024-01-15T10:30:00Z"
        },
        {
          id: 2,
          name: "Bamboo CI",
          type: "build",
          status: "connected",
          url: "https://bamboo.company.com",
          lastSync: "2024-01-15T09:45:00Z"
        },
        {
          id: 3,
          name: "Confluence",
          type: "documentation",
          status: "connected",
          url: "https://company.atlassian.net/wiki",
          lastSync: "2024-01-15T08:20:00Z"
        },
        {
          id: 4,
          name: "Crucible",
          type: "code-review",
          status: "disconnected",
          url: "https://crucible.company.com",
          lastSync: null
        }
      ])
      toast.error("Using offline data - check backend connection")
    }

    // Mock commits data (would come from Git integration in real app)
    setCommits([
      {
        id: 1,
        hash: "abc123",
        message: "PROJ-123 Fix login bug #close",
        author: "john.doe",
        timestamp: "2024-01-15T10:30:00Z",
        issueKey: "PROJ-123",
        status: "success",
        smartCommands: ["close"]
      },
      {
        id: 2,
        hash: "def456",
        message: "PROJ-124 Add user dashboard #time 2h",
        author: "jane.smith",
        timestamp: "2024-01-15T09:15:00Z",
        issueKey: "PROJ-124",
        status: "pending",
        smartCommands: ["time"]
      }
    ])

    // Mock builds data (would come from CI/CD integration in real app)
    setBuilds([
      {
        id: 1,
        buildNumber: "123",
        status: "success",
        project: "main-project",
        branch: "main",
        timestamp: "2024-01-15T10:45:00Z",
        duration: "2m 34s",
        triggeredBy: "version-release"
      },
      {
        id: 2,
        buildNumber: "122",
        status: "failed",
        project: "main-project",
        branch: "feature/login-fix",
        timestamp: "2024-01-15T09:30:00Z",
        duration: "1m 12s",
        triggeredBy: "commit"
      }
    ])
    } finally {
      setLoading(false)
    }
  }

  const handleRunBuild = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Mock build trigger
      const newBuild = {
        id: Date.now(),
        buildNumber: Math.floor(Math.random() * 1000).toString(),
        status: "running",
        project: buildForm.project,
        branch: buildForm.branch,
        timestamp: new Date().toISOString(),
        duration: "0s",
        triggeredBy: "manual"
      }
      
      setBuilds([newBuild, ...builds])
      setBuildForm({ project: "", branch: "main", version: "" })
      setIsBuildDialogOpen(false)
      toast.success("Build triggered successfully")
      
      // Simulate build completion
      setTimeout(() => {
        setBuilds(prev => prev.map(build => 
          build.id === newBuild.id 
            ? { ...build, status: "success", duration: "2m 15s" }
            : build
        ))
        toast.success("Build completed successfully")
      }, 3000)
    } catch (error) {
      toast.error("Failed to trigger build")
    }
  }

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Mock branch creation
      toast.success(`Branch '${branchForm.branchName}' created for ${branchForm.issueKey}`)
      setBranchForm({ issueKey: "", branchName: "", repository: "" })
      setIsBranchDialogOpen(false)
    } catch (error) {
      toast.error("Failed to create branch")
    }
  }

  const handleCreateCommit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const smartCommands = commitForm.smartCommands.split(',').map(cmd => cmd.trim()).filter(Boolean)
      
      const newCommit = {
        id: Date.now(),
        hash: Math.random().toString(36).substring(7),
        message: `${commitForm.issueKey} ${commitForm.message} ${commitForm.smartCommands ? `#${commitForm.smartCommands}` : ''}`,
        author: "current.user",
        timestamp: new Date().toISOString(),
        issueKey: commitForm.issueKey,
        status: "pending",
        smartCommands
      }
      
      setCommits([newCommit, ...commits])
      setCommitForm({ issueKey: "", message: "", repository: "", smartCommands: "" })
      setIsCommitDialogOpen(false)
      toast.success("Commit created with Smart Commands")
      
      // Process smart commands
      if (smartCommands.includes("close")) {
        toast.success(`Issue ${commitForm.issueKey} will be closed`)
      }
      if (smartCommands.some(cmd => cmd.startsWith("time"))) {
        toast.success("Time logged to issue")
      }
    } catch (error) {
      toast.error("Failed to create commit")
    }
  }

  const handleLinkConfluence = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Mock Confluence integration
      toast.success(`Confluence page '${confluenceForm.pageTitle}' linked to ${confluenceForm.issueKey}`)
      setConfluenceForm({ issueKey: "", pageTitle: "", spaceKey: "", content: "" })
      setIsConfluenceDialogOpen(false)
    } catch (error) {
      toast.error("Failed to link Confluence page")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "disconnected":
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case "running":
      case "pending":
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
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
      <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Integrations</h1>
              <p className="text-muted-foreground">Manage external tool integrations and development workflow</p>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isBuildDialogOpen} onOpenChange={setIsBuildDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    Run Build
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Trigger Bamboo Build</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleRunBuild} className="space-y-4">
                    <div>
                      <Label>Project</Label>
                      <Input
                        value={buildForm.project}
                        onChange={(e) => setBuildForm({ ...buildForm, project: e.target.value })}
                        placeholder="main-project"
                        required
                      />
                    </div>
                    <div>
                      <Label>Branch</Label>
                      <Input
                        value={buildForm.branch}
                        onChange={(e) => setBuildForm({ ...buildForm, branch: e.target.value })}
                        placeholder="main"
                        required
                      />
                    </div>
                    <div>
                      <Label>Version (optional)</Label>
                      <Input
                        value={buildForm.version}
                        onChange={(e) => setBuildForm({ ...buildForm, version: e.target.value })}
                        placeholder="1.0.0"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsBuildDialogOpen(false)}>Cancel</Button>
                      <Button type="submit">Trigger Build</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="repository">Repository</TabsTrigger>
              <TabsTrigger value="builds">Builds</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          {integration.type === "repository" && <GitBranch className="h-5 w-5 mr-2" />}
                          {integration.type === "build" && <Play className="h-5 w-5 mr-2" />}
                          {integration.type === "documentation" && <FileText className="h-5 w-5 mr-2" />}
                          {integration.type === "code-review" && <Code className="h-5 w-5 mr-2" />}
                          {integration.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(integration.status)}
                          <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                            {integration.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <a href={integration.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {integration.url}
                          </a>
                        </div>
                        {integration.lastSync && (
                          <p className="text-xs text-muted-foreground">
                            Last sync: {new Date(integration.lastSync).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="repository">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Repository Integration</h3>
                  <div className="flex space-x-2">
                    <Dialog open={isBranchDialogOpen} onOpenChange={setIsBranchDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <GitBranch className="h-4 w-4 mr-2" />
                          Create Branch
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Branch from Issue</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateBranch} className="space-y-4">
                          <div>
                            <Label>Issue Key</Label>
                            <Input
                              value={branchForm.issueKey}
                              onChange={(e) => setBranchForm({ ...branchForm, issueKey: e.target.value })}
                              placeholder="PROJ-123"
                              required
                            />
                          </div>
                          <div>
                            <Label>Branch Name</Label>
                            <Input
                              value={branchForm.branchName}
                              onChange={(e) => setBranchForm({ ...branchForm, branchName: e.target.value })}
                              placeholder="feature/fix-login-bug"
                              required
                            />
                          </div>
                          <div>
                            <Label>Repository</Label>
                            <Input
                              value={branchForm.repository}
                              onChange={(e) => setBranchForm({ ...branchForm, repository: e.target.value })}
                              placeholder="origin"
                              required
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsBranchDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Branch</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={isCommitDialogOpen} onOpenChange={setIsCommitDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Code className="h-4 w-4 mr-2" />
                          Create Commit
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Smart Commit</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateCommit} className="space-y-4">
                          <div>
                            <Label>Issue Key</Label>
                            <Input
                              value={commitForm.issueKey}
                              onChange={(e) => setCommitForm({ ...commitForm, issueKey: e.target.value })}
                              placeholder="PROJ-123"
                              required
                            />
                          </div>
                          <div>
                            <Label>Commit Message</Label>
                            <Input
                              value={commitForm.message}
                              onChange={(e) => setCommitForm({ ...commitForm, message: e.target.value })}
                              placeholder="Fix login validation bug"
                              required
                            />
                          </div>
                          <div>
                            <Label>Smart Commands</Label>
                            <Input
                              value={commitForm.smartCommands}
                              onChange={(e) => setCommitForm({ ...commitForm, smartCommands: e.target.value })}
                              placeholder="close, time 2h, comment Fixed the issue"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Available commands: close, time [duration], comment [text], transition [status]
                            </p>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsCommitDialogOpen(false)}>Cancel</Button>
                            <Button type="submit">Create Commit</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Commits</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {commits.map((commit) => (
                        <div key={commit.id} className="flex items-start justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">{commit.hash}</code>
                              <Badge variant="outline">{commit.issueKey}</Badge>
                              {getStatusIcon(commit.status)}
                            </div>
                            <p className="text-sm font-medium">{commit.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                              <span>by {commit.author}</span>
                              <span>{new Date(commit.timestamp).toLocaleString()}</span>
                              {commit.smartCommands.length > 0 && (
                                <div className="flex space-x-1">
                                  {commit.smartCommands.map((cmd, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">#{cmd}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="builds">
              <Card>
                <CardHeader>
                  <CardTitle>Build History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {builds.map((build) => (
                      <div key={build.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(build.status)}
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">#{build.buildNumber}</span>
                              <Badge variant="outline">{build.project}</Badge>
                              <Badge variant="secondary">{build.branch}</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {new Date(build.timestamp).toLocaleString()} • {build.duration} • {build.triggeredBy}
                            </div>
                          </div>
                        </div>
                        <Badge variant={build.status === "success" ? "default" : build.status === "failed" ? "destructive" : "secondary"}>
                          {build.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documentation">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Confluence Integration</h3>
                  <Dialog open={isConfluenceDialogOpen} onOpenChange={setIsConfluenceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        Link to Confluence
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Link Issue to Confluence</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleLinkConfluence} className="space-y-4">
                        <div>
                          <Label>Issue Key</Label>
                          <Input
                            value={confluenceForm.issueKey}
                            onChange={(e) => setConfluenceForm({ ...confluenceForm, issueKey: e.target.value })}
                            placeholder="PROJ-123"
                            required
                          />
                        </div>
                        <div>
                          <Label>Page Title</Label>
                          <Input
                            value={confluenceForm.pageTitle}
                            onChange={(e) => setConfluenceForm({ ...confluenceForm, pageTitle: e.target.value })}
                            placeholder="Technical Documentation"
                            required
                          />
                        </div>
                        <div>
                          <Label>Space Key</Label>
                          <Input
                            value={confluenceForm.spaceKey}
                            onChange={(e) => setConfluenceForm({ ...confluenceForm, spaceKey: e.target.value })}
                            placeholder="PROJ"
                            required
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsConfluenceDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Link Page</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <Card>
                  <CardContent className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Confluence Integration</h3>
                    <p className="text-muted-foreground mb-4">Link issues to Confluence pages for comprehensive documentation</p>
                    <Button onClick={() => setIsConfluenceDialogOpen(true)}>
                      Link Your First Page
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
    </AppLayout>
  )
}
