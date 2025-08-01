const prisma = require("../config/database")

const configureCardColors = async (req, res) => {
  try {
    const { project_id, color_scheme } = req.body

    if (!project_id || !color_scheme) {
      return res.status(400).json({ error: "Project ID and color scheme are required" })
    }

    const config = await prisma.boardConfiguration.upsert({
      where: { project_id: parseInt(project_id) },
      update: {
        card_colors: JSON.stringify(color_scheme)
      },
      create: {
        project_id: parseInt(project_id),
        card_colors: JSON.stringify(color_scheme),
        created_by: req.user.id
      }
    })

    res.json({ message: "Card colors configured successfully", config })
  } catch (error) {
    console.error("Configure card colors error:", error)
    res.status(500).json({ error: "Failed to configure card colors" })
  }
}

const managePermissions = async (req, res) => {
  try {
    const { user_id, project_id, permissions } = req.body

    if (!user_id || !permissions) {
      return res.status(400).json({ error: "User ID and permissions are required" })
    }

    const permission = await prisma.permission.upsert({
      where: {
        user_id_project_id: {
          user_id: parseInt(user_id),
          project_id: project_id ? parseInt(project_id) : null
        }
      },
      update: {
        permissions: JSON.stringify(permissions)
      },
      create: {
        user_id: parseInt(user_id),
        project_id: project_id ? parseInt(project_id) : null,
        permissions: JSON.stringify(permissions),
        granted_by: req.user.id
      }
    })

    res.json({ message: "Permissions updated successfully", permission })
  } catch (error) {
    console.error("Manage permissions error:", error)
    res.status(500).json({ error: "Failed to manage permissions" })
  }
}

const configureTimeTracking = async (req, res) => {
  try {
    const { time_unit, working_hours_per_day, working_days_per_week } = req.body

    const config = await prisma.systemConfiguration.upsert({
      where: { key: "time_tracking" },
      update: {
        value: JSON.stringify({
          time_unit: time_unit || "hours",
          working_hours_per_day: working_hours_per_day || 8,
          working_days_per_week: working_days_per_week || 5
        })
      },
      create: {
        key: "time_tracking",
        value: JSON.stringify({
          time_unit: time_unit || "hours",
          working_hours_per_day: working_hours_per_day || 8,
          working_days_per_week: working_days_per_week || 5
        }),
        updated_by: req.user.id
      }
    })

    res.json({ message: "Time tracking configured successfully", config })
  } catch (error) {
    console.error("Configure time tracking error:", error)
    res.status(500).json({ error: "Failed to configure time tracking" })
  }
}

const setKeyboardShortcuts = async (req, res) => {
  try {
    const { shortcuts } = req.body

    if (!shortcuts) {
      return res.status(400).json({ error: "Shortcuts configuration is required" })
    }

    const config = await prisma.userPreference.upsert({
      where: {
        user_id_key: {
          user_id: req.user.id,
          key: "keyboard_shortcuts"
        }
      },
      update: {
        value: JSON.stringify(shortcuts)
      },
      create: {
        user_id: req.user.id,
        key: "keyboard_shortcuts",
        value: JSON.stringify(shortcuts)
      }
    })

    res.json({ message: "Keyboard shortcuts configured successfully", config })
  } catch (error) {
    console.error("Set keyboard shortcuts error:", error)
    res.status(500).json({ error: "Failed to set keyboard shortcuts" })
  }
}

const getSystemStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProjects,
      totalIssues,
      activeIssues,
      completedIssues,
      totalSprints
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.issue.count(),
      prisma.issue.count({ where: { status: { not: "Done" } } }),
      prisma.issue.count({ where: { status: "Done" } }),
      prisma.sprint.count()
    ])

    const stats = {
      totalUsers,
      totalProjects,
      totalIssues,
      activeIssues,
      completedIssues,
      totalSprints,
      completionRate: totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0
    }

    res.json({ stats })
  } catch (error) {
    console.error("Get system stats error:", error)
    res.status(500).json({ error: "Failed to get system stats" })
  }
}

const createSupportRequest = async (req, res) => {
  try {
    const { subject, description, priority, category } = req.body

    if (!subject || !description) {
      return res.status(400).json({ error: "Subject and description are required" })
    }

    const supportRequest = await prisma.supportRequest.create({
      data: {
        user_id: req.user.id,
        subject,
        description,
        priority: priority || "Medium",
        category: category || "General",
        status: "Open"
      }
    })

    res.status(201).json({ message: "Support request created successfully", supportRequest })
  } catch (error) {
    console.error("Create support request error:", error)
    res.status(500).json({ error: "Failed to create support request" })
  }
}

const getSupportRequests = async (req, res) => {
  try {
    const { status, priority } = req.query

    const whereClause = {}
    if (req.user.role !== "admin") {
      whereClause.user_id = req.user.id
    }
    if (status) whereClause.status = status
    if (priority) whereClause.priority = priority

    const supportRequests = await prisma.supportRequest.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, username: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({ supportRequests })
  } catch (error) {
    console.error("Get support requests error:", error)
    res.status(500).json({ error: "Failed to get support requests" })
  }
}

const setHomepage = async (req, res) => {
  try {
    const { homepage_type, homepage_id } = req.body

    if (!homepage_type) {
      return res.status(400).json({ error: "Homepage type is required" })
    }

    const preference = await prisma.userPreference.upsert({
      where: {
        user_id_key: {
          user_id: req.user.id,
          key: "homepage"
        }
      },
      update: {
        value: JSON.stringify({
          type: homepage_type,
          id: homepage_id || null
        })
      },
      create: {
        user_id: req.user.id,
        key: "homepage",
        value: JSON.stringify({
          type: homepage_type,
          id: homepage_id || null
        })
      }
    })

    res.json({ message: "Homepage configured successfully", preference })
  } catch (error) {
    console.error("Set homepage error:", error)
    res.status(500).json({ error: "Failed to set homepage" })
  }
}

module.exports = {
  configureCardColors,
  managePermissions,
  configureTimeTracking,
  setKeyboardShortcuts,
  getSystemStats,
  createSupportRequest,
  getSupportRequests,
  setHomepage
}