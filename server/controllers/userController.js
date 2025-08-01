const prisma = require("../config/database")
const bcrypt = require("bcrypt")

const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { created_at: "desc" }
    })
    
    const formattedUsers = users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      created_at: user.created_at,
      updated_at: user.updated_at,
      role: user.role?.name || 'No Role'
    }))
    
    res.json({ users: formattedUsers })
  } catch (error) {
    console.error("Get users error:", error)
    res.status(500).json({ error: "Failed to get users" })
  }
}

const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" })
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    })

    if (existingUser) {
      return res.status(400).json({ error: "Username or email already exists" })
    }

    // Find role by name if provided
    let roleId = null
    if (role && role !== 'no-role') {
      const roleRecord = await prisma.role.findFirst({
        where: { name: role }
      })
      console.log('Creating user with role:', role, 'Found role record:', roleRecord)
      roleId = roleRecord?.id || null
    }

    const password_hash = await bcrypt.hash(password, 12)
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        role_id: roleId
      },
      include: {
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const formattedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      created_at: user.created_at,
      role: user.role?.name || 'No Role'
    }

    res.status(201).json({ message: "User created successfully", user: formattedUser })
  } catch (error) {
    console.error("Create user error:", error)
    res.status(500).json({ error: "Failed to create user" })
  }
}

const updateUser = async (req, res) => {
  try {
    const { id } = req.params
    const { username, email, password, role } = req.body

    const updateData = {}
    if (username) updateData.username = username
    if (email) updateData.email = email
    if (password) updateData.password_hash = await bcrypt.hash(password, 12)
    
    // Handle role update
    if (role !== undefined) {
      console.log('Role update requested:', role)
      if (role && role !== 'no-role') {
        // First, let's see all available roles
        const allRoles = await prisma.role.findMany()
        console.log('All available roles:', allRoles)
        
        const roleRecord = await prisma.role.findFirst({
          where: { name: role }
        })
        console.log('Searching for role:', role, 'Found role record:', roleRecord)
        updateData.role_id = roleRecord?.id || null
        console.log('Setting role_id to:', updateData.role_id)
      } else {
        console.log('Setting role_id to null for no-role')
        updateData.role_id = null
      }
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    const formattedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      updated_at: user.updated_at,
      role: user.role?.name || 'No Role'
    }

    res.json({ message: "User updated successfully", user: formattedUser })
  } catch (error) {
    console.error("Update user error:", error)
    res.status(500).json({ error: "Failed to update user" })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    
    await prisma.user.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: "User deleted successfully" })
  } catch (error) {
    console.error("Delete user error:", error)
    res.status(500).json({ error: "Failed to delete user" })
  }
}

const addUserToProject = async (req, res) => {
  try {
    const { project_id, user_id, role } = req.body

    const projectUser = await prisma.projectUser.create({
      data: {
        project_id: parseInt(project_id),
        user_id: parseInt(user_id),
        role: role || "developer"
      }
    })

    res.status(201).json({ message: "User added to project", projectUser })
  } catch (error) {
    console.error("Add user to project error:", error)
    res.status(500).json({ error: "Failed to add user to project" })
  }
}

const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role_id: true,
        created_at: true,
        updated_at: true,
        role: {
          select: {
            name: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const formattedUser = {
      ...user,
      role: user.role?.name || 'No Role'
    }

    res.json({ user: formattedUser })
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({ error: "Failed to get user profile" })
  }
}

const updateUserProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body
    const userId = req.user.id

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    const updateData = {}
    if (username) updateData.username = username
    if (email) updateData.email = email

    if (newPassword && currentPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
      if (!isValidPassword) {
        return res.status(400).json({ error: "Current password is incorrect" })
      }
      updateData.password_hash = await bcrypt.hash(newPassword, 12)
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        role_id: true,
        updated_at: true,
        role: {
          select: {
            name: true
          }
        }
      }
    })

    const formattedUser = {
      ...updatedUser,
      role: updatedUser.role?.name || 'No Role'
    }

    res.json({ message: "Profile updated successfully", user: formattedUser })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
}

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  addUserToProject,
  getUserProfile,
  updateUserProfile
}