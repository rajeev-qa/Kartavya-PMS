const express = require("express")
const {
  connectVersionControl,
  createBranch,
  linkCommit,
  getCommits,
  triggerBuild,
  getBuildStatus,
  getAll,
  create,
  toggle,
  test
} = require("../controllers/integrationController")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth)

// Main integration endpoints
router.get("/", getAll)
router.post("/", create)
router.put("/:id/toggle", toggle)
router.post("/:id/test", test)

// Specific integration features
router.post("/version-control", connectVersionControl)
router.post("/branch/:issue_id", createBranch)
router.post("/commit", linkCommit)
router.get("/commits/:issue_id", getCommits)
router.post("/build/:project_id", triggerBuild)
router.get("/build/:project_id", getBuildStatus)

module.exports = router