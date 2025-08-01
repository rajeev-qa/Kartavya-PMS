const express = require("express")
const {
  createDashboard,
  getDashboards,
  getDashboard,
  updateDashboard,
  deleteDashboard,
  addGadget,
  updateGadget,
  deleteGadget
} = require("../controllers/dashboardController")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth)

router.post("/", createDashboard)
router.get("/", getDashboards)
router.get("/:id", getDashboard)
router.put("/:id", updateDashboard)
router.delete("/:id", deleteDashboard)
router.post("/:dashboard_id/gadgets", addGadget)
router.put("/gadgets/:id", updateGadget)
router.delete("/gadgets/:id", deleteGadget)

module.exports = router