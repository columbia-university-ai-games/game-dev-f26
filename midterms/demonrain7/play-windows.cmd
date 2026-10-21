@echo off
cd /d "%~dp0"
python scripts\catacomb_env.py --human %*
if errorlevel 1 pause
