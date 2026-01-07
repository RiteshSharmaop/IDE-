# Notification System Setup Verification Script (Windows)

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Notification System Setup Check" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

function Check-File {
    param([string]$Path)
    if (Test-Path -Path $Path -Type Leaf) {
        Write-Host "✓ $Path" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $Path (MISSING)" -ForegroundColor Red
        return $false
    }
}

function Check-Directory {
    param([string]$Path)
    if (Test-Path -Path $Path -Type Container) {
        Write-Host "✓ $Path\" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ $Path\ (MISSING)" -ForegroundColor Red
        return $false
    }
}

Write-Host "📋 Checking Backend Files..." -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
Check-File "backend\src\models\Notification.js"
Check-File "backend\src\services\notificationService.js"
Check-File "backend\src\controllers\notificationController.js"
Check-File "backend\src\routes\notifications.js"
Write-Host ""

Write-Host "📋 Checking Frontend Files..." -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
Check-File "frontend\src\lib\notificationApi.js"
Check-File "frontend\src\hooks\useNotifications.js"
Check-File "frontend\src\components\CheckboxInTable.jsx"
Write-Host ""

Write-Host "📋 Checking Configuration..." -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
Check-File "backend\src\socket.js"
Check-File "backend\src\server.js"
Check-File "frontend\src\pages\CodeIDE.jsx"
Write-Host ""

Write-Host "📋 Checking Documentation..." -ForegroundColor Yellow
Write-Host "---" -ForegroundColor Gray
Check-File "NOTIFICATION_SYSTEM.md"
Check-File "NOTIFICATION_INTEGRATION_GUIDE.md"
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Setup Verification Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📚 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Start Backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "2. Start Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "3. Open http://localhost:5173 in browser" -ForegroundColor White
Write-Host "4. Open multiple tabs and test notifications" -ForegroundColor White
Write-Host ""

Write-Host "📖 Documentation:" -ForegroundColor Yellow
Write-Host "   - NOTIFICATION_SYSTEM.md (detailed documentation)" -ForegroundColor White
Write-Host "   - NOTIFICATION_INTEGRATION_GUIDE.md (quick start guide)" -ForegroundColor White
Write-Host ""
