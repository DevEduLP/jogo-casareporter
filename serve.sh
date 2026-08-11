#!/bin/sh
# Sobe um servidor local (módulos ES não carregam via file://).
cd "$(dirname "$0")"
if command -v python3 >/dev/null 2>&1; then exec python3 -m http.server 8000
elif command -v python >/dev/null 2>&1; then exec python -m http.server 8000
elif command -v npx >/dev/null 2>&1; then exec npx --yes serve -l 8000 .
else echo "Instale Python ou Node para servir o projeto."; exit 1; fi
