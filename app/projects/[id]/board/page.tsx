"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, MoreHorizontal, Settings, Zap, Calendar, Layers, Tag, Package, Filter, Search, Users, Clock, BarChart3, Eye, EyeOff } from "lucide-react"
import { projectsAPI, issuesAPI, sprintsAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"
import { checkPermission, getUserPermissions } from "@/lib/permissions"

interface Issue {
  id: number
  key: string
  summary: string
  type: string
  status: string
  priority?: string
  assignee?: {
    username: string
  }
  story_points?: number
}

const defaultColumns = [
  { id: "To Do", title: "To Do", wipLimit: null },
  { id: "In Progress", title: "In Progress", wipLimit: 3 },
  { id: "Done", title: "Done", wipLimit: null }
]

export default function ProjectBoard() {
  const params = useParams()
  const router = useRouter()
  const projectId = Number(params.id)
  
  const [project, setProject] = useState<any>(null)
  const [issues, setIssues] = useState<Issue[]>([])
  const [sprints, setSprints] = useState<any[]>([])
  const [activeSprint, setActiveSprint] = useState<any>(null)
  const [columns, setColumns] = useState(defaultColumns)
  const [boardType, setBoardType] = useState<'kanban' | 'scrum'>('kanban')
  const [loading, setLoading] = useState(true)
  const [isSprintDialogOpen, setIsSprintDialogOpen] = useState(false)
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false)
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false)
  const [sprintForm, setSprintForm] = useState({ name: '', start_date: '', end_date: '' })
  const [columnForm, setColumnForm] = useState({ title: '', wipLimit: '' })
  const [versionForm, setVersionForm] = useState({ name: '', description: '', release_date: '' })
  const [swimlaneBy, setSwimlaneBy] = useState<'none' | 'assignee' | 'epic'>('none')
  const [versions, setVersions] = useState<any[]>([])
  const [epics, setEpics] = useState<any[]>([])
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBy, setFilterBy] = useState<'all' | 'assignee' | 'priority' | 'type'>('all')
  const [showCompletedSprints, setShowCompletedSprints] = useState(false)

  useEffect(() => {
    const permissions = getUserPermissions()
    setUserPermissions(permissions)
    fetchProjectData()
    fetchSprints()
    fetchVersions()
    fetchEpics()
  }, [projectId])

  const fetchProjectData = async () => {
    try {
      const [projectResponse, issuesResponse] = await Promise.all([
        projectsAPI.getById(projectId),
        issuesAPI.getAll({ project_id: projectId })
      ])
      setProject(projectResponse.project)
      const issuesData = issuesResponse.issues || []
      setIssues(issuesData)
      
      // Update epics after issues are loaded
      const epicIssues = issuesData.filter((issue: any) => issue.type?.toLowerCase() === 'epic')
      setEpics(epicIssues)
    } catch (error) {
      toast.error("Failed to fetch project data")
    } finally {
      setLoading(false)
    }
  }

  const fetchSprints = async () => {
    try {
      const response = await sprintsAPI.getAll(projectId)
      setSprints(response.sprints || [])
      const active = response.sprints?.find((s: any) => s.status === 'active')
      setActiveSprint(active)
      if (active) setBoardType('scrum')
    } catch (error) {
      console.error('Failed to fetch sprints')
    }
  }

  const handleCreateSprint = async () => {
    try {
      await sprintsAPI.create({
        project_id: projectId,
        name: sprintForm.name,
        start_date: sprintForm.start_date,
        end_date: sprintForm.end_date
      })
      toast.success('Sprint created successfully')
      setIsSprintDialogOpen(false)
      setSprintForm({ name: '', start_date: '', end_date: '' })
      fetchSprints()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create sprint')
    }
  }

  const handleStartSprint = async (sprintId: number) => {
    try {
      await sprintsAPI.update(sprintId, { status: 'active' })
      toast.success('Sprint started successfully')
      fetchSprints()
    } catch (error: any) {
      toast.error('Failed to start sprint')
    }
  }

  const handleCompleteSprint = async (sprintId: number) => {
    try {
      await sprintsAPI.update(sprintId, { status: 'completed' })
      toast.success('Sprint completed successfully')
      fetchSprints()
    } catch (error: any) {
      toast.error('Failed to complete sprint')
    }
  }

  const handleAddColumn = () => {
    if (!columnForm.title) return
    const newColumn = {
      id: columnForm.title,
      title: columnForm.title,
      wipLimit: columnForm.wipLimit ? parseInt(columnForm.wipLimit) : null
    }
    setColumns([...columns, newColumn])
    setIsColumnDialogOpen(false)
    setColumnForm({ title: '', wipLimit: '' })
    toast.success('Column added successfully')
  }

  const fetchVersions = async () => {
    try {
      // Mock versions for now - would be real API call
      setVersions([
        { id: 1, name: 'v1.0.0', description: 'Initial release', release_date: '2024-03-01', status: 'planned' },
        { id: 2, name: 'v1.1.0', description: 'Feature update', release_date: '2024-04-01', status: 'planned' }
      ])
    } catch (error) {
      console.error('Failed to fetch versions')
    }
  }

  const fetchEpics = async () => {
    try {
      const epicIssues = issues.filter(issue => issue.type?.toLowerCase() === 'epic')
      setEpics(epicIssues)
    } catch (error) {
      console.error('Failed to fetch epics')
    }
  }

  const handleCreateVersion = async () => {
    try {
      // Mock version creation - would be real API call
      const newVersion = {
        id: Date.now(),
        name: versionForm.name,
        description: versionForm.description,
        release_date: versionForm.release_date,
        status: 'planned'
      }
      setVersions([...versions, newVersion])
      setIsVersionDialogOpen(false)
      setVersionForm({ name: '', description: '', release_date: '' })
      toast.success('Version created successfully')
    } catch (error: any) {
      toast.error('Failed to create version')
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result
    const issueId = parseInt(draggableId)
    const newStatus = destination.droppableId

    if (source.droppableId === destination.droppableId) {
      // Reordering within same column - could implement priority changes
      return
    }

    try {
      await issuesAPI.update(issueId, { status: newStatus })
      fetchProjectData()
      toast.success('Issue moved successfully')
    } catch (error: any) {
      toast.error('Failed to move issue')
    }
  }

  const handleStatusChange = async (issueId: number, newStatus: string) => {
    try {
      await issuesAPI.update(issueId, { status: newStatus })
      fetchProjectData()
      toast.success('Issue status updated')
    } catch (error: any) {
      toast.error('Failed to update issue status')
    }
  }

  const getSwimlanes = () => {
    if (swimlaneBy === 'assignee') {
      const assignees = [...new Set(issues.map(i => i.assignee?.username).filter(Boolean))]
      return [{ id: 'unassigned', name: 'Unassigned' }, ...assignees.map(a => ({ id: a, name: a }))]
    }
    if (swimlaneBy === 'epic') {
      return [{ id: 'no-epic', name: 'No Epic' }, ...epics.map(e => ({ id: e.id.toString(), name: e.summary }))]
    }
    return [{ id: 'all', name: 'All Issues' }]
  }

  const getIssuesForSwimlane = (swimlaneId: string, status: string) => {
    let filteredIssues = getIssuesByStatus(status)
    
    if (swimlaneBy === 'assignee') {
      if (swimlaneId === 'unassigned') {
        filteredIssues = filteredIssues.filter(i => !i.assignee)
      } else {
        filteredIssues = filteredIssues.filter(i => i.assignee?.username === swimlaneId)
      }
    } else if (swimlaneBy === 'epic') {
      if (swimlaneId === 'no-epic') {
        filteredIssues = filteredIssues.filter(i => !i.epic_id)
      } else {
        filteredIssues = filteredIssues.filter(i => i.epic_id?.toString() === swimlaneId)
      }
    }
    
    return filteredIssues
  }

  const getIssuesByStatus = (status: string) => {
    let filteredIssues = issues.filter(issue => issue.status === status)
    
    // Apply search filter
    if (searchTerm) {
      filteredIssues = filteredIssues.filter(issue => 
        issue.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.key.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply additional filters
    if (filterBy === 'assignee' && searchTerm) {
      filteredIssues = filteredIssues.filter(issue => 
        issue.assignee?.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } else if (filterBy === 'priority' && searchTerm) {
      filteredIssues = filteredIssues.filter(issue => 
        issue.priority?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } else if (filterBy === 'type' && searchTerm) {
      filteredIssues = filteredIssues.filter(issue => 
        issue.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return filteredIssues
  }

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'story': return '📖'
      case 'task': return '✅'
      case 'bug': return '🐛'
      case 'epic': return '🎯'
      default: return '📝'
    }
  }

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Enhanced Board Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push(`/projects/${projectId}`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {project?.name} - {boardType === 'scrum' ? 'Scrum' : 'Kanban'} Board
                </h1>
                {activeSprint && (
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Zap className="h-3 w-3 mr-1" />
                      Active Sprint: {activeSprint.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(activeSprint.end_date).toLocaleDateString()}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => setBoardType(boardType === 'kanban' ? 'scrum' : 'kanban')}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Switch to {boardType === 'kanban' ? 'Scrum' : 'Kanban'}
              </Button>
              
              {checkPermission(userPermissions, 'issue.create') && (
                <>
                  <Button onClick={() => router.push(`/work-items/new?project=${projectId}`)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Work Item
                  </Button>
                  <Button variant="outline" onClick={() => router.push(`/bugs/new?project=${projectId}`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Bug Report
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <Card className="border-0 shadow-sm bg-gradient-to-r from-gray-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white"
                    />
                  </div>
                  
                  <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                    <SelectTrigger className="w-40 bg-white">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fields</SelectItem>
                      <SelectItem value="assignee">By Assignee</SelectItem>
                      <SelectItem value="priority">By Priority</SelectItem>
                      <SelectItem value="type">By Type</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={swimlaneBy} onValueChange={(value: any) => setSwimlaneBy(value)}>
                    <SelectTrigger className="w-40 bg-white">
                      <Layers className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Swimlanes</SelectItem>
                      <SelectItem value="assignee">By Assignee</SelectItem>
                      <SelectItem value="epic">By Epic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  {checkPermission(userPermissions, 'sprint.create') && boardType === 'scrum' && (
                    <Button variant="outline" onClick={() => setIsSprintDialogOpen(true)} className="bg-white">
                      <Calendar className="h-4 w-4 mr-2" />
                      Sprint
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={() => setIsVersionDialogOpen(true)} className="bg-white">
                    <Package className="h-4 w-4 mr-2" />
                    Versions
                  </Button>
                  
                  <Button variant="outline" onClick={() => setIsColumnDialogOpen(true)} className="bg-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCompletedSprints(!showCompletedSprints)}
                    className="bg-white"
                  >
                    {showCompletedSprints ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showCompletedSprints ? 'Hide' : 'Show'} Completed
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sprint Management */}
        {boardType === 'scrum' && (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center text-purple-800">
                <Zap className="h-5 w-5 mr-2" />
                Sprint Management
                <Badge variant="outline" className="ml-2 text-xs">
                  {sprints.filter(s => showCompletedSprints || s.status !== 'completed').length} sprints
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sprints
                  .filter(sprint => showCompletedSprints || sprint.status !== 'completed')
                  .slice(0, showCompletedSprints ? sprints.length : 3)
                  .map((sprint) => (
                  <div key={sprint.id} className="bg-white border-2 border-purple-100 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">{sprint.name}</h3>
                      <Badge 
                        variant={sprint.status === 'active' ? 'default' : sprint.status === 'completed' ? 'secondary' : 'outline'}
                        className={sprint.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {sprint.status}
                      </Badge>
                    </div>
                    
                    {sprint.start_date && sprint.end_date && (
                      <div className="text-xs text-gray-500 mb-3 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      {checkPermission(userPermissions, 'sprint.edit') && sprint.status === 'planned' && (
                        <Button size="sm" onClick={() => handleStartSprint(sprint.id)} className="bg-green-600 hover:bg-green-700">
                          <Zap className="h-3 w-3 mr-1" />
                          Start Sprint
                        </Button>
                      )}
                      {checkPermission(userPermissions, 'sprint.edit') && sprint.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => handleCompleteSprint(sprint.id)}>
                          <Clock className="h-3 w-3 mr-1" />
                          Complete Sprint
                        </Button>
                      )}
                      {!checkPermission(userPermissions, 'sprint.edit') && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          View Only
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Board with Drag & Drop */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="space-y-6">
            {getSwimlanes().map((swimlane) => (
              <div key={swimlane.id} className="space-y-4">
                {swimlaneBy !== 'none' && (
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <Layers className="h-4 w-4" />
                    <span className="font-medium">{swimlane.name}</span>
                  </div>
                )}
                
                <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}>
                  {columns.map((column) => {
                    const columnIssues = getIssuesForSwimlane(swimlane.id, column.id)
                    const isOverWipLimit = column.wipLimit && columnIssues.length > column.wipLimit
                    
                    return (
                      <div key={`${swimlane.id}-${column.id}`} className="space-y-4">
                        {swimlane.id === getSwimlanes()[0].id && (
                          <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            isOverWipLimit 
                              ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 shadow-md' 
                              : 'bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-bold text-lg text-gray-800">
                                  {column.title}
                                </h3>
                                <Badge 
                                  variant="outline" 
                                  className={`text-sm font-semibold ${
                                    isOverWipLimit ? 'bg-red-100 text-red-800 border-red-300' : 'bg-blue-100 text-blue-800 border-blue-300'
                                  }`}
                                >
                                  {getIssuesByStatus(column.id).length}
                                  {column.wipLimit && (
                                    <span className={`ml-1 ${isOverWipLimit ? 'text-red-600' : 'text-gray-600'}`}>
                                      / {column.wipLimit}
                                    </span>
                                  )}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                {isOverWipLimit && (
                                  <Badge variant="destructive" className="text-xs animate-pulse">
                                    ⚠️ WIP Limit Exceeded
                                  </Badge>
                                )}
                                
                                {checkPermission(userPermissions, 'issue.create') && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => router.push(`/work-items/new?project=${projectId}&status=${column.id}`)}
                                    className="text-xs hover:bg-white"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Add
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <Droppable droppableId={column.id} isDropDisabled={!checkPermission(userPermissions, 'issue.edit')}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className={`space-y-3 min-h-[300px] p-3 rounded-xl transition-all duration-200 ${
                                snapshot.isDraggingOver 
                                  ? 'bg-gradient-to-b from-blue-50 to-blue-100 border-2 border-blue-300 shadow-inner' 
                                  : 'bg-gray-50/50'
                              }`}
                            >
                              {columnIssues.map((issue, index) => (
                                <Draggable 
                                  key={issue.id} 
                                  draggableId={issue.id.toString()} 
                                  index={index}
                                  isDragDisabled={!checkPermission(userPermissions, 'issue.edit')}
                                >
                                  {(provided, snapshot) => (
                                    <Card
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 ${
                                        snapshot.isDragging 
                                          ? 'rotate-2 shadow-2xl scale-105 border-l-blue-500' 
                                          : 'hover:scale-102 border-l-gray-300'
                                      } ${!checkPermission(userPermissions, 'issue.edit') ? 'opacity-75' : ''}`}
                                    >
                                      <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                          <div className="flex items-center space-x-2">
                                            <span className="text-lg">{getTypeIcon(issue.type)}</span>
                                            <Badge variant="outline" className="text-xs font-mono bg-gray-100">
                                              {issue.key}
                                            </Badge>
                                          </div>
                                          
                                          {checkPermission(userPermissions, 'issue.edit') && (
                                            <Select onValueChange={(value) => handleStatusChange(issue.id, value)}>
                                              <SelectTrigger className="w-8 h-8 p-0 border-none hover:bg-gray-100 rounded-full">
                                                <MoreHorizontal className="h-4 w-4" />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {versions.map((version) => (
                                                  <SelectItem key={version.id} value={`version-${version.id}`}>
                                                    <Package className="h-3 w-3 mr-2" />
                                                    Release in {version.name}
                                                  </SelectItem>
                                                ))}
                                                {columns.map((col) => (
                                                  <SelectItem key={col.id} value={col.id}>
                                                    <ArrowLeft className="h-3 w-3 mr-2" />
                                                    Move to {col.title}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          )}
                                        </div>
                                        
                                        <CardTitle className="text-sm leading-tight text-gray-800 hover:text-blue-600 transition-colors">
                                          {issue.summary}
                                        </CardTitle>
                                      </CardHeader>
                                      
                                      <CardContent className="pt-0">
                                        <div className="flex items-center justify-between">
                                          <div className="flex flex-wrap gap-1">
                                            <Badge 
                                              variant="secondary" 
                                              className="text-xs bg-blue-100 text-blue-800 border-blue-200"
                                            >
                                              {issue.type}
                                            </Badge>
                                            
                                            {issue.priority && (
                                              <Badge 
                                                variant="outline" 
                                                className={`text-xs ${getPriorityColor(issue.priority)}`}
                                              >
                                                {issue.priority}
                                              </Badge>
                                            )}
                                            
                                            {issue.story_points && (
                                              <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                                                {issue.story_points}sp
                                              </Badge>
                                            )}
                                          </div>
                                          
                                          <div className="flex items-center space-x-1">
                                            {issue.assignee ? (
                                              <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
                                                <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                                  {issue.assignee.username.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                              </Avatar>
                                            ) : (
                                              <div className="h-7 w-7 rounded-full bg-gray-200 flex items-center justify-center">
                                                <Users className="h-3 w-3 text-gray-400" />
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                        
                                        {!checkPermission(userPermissions, 'issue.edit') && (
                                          <div className="mt-2 text-xs text-gray-500 flex items-center">
                                            <Eye className="h-3 w-3 mr-1" />
                                            View Only
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              
                              {columnIssues.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                                  <div className="text-4xl mb-2">📋</div>
                                  <p className="text-sm">No issues in {column.title}</p>
                                  {checkPermission(userPermissions, 'issue.create') && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="mt-2 text-xs"
                                      onClick={() => router.push(`/work-items/new?project=${projectId}&status=${column.id}`)}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add Issue
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>

        {/* Enhanced Create Sprint Dialog */}
        <Dialog open={isSprintDialogOpen} onOpenChange={setIsSprintDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-purple-800">
                <Zap className="h-5 w-5 mr-2" />
                Create New Sprint
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sprint-name" className="text-sm font-semibold">Sprint Name</Label>
                <Input
                  id="sprint-name"
                  value={sprintForm.name}
                  onChange={(e) => setSprintForm({ ...sprintForm, name: e.target.value })}
                  placeholder="e.g., Sprint 1 - Foundation"
                  className="border-2 focus:border-purple-300"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm font-semibold">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={sprintForm.start_date}
                    onChange={(e) => setSprintForm({ ...sprintForm, start_date: e.target.value })}
                    className="border-2 focus:border-purple-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm font-semibold">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={sprintForm.end_date}
                    onChange={(e) => setSprintForm({ ...sprintForm, end_date: e.target.value })}
                    className="border-2 focus:border-purple-300"
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tip:</strong> Sprints typically last 1-4 weeks. Choose dates that align with your team's workflow.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsSprintDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSprint} className="bg-purple-600 hover:bg-purple-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Create Sprint
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Enhanced Add Column Dialog */}
        <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-blue-800">
                <Settings className="h-5 w-5 mr-2" />
                Configure Board Column
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="column-title" className="text-sm font-semibold">Column Title</Label>
                <Input
                  id="column-title"
                  value={columnForm.title}
                  onChange={(e) => setColumnForm({ ...columnForm, title: e.target.value })}
                  placeholder="e.g., Code Review, Testing, Ready for Deploy"
                  className="border-2 focus:border-blue-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="wip-limit" className="text-sm font-semibold">WIP Limit (optional)</Label>
                <Input
                  id="wip-limit"
                  type="number"
                  value={columnForm.wipLimit}
                  onChange={(e) => setColumnForm({ ...columnForm, wipLimit: e.target.value })}
                  placeholder="3"
                  className="border-2 focus:border-blue-300"
                />
                <p className="text-xs text-gray-500">
                  Work In Progress limit helps maintain focus and flow
                </p>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-700">
                  ⚠️ <strong>Note:</strong> New columns will be added to the right of existing columns.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => setIsColumnDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddColumn} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Column
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Version Management Dialog */}
        <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Version Management
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Existing Versions */}
              <div>
                <h3 className="font-semibold mb-3">Existing Versions</h3>
                <div className="space-y-2">
                  {versions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{version.name}</span>
                          <Badge variant={version.status === 'released' ? 'default' : 'secondary'}>
                            {version.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{version.description}</p>
                        <p className="text-xs text-muted-foreground">Release: {new Date(version.release_date).toLocaleDateString()}</p>
                      </div>
                      <div className="flex space-x-2">
                        {version.status === 'planned' && (
                          <Button size="sm" variant="outline">
                            Release
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Tag className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Create New Version */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Create New Version</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="version-name">Version Name</Label>
                    <Input
                      id="version-name"
                      value={versionForm.name}
                      onChange={(e) => setVersionForm({ ...versionForm, name: e.target.value })}
                      placeholder="v1.2.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="version-description">Description</Label>
                    <Textarea
                      id="version-description"
                      value={versionForm.description}
                      onChange={(e) => setVersionForm({ ...versionForm, description: e.target.value })}
                      placeholder="What's new in this version?"
                    />
                  </div>
                  <div>
                    <Label htmlFor="release-date">Planned Release Date</Label>
                    <Input
                      id="release-date"
                      type="date"
                      value={versionForm.release_date}
                      onChange={(e) => setVersionForm({ ...versionForm, release_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsVersionDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={handleCreateVersion}>
                  Create Version
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  )
}