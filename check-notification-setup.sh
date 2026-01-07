#!/bin/bash

# Notification System Setup Verification Script

echo "================================"
echo "Notification System Setup Check"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    return 0
  else
    echo -e "${RED}✗${NC} $1 (MISSING)"
    return 1
  fi
}

check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1/"
    return 0
  else
    echo -e "${RED}✗${NC} $1/ (MISSING)"
    return 1
  fi
}

echo "📋 Checking Backend Files..."
echo "---"
check_file "backend/src/models/Notification.js"
check_file "backend/src/services/notificationService.js"
check_file "backend/src/controllers/notificationController.js"
check_file "backend/src/routes/notifications.js"
echo ""

echo "📋 Checking Frontend Files..."
echo "---"
check_file "frontend/src/lib/notificationApi.js"
check_file "frontend/src/hooks/useNotifications.js"
check_file "frontend/src/components/CheckboxInTable.jsx"
echo ""

echo "📋 Checking Configuration..."
echo "---"
check_file "backend/src/socket.js"
check_file "backend/src/server.js"
check_file "frontend/src/pages/CodeIDE.jsx"
echo ""

echo "📋 Checking Documentation..."
echo "---"
check_file "NOTIFICATION_SYSTEM.md"
check_file "NOTIFICATION_INTEGRATION_GUIDE.md"
echo ""

echo "================================"
echo "✅ Setup Verification Complete!"
echo "================================"
echo ""
echo "📚 Next Steps:"
echo "1. Start Backend:  cd backend && npm run dev"
echo "2. Start Frontend: cd frontend && npm run dev"
echo "3. Open http://localhost:5173 in browser"
echo "4. Open multiple tabs and test notifications"
echo ""
echo "📖 Documentation:"
echo "   - NOTIFICATION_SYSTEM.md (detailed documentation)"
echo "   - NOTIFICATION_INTEGRATION_GUIDE.md (quick start guide)"
echo ""
