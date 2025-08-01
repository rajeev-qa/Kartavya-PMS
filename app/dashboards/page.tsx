"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, BarChart3, Activity, Clock, Users, TrendingUp, Settings } from "lucide-react"
import { dashboardAPI, reportsAPI, adminAPI } from "@/lib/api"
import { toast } from "react-hot-toast"

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState<any[]>([])
  const [selectedDashboard, setSelectedDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAddGadgetOpen, setIsAddGadgetOpen] = useState(false)
  const [systemStats, setSystemStats] = useState<any>({})
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    is_shared: false
  })
  const [gadgetForm, setGadgetForm] = useState({
    type: "sprint_health",
    configuration: {}
  })

  useEffect(() => {
    fetchDashboards()
    fetchSystemStats()
  }, [])

  const fetchDashboards = async () => {
    try {
      const response = await dashboardAPI.getAll()
      setDashboards(response.dashboards || [])
      if (response.dashboards?.length > 0) {
        setSelectedDashboard(response.dashboards[0])
      }
    } catch (error) {
      toast.error("Failed to fetch dashboards")
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemStats = async () => {
    try {
      const response = await adminAPI.getStats()
      setSystemStats(response.stats || {})
    } catch (error) {
      console.error("Failed to fetch system stats")
    }
  }

  const handleCreateDashboard = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dashboardAPI.create(createForm.name, createForm.description, createForm.is_shared)
      setCreateForm({ name: "", description: "", is_shared: false })
      setIsCreateOpen(false)
      fetchDashboards()
      toast.success("Dashboard created successfully")
    } catch (error) {
      toast.error("Failed to create dashboard")
    }
  }

  const handleAddGadget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDashboard) return
    
    try {
      await dashboardAPI.addGadget(selectedDashboard.id, gadgetForm.type, gadgetForm.configuration)
      setGadgetForm({ type: "sprint_health", configuration: {} })
      setIsAddGadgetOpen(false)
      fetchDashboards()
      toast.success("Gadget added successfully")
    } catch (error) {
      toast.error("Failed to add gadget")
    }
  }

  const renderGadget = (gadget: any) => {
    switch (gadget.type) {
      case "system_stats":
        return (
          <Card key={gadget.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                System Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{systemStats.totalUsers || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{systemStats.totalProjects || 0}</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{systemStats.totalIssues || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{systemStats.completionRate || 0}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      
      case "sprint_health":
        return (
          <Card key={gadget.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Sprint Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Sprints</span>
                  <Badge variant="secondary">2</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Issues in Progress</span>
                  <Badge variant="default">{systemStats.activeIssues || 0}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completed Issues</span>
                  <Badge variant="outline">{systemStats.completedIssues || 0}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      
      case "recent_activity":
        return (
          <Card key={gadget.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">John Doe</span> updated issue PROJ-123
                  <div className="text-xs text-muted-foreground">2 hours ago</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Jane Smith</span> created new sprint
                  <div className="text-xs text-muted-foreground">4 hours ago</div>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Bob Johnson</span> completed issue PROJ-124
                  <div className="text-xs text-muted-foreground">6 hours ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      
      case "team_workload":
        return (
          <Card key={gadget.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Team Workload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">John Doe</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <span className="text-xs">5 issues</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Jane Smith</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                    <span className="text-xs">3 issues</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Bob Johnson</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: "90%" }}></div>
                    </div>
                    <span className="text-xs">7 issues</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      
      default:
        return (
          <Card key={gadget.id}>
            <CardHeader>
              <CardTitle>Unknown Gadget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Gadget type: {gadget.type}</p>
            </CardContent>
          </Card>
        )
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Dashboards</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Dashboard
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Dashboard</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateDashboard} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Dashboard Name</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create Dashboard</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="flex space-x-6">
          {/* Dashboard List */}
          <div className="w-64 space-y-2">
            <h2 className="font-semibold mb-4">My Dashboards</h2>
            {dashboards.map((dashboard) => (
              <Button
                key={dashboard.id}
                variant={selectedDashboard?.id === dashboard.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedDashboard(dashboard)}
              >
                {dashboard.name}
                {dashboard.is_shared && <Badge variant="secondary" className="ml-2">Shared</Badge>}
              </Button>
            ))}
          </div>

          {/* Dashboard Content */}
          <div className="flex-1">
            {selectedDashboard ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedDashboard.name}</h2>
                    {selectedDashboard.description && (
                      <p className="text-muted-foreground">{selectedDashboard.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Dialog open={isAddGadgetOpen} onOpenChange={setIsAddGadgetOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Gadget
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Gadget</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddGadget} className="space-y-4">
                          <div>
                            <Label htmlFor="gadgetType">Gadget Type</Label>
                            <Select value={gadgetForm.type} onValueChange={(value) => setGadgetForm({ ...gadgetForm, type: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="system_stats">System Statistics</SelectItem>
                                <SelectItem value="sprint_health">Sprint Health</SelectItem>
                                <SelectItem value="recent_activity">Recent Activity</SelectItem>
                                <SelectItem value="team_workload">Team Workload</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setIsAddGadgetOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit">Add Gadget</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Gadgets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedDashboard.gadgets?.length > 0 ? (
                    selectedDashboard.gadgets.map((gadget: any) => renderGadget(gadget))
                  ) : (
                    <>
                      {renderGadget({ id: 1, type: "system_stats" })}
                      {renderGadget({ id: 2, type: "sprint_health" })}
                      {renderGadget({ id: 3, type: "recent_activity" })}
                      {renderGadget({ id: 4, type: "team_workload" })}
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No dashboard selected</h3>
                <p className="text-gray-500">Select a dashboard from the sidebar or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}