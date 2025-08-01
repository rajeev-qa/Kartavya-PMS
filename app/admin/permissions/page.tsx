"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Shield, Save } from "lucide-react"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<any>({
    admin: {
      // Project Management
      project_create: true, project_edit: true, project_delete: true, project_view: true, project_archive: true,
      // Issue Management
      issue_create: true, issue_edit: true, issue_delete: true, issue_assign: true, issue_transition: true, issue_bulk_edit: true,
      // User Management
      user_create: true, user_edit: true, user_delete: true, user_view: true, user_assign_roles: true, user_manage_permissions: true,
      // Team Management
      team_create: true, team_manage: true,
      // Administration
      admin_settings: true, admin_roles: true, admin_permissions: true, admin_audit_logs: true, admin_integrations: true,
      // Reporting & Analytics
      report_view: true, report_create: true, report_export: true, report_dashboard: true,
      // Board & Sprint Management
      board_manage: true, sprint_manage: true,
      // Workflow Management
      workflow_manage: true,
      // Test Management
      test_manage: true
    },
    developer: {
      // Project Management
      project_create: false, project_edit: true, project_delete: false, project_view: true, project_archive: false,
      // Issue Management
      issue_create: true, issue_edit: true, issue_delete: false, issue_assign: true, issue_transition: true, issue_bulk_edit: true,
      // User Management
      user_create: false, user_edit: false, user_delete: false, user_view: true, user_assign_roles: false, user_manage_permissions: false,
      // Team Management
      team_create: false, team_manage: false,
      // Administration
      admin_settings: false, admin_roles: false, admin_permissions: false, admin_audit_logs: false, admin_integrations: false,
      // Reporting & Analytics
      report_view: true, report_create: true, report_export: true, report_dashboard: false,
      // Board & Sprint Management
      board_manage: true, sprint_manage: true,
      // Workflow Management
      workflow_manage: false,
      // Test Management
      test_manage: true
    },
    user: {
      // Project Management
      project_create: false, project_edit: false, project_delete: false, project_view: true, project_archive: false,
      // Issue Management
      issue_create: true, issue_edit: false, issue_delete: false, issue_assign: false, issue_transition: false, issue_bulk_edit: false,
      // User Management
      user_create: false, user_edit: false, user_delete: false, user_view: true, user_assign_roles: false, user_manage_permissions: false,
      // Team Management
      team_create: false, team_manage: false,
      // Administration
      admin_settings: false, admin_roles: false, admin_permissions: false, admin_audit_logs: false, admin_integrations: false,
      // Reporting & Analytics
      report_view: true, report_create: false, report_export: false, report_dashboard: false,
      // Board & Sprint Management
      board_manage: false, sprint_manage: false,
      // Workflow Management
      workflow_manage: false,
      // Test Management
      test_manage: false
    }
  })

  const permissionList = [
    // Project Management
    { key: "project_create", name: "Create Projects", description: "Create new projects" },
    { key: "project_edit", name: "Edit Projects", description: "Modify project details and settings" },
    { key: "project_delete", name: "Delete Projects", description: "Remove projects permanently" },
    { key: "project_view", name: "View Projects", description: "Access project information" },
    { key: "project_archive", name: "Archive Projects", description: "Archive/restore projects" },
    
    // Issue Management
    { key: "issue_create", name: "Create Issues", description: "Create new issues" },
    { key: "issue_edit", name: "Edit Issues", description: "Modify issue details" },
    { key: "issue_delete", name: "Delete Issues", description: "Remove issues permanently" },
    { key: "issue_assign", name: "Assign Issues", description: "Assign issues to users" },
    { key: "issue_transition", name: "Transition Issues", description: "Change issue status" },
    { key: "issue_bulk_edit", name: "Bulk Edit Issues", description: "Edit multiple issues at once" },
    
    // User Management
    { key: "user_create", name: "Create Users", description: "Add new users to the system" },
    { key: "user_edit", name: "Edit Users", description: "Modify user profiles and details" },
    { key: "user_delete", name: "Delete Users", description: "Remove users from the system" },
    { key: "user_view", name: "View Users", description: "Access user information and profiles" },
    { key: "user_assign_roles", name: "Assign Roles", description: "Assign roles to users" },
    { key: "user_manage_permissions", name: "Manage User Permissions", description: "Assign individual permissions to users" },
    
    // Team Management
    { key: "team_create", name: "Create Teams", description: "Create new teams" },
    { key: "team_manage", name: "Manage Teams", description: "Add/remove team members and assign leads" },
    
    // Administration
    { key: "admin_settings", name: "System Settings", description: "Configure global system settings" },
    { key: "admin_roles", name: "Manage Roles", description: "Create and manage user roles" },
    { key: "admin_permissions", name: "Manage Permissions", description: "Assign and manage permissions" },
    { key: "admin_audit_logs", name: "View Audit Logs", description: "Access system audit logs" },
    { key: "admin_integrations", name: "Manage Integrations", description: "Configure external integrations" },
    
    // Reporting & Analytics
    { key: "report_view", name: "View Reports", description: "Access reports and analytics" },
    { key: "report_create", name: "Create Reports", description: "Generate custom reports" },
    { key: "report_export", name: "Export Reports", description: "Export report data" },
    { key: "report_dashboard", name: "Manage Dashboards", description: "Create and manage dashboards" },
    
    // Board & Sprint Management
    { key: "board_manage", name: "Manage Boards", description: "Create and configure Kanban/Scrum boards" },
    { key: "sprint_manage", name: "Manage Sprints", description: "Create, start, and complete sprints" },
    
    // Workflow Management
    { key: "workflow_manage", name: "Manage Workflows", description: "Create and configure custom workflows" },
    
    // Test Management
    { key: "test_manage", name: "Manage Tests", description: "Create and execute test cases" }
  ]

  const roles = ["admin", "developer", "user"]

  const handlePermissionChange = (role: string, permission: string, enabled: boolean) => {
    setPermissions((prev: any) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permission]: enabled
      }
    }))
  }

  const savePermissions = async () => {
    try {
      // Mock API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success("Permissions updated successfully")
    } catch (error) {
      toast.error("Failed to update permissions")
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">Permission Management</h1>
                <p className="text-muted-foreground">Configure user permissions for different roles</p>
              </div>
            </div>
            <Button onClick={savePermissions}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Role-Based Permissions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure what each role can do in the system
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Permission</TableHead>
                    <TableHead className="text-center">Admin</TableHead>
                    <TableHead className="text-center">Developer</TableHead>
                    <TableHead className="text-center">User</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissionList.map((permission) => (
                    <TableRow key={permission.key}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-sm text-muted-foreground">{permission.description}</div>
                        </div>
                      </TableCell>
                      {roles.map((role) => (
                        <TableCell key={role} className="text-center">
                          <Switch
                            checked={permissions[role]?.[permission.key] || false}
                            onCheckedChange={(checked) => 
                              handlePermissionChange(role, permission.key, checked)
                            }
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Admin Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Full system access including user management and system configuration
                </p>
                <div className="space-y-2">
                  {Object.entries(permissions.admin).filter(([_, enabled]) => enabled).map(([key, _]) => (
                    <div key={key} className="text-sm">
                      ✓ {permissionList.find(p => p.key === key)?.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Developer Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Project management and development features access
                </p>
                <div className="space-y-2">
                  {Object.entries(permissions.developer).filter(([_, enabled]) => enabled).map(([key, _]) => (
                    <div key={key} className="text-sm">
                      ✓ {permissionList.find(p => p.key === key)?.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">User Role</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Basic access to view and interact with assigned projects
                </p>
                <div className="space-y-2">
                  {Object.entries(permissions.user).filter(([_, enabled]) => enabled).map(([key, _]) => (
                    <div key={key} className="text-sm">
                      ✓ {permissionList.find(p => p.key === key)?.name}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}