"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Layout, Plus, Edit, Trash2, GripVertical, X, BarChart3, Activity, Clock, Users, Eye, GitBranch, Code } from "lucide-react"
import { dashboardAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function DashboardManagement() {
  const [dashboards, setDashboards] = useState<any[]>([])
  const [activeDashboard, setActiveDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGadgetDialogOpen, setIsGadgetDialogOpen] = useState(false)
  const [editingDashboard, setEditingDashboard] = useState<any>(null)

  const [createForm, setCreateForm] = useState({
    name: "",
    description: ""
  })
  
  const [editForm, setEditForm] = useState({
    name: "",
    description: ""
  })
  
  const [selectedGadgetType, setSelectedGadgetType] = useState("")
  
  const availableGadgets = [
    { id: "sprint-health", name: "Sprint Health", description: "Monitor sprint progress and health metrics", icon: Activity },
    { id: "watched-issues", name: "Watched Issues", description: "Display issues you are watching", icon: Eye },
    { id: "bamboo-charts", name: "Bamboo Charts", description: "Show build status from Bamboo", icon: GitBranch },
    { id: "crucible-charts", name: "Crucible Charts", description: "Display code review metrics", icon: Code },
    { id: "velocity-chart", name: "Velocity Chart", description: "Team velocity over time", icon: BarChart3 },
    { id: "burndown-chart", name: "Burndown Chart", description: "Sprint burndown progress", icon: BarChart3 },
    { id: "issue-statistics", name: "Issue Statistics", description: "Issue breakdown by status", icon: BarChart3 },
    { id: "recent-activity", name: "Recent Activity", description: "Latest project activity", icon: Activity }
  ]

  useEffect(() => {
    fetchDashboards()
  }, [])

  const fetchDashboards = async () => {
    try {
      const response = await dashboardAPI.getAll()
      const dashboardsData = response.dashboards || []
      
      // If no dashboards exist, create a default one
      if (dashboardsData.length === 0) {
        const defaultDashboard = await dashboardAPI.create(
          "My Dashboard", 
          "Personal dashboard", 
          false
        )
        
        // Add default gadgets
        await dashboardAPI.addGadget(defaultDashboard.dashboard.id, "sprint-health")
        await dashboardAPI.addGadget(defaultDashboard.dashboard.id, "velocity-chart")
        await dashboardAPI.addGadget(defaultDashboard.dashboard.id, "watched-issues")
        
        // Refetch dashboards
        const updatedResponse = await dashboardAPI.getAll()
        setDashboards(updatedResponse.dashboards || [])
        setActiveDashboard(updatedResponse.dashboards?.[0] || null)
      } else {
        setDashboards(dashboardsData)
        setActiveDashboard(dashboardsData[0])
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error)
      // Fallback to mock data if API fails
      const mockDashboards = [
        {
          id: 1,
          name: "My Dashboard",
          description: "Personal dashboard",
          isDefault: true,
          gadgets: [
            { id: 1, type: "sprint-health" },
            { id: 2, type: "velocity-chart" },
            { id: 3, type: "watched-issues" }
          ]
        }
      ]
      setDashboards(mockDashboards)
      setActiveDashboard(mockDashboards[0])
      toast.error("Using offline data - check backend connection")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await dashboardAPI.create(
        createForm.name,
        createForm.description,
        false
      )
      
      await fetchDashboards()
      setCreateForm({ name: "", description: "" })
      setIsCreateDialogOpen(false)
      toast.success("Dashboard created successfully")
    } catch (error) {
      console.error("Create dashboard error:", error)
      toast.error("Failed to create dashboard")
    }
  }

  const handleEditDashboard = (dashboard: any) => {
    setEditingDashboard(dashboard)
    setEditForm({
      name: dashboard.name,
      description: dashboard.description
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateDashboard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Note: dashboardAPI.update doesn't exist in current API, using local update for now
      const updatedDashboards = dashboards.map(d => 
        d.id === editingDashboard.id ? { ...d, ...editForm } : d
      )
      setDashboards(updatedDashboards)
      if (activeDashboard?.id === editingDashboard.id) {
        setActiveDashboard({ ...activeDashboard, ...editForm })
      }
      setIsEditDialogOpen(false)
      toast.success("Dashboard updated successfully")
    } catch (error) {
      toast.error("Failed to update dashboard")
    }
  }

  const handleDeleteDashboard = async (dashboardId: number) => {
    if (!confirm("Are you sure you want to delete this dashboard?")) return
    
    try {
      const updatedDashboards = dashboards.filter(d => d.id !== dashboardId)
      setDashboards(updatedDashboards)
      if (activeDashboard?.id === dashboardId) {
        setActiveDashboard(updatedDashboards[0] || null)
      }
      toast.success("Dashboard deleted successfully")
    } catch (error) {
      toast.error("Failed to delete dashboard")
    }
  }

  const handleAddGadget = async () => {
    if (!selectedGadgetType || !activeDashboard) return
    
    try {
      await dashboardAPI.addGadget(
        activeDashboard.id,
        selectedGadgetType,
        {} // configuration
      )
      
      await fetchDashboards()
      setIsGadgetDialogOpen(false)
      setSelectedGadgetType("")
      toast.success("Gadget added successfully")
    } catch (error) {
      console.error("Add gadget error:", error)
      // Fallback to local update if API fails
      const newGadget = {
        id: Date.now(),
        type: selectedGadgetType
      }
      
      const updatedDashboard = {
        ...activeDashboard,
        gadgets: [...(activeDashboard.gadgets || []), newGadget]
      }
      
      const updatedDashboards = dashboards.map(d => 
        d.id === activeDashboard.id ? updatedDashboard : d
      )
      
      setDashboards(updatedDashboards)
      setActiveDashboard(updatedDashboard)
      setIsGadgetDialogOpen(false)
      setSelectedGadgetType("")
      toast.success("Gadget added successfully (offline mode)")
    }
  }

  const handleRemoveGadget = (gadgetId: number) => {
    if (!activeDashboard) return
    
    const updatedGadgets = activeDashboard.gadgets.filter((g: any) => g.id !== gadgetId)
    const updatedDashboard = { ...activeDashboard, gadgets: updatedGadgets }
    
    const updatedDashboards = dashboards.map(d => 
      d.id === activeDashboard.id ? updatedDashboard : d
    )
    
    setDashboards(updatedDashboards)
    setActiveDashboard(updatedDashboard)
    toast.success("Gadget removed")
  }

  const renderGadget = (gadget: any) => {
    const gadgetInfo = availableGadgets.find(g => g.id === gadget.type)
    const IconComponent = gadgetInfo?.icon || BarChart3

    return (
      <Card key={gadget.id} className="cursor-move hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center">
              <IconComponent className="h-4 w-4 mr-2" />
              {gadgetInfo?.name || gadget.type}
            </CardTitle>
            <div className="flex items-center space-x-1">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemoveGadget(gadget.id)}
                className="text-red-600"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {gadget.type === "sprint-health" && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Sprint Progress:</span>
                <span className="font-medium">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
              <div className="text-xs text-muted-foreground">5 days remaining</div>
            </div>
          )}
          
          {gadget.type === "watched-issues" && (
            <div className="space-y-2">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>PROJ-123</span>
                  <Badge variant="outline">In Progress</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Fix login bug</p>
              </div>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>PROJ-124</span>
                  <Badge variant="outline">To Do</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Add user dashboard</p>
              </div>
            </div>
          )}
          
          {gadget.type === "bamboo-charts" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Build Status:</span>
                <Badge variant="default" className="bg-green-600">Passing</Badge>
              </div>
              <div className="text-xs text-muted-foreground">Last build: 2 hours ago</div>
              <div className="text-xs">Tests: 45/45 passing</div>
            </div>
          )}
          
          {gadget.type === "crucible-charts" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Code Reviews:</span>
                <span className="font-medium">3 pending</span>
              </div>
              <div className="text-xs text-muted-foreground">Average review time: 2.5 hours</div>
              <div className="text-xs">Approval rate: 92%</div>
            </div>
          )}
          
          {(gadget.type === "velocity-chart" || gadget.type === "burndown-chart" || gadget.type === "issue-statistics") && (
            <div className="h-24 bg-gray-100 rounded flex items-center justify-center">
              <div className="text-center">
                <IconComponent className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-500">Chart visualization</p>
              </div>
            </div>
          )}
          
          {gadget.type === "recent-activity" && (
            <div className="space-y-2">
              <div className="text-xs">
                <span className="font-medium">John</span> updated PROJ-123
                <div className="text-muted-foreground">2 minutes ago</div>
              </div>
              <div className="text-xs">
                <span className="font-medium">Jane</span> created PROJ-125
                <div className="text-muted-foreground">1 hour ago</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
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
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Management</h1>
              <p className="text-muted-foreground">Create and manage your dashboards with custom gadgets</p>
            </div>
            <div className="flex space-x-2">
              <Dialog open={isGadgetDialogOpen} onOpenChange={setIsGadgetDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={!activeDashboard}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Gadget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Gadget</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Gadget Type</Label>
                      <Select value={selectedGadgetType} onValueChange={setSelectedGadgetType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a gadget" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableGadgets.map((gadget) => (
                            <SelectItem key={gadget.id} value={gadget.id}>
                              {gadget.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedGadgetType && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {availableGadgets.find(g => g.id === selectedGadgetType)?.description}
                        </p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsGadgetDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleAddGadget} disabled={!selectedGadgetType}>Add Gadget</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Dashboard
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Dashboard</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateDashboard} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={createForm.name}
                        onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={createForm.description}
                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto">
            {dashboards.map((dashboard) => (
              <div key={dashboard.id} className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  variant={dashboard.id === activeDashboard?.id ? "default" : "outline"}
                  onClick={() => setActiveDashboard(dashboard)}
                >
                  {dashboard.name}
                  {dashboard.isDefault && <Badge variant="secondary" className="ml-2 text-xs">Default</Badge>}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEditDashboard(dashboard)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                {!dashboard.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteDashboard(dashboard.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {activeDashboard && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-semibold">{activeDashboard.name}</h2>
                {activeDashboard.description && (
                  <p className="text-muted-foreground">{activeDashboard.description}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeDashboard.gadgets.map((gadget: any) => renderGadget(gadget))}
                
                {activeDashboard.gadgets.length === 0 && (
                  <Card className="col-span-full">
                    <CardContent className="text-center py-8">
                      <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No gadgets added</h3>
                      <p className="text-muted-foreground mb-4">Add gadgets to customize your dashboard</p>
                      <Button onClick={() => setIsGadgetDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Gadget
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Dashboard</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleUpdateDashboard} className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                    id="edit-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Input
                    id="edit-description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
    </AppLayout>
  )
}