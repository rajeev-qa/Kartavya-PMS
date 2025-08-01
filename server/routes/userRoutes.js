const express = require("express")
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  addUserToProject,
  getUserProfile,
  updateUserProfile
} = require("../controllers/userController")
const auth = require("../middleware/auth")

const router = express.Router()

router.use(auth)

router.get("/", getAllUsers)
router.post("/", createUser)
router.get("/profile", getUserProfile)
router.put("/profile", updateUserProfile)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)
router.post("/project", addUserToProject)

module.exports = router