const prisma = require("../config/database")

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" })
      }

      // Get user with role and permissions
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          role: {
            include: {
              permissions: {
                select: { permission: true }
              }
            }
          }
        }
      })

      if (!user || !user.role) {
        return res.status(403).json({ error: "No role assigned" })
      }

      const userPermissions = user.role.permissions.map(rp => rp.permission)
      
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          error: `Permission denied. Required: ${requiredPermission}` 
        })
      }

      next()
    } catch (error) {
      console.error("Permission check error:", error)
      res.status(500).json({ error: "Permission check failed" })
    }
  }
}

module.exports = { checkPermission }