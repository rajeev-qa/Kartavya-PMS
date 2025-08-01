"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Target, Layers, CheckSquare, User, Calendar } from "lucide-react"
import { issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function WorkItemsPage() {
  const router = useRouter()
  const [workItems, setWorkItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkItems()
  }, [])

  const fetchWorkItems = async () => {
    try {
      const response = await issuesAPI.getAll()
      // Filter for work items (Story, Epic, Task)
      const items = response.issues?.filter((item: any) => 
        ['Story', 'Epic', 'Task'].includes(item.type)
      ) || []
      setWorkItems(items)
    } catch (error) {
      toast.error("Failed to fetch work items")
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Epic': return <Target className="h-4 w-4" />
      case 'Story': return <Layers className="h-4 w-4" />
      case 'Task': return <CheckSquare className="h-4 w-4" />
      default: return <Layers className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Epic': return 'bg-purple-100 text-purple-800'
      case 'Story': return 'bg-blue-100 text-blue-800'
      case 'Task': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Layers className="h-6 w-6 mr-2" />
              Work Items
            </h1>
            <p className="text-muted-foreground">Team task distribution and tracking ({workItems.length} items)</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/work-items/new?type=Epic")}>
              <Target className="h-4 w-4 mr-2" />
              Epic
            </Button>
            <Button variant="outline" onClick={() => router.push("/work-items/new?type=Story")}>
              <Layers className="h-4 w-4 mr-2" />
              Story
            </Button>
            <Button onClick={() => router.push("/work-items/new?type=Task")}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Task
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Work Items ({workItems.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {workItems.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No work items found</p>
                <Button className="mt-4" onClick={() => router.push("/work-items/new")}>
                  Create First Work Item
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Assignee</TableHead>
                    <TableHead>Story Points</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workItems.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/issues/${item.id}`)}
                    >
                      <TableCell className="font-medium">{item.key}</TableCell>
                      <TableCell>{item.summary}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(item.type)}
                          <Badge className={getTypeColor(item.type)}>
                            {item.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.priority === 'High' ? 'destructive' : 'secondary'}>
                          {item.priority || 'Medium'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.assignee ? (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {item.assignee.username}
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.story_points ? (
                          <Badge variant="outline">{item.story_points}sp</Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}