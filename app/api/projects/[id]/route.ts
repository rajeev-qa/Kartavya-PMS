import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)
    
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        lead: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        users: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        issues: {
          include: {
            assignee: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            reporter: {
              select: {
                id: true,
                username: true,
                email: true
              }
            }
          }
        },
        sprints: true
      }
    })
    
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
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = parseInt(params.id)
    const body = await request.json()
    const { name, key, description } = body
    
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        key: key?.toUpperCase(),
        description
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
      data: updatedProject
    })
  } catch (error) {
    console.error('Database error:', error)
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
  try {
    const projectId = parseInt(params.id)
    
    await prisma.project.delete({
      where: { id: projectId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 400 }
    )
  }
}