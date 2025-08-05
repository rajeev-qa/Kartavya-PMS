import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('project_id')
    const status = searchParams.get('status')
    const assignee = searchParams.get('assignee')
    const type = searchParams.get('type')
    const search = searchParams.get('search')
    
    const where: any = {}
    
    if (projectId) {
      where.project_id = parseInt(projectId)
    }
    
    if (status) {
      where.status = status
    }
    
    if (type) {
      where.type = type
    }
    
    if (assignee) {
      where.assignee = {
        username: assignee
      }
    }
    
    if (search) {
      where.OR = [
        { summary: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    const issues = await prisma.issue.findMany({
      where,
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
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      data: issues,
      total: issues.length
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issues' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { summary, description, type, priority, assignee_id, project_id } = body
    
    // Get project to generate key
    const project = await prisma.project.findUnique({
      where: { id: project_id },
      include: {
        issues: {
          select: { id: true }
        }
      }
    })
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    const issueNumber = project.issues.length + 1
    const key = `${project.key}-${issueNumber}`
    
    const newIssue = await prisma.issue.create({
      data: {
        key,
        summary,
        description: description || '',
        type: type || 'Task',
        status: 'To Do',
        priority: priority || 'Medium',
        assignee_id: assignee_id || 1,
        reporter_id: 1,
        project_id
      },
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
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: newIssue
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create issue' },
      { status: 400 }
    )
  }
}