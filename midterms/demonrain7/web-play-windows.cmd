@echo off
cd /d "%~dp0"
python scripts\serve_web.py --share
pause
