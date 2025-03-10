#!/bin/bash

# Script para respaldar y restaurar la base de datos del directorio profesional

# Función para verificar variables de entorno
check_env_vars() {
  required_vars=("PGHOST" "PGUSER" "PGPASSWORD" "PGDATABASE" "PGPORT" "DATABASE_URL")
  missing_vars=0
  
  echo "Verificando variables de entorno..."
  for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
      echo "❌ Falta la variable de entorno: $var"
      missing_vars=1
    else
      echo "✅ Variable $var configurada"
    fi
  done
  
  if [ $missing_vars -eq 1 ]; then
    echo "Por favor, configura todas las variables de entorno necesarias"
    exit 1
  fi
}

# Función para crear respaldo
create_backup() {
  echo "Creando respaldo de la base de datos..."
  pg_dump -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" > backup.sql
  if [ $? -eq 0 ]; then
    echo "✅ Respaldo creado exitosamente: backup.sql"
  else
    echo "❌ Error al crear el respaldo"
    exit 1
  fi
}

# Función para restaurar respaldo
restore_backup() {
  if [ ! -f backup.sql ]; then
    echo "❌ No se encontró el archivo backup.sql"
    exit 1
  fi
  
  echo "Restaurando base de datos..."
  psql -h "$PGHOST" -U "$PGUSER" -d "$PGDATABASE" < backup.sql
  if [ $? -eq 0 ]; then
    echo "✅ Base de datos restaurada exitosamente"
  else
    echo "❌ Error al restaurar la base de datos"
    exit 1
  fi
}

# Menú principal
echo "=== Utilidad de Respaldo y Restauración ==="
echo "1. Crear respaldo"
echo "2. Restaurar respaldo"
echo "3. Verificar configuración"
echo "4. Salir"
read -p "Selecciona una opción (1-4): " option

case $option in
  1)
    check_env_vars
    create_backup
    ;;
  2)
    check_env_vars
    restore_backup
    ;;
  3)
    check_env_vars
    ;;
  4)
    echo "Saliendo..."
    exit 0
    ;;
  *)
    echo "Opción inválida"
    exit 1
    ;;
esac
