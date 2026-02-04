@echo off
echo ==========================================
echo Iniciando CineMatch...
echo ==========================================

echo Iniciando Backend (Puerto 3001)...
start "CineMatch Backend" /D "backend" npm run dev

echo Iniciando Frontend (Puerto 5173)...
start "CineMatch Frontend" npm run dev

echo ==========================================
echo Aplicacion iniciada!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3001
echo ==========================================
pause
