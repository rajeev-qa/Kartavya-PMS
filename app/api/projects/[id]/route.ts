import { NextRequest, NextResponse } from 'next/server'
import { projectStore } from '@/lib/data-store'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  
  // Find project by ID
  const project = projectStore.getById(id)
  
  if (!project) {
    return NextResponse.json(
      { success: false, error: 'Project not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    data: project
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()
    
    const updatedProject = projectStore.update(id, body)
    
    if (!updatedProject) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProject
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 400 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id)
  
  const deleted = projectStore.delete(id)
  
  if (!deleted) {
    return NextResponse.json(
      { success: false, error: 'Project not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({
    success: true,
    message: 'Project deleted successfully'
  })
}