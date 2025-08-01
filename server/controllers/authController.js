const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const prisma = require("../config/database")

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

const register = async (req, res) => {
  try {
    const { username, email, password, role_id = 3 } = req.body // Default to user role (id: 3)

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email, and password are required" })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      return res.status(400).json({ error: "User with this email or username already exists" })
    }

    // Hash password
    const saltRounds = 12
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password_hash,
        role_id,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role_id: true,
        created_at: true,
      },
    })

    // Generate token
    const token = generateToken(user)

    res.status(201).json({
      message: "User registered successfully",
      user,
      token,
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Failed to register user" })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" })
    }

    // Find user with role and permissions
    const user = await prisma.user.findUnique({
      where: { email },
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

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Generate token
    const token = generateToken(user)

    // Format user data with permissions
    const permissions = user.role?.permissions?.map(rp => rp.permission) || []
    const { password_hash, role, ...userWithoutPassword } = user
    
    const userData = {
      ...userWithoutPassword,
      role: user.role?.name || 'No Role',
      permissions
    }

    res.json({
      message: "Login successful",
      user: userData,
      token,
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Failed to login" })
  }
}

const getProfile = async (req, res) => {
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
      },
    })

    res.json({ user })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ error: "Failed to get user profile" })
  }
}

module.exports = {
  register,
  login,
  getProfile,
}
