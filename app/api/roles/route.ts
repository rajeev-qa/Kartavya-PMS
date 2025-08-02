import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Administrator',
        description: 'Full system access',
        permissions: ['*']
      },
      {
        id: 2,
        name: 'Developer',
        description: 'Development access',
        permissions: ['project.view', 'issue.view', 'issue.create', 'issue.edit']
      },
      {
        id: 3,
        name: 'Viewer',
        description: 'Read-only access',
        permissions: ['project.view', 'issue.view']
      }
    ],
    total: 3
  })
}