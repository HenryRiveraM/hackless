# Backend - Hackless Security Platform

Backend Express.js para la plataforma de seguridad Hackless, que proporciona APIs para gestión de empresas, empleados, reportes ejecutivos y configuración.

## 📋 Requisitos Previos

- **Node.js** v14 o superior
- **npm** o **yarn**
- **MySQL** 5.7 o superior
- **Git** (opcional)

## 🚀 Instalación

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd hackless/backend
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno

Copiar el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```

Editar `.env` con tus valores locales:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_secure_password
DB_NAME=hackless
JWT_SECRET=your_very_secure_secret_key_with_min_32_chars
JWT_EXPIRES_IN=1d
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Crear Base de Datos
```sql
CREATE DATABASE hackless;
USE hackless;
```

### 5. Ejecutar Migraciones SQL

Ejecutar los archivos SQL de migración en este orden:
1. Crear tabla `usuarios` (si no existe)
2. `EMPLEADOS_MIGRATION.sql`
3. `REPORTES_MIGRATION.sql`
4. `CONFIGURACION_MIGRATION.sql`

## ▶️ Ejecución

### Modo Desarrollo
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Modo Desarrollo con Nodemon (si está instalado)
```bash
npm install --save-dev nodemon
npx nodemon ./bin/www
```

## 📁 Estructura del Proyecto

```
backend/
├── bin/
│   └── www              # Punto de entrada del servidor
├── config/
│   └── database.js      # Configuración de conexión MySQL
├── controllers/         # Controladores (lógica HTTP)
│   ├── authController.js
│   ├── empleadosController.js
│   ├── reportesController.js
│   └── configuracionController.js
├── middlewares/
│   └── authMiddleware.js # Validación JWT
├── repositories/        # Acceso a base de datos
│   ├── userRepository.js
│   ├── companyRepository.js
│   ├── empleadosRepository.js
│   ├── reportesRepository.js
│   └── configuracionRepository.js
├── routes/             # Definición de rutas
│   ├── index.js
│   ├── auth.js
│   ├── empleados.js
│   ├── reportes.js
│   └── configuracion.js
├── services/           # Lógica de negocio
│   ├── authService.js
│   ├── empleadosService.js
│   ├── reportesService.js
│   └── configuracionService.js
├── app.js             # Configuración de Express
├── .env.example       # Ejemplo de variables de entorno
├── package.json
└── README.md          # Este archivo
```

## 🔒 Autenticación y Seguridad

### JWT (JSON Web Tokens)
- Todos los endpoints (excepto auth) requieren autenticación JWT
- El token se envía en el header: `Authorization: Bearer <token>`
- El token expira después del tiempo definido en `JWT_EXPIRES_IN`

### Rate Limiting
- Endpoints de autenticación limitados a 5 intentos por 15 minutos
- Todos los endpoints limitados a 100 requests por 15 minutos

### Validaciones
- Contraseñas hasheadas con bcrypt (10 salt rounds)
- Validación de emails
- Validación de rangos (puntajes 0-100)
- Validación de enumeraciones (estados, idiomas, etc.)

### Protección de Secrets
- Archivo `.env` nunca se commitea (está en `.gitignore`)
- Usar `.env.example` como referencia
- Cambiar `JWT_SECRET` y `DB_PASSWORD` en producción

## 📡 Endpoints Principales

### Autenticación
```
POST   /api/auth/register           - Registrar usuario
POST   /api/auth/register-company   - Registrar empresa
POST   /api/auth/login              - Iniciar sesión
```

### Empleados (Requiere JWT)
```
GET    /api/empleados               - Listar empleados
POST   /api/empleados               - Crear empleado
GET    /api/empleados/:id           - Obtener empleado
PUT    /api/empleados/:id           - Actualizar empleado
DELETE /api/empleados/:id           - Eliminar empleado
GET    /api/empleados/resumen       - Resumen de empleados
```

### Reportes (Requiere JWT)
```
GET    /api/reportes                - Listar reportes
POST   /api/reportes                - Crear reporte
GET    /api/reportes/:id            - Obtener reporte
PUT    /api/reportes/:id            - Actualizar reporte
DELETE /api/reportes/:id            - Eliminar reporte
```

### Configuración (Requiere JWT)
```
GET    /api/configuracion/perfil              - Obtener perfil
PUT    /api/configuracion/perfil              - Actualizar perfil
GET    /api/configuracion/seguridad           - Obtener seguridad
PUT    /api/configuracion/seguridad           - Actualizar seguridad
GET    /api/configuracion/sesiones            - Listar sesiones
DELETE /api/configuracion/sesiones/:id        - Cerrar sesión
DELETE /api/configuracion/sesiones            - Cerrar otras sesiones
GET    /api/configuracion/suscripcion         - Obtener suscripción
PUT    /api/configuracion/suscripcion         - Actualizar suscripción
```

## 🔄 Flujo de Respuestas

Todas las respuestas siguen el formato:
```json
{
  "success": true,
  "message": "Descripción de la acción",
  "data": { /* datos opcionales */ }
}
```

### Ejemplo de Error
```json
{
  "success": false,
  "message": "Descripción del error"
}
```

## 🧪 Testing

### Con Postman/Insomnia
1. Registrar empresa: `POST /api/auth/register-company`
2. Login: `POST /api/auth/login`
3. Copiar token del response
4. Agregar header: `Authorization: Bearer <token>`
5. Testear endpoints protegidos

### Ejemplo cURL para Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password123"
  }'
```

