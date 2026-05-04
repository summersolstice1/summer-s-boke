@echo off
setlocal

cd /d "%~dp0"
set "URL=http://127.0.0.1:2025"

echo ========================================
echo 2025 Blog - one click start
echo Project: %cd%
echo URL: %URL%
echo ========================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -ge 200) { Start-Process '%URL%'; exit 0 } else { exit 1 } } catch { exit 1 }"
if not errorlevel 1 (
	echo Site is already running.
	echo Browser opened: %URL%
	echo.
	pause
	exit /b 0
)

where node >nul 2>nul
if errorlevel 1 (
	echo Node.js was not found. Please install Node.js first.
	echo.
	pause
	exit /b 1
)

where corepack >nul 2>nul
if errorlevel 1 (
	echo Corepack was not found. Please check your Node.js installation.
	echo.
	pause
	exit /b 1
)

if not exist "node_modules" (
	echo Installing dependencies. This may take a few minutes...
	call corepack pnpm install
	if errorlevel 1 (
		echo.
		echo Dependency installation failed.
		pause
		exit /b 1
	)
	echo.
)

echo Starting development server...
echo Browser will open automatically when the site is ready.
echo Press Ctrl+C in this window to stop the server.
echo.

start "" powershell -NoProfile -WindowStyle Hidden -ExecutionPolicy Bypass -Command "for ($i = 0; $i -lt 40; $i++) { try { $r = Invoke-WebRequest -Uri '%URL%' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -ge 200) { Start-Process '%URL%'; break } } catch {} Start-Sleep -Seconds 1 }"

call corepack pnpm dev

echo.
pause
