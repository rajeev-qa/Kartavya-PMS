import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'Issue Summary Report',
        type: 'summary',
        report_data: {
          total_issues: 3,
          open_issues: 1,
          in_progress: 1,
          closed_issues: 1
        },
        created_at: new Date().toISOString()
      }
    ],
    total: 1
  })
}