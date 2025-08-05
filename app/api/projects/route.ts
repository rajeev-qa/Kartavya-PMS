import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: {
        lead: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: projects,
      total: projects.length
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, key, description } = body
    
    const newProject = await prisma.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        description: description || '',
        lead_user_id: 1 // Default admin user
      },
      include: {
        lead: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: newProject
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 400 }
    )
  }
}