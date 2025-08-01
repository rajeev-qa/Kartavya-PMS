const prisma = require("../config/database")

const addComment = async (req, res) => {
  try {
    const { issue_id } = req.params
    const { content } = req.body
    
    if (!content) {
      return res.status(400).json({ error: "Content is required" })
    }

    const comment = await prisma.comment.create({
      data: {
        issue_id: parseInt(issue_id),
        user_id: req.user.id,
        content
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    })

    res.status(201).json({ message: "Comment added successfully", comment })
  } catch (error) {
    console.error("Add comment error:", error)
    res.status(500).json({ error: "Failed to add comment" })
  }
}

const getComments = async (req, res) => {
  try {
    const { issue_id } = req.params

    const comments = await prisma.comment.findMany({
      where: { issue_id: parseInt(issue_id) },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      },
      orderBy: { created_at: "asc" }
    })

    res.json({ comments })
  } catch (error) {
    console.error("Get comments error:", error)
    res.status(500).json({ error: "Failed to get comments" })
  }
}

const updateComment = async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    })

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    if (comment.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    const updatedComment = await prisma.comment.update({
      where: { id: parseInt(id) },
      data: { content },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    })

    res.json({ message: "Comment updated successfully", comment: updatedComment })
  } catch (error) {
    console.error("Update comment error:", error)
    res.status(500).json({ error: "Failed to update comment" })
  }
}

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params

    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) }
    })

    if (!comment) {
      return res.status(404).json({ error: "Comment not found" })
    }

    if (comment.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: "Comment deleted successfully" })
  } catch (error) {
    console.error("Delete comment error:", error)
    res.status(500).json({ error: "Failed to delete comment" })
  }
}

module.exports = {
  addComment,
  getComments,
  updateComment,
  deleteComment
}