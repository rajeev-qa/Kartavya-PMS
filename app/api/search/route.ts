import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  // Mock search results based on query
  const results = query ? [
    {
      id: 1,
      type: 'issue',
      title: `Issue matching "${query}"`,
      description: 'This is a sample search result',
      project: 'Kartavya PMS',
      url: '/issues/1'
    },
    {
      id: 2,
      type: 'project',
      title: `Project matching "${query}"`,
      description: 'This is a sample project result',
      project: 'Kartavya PMS',
      url: '/projects/1'
    }
  ] : []
  
  return NextResponse.json({
    success: true,
    data: results,
    total: results.length,
    query
  })
}