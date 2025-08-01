"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Shield, User, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import AppLayout from "@/components/layout/AppLayout"
import { toast } from "react-hot-toast"

const TEST_PERMISSIONS = [
  // Project Management
  { id: "project.create", name: "Create Projects", category: "Project Management" },
  { id: "project.edit", name: "Edit Projects", category: "Project Management" },
  { id: "project.delete", name: "Delete Projects", category: "Project Management" },
  { id: "project.view", name: "View Projects", category: "Project Management" },
  
  // Issue Management
  { id: "issue.create", name: "Create Issues", category: "Issue Management" },
  { id: "issue.edit", name: "Edit Issues", category: "Issue Management" },
  { id: "issue.delete", name: "Delete Issues", category: "Issue Management" },
  { id: "issue.bulk_edit", name: "Bulk Edit Issues", category: "Issue Management" },
  
  // User Management
  { id: "user.create", name: "Create Users", category: "User Management" },
  { id: "user.edit", name: "Edit Users", category: "User Management" },
  { id: "user.delete", name: "Delete Users", category: "User Management" },
  { id: "user.view", name: "View Users", category: "User Management" },
  
  // Administration
  { id: "admin.settings", name: "System Settings", category: "Administration" },
  { id: "admin.roles", name: "Manage Roles", category: "Administration" },
  { id: "admin.permissions", name: "Manage Permissions", category: "Administration" },
  
  // Reporting
  { id: "report.view", name: "View Reports", category: "Reporting" },
  { id: "report.create", name: "Create Reports", category: "Reporting" },
  { id: "report.export", name: "Export Reports", category: "Reporting" },
  
  // Test Management
  { id: "test.create", name: "Create Test Cases", category: "Test Management" },
  { id: "test.execute", name: "Execute Tests", category: "Test Management" },
]

export default function PermissionTestPage() {
  const { user, hasPermission } = useAuth()
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    if (user) {
      runPermissionTests()
    }
  }, [user])

  const runPermissionTests = () => {
    const results = TEST_PERMISSIONS.map(permission => ({
      ...permission,
      hasAccess: hasPermission(permission.id),
      tested: true
    }))
    setTestResults(results)
  }

  const testMenuAccess = () => {
    const menuTests = [
      { name: "Projects Menu", permission: "project.view" },
      { name: "Work Items Menu", permission: "issue.view" },
      { name: "Test Cases Menu", permission: "test.create" },
      { name: "Reports Menu", permission: "report.view" },
      { name: "Users Admin", permission: "user.view" },
      { name: "Roles Admin", permission: "admin.roles" },
      { name: "Permissions Admin", permission: "admin.permissions" },
      { name: "Settings Admin", permission: "admin.settings" },
    ]

    menuTests.forEach(test => {
      const hasAccess = hasPermission(test.permission)
      toast(
        hasAccess 
          ? `✅ ${test.name}: Access Granted` 
          : `❌ ${test.name}: Access Denied`,
        { duration: 2000 }
      )
    })
  }

  const groupedResults = testResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = []
    }
    acc[result.category].push(result)
    return acc
  }, {} as Record<string, any[]>)

  const totalPermissions = testResults.length
  const grantedPermissions = testResults.filter(r => r.hasAccess).length
  const deniedPermissions = totalPermissions - grantedPermissions

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to test permissions</p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">Permission Testing</h1>
                <p className="text-blue-100">Test and verify user permissions</p>
              </div>
            </div>
            <Button 
              variant="secondary" 
              onClick={testMenuAccess}
              className="bg-white/20 hover:bg-white/30"
            >
              Test Menu Access
            </Button>
          </div>
        </div>

        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Current User Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="font-medium">{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge variant="outline">{user.role || 'No Role'}</Badge>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Permissions ({user.permissions?.length || 0})</p>
              <div className="flex flex-wrap gap-1">
                {user.permissions?.map((permission, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {permission}
                  </Badge>
                )) || <span className="text-muted-foreground">No permissions assigned</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Permissions</p>
                  <p className="text-2xl font-bold">{totalPermissions}</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Granted</p>
                  <p className="text-2xl font-bold text-green-600">{grantedPermissions}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Denied</p>
                  <p className="text-2xl font-bold text-red-600">{deniedPermissions}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permission Test Results */}
        <div className="space-y-6">
          {Object.entries(groupedResults).map(([category, permissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle>{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        permission.hasAccess
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        {permission.hasAccess ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm font-medium">{permission.name}</span>
                      </div>
                      <Badge 
                        variant={permission.hasAccess ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {permission.hasAccess ? "GRANTED" : "DENIED"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button onClick={runPermissionTests} variant="outline">
                Re-run Permission Tests
              </Button>
              <Button 
                onClick={() => {
                  console.log('Current user:', user)
                  console.log('User permissions:', user.permissions)
                  toast.success('User data logged to console')
                }}
                variant="outline"
              >
                Log User Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}