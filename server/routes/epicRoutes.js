const express = require("express")
const {
  createEpic,
  getEpics,
  getEpic,
  addIssueToEpic,
  removeIssueFromEpic
} = require("../controllers/epicController")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth)

router.post("/", createEpic)
router.get("/", getEpics)
router.get("/:id", getEpic)
router.post("/issues", addIssueToEpic)
router.delete("/issues/:issue_id", removeIssueFromEpic)

module.exports = router