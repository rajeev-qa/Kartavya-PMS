const express = require("express")
const {
  createIssue,
  getIssues,
  getIssue,
  updateIssue,
  deleteIssue,
  addComment,
} = require("../controllers/issueController")
const {
  addComment: addCommentNew,
  getComments,
  updateComment,
  deleteComment
} = require("../controllers/commentController")
const {
  logWork,
  getWorklogs,
  updateWorklog,
  deleteWorklog
} = require("../controllers/worklogController")
const {
  upload,
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment
} = require("../controllers/attachmentController")
const auth = require("../middleware/auth")
const { checkPermission } = require("../middleware/permissions")

const router = express.Router()

router.use(auth) // All issue routes require authentication

router.post("/", checkPermission('issue.create'), createIssue)
router.get("/", checkPermission('project.view'), getIssues)
router.get("/:id", checkPermission('project.view'), getIssue)
router.put("/:id", checkPermission('issue.edit'), updateIssue)
router.delete("/:id", checkPermission('issue.delete'), deleteIssue)
router.post("/:id/comments", checkPermission('issue.comment'), addComment)

// New comment routes
router.post("/:issue_id/comments", checkPermission('issue.comment'), addCommentNew)
router.get("/:issue_id/comments", checkPermission('project.view'), getComments)
router.put("/comments/:id", checkPermission('issue.comment'), updateComment)
router.delete("/comments/:id", checkPermission('issue.comment'), deleteComment)

// Worklog routes
router.post("/:issue_id/worklog", logWork)
router.get("/:issue_id/worklog", getWorklogs)
router.put("/worklog/:id", updateWorklog)
router.delete("/worklog/:id", deleteWorklog)

// Attachment routes
router.post("/:issue_id/attachments", upload.single("file"), uploadAttachment)
router.get("/:issue_id/attachments", getAttachments)
router.get("/attachments/:id/download", downloadAttachment)
router.delete("/attachments/:id", deleteAttachment)

module.exports = router
