const prisma = require("../config/database")

const logWork = async (req, res) => {
  try {
    const { issue_id } = req.params
    const { time_spent, comment } = req.body
    
    if (!time_spent) {
      return res.status(400).json({ error: "Time spent is required" })
    }

    const worklog = await prisma.workLog.create({
      data: {
        issue_id: parseInt(issue_id),
        user_id: req.user.id,
        time_spent: parseInt(time_spent),
        comment
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    })

    res.status(201).json({ message: "Work logged successfully", worklog })
  } catch (error) {
    console.error("Log work error:", error)
    res.status(500).json({ error: "Failed to log work" })
  }
}

const getWorklogs = async (req, res) => {
  try {
    const { issue_id } = req.params

    const worklogs = await prisma.workLog.findMany({
      where: { issue_id: parseInt(issue_id) },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      },
      orderBy: { created_at: "desc" }
    })

    res.json({ worklogs })
  } catch (error) {
    console.error("Get worklogs error:", error)
    res.status(500).json({ error: "Failed to get worklogs" })
  }
}

const updateWorklog = async (req, res) => {
  try {
    const { id } = req.params
    const { time_spent, comment } = req.body

    const worklog = await prisma.workLog.findUnique({
      where: { id: parseInt(id) }
    })

    if (!worklog) {
      return res.status(404).json({ error: "Worklog not found" })
    }

    if (worklog.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const updatedWorklog = await prisma.workLog.update({
      where: { id: parseInt(id) },
      data: { 
        time_spent: time_spent ? parseInt(time_spent) : worklog.time_spent,
        comment: comment !== undefined ? comment : worklog.comment
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    })

    res.json({ message: "Worklog updated successfully", worklog: updatedWorklog })
  } catch (error) {
    console.error("Update worklog error:", error)
    res.status(500).json({ error: "Failed to update worklog" })
  }
}

const deleteWorklog = async (req, res) => {
  try {
    const { id } = req.params

    const worklog = await prisma.workLog.findUnique({
      where: { id: parseInt(id) }
    })

    if (!worklog) {
      return res.status(404).json({ error: "Worklog not found" })
    }

    if (worklog.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    await prisma.workLog.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: "Worklog deleted successfully" })
  } catch (error) {
    console.error("Delete worklog error:", error)
    res.status(500).json({ error: "Failed to delete worklog" })
  }
}

module.exports = {
  logWork,
  getWorklogs,
  updateWorklog,
  deleteWorklog
}