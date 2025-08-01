"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, Plus, Edit, Trash2, Shield, Crown, Zap } from "lucide-react"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

interface Permission {
  id: string
  name: string
  category: string
  description: string
}

interface Role {
  id: number
  name: string
  description: string
  permissions: string[]
  userCount: number
  isSystem: boolean
  createdAt: string
  updatedAt: string
}

const PERMISSION_CATEGORIES = [
  "Project Management",
  "Issue Management", 
  "User Management",
  "Team Management",
  "Administration",
  "Reporting & Analytics",
  "Board Management",
  "Sprint Management",
  "Workflow Management",
  "Search & Filters",
  "Test Management"
]

const ALL_PERMISSIONS: Permission[] = [
  // Project Management
  { id: "project.create", name: "Create Projects", category: "Project Management", description: "Create new projects" },
  { id: "project.edit", name: "Edit Projects", category: "Project Management", description: "Modify project details and settings" },
  { id: "project.delete", name: "Delete Projects", category: "Project Management", description: "Remove projects permanently" },
  { id: "project.view", name: "View Projects", category: "Project Management", description: "Access project information" },
  { id: "project.archive", name: "Archive Projects", category: "Project Management", description: "Archive/restore projects" },
  { id: "project.lead", name: "Manage Project Lead", category: "Project Management", description: "Assign project leads" },
  { id: "project.components", name: "Manage Components", category: "Project Management", description: "Create and manage project components" },
  { id: "project.versions", name: "Manage Versions", category: "Project Management", description: "Create and manage project versions" },
  { id: "project.settings", name: "Project Settings", category: "Project Management", description: "Configure project settings" },
  
  // Issue Management
  { id: "issue.create", name: "Create Issues", category: "Issue Management", description: "Create new issues" },
  { id: "issue.edit", name: "Edit Issues", category: "Issue Management", description: "Modify issue details" },
  { id: "issue.delete", name: "Delete Issues", category: "Issue Management", description: "Remove issues permanently" },
  { id: "issue.assign", name: "Assign Issues", category: "Issue Management", description: "Assign issues to users" },
  { id: "issue.comment", name: "Comment on Issues", category: "Issue Management", description: "Add comments to issues" },
  { id: "issue.transition", name: "Transition Issues", category: "Issue Management", description: "Change issue status" },
  { id: "issue.link", name: "Link Issues", category: "Issue Management", description: "Create issue links and relationships" },
  { id: "issue.watch", name: "Watch Issues", category: "Issue Management", description: "Watch/unwatch issues for notifications" },
  { id: "issue.vote", name: "Vote on Issues", category: "Issue Management", description: "Vote on issues" },
  { id: "issue.attachments", name: "Manage Attachments", category: "Issue Management", description: "Add/remove issue attachments" },
  { id: "issue.worklog", name: "Log Work", category: "Issue Management", description: "Log time spent on issues" },
  { id: "issue.clone", name: "Clone Issues", category: "Issue Management", description: "Clone existing issues" },
  { id: "issue.move", name: "Move Issues", category: "Issue Management", description: "Move issues between projects" },
  { id: "issue.bulk_edit", name: "Bulk Edit Issues", category: "Issue Management", description: "Edit multiple issues at once" },
  
  // User Management
  { id: "user.create", name: "Create Users", category: "User Management", description: "Add new users to the system" },
  { id: "user.edit", name: "Edit Users", category: "User Management", description: "Modify user profiles and details" },
  { id: "user.delete", name: "Delete Users", category: "User Management", description: "Remove users from the system" },
  { id: "user.view", name: "View Users", category: "User Management", description: "Access user information and profiles" },
  { id: "user.deactivate", name: "Deactivate Users", category: "User Management", description: "Deactivate/reactivate user accounts" },
  { id: "user.reset_password", name: "Reset Passwords", category: "User Management", description: "Reset user passwords" },
  { id: "user.assign_roles", name: "Assign Roles", category: "User Management", description: "Assign roles to users" },
  { id: "user.manage_groups", name: "Manage Groups", category: "User Management", description: "Create and manage user groups" },
  { id: "user.impersonate", name: "Impersonate Users", category: "User Management", description: "Login as another user" },
  { id: "user.view_activity", name: "View User Activity", category: "User Management", description: "View user activity logs" },
  { id: "user.manage_permissions", name: "Manage User Permissions", category: "User Management", description: "Assign individual permissions to users" },
  
  // Team Management
  { id: "team.create", name: "Create Teams", category: "Team Management", description: "Create new teams" },
  { id: "team.edit", name: "Edit Teams", category: "Team Management", description: "Modify team details" },
  { id: "team.delete", name: "Delete Teams", category: "Team Management", description: "Remove teams" },
  { id: "team.add_members", name: "Add Team Members", category: "Team Management", description: "Add users to teams" },
  { id: "team.remove_members", name: "Remove Team Members", category: "Team Management", description: "Remove users from teams" },
  { id: "team.assign_lead", name: "Assign Team Lead", category: "Team Management", description: "Assign team leaders" },
  
  // Administration
  { id: "admin.settings", name: "System Settings", category: "Administration", description: "Configure global system settings" },
  { id: "admin.roles", name: "Manage Roles", category: "Administration", description: "Create and manage user roles" },
  { id: "admin.permissions", name: "Manage Permissions", category: "Administration", description: "Assign and manage permissions" },
  { id: "admin.audit_logs", name: "View Audit Logs", category: "Administration", description: "Access system audit logs" },
  { id: "admin.backup", name: "System Backup", category: "Administration", description: "Create and manage system backups" },
  { id: "admin.maintenance", name: "System Maintenance", category: "Administration", description: "Perform system maintenance tasks" },
  { id: "admin.integrations", name: "Manage Integrations", category: "Administration", description: "Configure external integrations" },
  { id: "admin.notifications", name: "Manage Notifications", category: "Administration", description: "Configure system notifications" },
  
  // Reporting & Analytics
  { id: "report.view", name: "View Reports", category: "Reporting & Analytics", description: "Access reports and analytics" },
  { id: "report.create", name: "Create Reports", category: "Reporting & Analytics", description: "Generate custom reports" },
  { id: "report.export", name: "Export Reports", category: "Reporting & Analytics", description: "Export report data" },
  { id: "report.share", name: "Share Reports", category: "Reporting & Analytics", description: "Share reports with other users" },
  { id: "report.schedule", name: "Schedule Reports", category: "Reporting & Analytics", description: "Schedule automated reports" },
  { id: "report.dashboard", name: "Manage Dashboards", category: "Reporting & Analytics", description: "Create and manage dashboards" },
  
  // Board Management
  { id: "board.create", name: "Create Boards", category: "Board Management", description: "Create new Kanban/Scrum boards" },
  { id: "board.edit", name: "Edit Boards", category: "Board Management", description: "Modify board configuration" },
  { id: "board.delete", name: "Delete Boards", category: "Board Management", description: "Remove boards" },
  { id: "board.configure", name: "Configure Boards", category: "Board Management", description: "Configure board columns and workflows" },
  { id: "board.filters", name: "Manage Board Filters", category: "Board Management", description: "Create and manage board filters" },
  { id: "board.swimlanes", name: "Manage Swimlanes", category: "Board Management", description: "Configure board swimlanes" },
  
  // Sprint Management
  { id: "sprint.create", name: "Create Sprints", category: "Sprint Management", description: "Create new sprints" },
  { id: "sprint.edit", name: "Edit Sprints", category: "Sprint Management", description: "Modify sprint details" },
  { id: "sprint.start", name: "Start Sprints", category: "Sprint Management", description: "Activate sprints" },
  { id: "sprint.complete", name: "Complete Sprints", category: "Sprint Management", description: "Close and complete sprints" },
  { id: "sprint.delete", name: "Delete Sprints", category: "Sprint Management", description: "Remove sprints" },
  { id: "sprint.plan", name: "Plan Sprints", category: "Sprint Management", description: "Plan sprint content and capacity" },
  
  // Workflow Management
  { id: "workflow.create", name: "Create Workflows", category: "Workflow Management", description: "Create custom workflows" },
  { id: "workflow.edit", name: "Edit Workflows", category: "Workflow Management", description: "Modify workflow transitions" },
  { id: "workflow.delete", name: "Delete Workflows", category: "Workflow Management", description: "Remove workflows" },
  { id: "workflow.assign", name: "Assign Workflows", category: "Workflow Management", description: "Assign workflows to projects" },
  
  // Search & Filters
  { id: "search.advanced", name: "Advanced Search", category: "Search & Filters", description: "Use advanced search features" },
  { id: "search.save_filters", name: "Save Search Filters", category: "Search & Filters", description: "Save and manage search filters" },
  { id: "search.share_filters", name: "Share Filters", category: "Search & Filters", description: "Share filters with other users" },
  
  // Test Management
  { id: "test.create", name: "Create Test Cases", category: "Test Management", description: "Create test cases" },
  { id: "test.execute", name: "Execute Tests", category: "Test Management", description: "Execute test cases" },
  { id: "test.manage", name: "Manage Test Plans", category: "Test Management", description: "Create and manage test plans" },
  { id: "test.report", name: "Test Reporting", category: "Test Management", description: "Generate test reports" }
]

