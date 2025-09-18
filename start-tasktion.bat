@echo off
start cmd /k "cd /d %~dp0backend && node server.js"
start cmd /k "cd /d %~dp0 && npm run dev"