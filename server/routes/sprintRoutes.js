const express = require("express")
const {
  createSprint,
  getSprints,
  getSprint,
  updateSprint,
  addIssueToSprint,
  removeIssueFromSprint,
} = require("../controllers/sprintController")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth) // All sprint routes require authentication

router.post("/", createSprint)
router.get("/", getSprints)
router.get("/:id", getSprint)
router.put("/:id", updateSprint)
router.post("/:id/issues", addIssueToSprint)
router.delete("/:id/issues/:issue_id", removeIssueFromSprint)

module.exports = router
