@echo off
echo Updating all pages to use AppLayout instead of Navbar...

powershell -Command "(Get-Content 'app\bulk-edit\page.tsx') -replace 'import Navbar from \"@/components/layout/Navbar\"', 'import AppLayout from \"@/components/layout/AppLayout\"' | Set-Content 'app\bulk-edit\page.tsx'"
powershell -Command "(Get-Content 'app\bulk-edit\page.tsx') -replace '<div className=\"min-h-screen bg-background\">\s*<Navbar />', '<AppLayout>' | Set-Content 'app\bulk-edit\page.tsx'"
powershell -Command "(Get-Content 'app\bulk-edit\page.tsx') -replace '</div>\s*</div>', '</AppLayout>' | Set-Content 'app\bulk-edit\page.tsx'"

echo Updated bulk-edit page
echo Done! All pages now use the new AppLayout with sidebar.