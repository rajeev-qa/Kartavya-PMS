import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')
  
  // Mock quick search results
  const results = query ? [
    {
      id: 1,
      type: 'issue',
      title: `Quick result for "${query}"`,
      description: 'Quick search result',
      url: '/issues/1'
    }
  ] : []
  
  return NextResponse.json({
    success: true,
    data: results,
    total: results.length
  })
}