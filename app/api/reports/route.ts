import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json([
    {
      id: 1,
      name: 'Issue Summary Report',
      type: 'summary',
      data: {
        total_issues: 2,
        open_issues: 1,
        in_progress: 1,
        closed_issues: 0
      }
    }
  ])
}