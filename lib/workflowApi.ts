const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
}

export const workflowAPI = {
  // Workflow CRUD operations
  async getAll() {
    const response = await fetch(`${API_BASE_URL}/workflows`, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch workflows')
    return response.json()
  },

  async create(workflowData: {
    name: string
    description?: string
    statuses: string[]
    transitions: Array<{ from: string; to: string; name: string }>
    project_id?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/workflows`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(workflowData)
    })
    if (!response.ok) throw new Error('Failed to create workflow')
    return response.json()
  },

  async update(id: number, workflowData: {
    name?: string
    description?: string
    statuses?: string[]
    transitions?: Array<{ from: string; to: string; name: string }>
  }) {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(workflowData)
    })
    if (!response.ok) throw new Error('Failed to update workflow')
    return response.json()
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to delete workflow')
    return response.json()
  },

  // Default assignee operations
  async getDefaultAssignees(projectId?: number) {
    const url = projectId 
      ? `${API_BASE_URL}/workflows/default-assignee?project_id=${projectId}`
      : `${API_BASE_URL}/workflows/default-assignee`
    
    const response = await fetch(url, {
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to fetch default assignees')
    return response.json()
  },

  async setDefaultAssignee(data: {
    project_id: number
    issue_type: string
    assignee_id?: number
  }) {
    const response = await fetch(`${API_BASE_URL}/workflows/default-assignee`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Failed to set default assignee')
    return response.json()
  },

  // Auto-assignment
  async autoAssignIssue(issueId: number) {
    const response = await fetch(`${API_BASE_URL}/workflows/auto-assign/${issueId}`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Failed to auto-assign issue')
    return response.json()
  },

  // Workflow validation
  async validateWorkflow(workflowData: {
    statuses: string[]
    transitions: Array<{ from: string; to: string; name: string }>
  }) {
    // Client-side validation
    const errors: string[] = []
    
    if (!workflowData.statuses || workflowData.statuses.length === 0) {
      errors.push('At least one status is required')
    }
    
    if (!workflowData.transitions || workflowData.transitions.length === 0) {
      errors.push('At least one transition is required')
    }
    
    // Check if all transition statuses exist in the status list
    workflowData.transitions.forEach((transition, index) => {
      if (!workflowData.statuses.includes(transition.from)) {
        errors.push(`Transition ${index + 1}: 'From' status '${transition.from}' does not exist`)
      }
      if (!workflowData.statuses.includes(transition.to)) {
        errors.push(`Transition ${index + 1}: 'To' status '${transition.to}' does not exist`)
      }
      if (!transition.name.trim()) {
        errors.push(`Transition ${index + 1}: Name is required`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Workflow templates
  getTemplates() {
    return [
      {
        name: 'Simple Workflow',
        description: 'Basic three-step workflow',
        statuses: ['To Do', 'In Progress', 'Done'],
        transitions: [
          { from: 'To Do', to: 'In Progress', name: 'Start Progress' },
          { from: 'In Progress', to: 'Done', name: 'Complete' },
          { from: 'Done', to: 'To Do', name: 'Reopen' }
        ]
      },
      {
        name: 'Bug Workflow',
        description: 'Workflow for bug tracking',
        statuses: ['Open', 'In Progress', 'Testing', 'Closed'],
        transitions: [
          { from: 'Open', to: 'In Progress', name: 'Start Fix' },
          { from: 'In Progress', to: 'Testing', name: 'Ready for Test' },
          { from: 'Testing', to: 'Closed', name: 'Verified' },
          { from: 'Testing', to: 'In Progress', name: 'Failed Test' },
          { from: 'Closed', to: 'Open', name: 'Reopen' }
        ]
      },
      {
        name: 'Feature Workflow',
        description: 'Workflow for feature development',
        statuses: ['Backlog', 'Analysis', 'Development', 'Review', 'Testing', 'Done'],
        transitions: [
          { from: 'Backlog', to: 'Analysis', name: 'Start Analysis' },
          { from: 'Analysis', to: 'Development', name: 'Start Development' },
          { from: 'Development', to: 'Review', name: 'Ready for Review' },
          { from: 'Review', to: 'Testing', name: 'Approved' },
          { from: 'Review', to: 'Development', name: 'Changes Requested' },
          { from: 'Testing', to: 'Done', name: 'Passed Testing' },
          { from: 'Testing', to: 'Development', name: 'Failed Testing' }
        ]
      }
    ]
  }
}