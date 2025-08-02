// Simple in-memory data store for demo purposes
// In production, this would be replaced with a database

export interface Project {
  id: number
  name: string
  key: string
  description: string
  lead_id: number
  lead: { id: number; username: string; email: string }
  created_at: string
  updated_at: string
}

// Projects store
let projects: Project[] = [
  {
    id: 1,
    name: 'Kartavya PMS',
    key: 'KPM',
    description: 'Main project management system',
    lead_id: 1,
    lead: { id: 1, username: 'admin', email: 'admin@kartavya.com' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

let nextProjectId = 2

export const projectStore = {
  getAll: () => projects,
  getById: (id: number) => projects.find(p => p.id === id),
  create: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
    const newProject: Project = {
      ...projectData,
      id: nextProjectId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    projects.push(newProject)
    return newProject
  },
  update: (id: number, updates: Partial<Project>) => {
    const index = projects.findIndex(p => p.id === id)
    if (index === -1) return null
    
    projects[index] = {
      ...projects[index],
      ...updates,
      updated_at: new Date().toISOString()
    }
    return projects[index]
  },
  delete: (id: number) => {
    const index = projects.findIndex(p => p.id === id)
    if (index === -1) return false
    
    projects.splice(index, 1)
    return true
  }
}