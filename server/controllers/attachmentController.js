const prisma = require("../config/database")
const multer = require("multer")
const path = require("path")
const fs = require("fs")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || "uploads"
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error("Invalid file type"))
    }
  }
})

const uploadAttachment = async (req, res) => {
  try {
    const { issue_id } = req.params
    
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" })
    }

    const attachment = await prisma.attachment.create({
      data: {
        issue_id: parseInt(issue_id),
        user_id: req.user.id,
        filename: req.file.originalname,
        file_path: req.file.path
      },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    })

    // Add file_size to the attachment record
    const stats = fs.statSync(req.file.path)
    const updatedAttachment = await prisma.attachment.update({
      where: { id: attachment.id },
      data: { file_size: stats.size },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    })

    res.status(201).json({ message: "File uploaded successfully", attachment: updatedAttachment })
  } catch (error) {
    console.error("Upload attachment error:", error)
    res.status(500).json({ error: "Failed to upload file" })
  }
}

const getAttachments = async (req, res) => {
  try {
    const { issue_id } = req.params

    const attachments = await prisma.attachment.findMany({
      where: { issue_id: parseInt(issue_id) },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      },
      orderBy: { created_at: "desc" }
    })

    res.json({ attachments })
  } catch (error) {
    console.error("Get attachments error:", error)
    res.status(500).json({ error: "Failed to get attachments" })
  }
}

const downloadAttachment = async (req, res) => {
  try {
    const { id } = req.params
    const { view } = req.query

    const attachment = await prisma.attachment.findUnique({
      where: { id: parseInt(id) }
    })

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" })
    }

    if (!fs.existsSync(attachment.file_path)) {
      return res.status(404).json({ error: "File not found on disk" })
    }

    if (view === 'true') {
      // View file in browser
      const mimeType = getMimeType(attachment.filename)
      res.setHeader('Content-Type', mimeType)
      res.setHeader('Content-Disposition', `inline; filename="${attachment.filename}"`)
      res.sendFile(path.resolve(attachment.file_path))
    } else {
      // Download file
      res.download(attachment.file_path, attachment.filename)
    }
  } catch (error) {
    console.error("Download attachment error:", error)
    res.status(500).json({ error: "Failed to download file" })
  }
}

const getMimeType = (filename) => {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params

    const attachment = await prisma.attachment.findUnique({
      where: { id: parseInt(id) }
    })

    if (!attachment) {
      return res.status(404).json({ error: "Attachment not found" })
    }

    if (attachment.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" })
    }

    // Delete file from disk
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path)
    }

    await prisma.attachment.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: "Attachment deleted successfully" })
  } catch (error) {
    console.error("Delete attachment error:", error)
    res.status(500).json({ error: "Failed to delete attachment" })
  }
}

module.exports = {
  upload,
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment
}