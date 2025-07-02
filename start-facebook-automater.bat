@echo off
REM Navigate to the project directory
cd /d "C:\Users\zeke\Projects\Facebook Daily Post Automater"

REM Open the app in the default browser
start "" "http://localhost:3000"

REM Start the Node.js server
node server.js

pause 