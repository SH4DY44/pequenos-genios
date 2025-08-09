#!/bin/bash
# install-production.sh - Instalar sistema de recordatorios en producción

echo "🚀 INSTALACIÓN DE PEQUEÑOS GENIOS - SISTEMA DE RECORDATORIOS"
echo "============================================================"

PROJECT_DIR="/home/shady44/Escritorio/PT/pequenos-genios/email-service"
cd "$PROJECT_DIR"

echo "📦 1. Verificando dependencias..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado"
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"
echo "✅ npm $(npm --version) encontrado"

echo ""
echo "🔧 2. Instalando dependencias del proyecto..."
npm install

echo ""
echo "📁 3. Creando directorios necesarios..."
mkdir -p logs
mkdir -p uploads

echo ""
echo "⚙️ 4. Configurando variables de entorno..."
if [ ! -f ".env" ]; then
    echo "❌ Archivo .env no encontrado. Creando template..."
    cp .env.example .env 2>/dev/null || echo "⚠️ Configurar manualmente el archivo .env"
fi

echo ""
echo "🧪 5. Probando el servicio..."
echo "Iniciando servidor de prueba..."

# Iniciar servidor temporalmente para probar
timeout 10 node server.js &
SERVER_PID=$!
sleep 3

# Probar endpoint de health
if curl -s http://localhost:3002/health > /dev/null; then
    echo "✅ Servidor funcionando correctamente"
else
    echo "❌ Error en el servidor"
fi

# Detener servidor de prueba
kill $SERVER_PID 2>/dev/null || true
sleep 2

echo ""
echo "🎯 6. OPCIONES DE INSTALACIÓN:"
echo ""
echo "A) 🕐 CRON JOBS (Recomendado para desarrollo)"
echo "   - Ejecuta recordatorios automáticamente cada 2 horas"
echo "   - Requiere que el servidor esté corriendo manualmente"
echo ""
echo "B) 🔄 PM2 (Recomendado para producción)"
echo "   - Gestión automática de procesos"
echo "   - Reinicio automático en caso de errores"
echo "   - Logs centralizados"
echo ""
echo "C) 🖥️ SYSTEMD (Para servidores Linux)"
echo "   - Servicio del sistema"
echo "   - Se inicia automáticamente con el sistema"
echo ""

read -p "Seleccionar opción (A/B/C): " OPTION

case $OPTION in
    [Aa]* )
        echo "📅 Configurando Cron Jobs..."
        chmod +x cron-setup.sh
        ./cron-setup.sh
        echo ""
        echo "✅ Instalación completada con Cron Jobs"
        echo "📋 PASOS SIGUIENTES:"
        echo "   1. Iniciar servidor: node server.js"
        echo "   2. Los recordatorios se ejecutarán automáticamente"
        echo "   3. Ver logs: tail -f logs/cron.log"
        ;;
    [Bb]* )
        echo "🔄 Configurando PM2..."
        if ! command -v pm2 &> /dev/null; then
            echo "📦 Instalando PM2..."
            npm install -g pm2
        fi
        
        pm2 start ecosystem.config.json
        pm2 save
        pm2 startup
        
        echo ""
        echo "✅ Instalación completada con PM2"
        echo "📋 COMANDOS ÚTILES:"
        echo "   pm2 status         - Ver estado de procesos"
        echo "   pm2 logs           - Ver logs en tiempo real"
        echo "   pm2 restart all    - Reiniciar servicios"
        echo "   pm2 stop all       - Detener servicios"
        ;;
    [Cc]* )
        echo "🖥️ Configurando Systemd..."
        sudo cp pequenos-genios-email.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable pequenos-genios-email
        sudo systemctl start pequenos-genios-email
        
        # Configurar cron para el procesador
        chmod +x cron-setup.sh
        ./cron-setup.sh
        
        echo ""
        echo "✅ Instalación completada con Systemd"
        echo "📋 COMANDOS ÚTILES:"
        echo "   sudo systemctl status pequenos-genios-email"
        echo "   sudo systemctl restart pequenos-genios-email"
        echo "   sudo journalctl -u pequenos-genios-email -f"
        ;;
    * )
        echo "❌ Opción no válida"
        exit 1
        ;;
esac

echo ""
echo "🎉 INSTALACIÓN COMPLETADA"
echo "========================"
echo ""
echo "📧 El sistema de recordatorios automáticos está configurado"
echo "📊 Endpoints disponibles:"
echo "   http://localhost:3002/health"
echo "   http://localhost:3002/api/email/status"
echo "   http://localhost:3002/api/email/automatic"
echo ""
echo "📝 Logs disponibles en: $PROJECT_DIR/logs/"
echo ""
echo "⚠️  IMPORTANTE: Configurar correctamente las variables en .env"
echo "   - GMAIL_USER: tu email de Gmail"
echo "   - GMAIL_APP_PASSWORD: contraseña de aplicación"
echo "   - API_KEY: clave segura para la API"
