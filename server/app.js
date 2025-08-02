const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/authRoutes")
const projectRoutes = require("./routes/projectRoutes")
const issueRoutes = require("./routes/issueRoutes")
const sprintRoutes = require("./routes/sprintRoutes")
const userRoutes = require("./routes/userRoutes")
const epicRoutes = require("./routes/epicRoutes")
const searchRoutes = require("./routes/searchRoutes")
const workflowRoutes = require("./routes/workflowRoutes")
const integrationRoutes = require("./routes/integrationRoutes")
const adminRoutes = require("./routes/adminRoutes")
const reportRoutes = require("./routes/reportRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const roleRoutes = require("./routes/roles")
const testCaseRoutes = require("./routes/testCaseRoutes")

// Import middleware
const errorHandler = require("./middleware/errorHandler")

const app = express()

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      "https://kartavya-pms-production.up.railway.app"
    ],
    credentials: true,
  }),
)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Health check endpoints
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: process.env.PORT || 5000
  })
})

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Kartavya PMS Backend API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0"
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/issues", issueRoutes)
app.use("/api/sprints", sprintRoutes)
app.use("/api/users", userRoutes)
app.use("/api/epics", epicRoutes)
app.use("/api/search", searchRoutes)
app.use("/api/workflows", workflowRoutes)
app.use("/api/integrations", integrationRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/dashboards", dashboardRoutes)
app.use("/api/roles", roleRoutes)
app.use("/api/test-cases", testCaseRoutes)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// Error handling middleware
app.use(errorHandler)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`)
})

module.exports = app
