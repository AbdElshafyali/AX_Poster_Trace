@echo off
chcp 65001 > nul
title AXONID Poster & Trace Studio - Web App
echo ========================================================
echo    AXONID Poster & Trace Studio (تشغيل تطبيق الويب)
echo ========================================================
echo.
echo [*] جاري تشغيل خادم الويب المحلي...
cd /d "%~dp0"
call npx vite --port 8787 --open
pause
