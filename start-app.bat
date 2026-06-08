@echo off
cd /d "%~dp0"

echo ==========================================
echo Iniciando CineMatch...
echo ==========================================

docker info >nul 2>&1
if %errorlevel% equ 0 (
    echo Docker detectado. Levantando Redis + Backend + Frontend...
    echo.
    echo   Frontend: http://localhost:5173
    echo   Backend:  http://localhost:3001
    echo   Redis:    localhost:6379
    echo.
    if not exist ".env" (
        echo Tip: copia .env.docker.example a .env para usar TMDB.
        echo.
    )
    echo Pulsa Ctrl+C para detener los contenedores.
    echo ==========================================
    docker compose up --build
    goto :end
)

echo Docker no esta disponible. Usando modo desarrollo local...
echo.
echo ADVERTENCIA: el backend necesita Redis en localhost:6379.
echo Puedes levantarlo con: docker run -d -p 6379:6379 --name cinematch-redis redis:7-alpine
echo.

echo Iniciando Backend ^(Puerto 3001^)...
start "CineMatch Backend" /D "%~dp0backend" cmd /k npm run dev

echo Iniciando Frontend ^(Puerto 5173^)...
start "CineMatch Frontend" /D "%~dp0" cmd /k npm run dev

echo ==========================================
echo Aplicacion iniciada!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3001
echo ==========================================

:end
pause
