"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { 
  Home, FolderOpen, Search, BarChart3, Settings, User, LogOut, 
  Menu, X, Shield, Users, Workflow, Upload, Puzzle, 
  ChevronDown, ChevronRight, GitBranch, Zap, Bug, TestTube
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, hasPermission } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'management', 'admin'])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsCollapsed(false)
      } else {
        setIsCollapsed(true)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const allNavigation = [
    {
      section: 'main',
      title: 'Main',
      items: [
        { name: "Dashboard", href: "/dashboard/manage", icon: Home, permission: null },
        { name: "Projects", href: "/projects", icon: FolderOpen, permission: "project.view" },
        { name: "Work Items", href: "/work-items", icon: GitBranch, permission: "issue.view" },
        { name: "Bug Reports", href: "/bugs", icon: Bug, permission: "issue.view" },
        { name: "Test Cases", href: "/test-cases", icon: TestTube, permission: "test.create" },
        { name: "Search", href: "/search/advanced", icon: Search, permission: "search.advanced" },
        { name: "Reports", href: "/reports/comprehensive", icon: BarChart3, permission: "report.view" },
      ]
    },
    {
      section: 'management',
      title: 'Management',
      items: [
        { name: "Bulk Edit", href: "/bulk-edit", icon: Settings, permission: "issue.bulk_edit" },
        { name: "Workflow", href: "/workflow", icon: Workflow, permission: "workflow.create" },
        { name: "Import Issues", href: "/import-issues", icon: Upload, permission: "issue.create" },
        { name: "Integrations", href: "/integrations", icon: Puzzle, permission: "admin.integrations" },
      ]
    },
    {
      section: 'admin',
      title: 'Administration',
      items: [
        { name: "Users", href: "/admin/users", icon: Users, permission: "user.view" },
        { name: "Roles", href: "/admin/roles", icon: Shield, permission: "admin.roles" },
        { name: "Permissions", href: "/admin/permissions", icon: Zap, permission: "admin.permissions" },
        { name: "Permission Test", href: "/admin/permission-test", icon: Shield, permission: "admin.permissions" },
        { name: "Test Cases", href: "/test-cases", icon: TestTube, permission: "test.create" },
        { name: "Settings", href: "/admin/settings", icon: Settings, permission: "admin.settings" },
        { name: "System", href: "/misc", icon: GitBranch, permission: "admin.settings" },
      ]
    }
  ]

  // Keep all navigation items, filtering will be done in render
  const navigation = allNavigation

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 z-50 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 shadow-2xl border-r border-slate-700",
        "lg:translate-x-0",
        isCollapsed ? "-translate-x-full lg:translate-x-0 lg:w-16" : "translate-x-0 w-64"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Kartavya
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-slate-700 p-2"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 max-h-[calc(100vh-8rem)]">
          {navigation.map((section) => {
            // Show section if it has visible items
            const visibleItems = section.items.filter(item => 
              !item.permission || hasPermission(item.permission)
            )
            
            if (visibleItems.length === 0) return null
            
            return (
              <div key={section.section} className="mb-6">
                {!isCollapsed && (
                  <button
                    onClick={() => toggleSection(section.section)}
                    className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                  >
                    <span>{section.title}</span>
                    {expandedSections.includes(section.section) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                )}
                
                {(isCollapsed || expandedSections.includes(section.section)) && (
                  <div className="space-y-1 px-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                    {visibleItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <button
                          key={item.name}
                          onClick={() => router.push(item.href)}
                          className={cn(
                            "flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                            isActive
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                              : "text-slate-300 hover:text-white hover:bg-slate-700"
                          )}
                          title={isCollapsed ? item.name : undefined}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          {!isCollapsed && (
                            <span className="ml-3 truncate group-hover:text-white transition-colors">
                              {item.name}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* User Profile */}
        <div className="border-t border-slate-700 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start text-white hover:bg-slate-700",
                  isCollapsed ? "px-2" : "px-3"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="ml-3 text-left">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" side="right">
              <div className="flex items-center justify-start gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                    {user?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-60 lg:hidden bg-slate-900 text-white p-2 rounded-lg shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>
    </>
  )
}