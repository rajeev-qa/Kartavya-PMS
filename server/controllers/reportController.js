const prisma = require("../config/database")

const generateBurndownChart = async (req, res) => {
  try {
    const { sprint_id } = req.params

    const sprint = await prisma.sprint.findUnique({
      where: { id: parseInt(sprint_id) },
      include: {
        issues: {
          include: {
            issue: {
              include: {
                work_logs: true
              }
            }
          }
        }
      }
    })

    if (!sprint) {
      return res.status(404).json({ error: "Sprint not found" })
    }

    const startDate = new Date(sprint.start_date)
    const endDate = new Date(sprint.end_date)
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))

    const totalStoryPoints = sprint.issues.reduce((sum, si) => 
      sum + (si.issue.story_points || 0), 0)

    const burndownData = []
    for (let day = 0; day <= totalDays; day++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + day)
      
      const completedPoints = sprint.issues
        .filter(si => si.issue.status === "Done" && 
          new Date(si.issue.updated_at) <= currentDate)
        .reduce((sum, si) => sum + (si.issue.story_points || 0), 0)

      burndownData.push({
        date: currentDate.toISOString().split('T')[0],
        remaining: totalStoryPoints - completedPoints,
        ideal: totalStoryPoints - (totalStoryPoints * day / totalDays)
      })
    }

    res.json({ burndownData, sprint })
  } catch (error) {
    console.error("Generate burndown chart error:", error)
    res.status(500).json({ error: "Failed to generate burndown chart" })
  }
}

const generateVelocityChart = async (req, res) => {
  try {
    const { project_id } = req.params

    const sprints = await prisma.sprint.findMany({
      where: { 
        project_id: parseInt(project_id),
        status: "Completed"
      },
      include: {
        issues: {
          include: {
            issue: true
          }
        }
      },
      orderBy: { created_at: 'asc' },
      take: 10
    })

    const velocityData = sprints.map(sprint => {
      const completedPoints = sprint.issues
        .filter(si => si.issue.status === "Done")
        .reduce((sum, si) => sum + (si.issue.story_points || 0), 0)

      const committedPoints = sprint.issues
        .reduce((sum, si) => sum + (si.issue.story_points || 0), 0)

      return {
        sprintName: sprint.name,
        committed: committedPoints,
        completed: completedPoints,
        velocity: completedPoints
      }
    })

    const averageVelocity = velocityData.length > 0 
      ? velocityData.reduce((sum, data) => sum + data.velocity, 0) / velocityData.length
      : 0

    res.json({ velocityData, averageVelocity })
  } catch (error) {
    console.error("Generate velocity chart error:", error)
    res.status(500).json({ error: "Failed to generate velocity chart" })
  }
}

const generateTimeTrackingReport = async (req, res) => {
  try {
    const { project_id, user_id, start_date, end_date } = req.query

    const whereClause = {}
    if (project_id) {
      whereClause.issue = { project_id: parseInt(project_id) }
    }
    if (user_id) {
      whereClause.user_id = parseInt(user_id)
    }
    if (start_date) {
      whereClause.created_at = { gte: new Date(start_date) }
    }
    if (end_date) {
      whereClause.created_at = { 
        ...whereClause.created_at,
        lte: new Date(end_date) 
      }
    }

    const worklogs = await prisma.workLog.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, username: true } },
        issue: { 
          select: { 
            id: true, 
            key: true, 
            summary: true,
            project: { select: { name: true } }
          } 
        }
      },
      orderBy: { created_at: 'desc' }
    })

    const totalTime = worklogs.reduce((sum, log) => sum + log.time_spent, 0)
    
    const userSummary = worklogs.reduce((acc, log) => {
      const userId = log.user.id
      if (!acc[userId]) {
        acc[userId] = {
          user: log.user,
          totalTime: 0,
          issueCount: new Set()
        }
      }
      acc[userId].totalTime += log.time_spent
      acc[userId].issueCount.add(log.issue.id)
      return acc
    }, {})

    const userStats = Object.values(userSummary).map(stat => ({
      user: stat.user,
      totalTime: stat.totalTime,
      issueCount: stat.issueCount.size
    }))

    res.json({ worklogs, totalTime, userStats })
  } catch (error) {
    console.error("Generate time tracking report error:", error)
    res.status(500).json({ error: "Failed to generate time tracking report" })
  }
}

const generateCreatedVsResolvedReport = async (req, res) => {
  try {
    const { project_id, days = 30 } = req.query

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(days))

    const whereClause = {
      created_at: { gte: startDate, lte: endDate }
    }
    if (project_id) {
      whereClause.project_id = parseInt(project_id)
    }

    const issues = await prisma.issue.findMany({
      where: whereClause,
      select: {
        id: true,
        status: true,
        created_at: true,
        updated_at: true
      }
    })

    const reportData = []
    for (let i = 0; i < parseInt(days); i++) {
      const currentDate = new Date(startDate)
      currentDate.setDate(startDate.getDate() + i)
      
      const created = issues.filter(issue => 
        issue.created_at.toDateString() === currentDate.toDateString()
      ).length

      const resolved = issues.filter(issue => 
        issue.status === "Done" && 
        issue.updated_at.toDateString() === currentDate.toDateString()
      ).length

      reportData.push({
        date: currentDate.toISOString().split('T')[0],
        created,
        resolved
      })
    }

    res.json({ reportData })
  } catch (error) {
    console.error("Generate created vs resolved report error:", error)
    res.status(500).json({ error: "Failed to generate report" })
  }
}

const exportReport = async (req, res) => {
  try {
    const { type, format = 'json' } = req.query

    let data = {}
    switch (type) {
      case 'burndown':
        // Implementation would call generateBurndownChart logic
        break
      case 'velocity':
        // Implementation would call generateVelocityChart logic
        break
      default:
        return res.status(400).json({ error: "Invalid report type" })
    }

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`)
      // Convert data to CSV format
      res.send('CSV data would be here')
    } else {
      res.json(data)
    }
  } catch (error) {
    console.error("Export report error:", error)
    res.status(500).json({ error: "Failed to export report" })
  }
}

module.exports = {
  generateBurndownChart,
  generateVelocityChart,
  generateTimeTrackingReport,
  generateCreatedVsResolvedReport,
  exportReport
}