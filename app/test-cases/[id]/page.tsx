"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Play, Edit, Trash2, Bug, CheckCircle, XCircle, Clock } from 'lucide-react'
import { testCaseApi, TestCase } from '@/lib/testCaseApi'
import toast from 'react-hot-toast'
import Link from 'next/link'
import AppLayout from '@/components/layout/AppLayout'

export default function TestCaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [testCase, setTestCase] = useState<TestCase | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleDelete = async () => {
    if (!testCase || !confirm('Are you sure you want to delete this test case?')) return

    try {
      await testCaseApi.delete(testCase.id)
      toast.success('Test case deleted successfully')
      router.push('/test-cases')
    } catch (error) {
      console.error('Error deleting test case:', error)
      toast.error('Failed to delete test case')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Passed': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'Failed': return <XCircle className="h-5 w-5 text-red-500" />
      case 'Active': return <Clock className="h-5 w-5 text-blue-500" />
      default: return <Clock className="h-5 w-5 text-gray-500" />
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
        <div className="p-6">Test case not found</div>
      </AppLayout>
    )
  }

  const steps = JSON.parse(testCase.steps as any) as string[]

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/test-cases')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Test Cases
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/test-cases/${testCase.id}/execute`}>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Execute Test
              </Button>
            </Link>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(testCase.status)}
                  <CardTitle className="text-2xl">{testCase.title}</CardTitle>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <Badge className={getPriorityColor(testCase.priority)}>
                    {testCase.priority}
                  </Badge>
                  <span>{testCase.project?.name}</span>
                  {testCase.issue && <span>• Related to: {testCase.issue.summary}</span>}
                  <span>• Created by {testCase.creator?.username}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {testCase.description && (
              <div className="mb-6">
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-gray-600">{testCase.description}</p>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-medium mb-3">Test Steps</h3>
              <ol className="space-y-3">
                {steps.map((step, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="font-medium text-blue-600 min-w-[32px] h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1 pt-1">
                      <p>{step}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Expected Result</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">{testCase.expected_result}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Execution History */}
        {testCase.executions && testCase.executions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testCase.executions.map((execution) => (
                  <div key={execution.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(execution.status)}
                        <span className="font-medium">{execution.status}</span>
                        <span className="text-sm text-gray-600">
                          by {execution.executor?.username}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(execution.executed_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm">
                      <p><strong>Environment:</strong> {execution.environment}</p>
                      <p><strong>Actual Result:</strong> {execution.actual_result}</p>
                      {execution.notes && (
                        <p><strong>Notes:</strong> {execution.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Related Bugs */}
        {testCase.bugs && testCase.bugs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-red-500" />
                Related Bugs ({testCase.bugs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {testCase.bugs.map((bug) => (
                  <div key={bug.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{bug.summary}</span>
                    </div>
                    <Badge variant="outline">{bug.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}