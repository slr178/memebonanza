@echo off
echo Starting Crypto Casino Servers...
echo.

echo [1/2] Starting Node.js API Server on port 3001...
start "API Server" cmd /k "node server.js"

echo [2/2] Starting Python Static Server on port 8000...
start "Static Server" cmd /k "python -m http.server 8000"

echo.
echo ✅ Both servers are starting!
echo.
echo 🎰 Casino Game: http://localhost:8000/index.html
echo 🔧 Admin Panel: http://localhost:8000/unified-admin.html  
echo 🔗 API Server: http://localhost:3001/health
echo.
echo Press any key to exit...
pause > nul 