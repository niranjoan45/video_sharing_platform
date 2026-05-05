@echo off
echo Starting Video Sharing Platform...

start "Backend Server" cmd /k "cd /d \"c:/Users/Ajith Krishna Swamy/OneDrive/Desktop/videosharing/videosharing/backend\" && npm start"

timeout /t 3 /nobreak > nul

start "Frontend Server" cmd /k "cd /d \"c:/Users/Ajith Krishna Swamy/OneDrive/Desktop/videosharing/videosharing/frontend\" && npm start"

echo Servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000

pause
