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
import { Palette, Shield, Keyboard, Clock, Monitor, HelpCircle, Plus, Trash2 } from "lucide-react"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function AdminSettings() {
  const [cardColors, setCardColors] = useState<any[]>([])
  const [permissions, setPermissions] = useState<any[]>([])
  const [shortcuts, setShortcuts] = useState<any[]>([])
  const [timeSettings, setTimeSettings] = useState<any>({})
  const [platforms, setPlatforms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isColorDialogOpen, setIsColorDialogOpen] = useState(false)
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false)
  const [isShortcutDialogOpen, setIsShortcutDialogOpen] = useState(false)
  const [isSupportDialogOpen, setIsSupportDialogOpen] = useState(false)

  const [colorForm, setColorForm] = useState({
    name: "",
    criteria: "",
    color: "#3b82f6",
    condition: "equals"
  })

  const [permissionForm, setPermissionForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  })

  const [shortcutForm, setShortcutForm] = useState({
    action: "",
    key: "",
    description: ""
  })

  const [supportForm, setSupportForm] = useState({
    subject: "",
    priority: "medium",
    description: "",
    category: "technical"
  })

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      setCardColors([
        { id: 1, name: "High Priority", criteria: "priority", condition: "equals", value: "high", color: "#ef4444" },
        { id: 2, name: "Bug Issues", criteria: "type", condition: "equals", value: "bug", color: "#f59e0b" },
        { id: 3, name: "Overdue", criteria: "due_date", condition: "before", value: "today", color: "#dc2626" }
      ])

      setPermissions([
        { id: 1, name: "Project Admin", description: "Full project management access", permissions: ["create_project", "edit_project", "delete_project", "manage_users"] },
        { id: 2, name: "Developer", description: "Development team access", permissions: ["create_issue", "edit_issue", "comment", "log_work"] },
        { id: 3, name: "Viewer", description: "Read-only access", permissions: ["view_project", "view_issue"] }
      ])

      setShortcuts([
        { id: 1, action: "Create Issue", key: "Ctrl+I", description: "Quick issue creation" },
        { id: 2, action: "Search", key: "Ctrl+K", description: "Open search dialog" },
        { id: 3, action: "Dashboard", key: "Ctrl+D", description: "Go to dashboard" }
      ])

      setTimeSettings({
        defaultUnit: "hours",
        workingHoursPerDay: 8,
        workingDaysPerWeek: 5,
        timeFormat: "decimal"
      })

      setPlatforms([
        { id: 1, name: "Windows", version: "10+", status: "supported" },
        { id: 2, name: "macOS", version: "10.15+", status: "supported" },
        { id: 3, name: "Linux", version: "Ubuntu 18.04+", status: "supported" },
        { id: 4, name: "iOS", version: "13+", status: "limited" },
        { id: 5, name: "Android", version: "8+", status: "limited" }
      ])
    } catch (error) {
      toast.error("Failed to fetch admin data")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCardColor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newColor = {
        id: Date.now(),
        ...colorForm
      }
      setCardColors([...cardColors, newColor])
      setColorForm({ name: "", criteria: "", color: "#3b82f6", condition: "equals" })
      setIsColorDialogOpen(false)
      toast.success("Card color rule created")
    } catch (error) {
      toast.error("Failed to create color rule")
    }
  }

  const handleCreatePermission = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newPermission = {
        id: Date.now(),
        ...permissionForm
      }
      setPermissions([...permissions, newPermission])
      setPermissionForm({ name: "", description: "", permissions: [] })
      setIsPermissionDialogOpen(false)
      toast.success("Permission scheme created")
    } catch (error) {
      toast.error("Failed to create permission scheme")
    }
  }

  const handleCreateShortcut = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newShortcut = {
        id: Date.now(),
        ...shortcutForm
      }
      setShortcuts([...shortcuts, newShortcut])
      setShortcutForm({ action: "", key: "", description: "" })
      setIsShortcutDialogOpen(false)
      toast.success("Keyboard shortcut created")
    } catch (error) {
      toast.error("Failed to create shortcut")
    }
  }

  const handleSubmitSupport = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      toast.success("Support request submitted successfully")
      setSupportForm({ subject: "", priority: "medium", description: "", category: "technical" })
      setIsSupportDialogOpen(false)
    } catch (error) {
      toast.error("Failed to submit support request")
    }
  }

  const handleDeleteItem = (type: string, id: number) => {
    switch (type) {
      case "color":
        setCardColors(cardColors.filter(c => c.id !== id))
        break
      case "permission":
        setPermissions(permissions.filter(p => p.id !== id))
        break
      case "shortcut":
        setShortcuts(shortcuts.filter(s => s.id !== id))
        break
    }
    toast.success("Item deleted")
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
            <div>
              <h1 className="text-2xl font-bold">Administrative Settings</h1>
              <p className="text-muted-foreground">Configure system settings and administrative options</p>
            </div>
            <Dialog open={isSupportDialogOpen} onOpenChange={setIsSupportDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Support Request
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Support Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitSupport} className="space-y-4">
                  <div>
                    <Label>Subject</Label>
                    <Input
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Priority</Label>
                      <Select value={supportForm.priority} onValueChange={(value) => setSupportForm({ ...supportForm, priority: value })}>
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
                      <Label>Category</Label>
                      <Select value={supportForm.category} onValueChange={(value) => setSupportForm({ ...supportForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="billing">Billing</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="bug">Bug Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={supportForm.description}
                      onChange={(e) => setSupportForm({ ...supportForm, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsSupportDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Submit Request</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="colors" className="space-y-6">
            <TabsList>
              <TabsTrigger value="colors">Card Colors</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
              <TabsTrigger value="time">Time Tracking</TabsTrigger>
              <TabsTrigger value="platforms">Platforms</TabsTrigger>
            </TabsList>

            <TabsContent value="colors">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Configure Card Colors</h3>
                  <Dialog open={isColorDialogOpen} onOpenChange={setIsColorDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Color Rule
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Card Color Rule</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateCardColor} className="space-y-4">
                        <div>
                          <Label>Rule Name</Label>
                          <Input
                            value={colorForm.name}
                            onChange={(e) => setColorForm({ ...colorForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Criteria</Label>
                            <Select value={colorForm.criteria} onValueChange={(value) => setColorForm({ ...colorForm, criteria: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="type">Issue Type</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                                <SelectItem value="assignee">Assignee</SelectItem>
                                <SelectItem value="due_date">Due Date</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Condition</Label>
                            <Select value={colorForm.condition} onValueChange={(value) => setColorForm({ ...colorForm, condition: value })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="before">Before</SelectItem>
                                <SelectItem value="after">After</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Color</Label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={colorForm.color}
                              onChange={(e) => setColorForm({ ...colorForm, color: e.target.value })}
                              className="w-12 h-10 rounded border"
                            />
                            <Input
                              value={colorForm.color}
                              onChange={(e) => setColorForm({ ...colorForm, color: e.target.value })}
                              placeholder="#3b82f6"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsColorDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Create Rule</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cardColors.map((color) => (
                    <Card key={color.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">{color.name}</CardTitle>
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-6 h-6 rounded border"
                              style={{ backgroundColor: color.color }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteItem("color", color.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground">
                          {color.criteria} {color.condition} {color.value}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Manage Permissions</h3>
                  <Dialog open={isPermissionDialogOpen} onOpenChange={setIsPermissionDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Permission Scheme
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Permission Scheme</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreatePermission} className="space-y-4">
                        <div>
                          <Label>Scheme Name</Label>
                          <Input
                            value={permissionForm.name}
                            onChange={(e) => setPermissionForm({ ...permissionForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={permissionForm.description}
                            onChange={(e) => setPermissionForm({ ...permissionForm, description: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsPermissionDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Create Scheme</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-4">
                  {permissions.map((permission) => (
                    <Card key={permission.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{permission.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteItem("permission", permission.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {permission.permissions.map((perm: string, index: number) => (
                            <Badge key={index} variant="secondary">
                              {perm.replace("_", " ")}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shortcuts">
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
                  <Dialog open={isShortcutDialogOpen} onOpenChange={setIsShortcutDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Shortcut
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Keyboard Shortcut</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateShortcut} className="space-y-4">
                        <div>
                          <Label>Action</Label>
                          <Input
                            value={shortcutForm.action}
                            onChange={(e) => setShortcutForm({ ...shortcutForm, action: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Key Combination</Label>
                          <Input
                            value={shortcutForm.key}
                            onChange={(e) => setShortcutForm({ ...shortcutForm, key: e.target.value })}
                            placeholder="Ctrl+K"
                            required
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Input
                            value={shortcutForm.description}
                            onChange={(e) => setShortcutForm({ ...shortcutForm, description: e.target.value })}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsShortcutDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Create Shortcut</Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  {shortcuts.map((shortcut) => (
                    <div key={shortcut.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{shortcut.action}</span>
                          <Badge variant="outline">{shortcut.key}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{shortcut.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteItem("shortcut", shortcut.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="time">
              <Card>
                <CardHeader>
                  <CardTitle>Time Tracking Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Default Time Unit</Label>
                      <Select value={timeSettings.defaultUnit} onValueChange={(value) => setTimeSettings({ ...timeSettings, defaultUnit: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hours">Hours</SelectItem>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="minutes">Minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Time Format</Label>
                      <Select value={timeSettings.timeFormat} onValueChange={(value) => setTimeSettings({ ...timeSettings, timeFormat: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="decimal">Decimal (8.5h)</SelectItem>
                          <SelectItem value="duration">Duration (8h 30m)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Working Hours per Day</Label>
                      <Input
                        type="number"
                        value={timeSettings.workingHoursPerDay}
                        onChange={(e) => setTimeSettings({ ...timeSettings, workingHoursPerDay: parseInt(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Working Days per Week</Label>
                      <Input
                        type="number"
                        value={timeSettings.workingDaysPerWeek}
                        onChange={(e) => setTimeSettings({ ...timeSettings, workingDaysPerWeek: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <Button onClick={() => toast.success("Time tracking settings saved")}>
                    Save Settings
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="platforms">
              <Card>
                <CardHeader>
                  <CardTitle>Supported Platforms</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {platforms.map((platform) => (
                      <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Monitor className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <span className="font-medium">{platform.name}</span>
                            <p className="text-sm text-muted-foreground">{platform.version}</p>
                          </div>
                        </div>
                        <Badge variant={platform.status === "supported" ? "default" : "secondary"}>
                          {platform.status}
                        </Badge>
                      </div>
                    ))}
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