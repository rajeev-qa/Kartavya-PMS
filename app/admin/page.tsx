"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Shield, Settings, Zap, GitBranch, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import AppLayout from "@/components/layout/AppLayout"

export default function AdminDashboard() {
  const router = useRouter()

  const adminCards = [
    {
      title: "User Management",
      description: "Manage system users and their access",
      icon: Users,
      href: "/admin/users",
      color: "from-blue-500 to-blue-600",
      stats: "24 Active Users"
    },
    {
      title: "Role Management", 
      description: "Create and manage user roles with permissions",
      icon: Shield,
      href: "/admin/roles",
      color: "from-purple-500 to-purple-600",
      stats: "5 Roles Configured"
    },
    {
      title: "Permissions",
      description: "Configure system-wide permissions",
      icon: Zap,
      href: "/admin/permissions", 
      color: "from-yellow-500 to-orange-500",
      stats: "23 Permissions"
    },
    {
      title: "System Settings",
      description: "Configure application settings and preferences",
      icon: Settings,
      href: "/admin/settings",
      color: "from-green-500 to-green-600", 
      stats: "All Systems Operational"
    },
    {
      title: "Integrations",
      description: "Manage external service integrations",
      icon: GitBranch,
      href: "/admin/integrations",
      color: "from-indigo-500 to-indigo-600",
      stats: "3 Active Integrations"
    },
    {
      title: "System Analytics",
      description: "View system performance and usage metrics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "from-pink-500 to-pink-600",
      stats: "View Reports"
    }
  ]

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <Settings className="h-8 w-8 mr-3 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-2">Manage system settings, users, and configurations</p>
            </div>
          </div>

          {/* Admin Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminCards.map((card) => {
              const Icon = card.icon
              return (
                <Card 
                  key={card.title}
                  className="border-slate-200 hover:shadow-lg transition-all duration-200 bg-white cursor-pointer group"
                  onClick={() => router.push(card.href)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${card.color}`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className="bg-slate-50 text-slate-600">
                        {card.stats}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {card.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-slate-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">5</div>
                <div className="text-sm text-slate-600">User Roles</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">12</div>
                <div className="text-sm text-slate-600">Active Projects</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">98%</div>
                <div className="text-sm text-slate-600">System Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}