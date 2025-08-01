import api from './api'

export interface TestCase {
  id: number
  title: string
  description?: string
  steps: string[]
  expected_result: string
  project_id: number
  issue_id?: number
  priority: string
  status: string
  created_by: number
  created_at: string
  updated_at: string
  project?: { name: string }
  issue?: { title: string }
  creator?: { username: string }
  executions?: TestExecution[]
  bugs?: { id: number; title: string; status: string }[]
}

export interface TestExecution {
  id: number
  test_case_id: number
  executed_by: number
  status: string
  actual_result: string
  notes?: string
  environment: string
  executed_at: string
  executor?: { username: string }
}

export interface CreateTestCaseData {
  title: string
  description?: string
  steps: string[]
  expected_result: string
  project_id: number
  issue_id?: number
  priority?: string
}

export interface ExecuteTestCaseData {
  status: 'Passed' | 'Failed' | 'Blocked'
  actual_result: string
  notes?: string
  environment?: string
}

export const testCaseApi = {
  create: (data: CreateTestCaseData) => 
    api.post('/test-cases', data),

  getAll: (params?: { project_id?: number; issue_id?: number; status?: string }) => 
    api.get('/test-cases', { params }),

  getById: (id: number) => 
    api.get(`/test-cases/${id}`),

  update: (id: number, data: Partial<CreateTestCaseData>) => 
    api.put(`/test-cases/${id}`, data),

  delete: (id: number) => 
    api.delete(`/test-cases/${id}`),

  execute: (id: number, data: ExecuteTestCaseData) => 
    api.post(`/test-cases/${id}/execute`, data),

  getStats: (project_id?: number) => 
    api.get('/test-cases/stats', { params: { project_id } })
}