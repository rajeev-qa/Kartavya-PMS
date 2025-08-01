"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Settings, GitBranch, Zap, MessageSquare, TestTube } from "lucide-react"
import { integrationsAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null)
  const [createForm, setCreateForm] = useState({
    type: "",
    name: "",
    config: {
      url: "",
      token: "",
      webhook_url: ""
    }
  })

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const response = await integrationsAPI.getAll()
      setIntegrations(response.integrations || [])
    } catch (error) {
      toast.error("Failed to fetch integrations")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateIntegration = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await integrationsAPI.create(createForm)
      setCreateForm({ type: "", name: "", config: { url: "", token: "", webhook_url: "" } })
      setIsCreateOpen(false)
      fetchIntegrations()
      toast.success("Integration created successfully")
    } catch (error) {
      toast.error("Failed to create integration")
    }
  }

  const handleToggleIntegration = async (integrationId: number, enabled: boolean) => {
    try {
      await integrationsAPI.toggle(integrationId, enabled)
      fetchIntegrations()
      toast.success(`Integration ${enabled ? 'enabled' : 'disabled'}`)
    } catch (error) {
      toast.error("Failed to toggle integration")
    }
  }

  const handleTestConnection = async (integrationId: number) => {
    try {
      await integrationsAPI.test(integrationId)
      toast.success("Connection test successful")
    } catch (error) {
      toast.error("Connection test failed")
    }
  }

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "github":
      case "bitbucket":
        return <GitBranch className="h-6 w-6" />
      case "slack":
        return <MessageSquare className="h-6 w-6" />
      case "bamboo":
      case "jenkins":
        return <TestTube className="h-6 w-6" />
      default:
        return <Zap className="h-6 w-6" />
    }
  }

  const availableIntegrations = [
    { type: "github", name: "GitHub", description: "Connect to GitHub repositories for commit tracking" },
    { type: "bitbucket", name: "Bitbucket", description: "Connect to Bitbucket repositories" },
    { type: "slack", name: "Slack", description: "Send notifications to Slack channels" },
    { type: "bamboo", name: "Bamboo", description: "Trigger builds and deployments" },
    { type: "jenkins", name: "Jenkins", description: "CI/CD pipeline integration" },
    { type: "confluence", name: "Confluence", description: "Link issues to documentation" }
  ]

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
            <div>
              <h1 className="text-2xl font-bold">Integrations</h1>
              <p className="text-muted-foreground">Connect external tools and services</p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Integration</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateIntegration} className="space-y-4">
                  <div>
                    <Label htmlFor="type">Integration Type</Label>
                    <select
                      id="type"
                      value={createForm.type}
                      onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">Select type</option>
                      {availableIntegrations.map((integration) => (
                        <option key={integration.type} value={integration.type}>
                          {integration.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="My GitHub Integration"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={createForm.config.url}
                      onChange={(e) => setCreateForm({ 
                        ...createForm, 
                        config: { ...createForm.config, url: e.target.value }
                      })}
                      placeholder="https://api.github.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="token">Access Token</Label>
                    <Input
                      id="token"
                      type="password"
                      value={createForm.config.token}
                      onChange={(e) => setCreateForm({ 
                        ...createForm, 
                        config: { ...createForm.config, token: e.target.value }
                      })}
                      placeholder="ghp_xxxxxxxxxxxx"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add Integration</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-6">
            {integrations.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No integrations configured</h3>
                  <p className="text-muted-foreground mb-4">Connect external tools to enhance your workflow</p>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Integration
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </CardContent>
              </Card>
            ) : (
              integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getIntegrationIcon(integration.type)}
                        <div>
                          <CardTitle>{integration.name}</CardTitle>
                          <p className="text-sm text-muted-foreground capitalize">
                            {integration.type} Integration
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={integration.enabled ? "default" : "secondary"}>
                          {integration.enabled ? "Enabled" : "Disabled"}
                        </Badge>
                        <Switch
                          checked={integration.enabled}
                          onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">URL:</span>
                          <p className="font-medium">{integration.config?.url || "Not configured"}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Status:</span>
                          <p className="font-medium">
                            {integration.last_sync ? "Connected" : "Not tested"}
                          </p>
                        </div>
                      </div>
                      
                      {integration.last_sync && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Last sync:</span>
                          <p className="font-medium">
                            {new Date(integration.last_sync).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTestConnection(integration.id)}
                        >
                          Test Connection
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedIntegration(integration)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Integrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableIntegrations.map((integration) => (
                  <div key={integration.type} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-3 mb-2">
                      {getIntegrationIcon(integration.type)}
                      <h3 className="font-medium">{integration.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {integration.description}
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        setCreateForm({ ...createForm, type: integration.type, name: integration.name })
                        setIsCreateOpen(true)
                      }}
                    >
                      Add {integration.name}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}