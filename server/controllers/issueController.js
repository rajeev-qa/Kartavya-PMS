const prisma = require("../config/database")

const createIssue = async (req, res) => {
  try {
    const { project_id, summary, description, type, priority, assignee_id, story_points, due_date } = req.body

    if (!project_id || !summary || !type) {
      return res.status(400).json({ error: "Project ID, summary, and type are required" })
    }

    // Check if user has access to project
    const projectAccess = await prisma.projectUser.findFirst({
      where: {
        project_id: Number.parseInt(project_id),
        user_id: req.user.id,
      },
    })

    if (!projectAccess) {
      return res.status(403).json({ error: "Access denied to this project" })
    }

    // Get project to generate issue key
    const project = await prisma.project.findUnique({
      where: { id: Number.parseInt(project_id) },
    })

    // Get next issue number for this project
    const lastIssue = await prisma.issue.findFirst({
      where: { project_id: Number.parseInt(project_id) },
      orderBy: { id: "desc" },
    })

    const issueNumber = lastIssue ? Number.parseInt(lastIssue.key.split("-")[1]) + 1 : 1
    const issueKey = `${project.key}-${issueNumber}`

    const issue = await prisma.issue.create({
      data: {
        project_id: Number.parseInt(project_id),
        key: issueKey,
        summary,
        description,
        type,
        status: "To Do",
        priority: priority || "Medium",
        assignee_id: assignee_id ? Number.parseInt(assignee_id) : null,
        reporter_id: req.user.id,
        story_points: story_points ? Number.parseInt(story_points) : null,
        due_date: due_date ? new Date(due_date) : null,
      },
      include: {
        assignee: {
          select: { id: true, username: true, email: true },
        },
        reporter: {
          select: { id: true, username: true, email: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
      },
    })

    // Log the change
    await prisma.changeLog.create({
      data: {
        entity_type: "issue",
        entity_id: issue.id,
        user_id: req.user.id,
        change_type: "create",
        change_details: {
          summary,
          type,
          status: "To Do",
        },
      },
    })

    res.status(201).json({
      message: "Issue created successfully",
      issue,
    })
  } catch (error) {
    console.error("Create issue error:", error)
    res.status(500).json({ error: "Failed to create issue" })
  }
}

const getIssues = async (req, res) => {
  try {
    const { 
      project_id, status, assignee_id, type, sprint_id,
      key, summary, priority, assignee, createdFrom, createdTo,
      page = 1, limit = 20
    } = req.query

    const whereClause = {}
    const skip = (parseInt(page) - 1) * parseInt(limit)

    if (project_id) {
      whereClause.project_id = Number.parseInt(project_id)

      // Check project access
      const projectAccess = await prisma.projectUser.findFirst({
        where: {
          project_id: Number.parseInt(project_id),
          user_id: req.user.id,
        },
      })

      if (!projectAccess) {
        return res.status(403).json({ error: "Access denied to this project" })
      }
    } else {
      // Get all projects user has access to
      const userProjects = await prisma.projectUser.findMany({
        where: { user_id: req.user.id },
        select: { project_id: true },
      })

      whereClause.project_id = {
        in: userProjects.map((p) => p.project_id),
      }
    }

    // Advanced filters
    if (key) {
      whereClause.key = {
        contains: key,
        mode: 'insensitive'
      }
    }
    
    if (summary) {
      whereClause.summary = {
        contains: summary,
        mode: 'insensitive'
      }
    }
    
    if (status) {
      whereClause.status = {
        equals: status,
        mode: 'insensitive'
      }
    }
    if (assignee_id) whereClause.assignee_id = Number.parseInt(assignee_id)
    if (type) whereClause.type = type
    if (priority) whereClause.priority = priority
    
    if (assignee) {
      whereClause.assignee = {
        username: {
          contains: assignee,
          mode: 'insensitive'
        }
      }
    }
    
    if (createdFrom || createdTo) {
      whereClause.created_at = {}
      if (createdFrom) whereClause.created_at.gte = new Date(createdFrom)
      if (createdTo) whereClause.created_at.lte = new Date(createdTo)
    }

    if (sprint_id) {
      whereClause.sprint_issues = {
        some: {
          sprint_id: Number.parseInt(sprint_id),
        },
      }
    }

    // Get total count for pagination
    const totalCount = await prisma.issue.count({ where: whereClause })
    
    const issues = await prisma.issue.findMany({
      where: whereClause,
      include: {
        assignee: {
          select: { id: true, username: true, email: true },
        },
        reporter: {
          select: { id: true, username: true, email: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
          orderBy: { created_at: "desc" },
          take: 3,
        },
        _count: {
          select: {
            comments: true,
            attachments: true,
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
      skip,
      take: parseInt(limit)
    })

    res.json({ 
      issues,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / parseInt(limit))
      }
    })
  } catch (error) {
    console.error("Get issues error:", error)
    res.status(500).json({ error: "Failed to get issues" })
  }
}

const getIssue = async (req, res) => {
  try {
    const { id } = req.params

    const issue = await prisma.issue.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        assignee: {
          select: { id: true, username: true, email: true },
        },
        reporter: {
          select: { id: true, username: true, email: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
        comments: {
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
          },
          orderBy: { created_at: "desc" },
        },
        attachments: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
        work_logs: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
          orderBy: { created_at: "desc" },
        },
        source_links: {
          include: {
            target_issue: {
              select: { id: true, key: true, summary: true, status: true },
            },
          },
        },
        target_links: {
          include: {
            source_issue: {
              select: { id: true, key: true, summary: true, status: true },
            },
          },
        },
      },
    })

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" })
    }

    // Check project access
    const projectAccess = await prisma.projectUser.findFirst({
      where: {
        project_id: issue.project_id,
        user_id: req.user.id,
      },
    })

    if (!projectAccess) {
      return res.status(403).json({ error: "Access denied to this issue" })
    }

    res.json({ issue })
  } catch (error) {
    console.error("Get issue error:", error)
    res.status(500).json({ error: "Failed to get issue" })
  }
}

