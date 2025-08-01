"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { testCaseApi } from '@/lib/testCaseApi'
import { projectsApi, issuesApi } from '@/lib/api'
import toast from 'react-hot-toast'
import AppLayout from '@/components/layout/AppLayout'

export default function NewTestCasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    issue_id: '',
    priority: 'Medium',
    expected_result: ''
  })
  const [steps, setSteps] = useState<string[]>([''])

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    if (formData.project_id) {
      fetchIssues(parseInt(formData.project_id))
    }
  }, [formData.project_id])

  const fetchProjects = async () => {
    try {
      const response = await projectsApi.getAll()
      setProjects(response.projects)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchIssues = async (projectId: number) => {
    try {
      const response = await issuesApi.getAll({ project_id: projectId })
      setIssues(response.issues)
    } catch (error) {
      console.error('Error fetching issues:', error)
    }
  }

  const addStep = () => {
    setSteps([...steps, ''])
  }

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index))
    }
  }

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps]
    newSteps[index] = value
    setSteps(newSteps)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.project_id || !formData.expected_result) {
      toast.error('Please fill in all required fields')
      return
    }

    const validSteps = steps.filter(step => step.trim())
    if (validSteps.length === 0) {
      toast.error('Please add at least one test step')
      return
    }

    setLoading(true)
    try {
      await testCaseApi.create({
        title: formData.title,
        description: formData.description || undefined,
        project_id: parseInt(formData.project_id),
        issue_id: formData.issue_id && formData.issue_id !== 'none' ? parseInt(formData.issue_id) : undefined,
        priority: formData.priority,
        expected_result: formData.expected_result,
        steps: validSteps
      })

      toast.success('Test case created successfully')
      router.push('/test-cases')
    } catch (error) {
      console.error('Error creating test case:', error)
      toast.error('Failed to create test case')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Test Case</h1>
        <p className="text-gray-600">Define test steps and expected results</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter test case title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this test case validates"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="project">Project *</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={(value) => setFormData({ ...formData, project_id: value, issue_id: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="issue">Related Issue (Optional)</Label>
                <Select
                  value={formData.issue_id}
                  onValueChange={(value) => setFormData({ ...formData, issue_id: value })}
                  disabled={!formData.project_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No related issue</SelectItem>
                    {issues.map((issue) => (
                      <SelectItem key={issue.id} value={issue.id.toString()}>
                        {issue.key} - {issue.summary}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Test Steps</CardTitle>
              <Button type="button" onClick={addStep} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium w-8">{index + 1}.</span>
                <Input
                  value={step}
                  onChange={(e) => updateStep(index, e.target.value)}
                  placeholder="Describe the test step"
                  className="flex-1"
                />
                {steps.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expected Result</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.expected_result}
              onChange={(e) => setFormData({ ...formData, expected_result: e.target.value })}
              placeholder="Describe the expected outcome when all steps are executed correctly"
              rows={4}
              required
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Test Case'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
      </div>
    </AppLayout>
  )
}