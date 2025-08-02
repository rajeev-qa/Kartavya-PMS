"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Database, Server } from "lucide-react"

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-orange-600" />
          </div>
          <CardTitle>Backend Connection Required</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-center">
            The Kartavya PMS frontend is running, but the backend API is not connected.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <Server className="h-4 w-4 text-green-600" />
              <span>Frontend: ✅ Running</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Database className="h-4 w-4 text-red-600" />
              <span>Backend: ❌ Not Connected</span>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Retry Connection
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.open('https://github.com/rajeev-qa/Kartavya-PMS', '_blank')}
              className="w-full"
            >
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}