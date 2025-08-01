const prisma = require("../config/database")
const axios = require("axios")

const connectVersionControl = async (req, res) => {
  try {
    const { project_id, provider, repository_url, access_token } = req.body

    if (!project_id || !provider || !repository_url) {
      return res.status(400).json({ error: "Project ID, provider, and repository URL are required" })
    }

    const integration = await prisma.integration.create({
      data: {
        project_id: parseInt(project_id),
        type: "version_control",
        provider,
        configuration: JSON.stringify({
          repository_url,
          access_token: access_token || null
        }),
        created_by: req.user.id
      }
    })

    res.status(201).json({ message: "Version control connected successfully", integration })
  } catch (error) {
    console.error("Connect version control error:", error)
    res.status(500).json({ error: "Failed to connect version control" })
  }
}

const createBranch = async (req, res) => {
  try {
    const { issue_id } = req.params
    const { branch_name } = req.body

    const issue = await prisma.issue.findUnique({
      where: { id: parseInt(issue_id) },
      include: {
        project: {
          include: {
            integrations: {
              where: { type: "version_control" }
            }
          }
        }
      }
    })

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" })
    }

    const vcIntegration = issue.project.integrations[0]
    if (!vcIntegration) {
      return res.status(400).json({ error: "No version control integration found" })
    }

    const config = JSON.parse(vcIntegration.configuration)
    const branchName = branch_name || `feature/${issue.key}-${issue.summary.toLowerCase().replace(/\s+/g, '-')}`

    // Mock branch creation - in real implementation would call GitHub/Bitbucket API
    const branch = await prisma.branch.create({
      data: {
        issue_id: parseInt(issue_id),
        name: branchName,
        repository_url: config.repository_url,
        created_by: req.user.id
      }
    })

    res.status(201).json({ message: "Branch created successfully", branch })
  } catch (error) {
    console.error("Create branch error:", error)
    res.status(500).json({ error: "Failed to create branch" })
  }
}

const linkCommit = async (req, res) => {
  try {
    const { issue_id, commit_hash, commit_message, repository_url } = req.body

    if (!issue_id || !commit_hash || !commit_message) {
      return res.status(400).json({ error: "Issue ID, commit hash, and message are required" })
    }

    const commit = await prisma.commit.create({
      data: {
        issue_id: parseInt(issue_id),
        hash: commit_hash,
        message: commit_message,
        repository_url,
        author_id: req.user.id
      }
    })

    // Process smart commit commands
    const smartCommands = extractSmartCommands(commit_message)
    for (const command of smartCommands) {
      await processSmartCommand(command, issue_id, req.user.id)
    }

    res.status(201).json({ message: "Commit linked successfully", commit })
  } catch (error) {
    console.error("Link commit error:", error)
    res.status(500).json({ error: "Failed to link commit" })
  }
}

const getCommits = async (req, res) => {
  try {
    const { issue_id } = req.params

    const commits = await prisma.commit.findMany({
      where: { issue_id: parseInt(issue_id) },
      include: {
        author: { select: { id: true, username: true, email: true } }
      },
      orderBy: { created_at: 'desc' }
    })

    res.json({ commits })
  } catch (error) {
    console.error("Get commits error:", error)
    res.status(500).json({ error: "Failed to get commits" })
  }
}

const triggerBuild = async (req, res) => {
  try {
    const { project_id } = req.params
    const { build_plan, parameters } = req.body

    const project = await prisma.project.findUnique({
      where: { id: parseInt(project_id) },
      include: {
        integrations: {
          where: { type: "ci_cd" }
        }
      }
    })

    if (!project) {
      return res.status(404).json({ error: "Project not found" })
    }

    const ciIntegration = project.integrations[0]
    if (!ciIntegration) {
      return res.status(400).json({ error: "No CI/CD integration found" })
    }

    // Mock build trigger - in real implementation would call Bamboo/Jenkins API
    const build = await prisma.build.create({
      data: {
        project_id: parseInt(project_id),
        plan_name: build_plan,
        status: "QUEUED",
        parameters: JSON.stringify(parameters || {}),
        triggered_by: req.user.id
      }
    })

    res.status(201).json({ message: "Build triggered successfully", build })
  } catch (error) {
    console.error("Trigger build error:", error)
    res.status(500).json({ error: "Failed to trigger build" })
  }
}

const getBuildStatus = async (req, res) => {
  try {
    const { project_id } = req.params

    const builds = await prisma.build.findMany({
      where: { project_id: parseInt(project_id) },
      include: {
        triggeredBy: { select: { id: true, username: true } }
      },
      orderBy: { created_at: 'desc' },
      take: 10
    })

    res.json({ builds })
  } catch (error) {
    console.error("Get build status error:", error)
    res.status(500).json({ error: "Failed to get build status" })
  }
}

