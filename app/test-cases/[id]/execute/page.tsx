"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Bug } from 'lucide-react'
import { testCaseApi, TestCase } from '@/lib/testCaseApi'
import toast from 'react-hot-toast'
import AppLayout from '@/components/layout/AppLayout'

export default function ExecuteTestCasePage() {
  const router = useRouter()
  const params = useParams()
  const [testCase, setTestCase] = useState<TestCase | null>(null)
  const [loading, setLoading] = useState(true)
  const [executing, setExecuting] = useState(false)
  const [formData, setFormData] = useState({
    status: '',
    actual_result: '',
    notes: '',
    environment: 'Development'
  })

  useEffect(() => {
    if (params.id) {
      fetchTestCase(parseInt(params.id as string))
    }
  }, [params.id])

  const fetchTestCase = async (id: number) => {
    try {
      const response = await testCaseApi.getById(id)
      setTestCase(response.data.testCase)
    } catch (error) {
      console.error('Error fetching test case:', error)
      toast.error('Failed to load test case')
    } finally {
      setLoading(false)
    }
  }

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.status || !formData.actual_result) {
      toast.error('Please fill in all required fields')
      return
    }

    setExecuting(true)
    try {
      const response = await testCaseApi.execute(parseInt(params.id as string), {
        status: formData.status as 'Passed' | 'Failed' | 'Blocked',
        actual_result: formData.actual_result,
        notes: formData.notes || undefined,
        environment: formData.environment
      })

      if (response.data.bug) {
        toast.success(`Test executed. Bug ${response.data.bug.title} created automatically.`)
      } else {
        toast.success('Test case executed successfully')
      }
      
      router.push('/test-cases')
    } catch (error) {
      console.error('Error executing test case:', error)
      toast.error('Failed to execute test case')
    } finally {
      setExecuting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Passed': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'Failed': return <XCircle className="h-5 w-5 text-red-500" />
      case 'Blocked': return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default: return null
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">Loading...</div>
      </AppLayout>
    )
  }

  if (!testCase) {
    return (
      <AppLayout>
        <div>Test case not found</div>
      </AppLayout>
    )
  }

  const steps = JSON.parse(testCase.steps as any) as string[]

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Execute Test Case</h1>
        <p className="text-gray-600">Run the test and record results</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Case Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{testCase.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getPriorityColor(testCase.priority)}>
                      {testCase.priority}
                    </Badge>
                    <span className="text-sm text-gray-600">{testCase.project?.name}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {testCase.description && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{testCase.description}</p>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Test Steps</h4>
                <ol className="space-y-2">
                  {steps.map((step, index) => (
                    <li key={index} className="flex gap-2">
                      <span className="font-medium text-blue-600 min-w-[24px]">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">Expected Result</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800">{testCase.expected_result}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Executions */}
          {testCase.executions && testCase.executions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Executions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {testCase.executions.slice(0, 3).map((execution) => (
                    <div key={execution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <span className="font-medium">{execution.status}</span>
                        <span className="text-sm text-gray-600">by {execution.executor?.username}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(execution.executed_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Execution Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Record Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleExecute} className="space-y-4">
                <div>
                  <Label htmlFor="status">Test Result *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select result" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Passed">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          Passed
                        </div>
                      </SelectItem>
                      <SelectItem value="Failed">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          Failed
                        </div>
                      </SelectItem>
                      <SelectItem value="Blocked">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          Blocked
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="environment">Environment</Label>
                  <Select
                    value={formData.environment}
                    onValueChange={(value) => setFormData({ ...formData, environment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Staging">Staging</SelectItem>
                      <SelectItem value="Production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="actual_result">Actual Result *</Label>
                  <Textarea
                    id="actual_result"
                    value={formData.actual_result}
                    onChange={(e) => setFormData({ ...formData, actual_result: e.target.value })}
                    placeholder="Describe what actually happened during test execution"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes or observations"
                    rows={3}
                  />
                </div>

                {formData.status === 'Failed' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <Bug className="h-4 w-4" />
                      <span className="font-medium">Auto Bug Creation</span>
                    </div>
                    <p className="text-sm text-red-700 mt-1">
                      A bug will be automatically created when this test is marked as failed.
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={executing}>
                    {executing ? 'Executing...' : 'Execute Test'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </AppLayout>
  )
}