import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password })
    return response.data
  },

  register: async (username: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { username, email, password })
    return response.data
  },

  getProfile: async () => {
    const response = await api.get("/auth/profile")
    return response.data
  },
}

// Projects API
export const projectsApi = {
  getAll: async () => {
    const response = await api.get("/projects")
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  create: async (projectData: { name: string; key: string; description?: string }) => {
    const response = await api.post("/projects", projectData)
    return response.data
  },

  update: async (id: number, projectData: { name?: string; description?: string }) => {
    const response = await api.put(`/projects/${id}`, projectData)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },

  // Team management
  getTeamMembers: async (id: number) => {
    const response = await api.get(`/projects/${id}/team`)
    return response.data
  },

  addTeamMember: async (id: number, user_id: number, role = "member") => {
    const response = await api.post(`/projects/${id}/team`, { user_id, role })
    return response.data
  },

  removeTeamMember: async (id: number, userId: number) => {
    const response = await api.delete(`/projects/${id}/team/${userId}`)
    return response.data
  },
}

export const projectsAPI = {
  getAll: async () => {
    const response = await api.get("/projects")
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  create: async (projectData: { name: string; key: string; description?: string }) => {
    const response = await api.post("/projects", projectData)
    return response.data
  },

  update: async (id: number, projectData: { name?: string; description?: string }) => {
    const response = await api.put(`/projects/${id}`, projectData)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/projects/${id}`)
    return response.data
  },

  // Team management
  getTeamMembers: async (id: number) => {
    const response = await api.get(`/projects/${id}/team`)
    return response.data
  },

  addTeamMember: async (id: number, user_id: number, role = "member") => {
    const response = await api.post(`/projects/${id}/team`, { user_id, role })
    return response.data
  },

  removeTeamMember: async (id: number, userId: number) => {
    const response = await api.delete(`/projects/${id}/team/${userId}`)
    return response.data
  },
}

// Issues API
export const issuesApi = {
  getAll: async (params?: {
    project_id?: number
    status?: string
    assignee_id?: number
    type?: string
    sprint_id?: number
  }) => {
    const response = await api.get("/issues", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/issues/${id}`)
    return response.data
  },

  create: async (issueData: {
    project_id: number
    summary: string
    description?: string
    type: string
    priority?: string
    assignee_id?: number
    story_points?: number
    due_date?: string
  }) => {
    const response = await api.post("/issues", issueData)
    return response.data
  },

  update: async (
    id: number,
    issueData: {
      summary?: string
      description?: string
      type?: string
      status?: string
      priority?: string
      assignee_id?: number
      story_points?: number
      due_date?: string
    },
  ) => {
    const response = await api.put(`/issues/${id}`, issueData)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/issues/${id}`)
    return response.data
  },

  updateStatus: async (id: number, status: string) => {
    const response = await api.put(`/issues/${id}`, { status })
    return response.data
  },

  addComment: async (id: number, content: string) => {
    const response = await api.post(`/issues/${id}/comments`, { content })
    return response.data
  },
}

export const issuesAPI = {
  getAll: async (params?: {
    project_id?: number
    status?: string
    assignee_id?: number
    type?: string
    sprint_id?: number
  }) => {
    const response = await api.get("/issues", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/issues/${id}`)
    return response.data
  },

  create: async (issueData: {
    project_id: number
    summary: string
    description?: string
    type: string
    priority?: string
    assignee_id?: number
    story_points?: number
    due_date?: string
  }) => {
    const response = await api.post("/issues", issueData)
    return response.data
  },

  update: async (
    id: number,
    issueData: {
      summary?: string
      description?: string
      type?: string
      status?: string
      priority?: string
      assignee_id?: number
      story_points?: number
      due_date?: string
    },
  ) => {
    const response = await api.put(`/issues/${id}`, issueData)
    return response.data
  },

  delete: async (id: number) => {
    const response = await api.delete(`/issues/${id}`)
    return response.data
  },

  updateStatus: async (id: number, status: string) => {
    const response = await api.put(`/issues/${id}`, { status })
    return response.data
  },

  addComment: async (id: number, content: string) => {
    const response = await api.post(`/issues/${id}/comments`, { content })
    return response.data
  },
}

// Sprints API
export const sprintsAPI = {
  getAll: async (params?: { project_id?: number }) => {
    const response = await api.get("/sprints", { params })
    return response.data
  },

  getById: async (id: number) => {
    const response = await api.get(`/sprints/${id}`)
    return response.data
  },

  create: async (sprintData: {
    project_id: number
    name: string
    start_date?: string
    end_date?: string
  }) => {
    const response = await api.post("/sprints", sprintData)
    return response.data
  },

  update: async (
    id: number,
    sprintData: {
      name?: string
      start_date?: string
      end_date?: string
      status?: string
    },
  ) => {
    const response = await api.put(`/sprints/${id}`, sprintData)
    return response.data
  },

  addIssue: async (id: number, issue_id: number) => {
    const response = await api.post(`/sprints/${id}/issues`, { issue_id })
    return response.data
  },

  removeIssue: async (id: number, issue_id: number) => {
    const response = await api.delete(`/sprints/${id}/issues/${issue_id}`)
    return response.data
  },
}

