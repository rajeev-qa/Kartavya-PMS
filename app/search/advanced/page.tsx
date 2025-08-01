"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Save, Share, Trash2 } from "lucide-react"
import { searchAPI, projectsAPI, usersAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"
import { useRouter } from "next/navigation"

export default function AdvancedSearch() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchMode, setSearchMode] = useState("quick")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [savedFilters, setSavedFilters] = useState<any[]>([])
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)
  const [filterName, setFilterName] = useState("")
  const [projects, setProjects] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  
  const [advancedFilters, setAdvancedFilters] = useState({
    assignee: "any",
    status: "any",
    type: "any",
    priority: "any",
    project: "any",
    dateFrom: "",
    dateTo: "",
    hasAttachments: false,
    issueKey: ""
  })

  useEffect(() => {
    fetchInitialData()
    loadSavedFilters()
  }, [])

  const fetchInitialData = async () => {
    try {
      const [projectsResponse, usersResponse] = await Promise.all([
        projectsAPI.getAll(),
        usersAPI.getAll()
      ])
      setProjects(projectsResponse.projects || [])
      setUsers(usersResponse.users || [])
    } catch (error) {
      console.error("Failed to fetch initial data")
    }
  }

  const loadSavedFilters = () => {
    const saved = localStorage.getItem('savedFilters')
    if (saved) {
      setSavedFilters(JSON.parse(saved))
    }
  }

  const handleSearch = async () => {
    setLoading(true)
    try {
      let searchParams: any = {}
      
      if (searchMode === "quick") {
        searchParams.query = searchQuery
        searchParams.fuzzy = true
      } else if (searchMode === "advanced") {
        searchParams = { ...advancedFilters }
        if (searchQuery) searchParams.query = searchQuery
      } else {
        searchParams.jql = searchQuery
      }
      
      // Mock search results for demo
      const mockResults = [
        {
          id: 1,
          key: "PROJ-123",
          summary: "Sample issue matching search",
          type: "issue",
          status: "In Progress",
          priority: "high",
          project_id: 1,
          assignee: { username: "john" }
        },
        {
          id: 2,
          key: "PROJ-124", 
          summary: "Another matching issue",
          type: "issue",
          status: "To Do",
          priority: "medium",
          project_id: 1
        }
      ]
      
      setResults(mockResults)
      toast.success(`Found ${mockResults.length} results`)
    } catch (error) {
      toast.error("Search failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error("Please enter a filter name")
      return
    }
    
    const newFilter = {
      id: Date.now(),
      name: filterName,
      query: searchQuery,
      filters: advancedFilters,
      mode: searchMode,
      createdAt: new Date().toISOString()
    }
    
    const updatedFilters = [...savedFilters, newFilter]
    setSavedFilters(updatedFilters)
    localStorage.setItem('savedFilters', JSON.stringify(updatedFilters))
    
    setFilterName("")
    setIsFilterDialogOpen(false)
    toast.success("Filter saved successfully")
  }

  const handleLoadFilter = (filter: any) => {
    setSearchQuery(filter.query)
    setAdvancedFilters(filter.filters)
    setSearchMode(filter.mode)
    handleSearch()
  }

  const handleDeleteFilter = (filterId: number) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId)
    setSavedFilters(updatedFilters)
    localStorage.setItem('savedFilters', JSON.stringify(updatedFilters))
    toast.success("Filter deleted")
  }

  const shareSearchResults = () => {
    const shareUrl = `${window.location.origin}/search/advanced?q=${encodeURIComponent(searchQuery)}&mode=${searchMode}`
    navigator.clipboard.writeText(shareUrl)
    toast.success("Search URL copied to clipboard")
  }

  const buildJQLQuery = () => {
    const conditions = []
    if (advancedFilters.assignee) conditions.push(`assignee = "${advancedFilters.assignee}"`)
    if (advancedFilters.status) conditions.push(`status = "${advancedFilters.status}"`)
    if (advancedFilters.type) conditions.push(`type = "${advancedFilters.type}"`)
    if (advancedFilters.priority) conditions.push(`priority = "${advancedFilters.priority}"`)
    if (advancedFilters.project) conditions.push(`project = "${advancedFilters.project}"`)
    if (advancedFilters.dateFrom) conditions.push(`created >= "${advancedFilters.dateFrom}"`)
    if (advancedFilters.dateTo) conditions.push(`created <= "${advancedFilters.dateTo}"`)
    if (advancedFilters.hasAttachments) conditions.push(`attachments is not EMPTY`)
    if (advancedFilters.issueKey) conditions.push(`key = "${advancedFilters.issueKey}"`)
    
    return conditions.join(" AND ")
  }

  return (
    <AppLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Advanced Search</h1>
              <p className="text-muted-foreground">Comprehensive search with filters and JQL support</p>
            </div>
            <Button variant="outline" onClick={shareSearchResults}>
              <Share className="h-4 w-4 mr-2" />
              Share Results
            </Button>
          </div>

          <Tabs value={searchMode} onValueChange={setSearchMode} className="space-y-6">
            <TabsList>
              <TabsTrigger value="quick">Quick Search</TabsTrigger>
              <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
              <TabsTrigger value="jql">JQL Query</TabsTrigger>
            </TabsList>

            <TabsContent value="quick">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Search</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Search issues, projects, or users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                      <Search className="h-4 w-4 mr-2" />
                      {loading ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Filters</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Additional search terms..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                      <Search className="h-4 w-4 mr-2" />
                      {loading ? "Searching..." : "Search"}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Issue Key</Label>
                      <Input
                        placeholder="PROJ-123"
                        value={advancedFilters.issueKey}
                        onChange={(e) => setAdvancedFilters({...advancedFilters, issueKey: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label>Assignee</Label>
                      <Select value={advancedFilters.assignee} onValueChange={(value) => setAdvancedFilters({...advancedFilters, assignee: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.username}>{user.username}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Status</Label>
                      <Select value={advancedFilters.status} onValueChange={(value) => setAdvancedFilters({...advancedFilters, status: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="To Do">To Do</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Type</Label>
                      <Select value={advancedFilters.type} onValueChange={(value) => setAdvancedFilters({...advancedFilters, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="story">Story</SelectItem>
                          <SelectItem value="task">Task</SelectItem>
                          <SelectItem value="bug">Bug</SelectItem>
                          <SelectItem value="epic">Epic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Priority</Label>
                      <Select value={advancedFilters.priority} onValueChange={(value) => setAdvancedFilters({...advancedFilters, priority: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Project</Label>
                      <Select value={advancedFilters.project} onValueChange={(value) => setAdvancedFilters({...advancedFilters, project: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Any" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any</SelectItem>
                          {projects.map(project => (
                            <SelectItem key={project.id} value={project.key}>{project.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Created From</Label>
                      <Input
                        type="date"
                        value={advancedFilters.dateFrom}
                        onChange={(e) => setAdvancedFilters({...advancedFilters, dateFrom: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Created To</Label>
                      <Input
                        type="date"
                        value={advancedFilters.dateTo}
                        onChange={(e) => setAdvancedFilters({...advancedFilters, dateTo: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={advancedFilters.hasAttachments}
                      onChange={(e) => setAdvancedFilters({...advancedFilters, hasAttachments: e.target.checked})}
                    />
                    <Label>Has Attachments</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="jql">
              <Card>
                <CardHeader>
                  <CardTitle>JQL Query</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter JQL query..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                      <Search className="h-4 w-4 mr-2" />
                      {loading ? "Searching..." : "Search"}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSearchQuery(buildJQLQuery())}
                    >
                      Build from Filters
                    </Button>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">JQL Examples:</p>
                    <div className="text-xs text-blue-600 space-y-1">
                      <div>• assignee = "john" AND status = "In Progress"</div>
                      <div>• project = "PROJ" AND priority = "high"</div>
                      <div>• created >= "2024-01-01" AND type = "bug"</div>
                      <div>• summary ~ "login*" OR description ~ "auth*"</div>
                      <div>• key = "PROJ-123"</div>
                      <div>• attachments is not EMPTY</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between items-center">
            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Save Filter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Search Filter</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Filter Name</Label>
                    <Input
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      placeholder="My Custom Filter"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsFilterDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveFilter}>Save Filter</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {savedFilters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Saved Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {savedFilters.map((filter) => (
                    <div key={filter.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{filter.name}</h4>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" onClick={() => handleLoadFilter(filter)}>
                            <Search className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteFilter(filter.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{filter.query}</p>
                      <Badge variant="outline" className="text-xs mt-1">{filter.mode}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results ({results.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.map((result) => (
                    <div 
                      key={result.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/projects/${result.project_id}/issues/${result.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{result.key}</Badge>
                            <Badge variant="secondary">{result.type}</Badge>
                            {result.status && <Badge variant="outline">{result.status}</Badge>}
                            {result.priority && <Badge variant="outline">{result.priority}</Badge>}
                          </div>
                          <h3 className="font-medium">{result.summary}</h3>
                          {result.assignee && (
                            <p className="text-xs text-muted-foreground">
                              Assigned to: {result.assignee.username}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!loading && results.length === 0 && searchQuery && (
            <Card>
              <CardContent className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
              </CardContent>
            </Card>
          )}
        </div>
    </AppLayout>
  )
}