export default function RoleMaster() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [roleForm, setRoleForm] = useState({
    name: "",
    description: "",
    permissions: [] as string[]
  })

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/roles?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched roles:', data)
        setRoles(data)
      } else {
        throw new Error('Failed to fetch roles')
      }
    } catch (error) {
      console.error('Fetch roles error:', error)
      toast.error("Failed to fetch roles")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/roles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions
        })
      })
      
      if (response.ok) {
        setRoleForm({ name: "", description: "", permissions: [] })
        setIsCreateDialogOpen(false)
        fetchRoles()
        toast.success("Role created successfully")
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create role')
      }
    } catch (error) {
      toast.error("Failed to create role")
    }
  }

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/roles/${selectedRole.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: roleForm.name,
          description: roleForm.description,
          permissions: roleForm.permissions
        })
      })
      
      if (response.ok) {
        setRoleForm({ name: "", description: "", permissions: [] })
        setIsEditDialogOpen(false)
        setSelectedRole(null)
        fetchRoles()
        toast.success("Role updated successfully")
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }
    } catch (error) {
      toast.error("Failed to update role")
    }
  }

  const handleDeleteRole = async (roleId: number) => {
    const role = roles.find(r => r.id === roleId)
    if (role?.isSystem) {
      toast.error("Cannot delete system roles")
      return
    }

    if (role?.userCount > 0) {
      toast.error("Cannot delete role with assigned users")
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setRoles(roles.filter(r => r.id !== roleId))
        toast.success("Role deleted successfully")
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete role')
      }
    } catch (error) {
      toast.error("Failed to delete role")
    }
  }

  const openEditDialog = (role: Role) => {
    setSelectedRole(role)
    setRoleForm({
      name: role.name,
      description: role.description,
      permissions: role.permissions
    })
    setIsEditDialogOpen(true)
  }

  const togglePermission = (permissionId: string) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const selectAllPermissions = () => {
    setRoleForm(prev => ({
      ...prev,
      permissions: ALL_PERMISSIONS.map(p => p.id)
    }))
  }

  const clearAllPermissions = () => {
    setRoleForm(prev => ({
      ...prev,
      permissions: []
    }))
  }

  const getPermissionsByCategory = (category: string) => {
    return ALL_PERMISSIONS.filter(p => p.category === category)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  <Shield className="h-8 w-8 mr-3 text-blue-600" />
                  Role Master
                </h1>
                <p className="text-slate-600 mt-2">Create and manage user roles with granular permissions</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={fetchRoles}
                  className="hover:bg-blue-50"
                >
                  Refresh
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center">
                      <Crown className="h-6 w-6 mr-2 text-yellow-500" />
                      Create New Role
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateRole} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Role Name</Label>
                        <Input
                          value={roleForm.name}
                          onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Enter role name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Description</Label>
                        <Textarea
                          value={roleForm.description}
                          onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Describe the role's purpose"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <Label className="text-lg font-semibold flex items-center">
                          <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                          Permissions
                        </Label>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={selectAllPermissions} className="hover:bg-green-50 hover:border-green-300">
                            Select All
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={clearAllPermissions} className="hover:bg-red-50 hover:border-red-300">
                            Clear All
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {PERMISSION_CATEGORIES.map(category => (
                          <Card key={category} className="border-slate-200 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-blue-50">
                              <CardTitle className="text-sm font-semibold text-slate-700">{category}</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4">
                              <div className="space-y-3">
                                {getPermissionsByCategory(category).map(permission => (
                                  <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                    <Checkbox
                                      checked={roleForm.permissions.includes(permission.id)}
                                      onCheckedChange={() => togglePermission(permission.id)}
                                      className="mt-0.5"
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-slate-900">{permission.name}</div>
                                      <div className="text-xs text-slate-500 mt-1">{permission.description}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="px-6">
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6">
                        Create Role
                      </Button>
                    </div>
                  </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Roles Grid */}
          <div className="grid gap-6">
            {roles.map((role) => (
              <Card key={role.id} className="border-slate-200 hover:shadow-lg transition-all duration-200 bg-white">
                <CardHeader className="pb-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${
                        role.isSystem ? 'bg-gradient-to-r from-yellow-100 to-orange-100' : 'bg-gradient-to-r from-blue-100 to-purple-100'
                      }`}>
                        {role.isSystem ? (
                          <Crown className="h-6 w-6 text-yellow-600" />
                        ) : (
                          <Shield className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="flex items-center text-xl">
                          {role.name}
                          {role.isSystem && (
                            <Badge variant="secondary" className="ml-3 bg-yellow-100 text-yellow-800 border-yellow-200">
                              System Role
                            </Badge>
                          )}
                        </CardTitle>
                        <p className="text-slate-600 mt-2">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="flex items-center px-3 py-1 bg-slate-50 border-slate-200">
                        <Users className="h-4 w-4 mr-2 text-slate-500" />
                        <span className="font-medium">{role.userCount}</span>
                        <span className="text-slate-500 ml-1">users</span>
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditDialog(role)}
                        disabled={role.isSystem}
                        className="hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.isSystem || role.userCount > 0}
                        className="text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-700">Permissions</h4>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {role.permissions.length} permissions
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.slice(0, 8).map(permissionId => {
                          const permission = ALL_PERMISSIONS.find(p => p.id === permissionId)
                          return permission ? (
                            <Badge key={permissionId} variant="outline" className="text-xs bg-slate-50 hover:bg-slate-100 transition-colors">
                              {permission.name}
                            </Badge>
                          ) : null
                        })}
                        {role.permissions.length > 8 && (
                          <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-slate-700">
                            +{role.permissions.length - 8} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                      <span>Created: {new Date(role.createdAt).toLocaleDateString()}</span>
                      <span>Updated: {new Date(role.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center">
                  <Edit className="h-6 w-6 mr-2 text-blue-500" />
                  Edit Role
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditRole} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Role Name</Label>
                    <Input
                      value={roleForm.name}
                      onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Description</Label>
                    <Textarea
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6">
                    <Label className="text-lg font-semibold flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                      Permissions
                    </Label>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={selectAllPermissions} className="hover:bg-green-50 hover:border-green-300">
                        Select All
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={clearAllPermissions} className="hover:bg-red-50 hover:border-red-300">
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {PERMISSION_CATEGORIES.map(category => (
                      <Card key={category} className="border-slate-200 hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3 bg-gradient-to-r from-slate-50 to-blue-50">
                          <CardTitle className="text-sm font-semibold text-slate-700">{category}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {getPermissionsByCategory(category).map(permission => (
                              <div key={permission.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                <Checkbox
                                  checked={roleForm.permissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-slate-900">{permission.name}</div>
                                  <div className="text-xs text-slate-500 mt-1">{permission.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="px-6">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6">
                    Update Role
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AppLayout>
  )
}