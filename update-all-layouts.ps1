# PowerShell script to update all pages to use AppLayout
$files = @(
    "app\bulk-edit\page.tsx",
    "app\import-issues\page.tsx", 
    "app\integrations\page.tsx",
    "app\misc\page.tsx",
    "app\navigation-test\page.tsx",
    "app\profile\page.tsx",
    "app\profile\tokens\page.tsx",
    "app\projects\[id]\backlog\page.tsx",
    "app\projects\[id]\board\enhanced\page.tsx",
    "app\projects\[id]\board\page.tsx",
    "app\projects\[id]\epics\page.tsx",
    "app\projects\[id]\epics\[epicId]\page.tsx",
    "app\projects\[id]\issues\new\page.tsx",
    "app\projects\[id]\issues\[issueId]\enhanced\page.tsx",
    "app\projects\[id]\issues\[issueId]\page.tsx",
    "app\projects\[id]\settings\page.tsx",
    "app\projects\[id]\sprints\page.tsx",
    "app\projects\[id]\status\page.tsx",
    "app\projects\[id]\team\page.tsx",
    "app\reports\page.tsx",
    "app\search\page.tsx",
    "app\workflow\page.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Updating $file..."
        
        # Replace import statement
        (Get-Content $file) -replace 'import Navbar from "@/components/layout/Navbar"', 'import AppLayout from "@/components/layout/AppLayout"' | Set-Content $file
        
        # Replace layout structure - pattern 1
        (Get-Content $file) -replace '<div className="min-h-screen bg-background">\s*<Navbar />\s*<div className="p-6">', '<AppLayout>' | Set-Content $file
        
        # Replace layout structure - pattern 2  
        (Get-Content $file) -replace '<div className="min-h-screen bg-background">\s*<Navbar />', '<AppLayout>' | Set-Content $file
        
        # Replace closing tags
        (Get-Content $file) -replace '</div>\s*</div>\s*$', '</AppLayout>' | Set-Content $file
        
        Write-Host "Updated $file"
    } else {
        Write-Host "File not found: $file"
    }
}

Write-Host "All files updated successfully!"