const prisma = require("../config/database")

const createSprint = async (req, res) => {
  try {
    const { project_id, name, start_date, end_date } = req.body

    if (!project_id || !name) {
      return res.status(400).json({ error: "Project ID and name are required" })
    }

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

    const sprint = await prisma.sprint.create({
      data: {
        project_id: Number.parseInt(project_id),
        name,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        status: "Planning",
      },
      include: {
        project: {
          select: { id: true, name: true, key: true },
        },
      },
    })

    res.status(201).json({
      message: "Sprint created successfully",
      sprint,
    })
  } catch (error) {
    console.error("Create sprint error:", error)
    res.status(500).json({ error: "Failed to create sprint" })
  }
}

const getSprints = async (req, res) => {
  try {
    const { project_id } = req.query

    if (!project_id) {
      return res.status(400).json({ error: "Project ID is required" })
    }

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

    const sprints = await prisma.sprint.findMany({
      where: { project_id: Number.parseInt(project_id) },
      include: {
        issues: {
          include: {
            issue: {
              include: {
                assignee: {
                  select: { id: true, username: true, email: true },
                },
              },
            },
          },
        },
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { created_at: "desc" },
    })

    // Calculate sprint statistics
    const sprintsWithStats = sprints.map((sprint) => {
      const issues = sprint.issues.map((si) => si.issue)
      const totalIssues = issues.length
      const completedIssues = issues.filter((issue) => issue.status === "Done").length
      const inProgressIssues = issues.filter((issue) => issue.status === "In Progress").length
      const todoIssues = issues.filter((issue) => issue.status === "To Do").length
      const totalStoryPoints = issues.reduce((sum, issue) => sum + (issue.story_points || 0), 0)
      const completedStoryPoints = issues
        .filter((issue) => issue.status === "Done")
        .reduce((sum, issue) => sum + (issue.story_points || 0), 0)

      return {
        ...sprint,
        stats: {
          totalIssues,
          completedIssues,
          inProgressIssues,
          todoIssues,
          totalStoryPoints,
          completedStoryPoints,
          progress: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0,
        },
      }
    })

    res.json({ sprints: sprintsWithStats })
  } catch (error) {
    console.error("Get sprints error:", error)
    res.status(500).json({ error: "Failed to get sprints" })
  }
}

const getSprint = async (req, res) => {
  try {
    const { id } = req.params

    const sprint = await prisma.sprint.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        project: {
          select: { id: true, name: true, key: true },
        },
        issues: {
          include: {
            issue: {
              include: {
                assignee: {
                  select: { id: true, username: true, email: true },
                },
                reporter: {
                  select: { id: true, username: true, email: true },
                },
              },
            },
          },
        },
      },
    })

    if (!sprint) {
      return res.status(404).json({ error: "Sprint not found" })
    }

    // Check project access
    const projectAccess = await prisma.projectUser.findFirst({
      where: {
        project_id: sprint.project_id,
        user_id: req.user.id,
      },
    })

    if (!projectAccess) {
      return res.status(403).json({ error: "Access denied to this sprint" })
    }

    res.json({ sprint })
  } catch (error) {
    console.error("Get sprint error:", error)
    res.status(500).json({ error: "Failed to get sprint" })
  }
}

const updateSprint = async (req, res) => {
  try {
    const { id } = req.params
    const { name, start_date, end_date, status } = req.body

    const sprint = await prisma.sprint.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!sprint) {
      return res.status(404).json({ error: "Sprint not found" })
    }

    // Check project access
    const projectAccess = await prisma.projectUser.findFirst({
      where: {
        project_id: sprint.project_id,
        user_id: req.user.id,
        role: { in: ["lead", "admin"] },
      },
    })

    if (!projectAccess && req.user.role !== "admin") {
      return res.status(403).json({ error: "Insufficient permissions to update sprint" })
    }

    const updateData = {}
    if (name) updateData.name = name
    if (start_date) updateData.start_date = new Date(start_date)
    if (end_date) updateData.end_date = new Date(end_date)
    if (status) updateData.status = status

    const updatedSprint = await prisma.sprint.update({
      where: { id: Number.parseInt(id) },
      data: updateData,
      include: {
        project: {
          select: { id: true, name: true, key: true },
        },
      },
    })

    res.json({
      message: "Sprint updated successfully",
      sprint: updatedSprint,
    })
  } catch (error) {
    console.error("Update sprint error:", error)
    res.status(500).json({ error: "Failed to update sprint" })
  }
}

const addIssueToSprint = async (req, res) => {
  try {
    const { id } = req.params
    const { issue_id } = req.body

    if (!issue_id) {
      return res.status(400).json({ error: "Issue ID is required" })
    }

    // Check if sprint exists
    const sprint = await prisma.sprint.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!sprint) {
      return res.status(404).json({ error: "Sprint not found" })
    }

    // Check if issue exists and belongs to same project
    const issue = await prisma.issue.findFirst({
      where: {
        id: Number.parseInt(issue_id),
        project_id: sprint.project_id,
      },
    })

    if (!issue) {
      return res.status(404).json({ error: "Issue not found or does not belong to this project" })
    }

    // Check project access
    const projectAccess = await prisma.projectUser.findFirst({
      where: {
        project_id: sprint.project_id,
        user_id: req.user.id,
      },
    })

    if (!projectAccess) {
      return res.status(403).json({ error: "Access denied to this project" })
    }

    // Add issue to sprint
    await prisma.sprintIssue.create({
      data: {
        sprint_id: Number.parseInt(id),
        issue_id: Number.parseInt(issue_id),
      },
    })

    res.json({ message: "Issue added to sprint successfully" })
  } catch (error) {
    console.error("Add issue to sprint error:", error)
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Issue is already in this sprint" })
    }
    res.status(500).json({ error: "Failed to add issue to sprint" })
  }
}

const removeIssueFromSprint = async (req, res) => {
  try {
    const { id, issue_id } = req.params

    const sprint = await prisma.sprint.findUnique({
      where: { id: Number.parseInt(id) },
    })

    if (!sprint) {
      return res.status(404).json({ error: "Sprint not found" })
    }

    // Check project access
    const projectAccess = await prisma.projectUser.findFirst({
      where: {
        project_id: sprint.project_id,
        user_id: req.user.id,
      },
    })

    if (!projectAccess) {
      return res.status(403).json({ error: "Access denied to this project" })
    }

    await prisma.sprintIssue.delete({
      where: {
        sprint_id_issue_id: {
          sprint_id: Number.parseInt(id),
          issue_id: Number.parseInt(issue_id),
        },
      },
    })

    res.json({ message: "Issue removed from sprint successfully" })
  } catch (error) {
    console.error("Remove issue from sprint error:", error)
    res.status(500).json({ error: "Failed to remove issue from sprint" })
  }
}

module.exports = {
  createSprint,
  getSprints,
  getSprint,
  updateSprint,
  addIssueToSprint,
  removeIssueFromSprint,
}
