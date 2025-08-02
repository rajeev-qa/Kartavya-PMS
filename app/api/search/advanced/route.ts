import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  const project = searchParams.get('project')
  const assignee = searchParams.get('assignee')
  const status = searchParams.get('status')
  const type = searchParams.get('type')
  
  // Mock advanced search results
  const results = [
    {
      id: 1,
      type: 'issue',
      title: 'Sample Issue',
      description: 'This matches your search criteria',
      project: 'Kartavya PMS',
      url: '/issues/1'
    }
  ]
  
  return NextResponse.json({
    success: true,
    data: results,
    total: results.length,
    query: {
      q: query,
      project,
      assignee,
      status,
      type
    }
  })
}