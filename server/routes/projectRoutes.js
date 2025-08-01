const express = require("express")
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
} = require("../controllers/projectController")
const auth = require("../middleware/auth")
const { checkPermission } = require("../middleware/permissions")

const router = express.Router()

router.use(auth) // All project routes require authentication

router.post("/", checkPermission('project.create'), createProject)
router.get("/", checkPermission('project.view'), getProjects)
router.get("/:id", checkPermission('project.view'), getProject)
router.put("/:id", checkPermission('project.edit'), updateProject)
router.delete("/:id", checkPermission('project.delete'), deleteProject)

// Team management routes
router.get("/:id/team", checkPermission('user.view'), getTeamMembers)
router.post("/:id/team", checkPermission('project.edit'), addTeamMember)
router.delete("/:id/team/:userId", checkPermission('project.edit'), removeTeamMember)

module.exports = router
