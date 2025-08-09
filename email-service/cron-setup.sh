#!/bin/bash
# cron-setup.sh - Configurar tareas programadas para recordatorios automáticos

echo "🕐 Configurando Cron Jobs para Pequeños Genios..."

# Directorio del proyecto
PROJECT_DIR="/home/shady44/Escritorio/PT/pequenos-genios/email-service"

# Crear script de ejecución
cat > "$PROJECT_DIR/run-automatic-reminders.sh" << 'EOF'
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
EOF

# Hacer ejecutable
chmod +x "$PROJECT_DIR/run-automatic-reminders.sh"

# Configurar crontab
echo "📅 Configurando crontab..."

# Backup del crontab actual
crontab -l > crontab_backup_$(date +%Y%m%d_%H%M%S).txt 2>/dev/null || true

# Agregar nuevas tareas al crontab
(crontab -l 2>/dev/null; echo "# Pequeños Genios - Recordatorios Automáticos") | crontab -
(crontab -l 2>/dev/null; echo "# Ejecutar cada 2 horas entre 8 AM y 8 PM") | crontab -
(crontab -l 2>/dev/null; echo "0 8,10,12,14,16,18,20 * * * $PROJECT_DIR/run-automatic-reminders.sh") | crontab -
(crontab -l 2>/dev/null; echo "# Estadísticas diarias a las 9 PM") | crontab -
(crontab -l 2>/dev/null; echo "0 21 * * * cd $PROJECT_DIR && node processor.js stats >> logs/daily-stats.log") | crontab -

echo "✅ Cron jobs configurados:"
echo "   - Recordatorios automáticos: cada 2 horas (8 AM - 8 PM)"
echo "   - Estadísticas diarias: 9 PM"
echo ""
echo "📄 Logs disponibles en:"
echo "   - $PROJECT_DIR/logs/cron.log"
echo "   - $PROJECT_DIR/logs/daily-stats.log"
echo ""
echo "🔍 Verificar crontab actual:"
echo "   crontab -l"
echo ""
echo "⚠️  IMPORTANTE: El servidor de email debe estar corriendo en puerto 3002"
echo "   Para iniciar: cd $PROJECT_DIR && node server.js"
