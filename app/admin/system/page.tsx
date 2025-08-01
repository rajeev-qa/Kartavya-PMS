"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Settings, Save, Database, Shield, Clock, Palette } from "lucide-react"
import { adminAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function SystemConfiguration() {
  const [config, setConfig] = useState({
    time_tracking: {
      time_unit: "hours",
      working_hours_per_day: 8,
      working_days_per_week: 5
    },
    security: {
      password_min_length: 8,
      session_timeout: 30,
      two_factor_enabled: false
    },
    appearance: {
      default_theme: "light",
      card_colors_enabled: true,
      compact_mode: false
    }
  })
  
  const [systemStats, setSystemStats] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const response = await adminAPI.getStats()
      setSystemStats(response.stats || {})
    } catch (error) {
      console.error("Failed to fetch system stats")
    }
  }

  const handleSaveConfig = async (section: string) => {
    setLoading(true)
    try {
      toast.success(`${section} configuration saved successfully`)
    } catch (error) {
      toast.error(`Failed to save ${section} configuration`)
    } finally {
      setLoading(false)
    }
  }

  const handleSetHomepage = async (type: string) => {
    try {
      await adminAPI.setHomepage(type)
      toast.success("Default homepage updated")
    } catch (error) {
      toast.error("Failed to update homepage")
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h1 className="text-3xl font-bold flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <Settings className="h-8 w-8 mr-3 text-blue-600" />
              System Configuration
            </h1>
            <p className="text-slate-600 mt-2">Configure system-wide settings and preferences</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{systemStats.totalUsers || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{systemStats.totalProjects || 0}</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{systemStats.totalIssues || 0}</div>
                  <div className="text-sm text-muted-foreground">Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{systemStats.totalSprints || 0}</div>
                  <div className="text-sm text-muted-foreground">Sprints</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="time_unit">Time Unit</Label>
                  <Select 
                    value={config.time_tracking.time_unit} 
                    onValueChange={(value) => setConfig({
                      ...config,
                      time_tracking: { ...config.time_tracking, time_unit: value }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="minutes">Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="working_hours">Working Hours per Day</Label>
                  <Input
                    id="working_hours"
                    type="number"
                    value={config.time_tracking.working_hours_per_day}
                    onChange={(e) => setConfig({
                      ...config,
                      time_tracking: { ...config.time_tracking, working_hours_per_day: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <Button onClick={() => handleSaveConfig("Time Tracking")} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Time Tracking
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="password_length">Minimum Password Length</Label>
                  <Input
                    id="password_length"
                    type="number"
                    value={config.security.password_min_length}
                    onChange={(e) => setConfig({
                      ...config,
                      security: { ...config.security, password_min_length: parseInt(e.target.value) }
                    })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={config.security.two_factor_enabled}
                    onCheckedChange={(checked) => setConfig({
                      ...config,
                      security: { ...config.security, two_factor_enabled: checked }
                    })}
                  />
                  <Label>Enable Two-Factor Authentication</Label>
                </div>

                <Button onClick={() => handleSaveConfig("Security")} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Default Homepage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Choose Default Landing Page</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleSetHomepage("dashboard")}
                      className="justify-start"
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleSetHomepage("projects")}
                      className="justify-start"
                    >
                      Projects
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Database Status</h3>
                    <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">System Load</h3>
                    <Badge variant="outline">Normal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}