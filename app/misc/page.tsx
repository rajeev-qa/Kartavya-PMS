"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Home, Package, AlertTriangle, RefreshCw, Settings, Plus, Edit, Trash2, GripVertical, Eye, BarChart3 } from "lucide-react"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function MiscellaneousFeatures() {
  const [homepageSettings, setHomepageSettings] = useState({ defaultPage: "dashboard" })
  const [releases, setReleases] = useState<any[]>([])
  const [customFields, setCustomFields] = useState<any[]>([])
  const [backlogItems, setBacklogItems] = useState<any[]>([])
  const [modelChanges, setModelChanges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false)
  const [isSyncDialogOpen, setIsSyncDialogOpen] = useState(false)

  const [fieldForm, setFieldForm] = useState({
    name: "",
    type: "text",
    required: false,
    options: ""
  })

  useEffect(() => {
    fetchMiscData()
  }, [])

  const fetchMiscData = async () => {
    try {
      // Mock data
      setReleases([
        {
          id: 1,
          name: "v1.2.0",
          status: "in_progress",
          releaseDate: "2024-02-15",
          issues: 15,
          completedIssues: 12,
          warnings: ["3 issues still in progress", "Missing test coverage for PROJ-123"]
        },
        {
          id: 2,
          name: "v1.1.0",
          status: "released",
          releaseDate: "2024-01-15",
          issues: 20,
          completedIssues: 20,
          warnings: []
        }
      ])

      setCustomFields([
        { id: 1, name: "Story Points", type: "number", required: false, order: 1 },
        { id: 2, name: "Business Value", type: "select", required: false, order: 2, options: ["High", "Medium", "Low"] },
        { id: 3, name: "Technical Debt", type: "checkbox", required: false, order: 3 }
      ])

      setBacklogItems([
        { id: 1, key: "PROJ-150", summary: "Implement user authentication", storyPoints: 8, priority: "high", status: "To Do" },
        { id: 2, key: "PROJ-151", summary: "Add payment integration", storyPoints: 13, priority: "medium", status: "To Do" },
        { id: 3, key: "PROJ-152", summary: "Optimize database queries", storyPoints: 5, priority: "low", status: "To Do" }
      ])

      setModelChanges([
        {
          id: 1,
          type: "field_added",
          entity: "Issue",
          change: "Added 'Story Points' field",
          timestamp: "2024-01-15T10:30:00Z",
          user: "admin"
        },
        {
          id: 2,
          type: "workflow_modified",
          entity: "Project",
          change: "Modified default workflow transitions",
          timestamp: "2024-01-14T15:20:00Z",
          user: "project_lead"
        }
      ])
    } catch (error) {
      toast.error("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleHomepageChange = (page: string) => {
    setHomepageSettings({ defaultPage: page })
    toast.success(`Homepage set to ${page}`)
  }

  const handleAddCustomField = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newField = {
        id: Date.now(),
        ...fieldForm,
        order: customFields.length + 1,
        options: fieldForm.options ? fieldForm.options.split(',').map(o => o.trim()) : []
      }
      
      setCustomFields([...customFields, newField])
      setFieldForm({ name: "", type: "text", required: false, options: "" })
      setIsFieldDialogOpen(false)
      toast.success("Custom field added")
    } catch (error) {
      toast.error("Failed to add field")
    }
  }

  const handleSyncRepository = async () => {
    try {
      // Mock sync process
      toast.success("Repository synchronization started")
      
      // Simulate sync completion
      setTimeout(() => {
        toast.success("Repository synchronized successfully")
        // Update some backlog items status
        setBacklogItems(prev => prev.map(item => 
          item.id === 1 ? { ...item, status: "In Progress" } : item
        ))
      }, 2000)
      
      setIsSyncDialogOpen(false)
    } catch (error) {
      toast.error("Failed to sync repository")
    }
  }

  const handleDeleteField = (fieldId: number) => {
    setCustomFields(customFields.filter(f => f.id !== fieldId))
    toast.success("Field deleted")
  }

  const moveField = (fieldId: number, direction: "up" | "down") => {
    const fieldIndex = customFields.findIndex(f => f.id === fieldId)
    if (fieldIndex === -1) return
    
    const newFields = [...customFields]
    const targetIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1
    
    if (targetIndex >= 0 && targetIndex < newFields.length) {
      [newFields[fieldIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[fieldIndex]]
      
      // Update order
      newFields.forEach((field, index) => {
        field.order = index + 1
      })
      
      setCustomFields(newFields)
      toast.success("Field order updated")
    }
  }

  const updateStoryPoints = (itemId: number, points: number) => {
    setBacklogItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, storyPoints: points } : item
    ))
    toast.success("Story points updated")
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
              <h1 className="text-2xl font-bold">System Configuration</h1>
              <p className="text-muted-foreground">Miscellaneous settings and system features</p>
            </div>
            <Dialog open={isSyncDialogOpen} onOpenChange={setIsSyncDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Repository
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Synchronize with Repository</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This will update issue statuses based on changes in linked repositories.
                  </p>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsSyncDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSyncRepository}>Start Sync</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="homepage" className="space-y-6">
            <TabsList>
              <TabsTrigger value="homepage">Homepage</TabsTrigger>
              <TabsTrigger value="releases">Release Hub</TabsTrigger>
              <TabsTrigger value="fields">Custom Fields</TabsTrigger>
              <TabsTrigger value="backlog">Long-term Backlog</TabsTrigger>
              <TabsTrigger value="changes">Model Changes</TabsTrigger>
            </TabsList>

            <TabsContent value="homepage">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home className="h-5 w-5 mr-2" />
                    Choose Homepage
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Set the default landing page for users when they log in.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { id: "dashboard", name: "Dashboard", description: "Personal dashboard with widgets" },
                      { id: "projects", name: "Projects", description: "Project overview and management" },
                      { id: "board", name: "Board", description: "Active project board" }
                    ].map((option) => (
                      <Card 
                        key={option.id}
                        className={`cursor-pointer transition-colors ${
                          homepageSettings.defaultPage === option.id ? "border-primary bg-primary/5" : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleHomepageChange(option.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              homepageSettings.defaultPage === option.id ? "border-primary bg-primary" : "border-gray-300"
                            }`} />
                            <span className="font-medium">{option.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{option.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="releases">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Release Hub
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {releases.map((release) => (
                        <div key={release.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <h3 className="font-semibold">{release.name}</h3>
                              <Badge variant={release.status === "released" ? "default" : "secondary"}>
                                {release.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(release.releaseDate).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold">{release.completedIssues}</div>
                              <div className="text-xs text-muted-foreground">Completed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{release.issues - release.completedIssues}</div>
                              <div className="text-xs text-muted-foreground">Remaining</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold">{Math.round((release.completedIssues / release.issues) * 100)}%</div>
                              <div className="text-xs text-muted-foreground">Progress</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">{release.warnings.length}</div>
                              <div className="text-xs text-muted-foreground">Warnings</div>
                            </div>
                          </div>

                          {release.warnings.length > 0 && (
                            <div className="bg-orange-50 border border-orange-200 rounded p-3">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                <span className="font-medium text-orange-800">Warnings</span>
                              </div>
                              <ul className="text-sm text-orange-700 space-y-1">
                                {release.warnings.map((warning, index) => (
                                  <li key={index}>• {warning}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="fields">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Custom Issue Fields</h3>
                  <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Custom Field</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddCustomField} className="space-y-4">
                        <div>
                          <Label>Field Name</Label>
                          <Input
                            value={fieldForm.name}
                            onChange={(e) => setFieldForm({ ...fieldForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Field Type</Label>
                          <Select value={fieldForm.type} onValueChange={(value) => setFieldForm({ ...fieldForm, type: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="select">Select</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                              <SelectItem value="date">Date</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {fieldForm.type === "select" && (
                          <div>
                            <Label>Options (comma-separated)</Label>
                            <Input
                              value={fieldForm.options}
                              onChange={(e) => setFieldForm({ ...fieldForm, options: e.target.value })}
                              placeholder="Option 1, Option 2, Option 3"
                            />
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={fieldForm.required}
                            onChange={(e) => setFieldForm({ ...fieldForm, required: e.target.checked })}
                          />
                          <Label>Required field</Label>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsFieldDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Add Field</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {customFields.map((field, index) => (
                    <div key={field.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex flex-col space-y-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveField(field.id, "up")}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveField(field.id, "down")}
                            disabled={index === customFields.length - 1}
                          >
                            ↓
                          </Button>
                        </div>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <span className="font-medium">{field.name}</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{field.type}</Badge>
                            {field.required && <Badge variant="secondary">Required</Badge>}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteField(field.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="backlog">
              <Card>
                <CardHeader>
                  <CardTitle>Long-term Backlog Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {backlogItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline">{item.key}</Badge>
                            <Badge variant="secondary">{item.priority}</Badge>
                            <Badge variant="outline">{item.status}</Badge>
                          </div>
                          <h4 className="font-medium">{item.summary}</h4>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">Story Points:</span>
                            <Input
                              type="number"
                              value={item.storyPoints}
                              onChange={(e) => updateStoryPoints(item.id, parseInt(e.target.value) || 0)}
                              className="w-16"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="changes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Model Changes Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {modelChanges.map((change) => (
                      <div key={change.id} className="flex items-start space-x-4 p-3 border rounded-lg">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          change.type === "field_added" ? "bg-green-500" : 
                          change.type === "workflow_modified" ? "bg-blue-500" : "bg-gray-500"
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{change.entity}</span>
                            <Badge variant="outline">{change.type.replace("_", " ")}</Badge>
                          </div>
                          <p className="text-sm">{change.change}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(change.timestamp).toLocaleString()} by {change.user}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </AppLayout>
  )
}
