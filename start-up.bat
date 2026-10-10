@echo off
if "%~1"=="minimized" goto :main
start /min "" "%~f0" minimized
exit /b 0

:main
setlocal

REM --- Configuration ---
set "SESSION_NAME=dev"
set "WORK_DIR=%~dp0"

cd /d "%WORK_DIR%"

REM --- Check if session already exists, attach if so ---
tmux has-session -t %SESSION_NAME% 2>nul
if %errorlevel%==0 exit /b 0


REM --- Create new detached session in the project folder ---
tmux new-session -d -s %SESSION_NAME% -c "%WORK_DIR%"

REM --- Send the command sequence into the session ---
tmux send-keys -t %SESSION_NAME% "git pull" Enter
tmux send-keys -t %SESSION_NAME% "pnpm run db:migrate" Enter
tmux send-keys -t %SESSION_NAME% "pnpm run dev --host --open" Enter

REM --- Close cmd window ---
exit