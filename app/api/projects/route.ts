import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for projects
let projects = [
  {
    id: 1,
    name: 'Kartavya PMS',
    key: 'KPM',
    description: 'Main project management system',
    lead_id: 1,
    lead: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Demo Project',
    key: 'DEMO',
    description: 'Demo project for testing',
    lead_id: 1,
    lead: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let nextId = 3

// Global variable to persist across requests
if (typeof global !== 'undefined') {
  if (!global.projects) {
    global.projects = projects
    global.nextProjectId = nextId
  }
  projects = global.projects
  nextId = global.nextProjectId
}

export async function GET() {
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
    
    const newProject = {
      id: nextId++,
      name,
      key: key.toUpperCase(),
      description: description || '',
      lead_id: 1,
      lead: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    projects.push(newProject)
    
    // Update global storage
    if (typeof global !== 'undefined') {
      global.projects = projects
      global.nextProjectId = nextId
    }
    
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