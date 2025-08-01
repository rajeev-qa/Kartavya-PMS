const express = require("express")
const {
  configureCardColors,
  managePermissions,
  configureTimeTracking,
  setKeyboardShortcuts,
  getSystemStats,
  createSupportRequest,
  getSupportRequests,
  setHomepage
} = require("../controllers/adminController")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth)

router.post("/card-colors", configureCardColors)
router.post("/permissions", managePermissions)
router.post("/time-tracking", configureTimeTracking)
router.post("/keyboard-shortcuts", setKeyboardShortcuts)
router.get("/stats", getSystemStats)
router.post("/support", createSupportRequest)
router.get("/support", getSupportRequests)
router.post("/homepage", setHomepage)

module.exports = router