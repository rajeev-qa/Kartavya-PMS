const express = require("express")
const {
  createWorkflow,
  getWorkflows,
  updateWorkflow,
  deleteWorkflow,
  setDefaultAssignee,
  getDefaultAssignees,
  autoAssignIssue
} = require("../controllers/workflowController")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth)

router.post("/", createWorkflow)
router.get("/", getWorkflows)
router.put("/:id", updateWorkflow)
router.delete("/:id", deleteWorkflow)
router.post("/default-assignee", setDefaultAssignee)
router.get("/default-assignee", getDefaultAssignees)
router.post("/auto-assign/:issue_id", autoAssignIssue)

module.exports = router