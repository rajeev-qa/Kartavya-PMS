const prisma = require("../config/database")

const createDashboard = async (req, res) => {
  try {
    const { name, description, is_shared } = req.body

    if (!name) {
      return res.status(400).json({ error: "Name is required" })
    }

    const dashboard = await prisma.dashboard.create({
      data: {
        user_id: req.user.id,
        name,
        description,
        is_shared: is_shared || false
      }
    })

    res.status(201).json({ message: "Dashboard created successfully", dashboard })
  } catch (error) {
    console.error("Create dashboard error:", error)
    res.status(500).json({ error: "Failed to create dashboard" })
  }
}

const getDashboards = async (req, res) => {
  try {
    const dashboards = await prisma.dashboard.findMany({
      where: {
        OR: [
          { user_id: req.user.id },
          { is_shared: true }
        ]
      },
      include: {
        user: { select: { id: true, username: true } },
        gadgets: {
          orderBy: { position: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({ dashboards })
  } catch (error) {
    console.error("Get dashboards error:", error)
    res.status(500).json({ error: "Failed to get dashboards" })
  }
}

const getDashboard = async (req, res) => {
  try {
    const { id } = req.params

    const dashboard = await prisma.dashboard.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { user_id: req.user.id },
          { is_shared: true }
        ]
      },
      include: {
        user: { select: { id: true, username: true } },
        gadgets: {
          orderBy: { position: 'asc' }
        }
      }
    })

    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard not found" })
    }

    res.json({ dashboard })
  } catch (error) {
    console.error("Get dashboard error:", error)
    res.status(500).json({ error: "Failed to get dashboard" })
  }
}

const updateDashboard = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, is_shared } = req.body

    const dashboard = await prisma.dashboard.findUnique({
      where: { id: parseInt(id) }
    })

    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard not found" })
    }

    if (dashboard.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const updatedDashboard = await prisma.dashboard.update({
      where: { id: parseInt(id) },
      data: { name, description, is_shared }
    })

    res.json({ message: "Dashboard updated successfully", dashboard: updatedDashboard })
  } catch (error) {
    console.error("Update dashboard error:", error)
    res.status(500).json({ error: "Failed to update dashboard" })
  }
}

const deleteDashboard = async (req, res) => {
  try {
    const { id } = req.params

    const dashboard = await prisma.dashboard.findUnique({
      where: { id: parseInt(id) }
    })

    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard not found" })
    }

    if (dashboard.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    await prisma.dashboard.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: "Dashboard deleted successfully" })
  } catch (error) {
    console.error("Delete dashboard error:", error)
    res.status(500).json({ error: "Failed to delete dashboard" })
  }
}

const addGadget = async (req, res) => {
  try {
    const { dashboard_id } = req.params
    const { type, configuration, position } = req.body

    if (!type) {
      return res.status(400).json({ error: "Gadget type is required" })
    }

    const dashboard = await prisma.dashboard.findUnique({
      where: { id: parseInt(dashboard_id) }
    })

    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard not found" })
    }

    if (dashboard.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const gadget = await prisma.gadget.create({
      data: {
        dashboard_id: parseInt(dashboard_id),
        type,
        configuration: JSON.stringify(configuration || {}),
        position: position || 0
      }
    })

    res.status(201).json({ message: "Gadget added successfully", gadget })
  } catch (error) {
    console.error("Add gadget error:", error)
    res.status(500).json({ error: "Failed to add gadget" })
  }
}

const updateGadget = async (req, res) => {
  try {
    const { id } = req.params
    const { type, configuration, position } = req.body

    const gadget = await prisma.gadget.findUnique({
      where: { id: parseInt(id) },
      include: { dashboard: true }
    })

    if (!gadget) {
      return res.status(404).json({ error: "Gadget not found" })
    }

    if (gadget.dashboard.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const updatedGadget = await prisma.gadget.update({
      where: { id: parseInt(id) },
      data: {
        type: type || gadget.type,
        configuration: configuration ? JSON.stringify(configuration) : gadget.configuration,
        position: position !== undefined ? position : gadget.position
      }
    })

    res.json({ message: "Gadget updated successfully", gadget: updatedGadget })
  } catch (error) {
    console.error("Update gadget error:", error)
    res.status(500).json({ error: "Failed to update gadget" })
  }
}

const deleteGadget = async (req, res) => {
  try {
    const { id } = req.params

    const gadget = await prisma.gadget.findUnique({
      where: { id: parseInt(id) },
      include: { dashboard: true }
    })

    if (!gadget) {
      return res.status(404).json({ error: "Gadget not found" })
    }

    if (gadget.dashboard.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    await prisma.gadget.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: "Gadget deleted successfully" })
  } catch (error) {
    console.error("Delete gadget error:", error)
    res.status(500).json({ error: "Failed to delete gadget" })
  }
}

module.exports = {
  createDashboard,
  getDashboards,
  getDashboard,
  updateDashboard,
  deleteDashboard,
  addGadget,
  updateGadget,
  deleteGadget
}