@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0apply-blog-pages.ps1"
echo exit=%ERRORLEVEL%
