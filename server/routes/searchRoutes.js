const express = require("express")
const {
  quickSearch,
  advancedSearch,
  saveFilter,
  getFilters,
  updateFilter,
  deleteFilter
} = require("../controllers/searchController")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth)

router.get("/quick", quickSearch)
router.get("/advanced", advancedSearch)
router.post("/filters", saveFilter)
router.get("/filters", getFilters)
router.put("/filters/:id", updateFilter)
router.delete("/filters/:id", deleteFilter)

module.exports = router