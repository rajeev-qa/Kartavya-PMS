const express = require("express")
const router = express.Router()
const authenticateToken = require("../middleware/auth")
const {
  createTestCase,
  executeTestCase,
  getTestCases,
  getTestCase,
  updateTestCase,
  deleteTestCase,
  getTestStats
} = require("../controllers/testCaseController")

router.post("/", authenticateToken, createTestCase)
router.post("/:id/execute", authenticateToken, executeTestCase)
router.get("/", authenticateToken, getTestCases)
router.get("/stats", authenticateToken, getTestStats)
router.get("/:id", authenticateToken, getTestCase)
router.put("/:id", authenticateToken, updateTestCase)
router.delete("/:id", authenticateToken, deleteTestCase)

module.exports = router