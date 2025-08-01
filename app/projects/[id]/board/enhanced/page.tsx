"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Settings, Play, Square, MoreHorizontal, Filter } from "lucide-react"
import { projectsApi, issuesApi, sprintsAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import Navbar from "@/components/layout/Navbar"

export default function EnhancedBoard() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  
  const [project, setProject] = useState<any>(null)
  const [issues, setIssues] = useState<any[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [activeSprint, setActiveSprint] = useState<any>(null)
  const [boardType, setBoardType] = useState("kanban")
  const [columns, setColumns] = useState([
    { id: "To Do", title: "To Do", wipLimit: null },
    { id: "In Progress", title: "In Progress", wipLimit: 3 },
    { id: "Done", title: "Done", wipLimit: null }
  ])
  const [swimlanes, setSwimlanes] = useState("none")
  const [loading, setLoading] = useState(true)
  const [draggedIssue, setDraggedIssue] = useState<any>(null)
  const [isSprintPlanOpen, setIsSprintPlanOpen] = useState(false)
  const [isBoardConfigOpen, setIsBoardConfigOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  const [sprintPlanForm, setSprintPlanForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
    goal: "",
    selected_issues: [] as number[]
  })

  useEffect(() => {
    fetchBoardData()
  }, [projectId])

  const fetchBoardData = async () => {
    try {
      const [projectResponse, issuesResponse, sprintsResponse] = await Promise.all([
        projectsApi.getById(projectId),
        issuesApi.getAll({ project_id: projectId }),
        sprintsAPI.getAll({ project_id: projectId })
      ])
      
      setProject(projectResponse.project)
      setIssues(issuesResponse.issues || [])
      setSprints(sprintsResponse.sprints || [])
      setActiveSprint(sprintsResponse.sprints?.find((s: any) => s.status === "active"))
    } catch (error) {
      toast.error("Failed to fetch board data")
    } finally {
      setLoading(false)
    }
  }

  const getIssuesByStatus = (status: string) => {
    let filteredIssues = issues.filter(issue => issue.status === status)
    
    if (boardType === "scrum" && activeSprint) {
      filteredIssues = filteredIssues.filter(issue => issue.sprint_id === activeSprint.id)
    }
    
    if (activeFilters.includes("my-issues")) {
      filteredIssues = filteredIssues.filter(issue => issue.assignee?.id === 1)
    }
    if (activeFilters.includes("unassigned")) {
      filteredIssues = filteredIssues.filter(issue => !issue.assignee)
    }
    if (activeFilters.includes("high-priority")) {
      filteredIssues = filteredIssues.filter(issue => issue.priority === "high" || issue.priority === "critical")
    }
    
    return filteredIssues
  }

  const handleDragStart = (e: React.DragEvent, issue: any) => {
    setDraggedIssue(issue)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    
    if (!draggedIssue) return
    
    const column = columns.find(col => col.id === newStatus)
    if (column?.wipLimit) {
      const currentCount = getIssuesByStatus(newStatus).length
      if (currentCount >= column.wipLimit) {
        toast.error(`WIP limit exceeded for ${column.title} (${column.wipLimit})`)
        return
      }
    }
    
    try {
      await issuesApi.updateStatus(draggedIssue.id, newStatus)
      fetchBoardData()
      toast.success("Issue moved successfully")
    } catch (error) {
      toast.error("Failed to move issue")
    }
    
    setDraggedIssue(null)
  }

  const handlePlanSprint = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await sprintsAPI.create({
        ...sprintPlanForm,
        project_id: projectId
      })
      
      for (const issueId of sprintPlanForm.selected_issues) {
        await sprintsAPI.addIssue(response.sprint.id, issueId)
      }
      
      setSprintPlanForm({
        name: "",
        start_date: "",
        end_date: "",
        goal: "",
        selected_issues: []
      })
      setIsSprintPlanOpen(false)
      fetchBoardData()
      toast.success("Sprint planned successfully")
    } catch (error) {
      toast.error("Failed to plan sprint")
    }
  }

  const toggleQuickFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="p-6">
        <div className="max-w-full mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/projects")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{project?.name} - {boardType === "scrum" ? "Scrum" : "Kanban"} Board</h1>
                {activeSprint && (
                  <p className="text-muted-foreground">Active Sprint: {activeSprint.name}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={boardType} onValueChange={setBoardType}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kanban">Kanban</SelectItem>
                  <SelectItem value="scrum">Scrum</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex space-x-1">
                {["my-issues", "unassigned", "high-priority"].map(filter => (
                  <Button
                    key={filter}
                    size="sm"
                    variant={activeFilters.includes(filter) ? "default" : "outline"}
                    onClick={() => toggleQuickFilter(filter)}
                  >
                    {filter.replace("-", " ")}
                  </Button>
                ))}
              </div>

              {boardType === "scrum" && (
                <Dialog open={isSprintPlanOpen} onOpenChange={setIsSprintPlanOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Plan Sprint
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Plan Sprint</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePlanSprint} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Sprint Name</Label>
                          <Input
                            value={sprintPlanForm.name}
                            onChange={(e) => setSprintPlanForm({ ...sprintPlanForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>Goal</Label>
                          <Input
                            value={sprintPlanForm.goal}
                            onChange={(e) => setSprintPlanForm({ ...sprintPlanForm, goal: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            type="date"
                            value={sprintPlanForm.start_date}
                            onChange={(e) => setSprintPlanForm({ ...sprintPlanForm, start_date: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            type="date"
                            value={sprintPlanForm.end_date}
                            onChange={(e) => setSprintPlanForm({ ...sprintPlanForm, end_date: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Select Issues</Label>
                        <div className="max-h-48 overflow-y-auto border rounded p-2 space-y-1">
                          {issues.filter(issue => !issue.sprint_id).map(issue => (
                            <div key={issue.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={sprintPlanForm.selected_issues.includes(issue.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSprintPlanForm({
                                      ...sprintPlanForm,
                                      selected_issues: [...sprintPlanForm.selected_issues, issue.id]
                                    })
                                  } else {
                                    setSprintPlanForm({
                                      ...sprintPlanForm,
                                      selected_issues: sprintPlanForm.selected_issues.filter(id => id !== issue.id)
                                    })
                                  }
                                }}
                              />
                              <span className="text-sm">{issue.key} - {issue.summary}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsSprintPlanOpen(false)}>Cancel</Button>
                        <Button type="submit">Plan Sprint</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}

              <Dialog open={isBoardConfigOpen} onOpenChange={setIsBoardConfigOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Board Configuration</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Swimlanes</Label>
                      <Select value={swimlanes} onValueChange={setSwimlanes}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="assignee">By Assignee</SelectItem>
                          <SelectItem value="priority">By Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Column WIP Limits</Label>
                      {columns.map((column, index) => (
                        <div key={column.id} className="flex items-center space-x-2 mt-2">
                          <span className="w-24 text-sm">{column.title}:</span>
                          <Input
                            type="number"
                            placeholder="No limit"
                            value={column.wipLimit || ""}
                            onChange={(e) => {
                              const newColumns = [...columns]
                              newColumns[index].wipLimit = e.target.value ? parseInt(e.target.value) : null
                              setColumns(newColumns)
                            }}
                            className="w-20"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button onClick={() => router.push(`/projects/${projectId}/issues/new`)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Issue
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((column) => {
              const columnIssues = getIssuesByStatus(column.id)
              
              return (
                <div key={column.id} className="space-y-4">
                  <div 
                    className="p-4 bg-gray-100 rounded flex items-center justify-between"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                  >
                    <h3 className="font-semibold">
                      {column.title} ({columnIssues.length})
                      {column.wipLimit && ` / ${column.wipLimit}`}
                    </h3>
                    {column.wipLimit && columnIssues.length >= column.wipLimit && (
                      <Badge variant="destructive">WIP Limit</Badge>
                    )}
                  </div>
                  
                  <div className="space-y-3 min-h-[200px]">
                    {columnIssues.map((issue) => (
                      <Card 
                        key={issue.id} 
                        className="cursor-move hover:shadow-md"
                        draggable
                        onDragStart={(e) => handleDragStart(e, issue)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <Badge variant="outline">{issue.key}</Badge>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          <CardTitle className="text-sm">{issue.summary}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-2">
                              <Badge variant="secondary">{issue.type}</Badge>
                              {issue.priority && (
                                <Badge variant="outline">{issue.priority}</Badge>
                              )}
                            </div>
                            {issue.assignee && (
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {issue.assignee.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}