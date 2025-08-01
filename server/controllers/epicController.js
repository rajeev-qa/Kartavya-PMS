const prisma = require("../config/database")

const createEpic = async (req, res) => {
  try {
    const { project_id, summary, description } = req.body
    
    if (!project_id || !summary) {
      return res.status(400).json({ error: "Project ID and summary are required" })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(project_id),
        users: {
          some: { user_id: req.user.id }
        }
      }
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    const issueCount = await prisma.issue.count({
      where: { project_id: parseInt(project_id) }
    })

    const epic = await prisma.issue.create({
      data: {
        project_id: parseInt(project_id),
        key: `${project.key}-${issueCount + 1}`,
        summary,
        description,
        type: "epic",
        status: "To Do",
        reporter_id: req.user.id
      },
      include: {
        project: true,
        reporter: {
          select: { id: true, username: true, email: true }
        },
        assignee: {
          select: { id: true, username: true, email: true }
        }
      }
    })

    res.status(201).json({ message: "Epic created successfully", epic })
  } catch (error) {
    console.error("Create epic error:", error)
    res.status(500).json({ error: "Failed to create epic" })
  }
}

const getEpics = async (req, res) => {
  try {
    const { project_id } = req.query

    const whereClause = {
      type: "epic"
    }

    if (project_id) {
      whereClause.project_id = parseInt(project_id)
      
      const hasAccess = await prisma.project.findFirst({
        where: {
          id: parseInt(project_id),
          users: {
            some: { user_id: req.user.id }
          }
        }
      })

      if (!hasAccess) {
        return res.status(403).json({ error: "Access denied" })
      }
    }

    const epics = await prisma.issue.findMany({
      where: whereClause,
      include: {
        project: true,
        reporter: {
          select: { id: true, username: true, email: true }
        },
        assignee: {
          select: { id: true, username: true, email: true }
        },
        epic_issues: {
          include: {
            assignee: {
              select: { id: true, username: true, email: true }
            }
          }
        }
      },
      orderBy: { created_at: "desc" }
    })

    const epicsWithStats = epics.map(epic => {
      const linkedIssues = epic.epic_issues
      const totalIssues = linkedIssues.length
      const completedIssues = linkedIssues.filter(issue => issue.status === "Done").length
      const progress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0

      return {
        ...epic,
        stats: {
          totalIssues,
          completedIssues,
          progress
        }
      }
    })

    res.json({ epics: epicsWithStats })
  } catch (error) {
    console.error("Get epics error:", error)
    res.status(500).json({ error: "Failed to get epics" })
  }
}

const getEpic = async (req, res) => {
  try {
    const { id } = req.params

    const epic = await prisma.issue.findFirst({
      where: {
        id: parseInt(id),
        type: "epic"
      },
      include: {
        project: true,
        reporter: {
          select: { id: true, username: true, email: true }
        },
        assignee: {
          select: { id: true, username: true, email: true }
        },
        epic_issues: {
          include: {
            assignee: {
              select: { id: true, username: true, email: true }
            },
            reporter: {
              select: { id: true, username: true, email: true }
            }
          },
          orderBy: { created_at: "desc" }
        }
      }
    })

    if (!epic) {
      return res.status(404).json({ error: "Epic not found" })
    }

    const hasAccess = await prisma.project.findFirst({
      where: {
        id: epic.project_id,
        users: {
          some: { user_id: req.user.id }
        }
      }
    })

    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied" })
    }

    const linkedIssues = epic.epic_issues
    const totalIssues = linkedIssues.length
    const completedIssues = linkedIssues.filter(issue => issue.status === "Done").length
    const progress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0

    const epicWithStats = {
      ...epic,
      stats: {
        totalIssues,
        completedIssues,
        progress
      }
    }

    res.json({ epic: epicWithStats })
  } catch (error) {
    console.error("Get epic error:", error)
    res.status(500).json({ error: "Failed to get epic" })
  }
}

const addIssueToEpic = async (req, res) => {
  try {
    const { epic_id, issue_id } = req.body

    if (!epic_id || !issue_id) {
      return res.status(400).json({ error: "Epic ID and Issue ID are required" })
    }

    const epic = await prisma.issue.findFirst({
      where: {
        id: parseInt(epic_id),
        type: "epic"
      }
    })

    if (!epic) {
      return res.status(404).json({ error: "Epic not found" })
    }

    const issue = await prisma.issue.findUnique({
      where: { id: parseInt(issue_id) }
    })

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" })
    }

    await prisma.issue.update({
      where: { id: parseInt(issue_id) },
      data: { epic_id: parseInt(epic_id) }
    })

    res.json({ message: "Issue added to epic successfully" })
  } catch (error) {
    console.error("Add issue to epic error:", error)
    res.status(500).json({ error: "Failed to add issue to epic" })
  }
}

const removeIssueFromEpic = async (req, res) => {
  try {
    const { issue_id } = req.params

    await prisma.issue.update({
      where: { id: parseInt(issue_id) },
      data: { epic_id: null }
    })

    res.json({ message: "Issue removed from epic successfully" })
  } catch (error) {
    console.error("Remove issue from epic error:", error)
    res.status(500).json({ error: "Failed to remove issue from epic" })
  }
}

module.exports = {
  createEpic,
  getEpics,
  getEpic,
  addIssueToEpic,
  removeIssueFromEpic
}