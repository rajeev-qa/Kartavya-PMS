"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Download } from "lucide-react"
import { projectsAPI, issuesAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function ImportIssues() {
  const [projects, setProjects] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll()
      setProjects(response.projects || [])
    } catch (error) {
      toast.error("Failed to fetch projects")
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "text/csv") {
      setSelectedFile(file)
    } else {
      toast.error("Please select a valid CSV file")
    }
  }

  const handleImport = async () => {
    if (!selectedProject || !selectedFile) {
      toast.error("Please select a project and file")
      return
    }

    setLoading(true)
    try {
      const text = await selectedFile.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      
      let successCount = 0
      let errorCount = 0

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue

        const values = line.split(',').map(v => v.trim())
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })

        try {
          const issueData = {
            project_id: parseInt(selectedProject),
            summary: row.summary || row.Summary || "",
            description: row.description || row.Description || "",
            type: row.type || row.Type || "task",
            priority: row.priority || row.Priority || "medium",
            status: row.status || row.Status || "To Do"
          }

          if (issueData.summary) {
            await issuesAPI.create(issueData)
            successCount++
          } else {
            errorCount++
          }
        } catch (error) {
          errorCount++
        }
      }

      toast.success(`Import completed: ${successCount} successful, ${errorCount} errors`)
      setSelectedFile(null)
    } catch (error) {
      toast.error("Import failed")
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = "summary,description,type,priority,status\n" +
      "Sample Task,This is a sample task description,task,medium,To Do\n" +
      "Sample Bug,This is a sample bug description,bug,high,To Do"
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'issues_template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Import Issues</h1>
              <p className="text-muted-foreground">Import issues from CSV file</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload CSV File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="project">Select Project</Label>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name} ({project.key})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file">CSV File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Upload a CSV file with columns: summary, description, type, priority, status
                </p>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={handleImport} 
                  disabled={loading || !selectedProject || !selectedFile}
                >
                  {loading ? "Importing..." : "Import Issues"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
    </AppLayout>
  )
}
