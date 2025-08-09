#!/bin/bash
# pm2-status.sh - Script para verificar el estado del sistema

echo "🚀 ESTADO DEL SISTEMA PEQUEÑOS GENIOS"
echo "====================================="
echo ""

echo "📊 Estado de PM2:"
pm2 status

echo ""
echo "🌐 Estado del servidor:"
HEALTH=$(curl -s http://localhost:3002/health --max-time 5)
if [ $? -eq 0 ]; then
    echo "✅ Servidor funcionando: $HEALTH"
else
    echo "❌ Servidor no responde"
fi

echo ""
echo "📧 Test de email automático:"
RESULT=$(curl -s -X POST http://localhost:3002/api/email/automatic \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secure-api-key-here" \
  -d '{
    "email": "test@ejemplo.com",
    "tipo": "recordatorio_inactividad",
    "nombreNino": "TestNino",
    "nombreTutor": "TestTutor",
    "diasInactivo": 1
  }' \
  --max-time 10 2>/dev/null)

if [[ $RESULT == *"success"* ]]; then
    echo "✅ Sistema de emails funcionando"
else
    echo "⚠️ Sistema de emails: necesita revisión"
fi

echo ""
echo "📝 Últimos logs (3 líneas):"
tail -n 3 logs/combined.log 2>/dev/null || echo "No hay logs disponibles"

echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   pm2 status           - Ver estado de procesos"
echo "   pm2 logs             - Ver logs en tiempo real"
echo "   pm2 restart all      - Reiniciar todos los servicios"
echo "   pm2 stop all         - Detener todos los servicios"
echo "   pm2 start ecosystem.config.json  - Iniciar servicios"
echo ""
echo "🌐 ENDPOINTS DISPONIBLES:"
echo "   http://localhost:3002/health"
echo "   http://localhost:3002/api/email/status"
echo "   http://localhost:3002/api/email/automatic"
echo "   http://localhost:3002/api/email/bulk-automatic"
