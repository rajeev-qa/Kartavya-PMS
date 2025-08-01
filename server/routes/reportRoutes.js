const express = require("express")
const {
  generateBurndownChart,
  generateVelocityChart,
  generateTimeTrackingReport,
  generateCreatedVsResolvedReport,
  exportReport
} = require("../controllers/reportController")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth)

router.get("/burndown/:sprint_id", generateBurndownChart)
router.get("/velocity/:project_id", generateVelocityChart)
router.get("/time-tracking", generateTimeTrackingReport)
router.get("/created-vs-resolved", generateCreatedVsResolvedReport)
router.get("/export", exportReport)

module.exports = router