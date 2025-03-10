# Guía de Respaldo y Restauración de Base de Datos

## Estructura de la Base de Datos
El proyecto utiliza PostgreSQL y contiene las siguientes tablas:
- users (usuarios y administradores)
- professionals (profesionales del directorio)
- categories (categorías de profesionales)
- ratings (calificaciones)
- recommendations (recomendaciones)
- system_settings (configuración del sistema)

## Pasos para Restaurar la Base de Datos

### 1. Requisitos Previos
- PostgreSQL instalado en tu servidor
- Acceso a la línea de comandos
- El archivo `backup.sql` (incluido en este proyecto)

### 2. Crear una Nueva Base de Datos
```bash
psql -U tu_usuario
CREATE DATABASE nombre_base_de_datos;
\q
```

### 3. Restaurar el Respaldo
```bash
psql -U tu_usuario -d nombre_base_de_datos < backup.sql
```

### 4. Configurar Variables de Entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/nombre_base_de_datos
PGHOST=tu_host
PGUSER=tu_usuario
PGPASSWORD=tu_contraseña
PGDATABASE=nombre_base_de_datos
PGPORT=5432
```

Reemplaza los valores con los correspondientes a tu servidor:
- `tu_host`: La dirección de tu servidor de base de datos
- `tu_usuario`: El nombre de usuario de PostgreSQL
- `tu_contraseña`: La contraseña de PostgreSQL
- `nombre_base_de_datos`: El nombre que elegiste para la base de datos

### 5. Verificar la Instalación
1. Inicia el proyecto con `npm run dev`
2. Intenta iniciar sesión con un usuario existente
3. Verifica que los datos de profesionales y categorías se muestren correctamente

## Notas Importantes
- Mantén seguras tus credenciales de base de datos
- Realiza respaldos periódicos de tu base de datos
- No compartas el archivo `.env` ni las credenciales en repositorios públicos
