"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { 
  Home, FolderOpen, Search, BarChart3, Settings, User, LogOut, 
  Upload, Puzzle, Users, Shield, Zap, GitBranch, Workflow
} from "lucide-react"
import { useAuth } from "@/hooks/useAuth"

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const hasPermission = (requiredRoles: string[]) => {
    if (!user?.role) return false
    const userRole = user.role.toLowerCase()
    if (userRole === 'admin' || userRole === 'administrator') return true
    return requiredRoles.includes(userRole)
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard/manage", icon: Home, roles: ['admin', 'administrator', 'developer', 'viewer'] },
    { name: "Projects", href: "/projects", icon: FolderOpen, roles: ['admin', 'administrator', 'developer', 'viewer'] },
    { name: "Search", href: "/search/advanced", icon: Search, roles: ['admin', 'administrator', 'developer', 'viewer'] },
    { name: "Reports", href: "/reports/enhanced", icon: BarChart3, roles: ['admin', 'administrator', 'developer', 'viewer'] },
  ]

  const managementItems = [
    { name: "Bulk Edit", href: "/bulk-edit", icon: Settings, roles: ['admin', 'administrator', 'developer'] },
    { name: "Workflow", href: "/workflow", icon: Workflow, roles: ['admin', 'administrator', 'developer'] },
    { name: "Import Issues", href: "/import-issues", icon: Upload, roles: ['admin', 'administrator', 'developer'] },
    { name: "Integrations", href: "/integrations", icon: Puzzle, roles: ['admin', 'administrator'] },
  ]

  const adminItems = [
    { name: "Users", href: "/admin/users", icon: Users, roles: ['admin', 'administrator'] },
    { name: "Roles", href: "/admin/roles", icon: Shield, roles: ['admin', 'administrator'] },
    { name: "Permissions", href: "/admin/permissions", icon: Zap, roles: ['admin', 'administrator'] },
    { name: "Settings", href: "/admin/settings", icon: Settings, roles: ['admin', 'administrator'] },
    { name: "System", href: "/misc", icon: GitBranch, roles: ['admin', 'administrator'] },
  ]

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mr-8"
            >
              Kartavya
            </button>

            <div className="hidden md:flex items-center space-x-1">
              {navigation.filter(item => hasPermission(item.roles)).map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <button
                    key={item.name}
                    onClick={() => router.push(item.href)}
                    className={`${
                      isActive
                        ? "bg-blue-50 text-blue-600 border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    } inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors border`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </button>
                )
              })}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                    <Settings className="h-4 w-4 mr-2" />
                    Tools
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {managementItems.filter(item => hasPermission(item.roles)).map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem key={item.name} onClick={() => router.push(item.href)}>
                        <Icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              {hasPermission(['admin', 'administrator']) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {adminItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <DropdownMenuItem key={item.name} onClick={() => router.push(item.href)}>
                          <Icon className="mr-2 h-4 w-4" />
                          {item.name}
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                      {user?.username?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
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
      </div>
    </nav>
  )
}