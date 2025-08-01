const jwt = require("jsonwebtoken")
const prisma = require("../config/database")

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ error: "Access denied. No token provided." })
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined")
      return res.status(500).json({ error: "Server configuration error" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { 
        id: true, 
        username: true, 
        email: true, 
        role_id: true,
        role: {
          select: {
            id: true,
            name: true
          }
        }
      },
    })

    if (!user) {
      return res.status(401).json({ error: "User not found" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error.message)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Token expired" })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Invalid token format" })
    }
    res.status(401).json({ error: "Authentication failed" })
  }
}

module.exports = auth
