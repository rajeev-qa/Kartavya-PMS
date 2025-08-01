const prisma = require("../config/database")

const quickSearch = async (req, res) => {
  try {
    const { q } = req.query
    
    if (!q || q.length < 2) {
      return res.json({ issues: [], projects: [] })
    }

    const searchTerm = `%${q}%`

    const [issues, projects] = await Promise.all([
      prisma.issue.findMany({
        where: {
          OR: [
            { key: { contains: q, mode: 'insensitive' } },
            { summary: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ],
          project: {
            users: {
              some: { user_id: req.user.id }
            }
          }
        },
        include: {
          project: true,
          assignee: { select: { id: true, username: true } },
          reporter: { select: { id: true, username: true } }
        },
        take: 20
      }),
      prisma.project.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { key: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } }
          ],
          users: {
            some: { user_id: req.user.id }
          }
        },
        include: {
          lead: { select: { id: true, username: true } }
        },
        take: 10
      })
    ])

    res.json({ issues, projects })
  } catch (error) {
    console.error("Quick search error:", error)
    res.status(500).json({ error: "Search failed" })
  }
}

const advancedSearch = async (req, res) => {
  try {
    const { 
      project_id, 
      assignee_id, 
      reporter_id, 
      status, 
      type, 
      priority,
      created_after,
      created_before,
      updated_after,
      updated_before,
      text
    } = req.query

    const whereClause = {
      project: {
        users: {
          some: { user_id: req.user.id }
        }
      }
    }

    if (project_id) whereClause.project_id = parseInt(project_id)
    if (assignee_id) whereClause.assignee_id = parseInt(assignee_id)
    if (reporter_id) whereClause.reporter_id = parseInt(reporter_id)
    if (status) whereClause.status = status
    if (type) whereClause.type = type
    if (priority) whereClause.priority = priority

    if (text) {
      whereClause.OR = [
        { summary: { contains: text, mode: 'insensitive' } },
        { description: { contains: text, mode: 'insensitive' } },
        { key: { contains: text, mode: 'insensitive' } }
      ]
    }

    if (created_after || created_before) {
      whereClause.created_at = {}
      if (created_after) whereClause.created_at.gte = new Date(created_after)
      if (created_before) whereClause.created_at.lte = new Date(created_before)
    }

    if (updated_after || updated_before) {
      whereClause.updated_at = {}
      if (updated_after) whereClause.updated_at.gte = new Date(updated_after)
      if (updated_before) whereClause.updated_at.lte = new Date(updated_before)
    }

    const issues = await prisma.issue.findMany({
      where: whereClause,
      include: {
        project: true,
        assignee: { select: { id: true, username: true, email: true } },
        reporter: { select: { id: true, username: true, email: true } },
        comments: { take: 1, orderBy: { created_at: 'desc' } }
      },
      orderBy: { updated_at: 'desc' },
      take: 100
    })

    res.json({ issues })
  } catch (error) {
    console.error("Advanced search error:", error)
    res.status(500).json({ error: "Advanced search failed" })
  }
}

const saveFilter = async (req, res) => {
  try {
    const { name, query, is_shared } = req.body

    if (!name || !query) {
      return res.status(400).json({ error: "Name and query are required" })
    }

    const filter = await prisma.filter.create({
      data: {
        user_id: req.user.id,
        name,
        query,
        is_shared: is_shared || false
      }
    })

    res.status(201).json({ message: "Filter saved successfully", filter })
  } catch (error) {
    console.error("Save filter error:", error)
    res.status(500).json({ error: "Failed to save filter" })
  }
}

const getFilters = async (req, res) => {
  try {
    const filters = await prisma.filter.findMany({
      where: {
        OR: [
          { user_id: req.user.id },
          { is_shared: true }
        ]
      },
      include: {
        user: { select: { id: true, username: true } }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({ filters })
  } catch (error) {
    console.error("Get filters error:", error)
    res.status(500).json({ error: "Failed to get filters" })
  }
}

const updateFilter = async (req, res) => {
  try {
    const { id } = req.params
    const { name, query, is_shared } = req.body

    const filter = await prisma.filter.findUnique({
      where: { id: parseInt(id) }
    })

    if (!filter) {
      return res.status(404).json({ error: "Filter not found" })
    }

    if (filter.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const updatedFilter = await prisma.filter.update({
      where: { id: parseInt(id) },
      data: { name, query, is_shared }
    })

    res.json({ message: "Filter updated successfully", filter: updatedFilter })
  } catch (error) {
    console.error("Update filter error:", error)
    res.status(500).json({ error: "Failed to update filter" })
  }
}

const deleteFilter = async (req, res) => {
  try {
    const { id } = req.params

    const filter = await prisma.filter.findUnique({
      where: { id: parseInt(id) }
    })

    if (!filter) {
      return res.status(404).json({ error: "Filter not found" })
    }

    if (filter.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    await prisma.filter.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: "Filter deleted successfully" })
  } catch (error) {
    console.error("Delete filter error:", error)
    res.status(500).json({ error: "Failed to delete filter" })
  }
}

module.exports = {
  quickSearch,
  advancedSearch,
  saveFilter,
  getFilters,
  updateFilter,
  deleteFilter
}