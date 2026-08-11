@echo off
REM Sobe um servidor local e abre o jogo. Modulos ES nao carregam via file://.
cd /d "%~dp0"
where python >nul 2>nul && (
  start "" http://localhost:8000
  python -m http.server 8000
  goto :eof
)
where npx >nul 2>nul && (
  start "" http://localhost:8000
  npx --yes serve -l 8000 .
  goto :eof
)
echo Instale Python ou Node.js para servir o projeto.
pause