// Comments API
export const commentsAPI = {
  add: async (issueId: number, content: string) => {
    const response = await api.post(`/issues/${issueId}/comments`, { content })
    return response.data
  },
  get: async (issueId: number) => {
    const response = await api.get(`/issues/${issueId}/comments`)
    return response.data
  },
  update: async (id: number, content: string) => {
    const response = await api.put(`/issues/comments/${id}`, { content })
    return response.data
  },
  delete: async (id: number) => {
    const response = await api.delete(`/issues/comments/${id}`)
    return response.data
  }
}

// Worklog API
export const worklogAPI = {
  log: async (issueId: number, timeSpent: number, comment?: string) => {
    const response = await api.post(`/issues/${issueId}/worklog`, { time_spent: timeSpent, comment })
    return response.data
  },
  get: async (issueId: number) => {
    const response = await api.get(`/issues/${issueId}/worklog`)
    return response.data
  }
}

// Search API
export const searchAPI = {
  quick: async (query: string) => {
    const response = await api.get(`/search/quick?q=${encodeURIComponent(query)}`)
    return response.data
  },
  advanced: async (params: any) => {
    const response = await api.get('/search/advanced', { params })
    return response.data
  },
  saveFilter: async (name: string, query: string, isShared = false) => {
    const response = await api.post('/search/filters', { name, query, is_shared: isShared })
    return response.data
  },
  getFilters: async () => {
    const response = await api.get('/search/filters')
    return response.data
  }
}

// Dashboard API
export const dashboardAPI = {
  create: async (name: string, description?: string, isShared = false) => {
    const response = await api.post('/dashboards', { name, description, is_shared: isShared })
    return response.data
  },
  getAll: async () => {
    const response = await api.get('/dashboards')
    return response.data
  },
  getById: async (id: number) => {
    const response = await api.get(`/dashboards/${id}`)
    return response.data
  },
  addGadget: async (dashboardId: number, type: string, configuration?: any) => {
    const response = await api.post(`/dashboards/${dashboardId}/gadgets`, { type, configuration })
    return response.data
  }
}

// Reports API
export const reportsAPI = {
  burndown: async (sprintId: number) => {
    const response = await api.get(`/reports/burndown/${sprintId}`)
    return response.data
  },
  velocity: async (projectId: number) => {
    const response = await api.get(`/reports/velocity/${projectId}`)
    return response.data
  },
  timeTracking: async (params?: any) => {
    const response = await api.get('/reports/time-tracking', { params })
    return response.data
  }
}

// Admin API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats')
    return response.data
  },
  createSupport: async (subject: string, description: string, priority = 'Medium') => {
    const response = await api.post('/admin/support', { subject, description, priority })
    return response.data
  },
  setHomepage: async (type: string, id?: number) => {
    const response = await api.post('/admin/homepage', { homepage_type: type, homepage_id: id })
    return response.data
  }
}

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get('/users')
    return response.data
  },
  create: async (userData: { username: string; email: string; password: string; role?: string }) => {
    const response = await api.post('/users', userData)
    return response.data
  },
  update: async (id: number, userData: any) => {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  },
  delete: async (id: number) => {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },
  updateProfile: async (userData: { username?: string; email?: string; full_name?: string }) => {
    const response = await api.put('/auth/profile', userData)
    return response.data
  },
  changePassword: async (passwordData: { current_password: string; new_password: string }) => {
    const response = await api.put('/auth/password', passwordData)
    return response.data
  }
}

// Epics API
export const epicsAPI = {
  create: async (projectId: number, summary: string, description?: string) => {
    const response = await api.post('/epics', { project_id: projectId, summary, description })
    return response.data
  },
  getAll: async (projectId?: number) => {
    const response = await api.get('/epics', { params: { project_id: projectId } })
    return response.data
  },
  getById: async (id: number) => {
    const response = await api.get(`/epics/${id}`)
    return response.data
  },
  addIssue: async (epicId: number, issueId: number) => {
    const response = await api.post('/epics/issues', { epic_id: epicId, issue_id: issueId })
    return response.data
  }
}

// Integrations API
export const integrationsAPI = {
  getAll: async () => {
    const response = await api.get('/integrations')
    return response.data
  },
  create: async (integrationData: { type: string; name: string; config: any }) => {
    const response = await api.post('/integrations', integrationData)
    return response.data
  },
  toggle: async (id: number, enabled: boolean) => {
    const response = await api.put(`/integrations/${id}/toggle`, { enabled })
    return response.data
  },
  test: async (id: number) => {
    const response = await api.post(`/integrations/${id}/test`)
    return response.data
  }
}

// Tokens API
export const tokensAPI = {
  getAll: async () => {
    const response = await api.get('/tokens')
    return response.data
  },
  create: async (tokenData: { name: string; permissions: string[] }) => {
    const response = await api.post('/tokens', tokenData)
    return response.data
  },
  revoke: async (id: number) => {
    const response = await api.delete(`/tokens/${id}`)
    return response.data
  }
}

// Roles API
export const rolesAPI = {
  getAll: async () => {
    const response = await api.get('/roles')
    return response.data
  }
}

export default api
