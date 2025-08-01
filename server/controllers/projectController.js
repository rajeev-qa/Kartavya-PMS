const prisma = require("../config/database")

const createProject = async (req, res) => {
  try {
    const { name, key, description } = req.body
    const lead_user_id = req.user.id

    if (!name || !key) {
      return res.status(400).json({ error: "Name and key are required" })
    }

    const project = await prisma.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        description,
        lead_user_id,
      },
      include: {
        lead: {
          select: { id: true, username: true, email: true },
        },
        users: {
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    })

    // Add creator as project member
    await prisma.projectUser.create({
      data: {
        project_id: project.id,
        user_id: lead_user_id,
        role: "lead",
      },
    })

    res.status(201).json({
      message: "Project created successfully",
      project,
    })
  } catch (error) {
    console.error("Create project error:", error)
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Project key already exists" })
    }
    res.status(500).json({ error: "Failed to create project" })
  }
}

const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        users: {
          some: {
            user_id: req.user.id,
          },
        },
      },
      include: {
        lead: {
          select: { id: true, username: true, email: true },
        },
        users: {
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
          },
        },
        issues: {
          select: {
            id: true,
            status: true,
            story_points: true,
          },
        },
        _count: {
          select: {
            issues: true,
            users: true,
          },
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    })

    // Calculate project statistics
    const projectsWithStats = projects.map((project) => {
      const issues = project.issues
      const totalIssues = issues.length
      const completedIssues = issues.filter((issue) => issue.status === "Done").length
      const inProgressIssues = issues.filter((issue) => issue.status === "In Progress").length
      const todoIssues = issues.filter((issue) => issue.status === "To Do").length
      const progress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0

      return {
        ...project,
        stats: {
          totalIssues,
          completedIssues,
          inProgressIssues,
          todoIssues,
          progress,
          teamSize: project._count.users,
        },
      }
    })

    res.json({ projects: projectsWithStats })
  } catch (error) {
    console.error("Get projects error:", error)
    res.status(500).json({ error: "Failed to get projects" })
  }
}

const getProject = async (req, res) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findFirst({
      where: {
        id: Number.parseInt(id),
        users: {
          some: {
            user_id: req.user.id,
          },
        },
      },
      include: {
        lead: {
          select: { id: true, username: true, email: true },
        },
        users: {
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
          },
        },
        issues: {
          include: {
            assignee: {
              select: { id: true, username: true, email: true },
            },
            reporter: {
              select: { id: true, username: true, email: true },
            },
          },
          orderBy: {
            created_at: "desc",
          },
        },
        sprints: {
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
          },
          orderBy: {
            created_at: "desc",
          },
        },
      },
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    res.json({ project })
  } catch (error) {
    console.error("Get project error:", error)
    res.status(500).json({ error: "Failed to get project" })
  }
}

const updateProject = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description } = req.body

    // Check if user has permission to update project
    const project = await prisma.project.findFirst({
      where: {
        id: Number.parseInt(id),
        OR: [
          { lead_user_id: req.user.id },
          {
            users: {
              some: {
                user_id: req.user.id,
                role: "lead",
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found or insufficient permissions" })
    }

    const updatedProject = await prisma.project.update({
      where: { id: Number.parseInt(id) },
      data: {
        name,
        description,
      },
      include: {
        lead: {
          select: { id: true, username: true, email: true },
        },
      },
    })

    res.json({
      message: "Project updated successfully",
      project: updatedProject,
    })
  } catch (error) {
    console.error("Update project error:", error)
    res.status(500).json({ error: "Failed to update project" })
  }
}

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params

    // Check if user is project lead or admin
    const project = await prisma.project.findFirst({
      where: {
        id: Number.parseInt(id),
        lead_user_id: req.user.id,
      },
    })

    if (!project && req.user.role !== "admin") {
      return res.status(404).json({ error: "Project not found or insufficient permissions" })
    }

    await prisma.project.delete({
      where: { id: Number.parseInt(id) },
    })

    res.json({ message: "Project deleted successfully" })
  } catch (error) {
    console.error("Delete project error:", error)
    res.status(500).json({ error: "Failed to delete project" })
  }
}

const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params
    const { user_id, role = "member" } = req.body

    // Check if user has permission to add team members
    const project = await prisma.project.findFirst({
      where: {
        id: Number.parseInt(id),
        OR: [
          { lead_user_id: req.user.id },
          {
            users: {
              some: {
                user_id: req.user.id,
                role: "lead",
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found or insufficient permissions" })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: Number.parseInt(user_id) },
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if user is already a team member
    const existingMember = await prisma.projectUser.findFirst({
      where: {
        project_id: Number.parseInt(id),
        user_id: Number.parseInt(user_id),
      },
    })

    if (existingMember) {
      return res.status(400).json({ error: "User is already a team member" })
    }

    // Add team member
    const teamMember = await prisma.projectUser.create({
      data: {
        project_id: Number.parseInt(id),
        user_id: Number.parseInt(user_id),
        role,
      },
      include: {
        user: {
          select: { id: true, username: true, email: true },
        },
      },
    })

    res.status(201).json({
      message: "Team member added successfully",
      teamMember,
    })
  } catch (error) {
    console.error("Add team member error:", error)
    res.status(500).json({ error: "Failed to add team member" })
  }
}

const removeTeamMember = async (req, res) => {
  try {
    const { id, userId } = req.params

    // Check if user has permission to remove team members
    const project = await prisma.project.findFirst({
      where: {
        id: Number.parseInt(id),
        OR: [
          { lead_user_id: req.user.id },
          {
            users: {
              some: {
                user_id: req.user.id,
                role: "lead",
              },
            },
          },
        ],
      },
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found or insufficient permissions" })
    }

    // Cannot remove project lead
    if (Number.parseInt(userId) === project.lead_user_id) {
      return res.status(400).json({ error: "Cannot remove project lead" })
    }

    // Remove team member
    await prisma.projectUser.deleteMany({
      where: {
        project_id: Number.parseInt(id),
        user_id: Number.parseInt(userId),
      },
    })

    res.json({ message: "Team member removed successfully" })
  } catch (error) {
    console.error("Remove team member error:", error)
    res.status(500).json({ error: "Failed to remove team member" })
  }
}

const getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params

    const project = await prisma.project.findFirst({
      where: {
        id: Number.parseInt(id),
        users: {
          some: {
            user_id: req.user.id,
          },
        },
      },
      include: {
        users: {
          include: {
            user: {
              select: { id: true, username: true, email: true },
            },
          },
        },
      },
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    const teamMembers = project.users.map(pu => ({
      id: pu.user.id,
      username: pu.user.username,
      email: pu.user.email,
      role: pu.role,
      avatar: pu.user.username.substring(0, 2).toUpperCase(),
    }))

    res.json({ teamMembers })
  } catch (error) {
    console.error("Get team members error:", error)
    res.status(500).json({ error: "Failed to get team members" })
  }
}

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
}
