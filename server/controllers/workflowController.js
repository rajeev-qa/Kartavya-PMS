const prisma = require("../config/database")

const createWorkflow = async (req, res) => {
  try {
    const { name, description, statuses, transitions, project_id } = req.body

    if (!name || !statuses || !transitions) {
      return res.status(400).json({ error: "Name, statuses, and transitions are required" })
    }

    if (!project_id) {
      return res.status(400).json({ error: "Project ID is required" })
    }

    // Create workflow in database
    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        project_id: parseInt(project_id)
      },
      include: {
        project: { select: { id: true, name: true, key: true } }
      }
    })

    // Create workflow transitions
    if (transitions && transitions.length > 0) {
      await prisma.workflowTransition.createMany({
        data: transitions.map(t => ({
          workflow_id: workflow.id,
          from_status: t.from,
          to_status: t.to
        }))
      })
    }

    // Fetch complete workflow with transitions
    const completeWorkflow = await prisma.workflow.findUnique({
      where: { id: workflow.id },
      include: {
        transitions: true,
        project: { select: { id: true, name: true, key: true } }
      }
    })

    // Format response to match frontend expectations
    const formattedWorkflow = {
      ...completeWorkflow,
      statuses,
      transitions: completeWorkflow.transitions.map(t => ({
        from: t.from_status,
        to: t.to_status,
        name: `${t.from_status} to ${t.to_status}`
      }))
    }

    res.status(201).json({ message: "Workflow created successfully", workflow: formattedWorkflow })
  } catch (error) {
    console.error("Create workflow error:", error)
    res.status(500).json({ error: "Failed to create workflow" })
  }
}

const getWorkflows = async (req, res) => {
  try {
    const workflows = await prisma.workflow.findMany({
      include: {
        transitions: true,
        project: { select: { id: true, name: true, key: true } }
      },
      orderBy: { created_at: 'desc' }
    })

    // Format workflows to match frontend expectations
    const formattedWorkflows = workflows.map(workflow => {
      const statuses = [...new Set([
        ...workflow.transitions.map(t => t.from_status),
        ...workflow.transitions.map(t => t.to_status)
      ])]
      
      return {
        ...workflow,
        statuses,
        transitions: workflow.transitions.map(t => ({
          from: t.from_status,
          to: t.to_status,
          name: `${t.from_status} to ${t.to_status}`
        }))
      }
    })

    res.json({ workflows: formattedWorkflows })
  } catch (error) {
    console.error("Get workflows error:", error)
    res.status(500).json({ error: "Failed to get workflows" })
  }
}

const updateWorkflow = async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, statuses, transitions } = req.body

    const workflow = await prisma.workflow.findUnique({
      where: { id: parseInt(id) }
    })

    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" })
    }

    // Update workflow basic info
    const updatedWorkflow = await prisma.workflow.update({
      where: { id: parseInt(id) },
      data: {
        name: name || workflow.name,
        description: description || workflow.description
      }
    })

    // Update transitions if provided
    if (transitions) {
      // Delete existing transitions
      await prisma.workflowTransition.deleteMany({
        where: { workflow_id: parseInt(id) }
      })

      // Create new transitions
      if (transitions.length > 0) {
        await prisma.workflowTransition.createMany({
          data: transitions.map(t => ({
            workflow_id: parseInt(id),
            from_status: t.from,
            to_status: t.to
          }))
        })
      }
    }

    // Fetch complete updated workflow
    const completeWorkflow = await prisma.workflow.findUnique({
      where: { id: parseInt(id) },
      include: {
        transitions: true,
        project: { select: { id: true, name: true, key: true } }
      }
    })

    // Format response
    const formattedWorkflow = {
      ...completeWorkflow,
      statuses: statuses || [...new Set([
        ...completeWorkflow.transitions.map(t => t.from_status),
        ...completeWorkflow.transitions.map(t => t.to_status)
      ])],
      transitions: completeWorkflow.transitions.map(t => ({
        from: t.from_status,
        to: t.to_status,
        name: `${t.from_status} to ${t.to_status}`
      }))
    }

    res.json({ message: "Workflow updated successfully", workflow: formattedWorkflow })
  } catch (error) {
    console.error("Update workflow error:", error)
    res.status(500).json({ error: "Failed to update workflow" })
  }
}

const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params

    const workflow = await prisma.workflow.findUnique({
      where: { id: parseInt(id) }
    })

    if (!workflow) {
      return res.status(404).json({ error: "Workflow not found" })
    }

    // Delete workflow (transitions will be deleted automatically due to cascade)
    await prisma.workflow.delete({
      where: { id: parseInt(id) }
    })

    res.json({ message: "Workflow deleted successfully" })
  } catch (error) {
    console.error("Delete workflow error:", error)
    res.status(500).json({ error: "Failed to delete workflow" })
  }
}

const setDefaultAssignee = async (req, res) => {
  try {
    const { project_id, issue_type, assignee_id } = req.body

    if (!project_id || !issue_type) {
      return res.status(400).json({ error: "Project ID and issue type are required" })
    }

    const defaultAssignee = await prisma.defaultAssignee.upsert({
      where: {
        project_id_issue_type: {
          project_id: parseInt(project_id),
          issue_type
        }
      },
      update: {
        assignee_id: assignee_id ? parseInt(assignee_id) : null
      },
      create: {
        project_id: parseInt(project_id),
        issue_type,
        assignee_id: assignee_id ? parseInt(assignee_id) : null
      },
      include: {
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, username: true, email: true } }
      }
    })

    res.json({ message: "Default assignee set successfully", defaultAssignee })
  } catch (error) {
    console.error("Set default assignee error:", error)
    res.status(500).json({ error: "Failed to set default assignee" })
  }
}

const getDefaultAssignees = async (req, res) => {
  try {
    const { project_id } = req.query

    const whereClause = {}
    if (project_id) {
      whereClause.project_id = parseInt(project_id)
    }

    const defaultAssignees = await prisma.defaultAssignee.findMany({
      where: whereClause,
      include: {
        project: { select: { id: true, name: true, key: true } },
        assignee: { select: { id: true, username: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({ defaultAssignees })
  } catch (error) {
    console.error("Get default assignees error:", error)
    res.status(500).json({ error: "Failed to get default assignees" })
  }
}

const autoAssignIssue = async (req, res) => {
  try {
    const { issue_id } = req.params

    const issue = await prisma.issue.findUnique({
      where: { id: parseInt(issue_id) },
      include: { project: true }
    })

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" })
    }

    const defaultAssignee = await prisma.defaultAssignee.findUnique({
      where: {
        project_id_issue_type: {
          project_id: issue.project_id,
          issue_type: issue.type
        }
      }
    })

    if (defaultAssignee && defaultAssignee.assignee_id) {
      await prisma.issue.update({
        where: { id: parseInt(issue_id) },
        data: { assignee_id: defaultAssignee.assignee_id }
      })

      res.json({ message: "Issue auto-assigned successfully" })
    } else {
      res.json({ message: "No default assignee configured" })
    }
  } catch (error) {
    console.error("Auto assign issue error:", error)
    res.status(500).json({ error: "Failed to auto assign issue" })
  }
}

module.exports = {
  createWorkflow,
  getWorkflows,
  updateWorkflow,
  deleteWorkflow,
  setDefaultAssignee,
  getDefaultAssignees,
  autoAssignIssue
}