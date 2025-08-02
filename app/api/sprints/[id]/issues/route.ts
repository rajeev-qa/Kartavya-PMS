import { NextRequest, NextResponse } from 'next/server'

// Mock sprint issues management
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id)
    const body = await request.json()
    const { issue_id } = body
    
    return NextResponse.json({
      success: true,
      message: 'Issue added to sprint successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add issue to sprint' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sprintId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const issueId = searchParams.get('issue_id')
    
    return NextResponse.json({
      success: true,
      message: 'Issue removed from sprint successfully'
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to remove issue from sprint' },
      { status: 400 }
    )
  }
}