const extractSmartCommands = (message) => {
  const commands = []
  const patterns = [
    /(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+([A-Z]+-\d+)/gi,
    /(?:time|log)\s+([A-Z]+-\d+)\s+(\d+[hm])/gi,
    /(?:comment|comments)\s+([A-Z]+-\d+)\s+"([^"]+)"/gi
  ]

  patterns.forEach(pattern => {
    let match
    while ((match = pattern.exec(message)) !== null) {
      commands.push({
        type: match[0].split(' ')[0].toLowerCase(),
        issueKey: match[1],
        value: match[2] || null
      })
    }
  })

  return commands
}

const processSmartCommand = async (command, issueId, userId) => {
  try {
    switch (command.type) {
      case 'close':
      case 'fix':
      case 'resolve':
        await prisma.issue.update({
          where: { id: parseInt(issueId) },
          data: { status: "Done" }
        })
        break
      case 'time':
      case 'log':
        const timeValue = parseInt(command.value.replace(/[hm]/g, ''))
        await prisma.workLog.create({
          data: {
            issue_id: parseInt(issueId),
            user_id: userId,
            time_spent: timeValue,
            comment: `Time logged via commit`
          }
        })
        break
      case 'comment':
        await prisma.comment.create({
          data: {
            issue_id: parseInt(issueId),
            user_id: userId,
            content: command.value
          }
        })
        break
    }
  } catch (error) {
    console.error("Process smart command error:", error)
  }
}

const getAll = async (req, res) => {
  try {
    const integrations = await prisma.integration.findMany({
      include: {
        project: { select: { id: true, name: true, key: true } }
      },
      orderBy: { created_at: 'desc' }
    })

    // Format integrations for frontend
    const formattedIntegrations = integrations.map(integration => {
      const config = JSON.parse(integration.configuration)
      return {
        id: integration.id,
        name: integration.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        type: integration.type,
        status: config.status || 'connected',
        url: config.url || config.repository_url || '',
        lastSync: integration.updated_at,
        project: integration.project
      }
    })

    res.json({ integrations: formattedIntegrations })
  } catch (error) {
    console.error("Get integrations error:", error)
    res.status(500).json({ error: "Failed to get integrations" })
  }
}

const create = async (req, res) => {
  try {
    const { type, name, config, project_id } = req.body

    if (!type || !name || !config) {
      return res.status(400).json({ error: "Type, name, and config are required" })
    }

    const integration = await prisma.integration.create({
      data: {
        project_id: project_id ? parseInt(project_id) : 1, // Default to first project
        type,
        configuration: JSON.stringify({ ...config, name })
      },
      include: {
        project: { select: { id: true, name: true, key: true } }
      }
    })

    res.status(201).json({ message: "Integration created successfully", integration })
  } catch (error) {
    console.error("Create integration error:", error)
    res.status(500).json({ error: "Failed to create integration" })
  }
}

const toggle = async (req, res) => {
  try {
    const { id } = req.params
    const { enabled } = req.body

    const integration = await prisma.integration.findUnique({
      where: { id: parseInt(id) }
    })

    if (!integration) {
      return res.status(404).json({ error: "Integration not found" })
    }

    const config = JSON.parse(integration.configuration)
    config.status = enabled ? 'connected' : 'disconnected'

    const updatedIntegration = await prisma.integration.update({
      where: { id: parseInt(id) },
      data: {
        configuration: JSON.stringify(config)
      }
    })

    res.json({ message: "Integration status updated", integration: updatedIntegration })
  } catch (error) {
    console.error("Toggle integration error:", error)
    res.status(500).json({ error: "Failed to toggle integration" })
  }
}

const test = async (req, res) => {
  try {
    const { id } = req.params

    const integration = await prisma.integration.findUnique({
      where: { id: parseInt(id) }
    })

    if (!integration) {
      return res.status(404).json({ error: "Integration not found" })
    }

    // Mock test - in real implementation would test actual connection
    const testResult = {
      success: true,
      message: "Integration test successful",
      timestamp: new Date().toISOString()
    }

    res.json({ testResult })
  } catch (error) {
    console.error("Test integration error:", error)
    res.status(500).json({ error: "Failed to test integration" })
  }
}

module.exports = {
  connectVersionControl,
  createBranch,
  linkCommit,
  getCommits,
  triggerBuild,
  getBuildStatus,
  getAll,
  create,
  toggle,
  test
}