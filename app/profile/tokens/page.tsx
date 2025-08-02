"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from "lucide-react"
import { tokensAPI } from "@/lib/api"
import { toast } from "react-hot-toast"
import AppLayout from "@/components/layout/AppLayout"

export default function OAuthTokensPage() {
  const [tokens, setTokens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [visibleTokens, setVisibleTokens] = useState<Set<number>>(new Set())
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    expires_in: "30"
  })

  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const response = await tokensAPI.getAll()
      setTokens(response.tokens || [])
    } catch (error) {
      toast.error("Failed to fetch tokens")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await tokensAPI.create({
        ...createForm,
        expires_in: parseInt(createForm.expires_in)
      })
      
      setNewToken(response.token)
      setCreateForm({ name: "", description: "", expires_in: "30" })
      fetchTokens()
      toast.success("Token created successfully")
    } catch (error) {
      toast.error("Failed to create token")
    }
  }

  const handleRevokeToken = async (tokenId: number) => {
    if (!confirm("Are you sure you want to revoke this token? This action cannot be undone.")) {
      return
    }

    try {
      await tokensAPI.revoke(tokenId)
      fetchTokens()
      toast.success("Token revoked successfully")
    } catch (error) {
      toast.error("Failed to revoke token")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Token copied to clipboard")
  }

  const toggleTokenVisibility = (tokenId: number) => {
    const newVisible = new Set(visibleTokens)
    if (newVisible.has(tokenId)) {
      newVisible.delete(tokenId)
    } else {
      newVisible.add(tokenId)
    }
    setVisibleTokens(newVisible)
  }

  const maskToken = (token: string) => {
    return token.substring(0, 8) + "..." + token.substring(token.length - 8)
  }

  const getStatusBadge = (token: any) => {
    const now = new Date()
    const expiresAt = new Date(token.expires_at)
    
    if (token.revoked_at) {
      return <Badge variant="destructive">Revoked</Badge>
    } else if (expiresAt < now) {
      return <Badge variant="secondary">Expired</Badge>
    } else {
      return <Badge variant="default">Active</Badge>
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="h-6 w-6" />
              <div>
                <h1 className="text-2xl font-bold">OAuth Tokens</h1>
                <p className="text-muted-foreground">Manage your API access tokens</p>
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Token
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate New Token</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateToken} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Token Name</Label>
                    <Input
                      id="name"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      placeholder="My API Token"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      placeholder="Token for accessing project data"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expires_in">Expires In (days)</Label>
                    <Input
                      id="expires_in"
                      type="number"
                      value={createForm.expires_in}
                      onChange={(e) => setCreateForm({ ...createForm, expires_in: e.target.value })}
                      min="1"
                      max="365"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Generate Token</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {newToken && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Token Generated Successfully</CardTitle>
                <p className="text-sm text-green-700">
                  Copy this token now. You won't be able to see it again!
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input
                    value={newToken}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(newToken)}
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => setNewToken(null)}
                >
                  Dismiss
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Your Tokens ({tokens.length})</CardTitle>
              <p className="text-sm text-muted-foreground">
                These tokens allow external applications to access your account via the API
              </p>
            </CardHeader>
            <CardContent>
              {tokens.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No tokens yet</h3>
                  <p className="text-muted-foreground mb-4">Generate your first API token to get started</p>
                  <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate First Token
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{token.name}</div>
                            {token.description && (
                              <div className="text-sm text-muted-foreground">{token.description}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm font-mono">
                              {visibleTokens.has(token.id) ? token.token : maskToken(token.token)}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleTokenVisibility(token.id)}
                            >
                              {visibleTokens.has(token.id) ? 
                                <EyeOff className="h-4 w-4" /> : 
                                <Eye className="h-4 w-4" />
                              }
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(token.token)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(token)}</TableCell>
                        <TableCell>{new Date(token.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {token.expires_at ? new Date(token.expires_at).toLocaleDateString() : "Never"}
                        </TableCell>
                        <TableCell>
                          {!token.revoked_at && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRevokeToken(token.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Authentication</h4>
                  <code className="block p-3 bg-gray-100 rounded text-sm">
                    curl -H "Authorization: Bearer YOUR_TOKEN" https://api.kartavya.com/projects
                  </code>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Example Request</h4>
                  <code className="block p-3 bg-gray-100 rounded text-sm">
                    fetch('https://api.kartavya.com/issues', {"{"}
                    <br />
                    &nbsp;&nbsp;headers: {"{"}
                    <br />
                    &nbsp;&nbsp;&nbsp;&nbsp;'Authorization': 'Bearer YOUR_TOKEN'
                    <br />
                    &nbsp;&nbsp;{"}"}
                    <br />
                    {"}"})
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  )
}
