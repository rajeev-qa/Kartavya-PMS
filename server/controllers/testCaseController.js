const prisma = require("../config/database")

const createTestCase = async (req, res) => {
  try {
    const { title, description, steps, expected_result, project_id, issue_id, priority } = req.body

    if (!title || !steps || !expected_result || !project_id) {
      return res.status(400).json({ error: "Title, steps, expected result, and project ID are required" })
    }

    const testCase = await prisma.testCase.create({
      data: {
        title,
        description,
        steps: JSON.stringify(steps),
        expected_result,
        project_id: parseInt(project_id),
        issue_id: issue_id ? parseInt(issue_id) : null,
        priority: priority || "Medium",
        status: "Active",
        created_by: req.user.id
      },
      include: {
        project: { select: { name: true } },
        issue: { select: { summary: true } },
        creator: { select: { username: true } }
      }
    })

    res.status(201).json({ message: "Test case created successfully", testCase })
  } catch (error) {
    console.error("Create test case error:", error)
    res.status(500).json({ error: "Failed to create test case" })
  }
}

const executeTestCase = async (req, res) => {
  try {
    const { id } = req.params
    const { status, actual_result, notes, environment } = req.body

    if (!status || !actual_result) {
      return res.status(400).json({ error: "Status and actual result are required" })
    }

    const testCase = await prisma.testCase.findUnique({
      where: { id: parseInt(id) },
      include: { project: true, issue: true }
    })

    if (!testCase) {
      return res.status(404).json({ error: "Test case not found" })
    }

    // Create test execution record
    const execution = await prisma.testExecution.create({
      data: {
        test_case_id: parseInt(id),
        executed_by: req.user.id,
        status,
        actual_result,
        notes,
        environment: environment || "Development"
      }
    })

    // If test failed, automatically create a bug
    let bug = null
    if (status === "Failed") {
      // Get project to generate issue key
      const project = await prisma.project.findUnique({
        where: { id: testCase.project_id }
      })

      // Get next issue number for this project
      const lastIssue = await prisma.issue.findFirst({
        where: { project_id: testCase.project_id },
        orderBy: { id: "desc" }
      })

      const issueNumber = lastIssue ? parseInt(lastIssue.key.split("-")[1]) + 1 : 1
      const issueKey = `${project.key}-${issueNumber}`

      bug = await prisma.issue.create({
        data: {
          key: issueKey,
          summary: `Bug: ${testCase.title} - Test Failed`,
          description: `Test case "${testCase.title}" failed during execution.
          
**Test Case Details:**
- Expected Result: ${testCase.expected_result}
- Actual Result: ${actual_result}
- Environment: ${environment || "Development"}
- Notes: ${notes || "No additional notes"}

**Steps to Reproduce:**
${JSON.parse(testCase.steps).map((step, index) => `${index + 1}. ${step}`).join('\n')}`,
          type: "Bug",
          priority: testCase.priority,
          status: "To Do",
          project_id: testCase.project_id,
          reporter_id: req.user.id,
          assignee_id: testCase.issue?.assignee_id || null,
          test_case_id: parseInt(id)
        }
      })

      // Update test case status
      await prisma.testCase.update({
        where: { id: parseInt(id) },
        data: { status: "Failed" }
      })
    } else if (status === "Passed") {
      await prisma.testCase.update({
        where: { id: parseInt(id) },
        data: { status: "Passed" }
      })
    }

    res.json({ 
      message: "Test case executed successfully", 
      execution,
      bug: bug ? { id: bug.id, summary: bug.summary } : null
    })
  } catch (error) {
    console.error("Execute test case error:", error)
    res.status(500).json({ error: "Failed to execute test case" })
  }
}

const getTestCases = async (req, res) => {
  try {
    const { project_id, issue_id, status } = req.query

    const whereClause = {}
    if (project_id) whereClause.project_id = parseInt(project_id)
    if (issue_id) whereClause.issue_id = parseInt(issue_id)
    if (status) whereClause.status = status

    const testCases = await prisma.testCase.findMany({
      where: whereClause,
      include: {
        project: { select: { name: true } },
        issue: { select: { summary: true } },
        creator: { select: { username: true } },
        executions: {
          orderBy: { executed_at: 'desc' },
          take: 1,
          include: {
            executor: { select: { username: true } }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({ testCases })
  } catch (error) {
    console.error("Get test cases error:", error)
    res.status(500).json({ error: "Failed to get test cases" })
  }
}

const getTestCase = async (req, res) => {
  try {
    const { id } = req.params

    const testCase = await prisma.testCase.findUnique({
      where: { id: parseInt(id) },
      include: {
        project: { select: { name: true } },
        issue: { select: { summary: true } },
        creator: { select: { username: true } },
        executions: {
          include: {
            executor: { select: { username: true } }
          },
          orderBy: { executed_at: 'desc' }
        },
        bugs: {
          select: { id: true, summary: true, status: true }
        }
      }
    })

    if (!testCase) {
      return res.status(404).json({ error: "Test case not found" })
    }

    res.json({ testCase })
  } catch (error) {
    console.error("Get test case error:", error)
    res.status(500).json({ error: "Failed to get test case" })
  }
}

const updateTestCase = async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, steps, expected_result, priority } = req.body

    const testCase = await prisma.testCase.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        steps: steps ? JSON.stringify(steps) : undefined,
        expected_result,
        priority
      },
      include: {
        project: { select: { name: true } },
        issue: { select: { summary: true } },
        creator: { select: { username: true } }
      }
    })

    res.json({ message: "Test case updated successfully", testCase })
  } catch (error) {
    console.error("Update test case error:", error)
    res.status(500).json({ error: "Failed to update test case" })
  }
}

const deleteTestCase = async (req, res) => {
  try {
    const { id } = req.params

    await prisma.testCase.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: "Test case deleted successfully" })
  } catch (error) {
    console.error("Delete test case error:", error)
    res.status(500).json({ error: "Failed to delete test case" })
  }
}

const getTestStats = async (req, res) => {
  try {
    const { project_id } = req.query

    const whereClause = project_id ? { project_id: parseInt(project_id) } : {}

    const [
      totalTests,
      passedTests,
      failedTests,
      activeTests,
      bugsFromTests
    ] = await Promise.all([
      prisma.testCase.count({ where: whereClause }),
      prisma.testCase.count({ where: { ...whereClause, status: "Passed" } }),
      prisma.testCase.count({ where: { ...whereClause, status: "Failed" } }),
      prisma.testCase.count({ where: { ...whereClause, status: "Active" } }),
      prisma.issue.count({ 
        where: { 
          type: "Bug",
          test_case_id: { not: null },
          ...(project_id && { project_id: parseInt(project_id) })
        } 
      })
    ])

    const stats = {
      totalTests,
      passedTests,
      failedTests,
      activeTests,
      bugsFromTests,
      passRate: totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0
    }

    res.json({ stats })
  } catch (error) {
    console.error("Get test stats error:", error)
    res.status(500).json({ error: "Failed to get test stats" })
  }
}

module.exports = {
  createTestCase,
  executeTestCase,
  getTestCases,
  getTestCase,
  updateTestCase,
  deleteTestCase,
  getTestStats
}