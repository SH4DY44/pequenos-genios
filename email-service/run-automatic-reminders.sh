#!/bin/bash
# run-automatic-reminders.sh - Ejecutar recordatorios automáticos

cd "$(dirname "$0")"

# Verificar si el servidor está corriendo
if ! curl -s http://localhost:3002/health > /dev/null; then
    echo "⚠️ Servidor de email no está corriendo. Iniciando..."
    # Iniciar servidor en background
    nohup node server.js > /dev/null 2>&1 &
    sleep 5
fi

# Ejecutar procesamiento de recordatorios
echo "🤖 Ejecutando recordatorios automáticos..."
node processor.js process

# Log del resultado
echo "$(date): Recordatorios procesados" >> logs/cron.log
