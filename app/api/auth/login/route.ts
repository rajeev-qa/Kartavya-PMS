import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // Mock authentication - add more test users
    const users = {
      'admin@kartavya.com': { password: 'admin123', role: 'admin', username: 'admin' },
      'john@example.com': { password: 'john123', role: 'developer', username: 'john' },
      'jane@example.com': { password: 'jane123', role: 'developer', username: 'jane' }
    }
    
    const user = users[email as keyof typeof users]
    if (user && user.password === password) {
      return NextResponse.json({
        success: true,
        token: `mock-jwt-${Date.now()}`,
        user: {
          id: Math.floor(Math.random() * 1000),
          email,
          username: user.username,
          role: user.role,
          permissions: user.role === 'admin' ? [
            // Project permissions
            'project.view', 'project.create', 'project.edit', 'project.delete', 'project.admin',
            // Issue permissions
            'issue.view', 'issue.create', 'issue.edit', 'issue.delete', 'issue.bulk_edit', 'issue.assign',
            // User permissions
            'user.view', 'user.create', 'user.edit', 'user.delete', 'user.admin',
            // Admin permissions
            'admin.settings', 'admin.roles', 'admin.permissions', 'admin.integrations', 'admin.system',
            // Report permissions
            'report.view', 'report.create', 'report.edit', 'report.delete',
            // Search permissions
            'search.basic', 'search.advanced', 'search.filters',
            // Test permissions
            'test.view', 'test.create', 'test.edit', 'test.delete', 'test.execute',
            // Workflow permissions
            'workflow.view', 'workflow.create', 'workflow.edit', 'workflow.delete',
            // Sprint permissions
            'sprint.view', 'sprint.create', 'sprint.edit', 'sprint.delete',
            // Dashboard permissions
            'dashboard.view', 'dashboard.create', 'dashboard.edit', 'dashboard.delete',
            // Comment permissions
            'comment.view', 'comment.create', 'comment.edit', 'comment.delete',
            // Attachment permissions
            'attachment.view', 'attachment.create', 'attachment.delete',
            // Epic permissions
            'epic.view', 'epic.create', 'epic.edit', 'epic.delete',
            // Version permissions
            'version.view', 'version.create', 'version.edit', 'version.delete',
            // Component permissions
            'component.view', 'component.create', 'component.edit', 'component.delete',
            // Time tracking permissions
            'time.view', 'time.log', 'time.edit', 'time.delete',
            // Notification permissions
            'notification.view', 'notification.create', 'notification.edit',
            // Integration permissions
            'integration.view', 'integration.create', 'integration.edit', 'integration.delete',
            // All access
            '*'
          ] : ['project.view', 'issue.view', 'issue.create', 'issue.edit']
        }
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Login endpoint is working',
    method: 'POST required'
  })
}