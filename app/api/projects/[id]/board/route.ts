import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = parseInt(params.id)
  
  // Mock board data with columns and issues
  const boardData = {
    columns: [
      {
        id: 'todo',
        title: 'To Do',
        issues: [
          {
            id: 1,
            key: 'KPM-1',
            summary: 'Sample Bug Issue',
            type: 'Bug',
            priority: 'High',
            assignee: { id: 1, username: 'admin', email: 'admin@kartavya.com' }
          }
        ]
      },
      {
        id: 'inprogress',
        title: 'In Progress',
        issues: [
          {
            id: 2,
            key: 'KPM-2',
            summary: 'Sample Story Issue',
            type: 'Story',
            priority: 'Medium',
            assignee: { id: 2, username: 'john', email: 'john@example.com' }
          }
        ]
      },
      {
        id: 'done',
        title: 'Done',
        issues: [
          {
            id: 3,
            key: 'KPM-3',
            summary: 'Task Issue',
            type: 'Task',
            priority: 'Low',
            assignee: { id: 3, username: 'jane', email: 'jane@example.com' }
          }
        ]
      }
    ]
  }
  
  return NextResponse.json({
    success: true,
    data: boardData
  })
}