### Ejemplo cURL para Acceder Endpoint Protegido
```bash
curl -X GET http://localhost:3000/api/configuracion/perfil \
  -H "Authorization: Bearer <tu_token_aqui>"
```

## 🛠️ Desarrollo

### Scripts Disponibles
```bash
npm start              # Ejecutar servidor
npm install            # Instalar dependencias
```

### Archivos de Configuración
- `.env` - Variables de entorno (no versionado)
- `.env.example` - Plantilla de variables
- `.gitignore` - Archivos ignorados por git

## 🐛 Troubleshooting

### Error: "ECONNREFUSED"
- Verificar que MySQL esté corriendo
- Verificar credenciales en `.env`
- Verificar puerto de base de datos

### Error: "JWT_SECRET no configurado"
- Verificar que `.env` existe
- Verificar que `JWT_SECRET` está definido

### Error: "La tabla no existe"
- Ejecutar archivos SQL de migración
- Verificar que la base de datos se creó

### Error: "Demasiados intentos"
- Rate limiting activo - esperar 15 minutos
- O cambiar IP/client

## 📚 Dependencias Principales

- **express** - Framework web
- **mysql2** - Driver MySQL con promises
- **jsonwebtoken** - Manejo de JWT
- **bcrypt** - Encriptación de contraseñas
- **cors** - Control de orígenes cruzados
- **express-rate-limit** - Rate limiting
- **dotenv** - Variables de entorno
- **morgan** - Logger HTTP

## 📝 Notas de Desarrollo

- Todas las queries usan parameterized statements (prevenir SQL injection)
- Soft-delete implementado (campo `estado = 0`)
- Multi-tenancy: usuarios solo ven datos de su empresa
- Validaciones en 3 niveles: Controller → Service → Repository

## 🔐 Checklist de Seguridad

- ✅ JWT validation en todos los endpoints protegidos
- ✅ Contraseñas hasheadas con bcrypt
- ✅ Rate limiting en endpoints críticos
- ✅ Validación de inputs
- ✅ CORS configurado
- ✅ Secrets no hardcodeados
- ✅ SQL parameterized statements
- ✅ .env en .gitignore

## 📞 Support

Para soporte o reportar issues, contactar al equipo de desarrollo.

## 📄 Licencia

Proyecto de Hackless Security Platform
