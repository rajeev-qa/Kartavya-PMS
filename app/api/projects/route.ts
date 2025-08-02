import { NextRequest, NextResponse } from 'next/server'
import { projectStore } from '@/lib/data-store'

export async function GET() {
  const projects = projectStore.getAll()
  return NextResponse.json({
    success: true,
    data: projects,
    total: projects.length
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, key, description } = body
    
    const newProject = projectStore.create({
      name,
      key: key.toUpperCase(),
      description: description || '',
      lead_id: 1,
      lead: { id: 1, username: 'admin', email: 'admin@kartavya.com' }
    })
    
    return NextResponse.json({
      success: true,
      data: newProject
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 400 }
    )
  }
}