const updateIssue = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    // Get current issue
    const currentIssue = await prisma.issue.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!currentIssue) {
      return res.status(404).json({ error: "Issue not found" })
    }

    // Check project access
    const projectAccess = await prisma.projectUser.findFirst({
      where: {
        project_id: currentIssue.project_id,
        user_id: req.user.id,
      },
    })

    if (!projectAccess) {
      return res.status(403).json({ error: "Access denied to this issue" })
    }

    // Prepare update data
    const cleanUpdateData = {}
    const allowedFields = [
      "summary",
      "description",
      "type",
      "status",
      "priority",
      "assignee_id",
      "story_points",
      "due_date",
    ]

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        if (field === "assignee_id" && updateData[field]) {
          cleanUpdateData[field] = Number.parseInt(updateData[field])
        } else if (field === "story_points" && updateData[field]) {
          cleanUpdateData[field] = Number.parseInt(updateData[field])
        } else if (field === "due_date" && updateData[field]) {
          cleanUpdateData[field] = new Date(updateData[field])
        } else {
          cleanUpdateData[field] = updateData[field]
        }
      }
    })

    const updatedIssue = await prisma.issue.update({
      where: { id: Number.parseInt(id) },
      data: cleanUpdateData,
      include: {
        assignee: {
          select: { id: true, username: true, email: true },
        },
        reporter: {
          select: { id: true, username: true, email: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
      },
    })

    // Log the change
    await prisma.changeLog.create({
      data: {
        entity_type: "issue",
        entity_id: updatedIssue.id,
        user_id: req.user.id,
        change_type: "update",
        change_details: {
          old_values: currentIssue,
          new_values: cleanUpdateData,
        },
      },
    })

    res.json({
      message: "Issue updated successfully",
      issue: updatedIssue,
    })
  } catch (error) {
    console.error("Update issue error:", error)
    res.status(500).json({ error: "Failed to update issue" })
  }
}

const deleteIssue = async (req, res) => {
  try {
    const { id } = req.params

    const issue = await prisma.issue.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" })
    }

    // Check if user can delete (reporter, assignee, or project lead)
    const canDelete =
      issue.reporter_id === req.user.id || issue.assignee_id === req.user.id || req.user.role === "admin"

    if (!canDelete) {
      const projectLead = await prisma.project.findFirst({
        where: {
          id: issue.project_id,
          lead_user_id: req.user.id,
        },
      })

      if (!projectLead) {
        return res.status(403).json({ error: "Insufficient permissions to delete this issue" })
      }
    }

    await prisma.issue.delete({
      where: { id: Number.parseInt(id) },
    })

    res.json({ message: "Issue deleted successfully" })
  } catch (error) {
    console.error("Delete issue error:", error)
    res.status(500).json({ error: "Failed to delete issue" })
  }
}

const addComment = async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body

    if (!content) {
      return res.status(400).json({ error: "Comment content is required" })
    }

    // Check if issue exists and user has access
    const issue = await prisma.issue.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" })
    }

    const projectAccess = await prisma.projectUser.findFirst({
      where: {
        project_id: issue.project_id,
        user_id: req.user.id,
      },
    })

    if (!projectAccess) {
      return res.status(403).json({ error: "Access denied to this issue" })
    }

    const comment = await prisma.comment.create({
      data: {
        issue_id: Number.parseInt(id),
        user_id: req.user.id,
        content,
      },
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
      },
    })

    res.status(201).json({
      message: "Comment added successfully",
      comment,
    })
  } catch (error) {
    console.error("Add comment error:", error)
    res.status(500).json({ error: "Failed to add comment" })
  }
}

module.exports = {
  createIssue,
  getIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  addComment,
}
