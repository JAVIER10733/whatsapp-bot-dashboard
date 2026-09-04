# WhatsApp Bot Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Baileys](https://img.shields.io/badge/Baileys-6.x-blue.svg)](https://github.com/WhiskeySockets/Baileys)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

Panel de control para gestionar múltiples instancias de bots de WhatsApp. Construido con Baileys, Express y una interfaz oscura de estilo Luxury UI.

**Autor:** Javier
**Ubicación:** Ventanas, Los Ríos, Ecuador
**Experiencia:** 7 años como Full-Stack Developer

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Scripts disponibles](#scripts-disponibles)
- [API](#api)
- [Docker](#docker)
- [Pruebas](#pruebas)
- [Roadmap](#roadmap)
- [Contribución](#contribución)
- [Licencia](#licencia)
- [Contacto](#contacto)

---

## Descripción

Este proyecto conecta y administra varios números de WhatsApp desde un solo panel. Cada instancia corre de forma independiente y se sincroniza en tiempo real con el frontend mediante WebSockets.

El sistema está pensado para negocios que atienden clientes por WhatsApp y necesitan centralizar mensajes, automatizar respuestas y monitorear el estado de cada línea desde un mismo lugar.

## Características

**Gestión multi instancia**
Conecta y controla varios números de WhatsApp al mismo tiempo, cada uno con su propia sesión y configuración.

**Sincronización en tiempo real**
Los mensajes, estados de conexión y notificaciones llegan al instante al dashboard gracias a Socket.io.

**Interfaz Luxury UI**
Diseño oscuro con acentos dorados. Se adapta a cualquier tamaño de pantalla.

**Conexión flexible**
Soporta vinculación por código QR y por código de emparejamiento (pairing code).

**Protección de cuentas**
Aplica delays humanizados entre mensajes, gestiona la memoria de forma eficiente y reconecta automáticamente cuando una sesión se cae.

**Arquitectura por capas**
Separa con claridad la API, el motor del bot, la base de datos y el frontend. Esto facilita el mantenimiento y el crecimiento del proyecto.

## Stack tecnológico

| Capa | Tecnologías |
|---|---|
| Frontend | HTML5, CSS3, JavaScript, Socket.io client |
| Backend | Node.js, Express.js, Socket.io |
| Motor del bot | @whiskeysockets/baileys, pino, node cache |
| Base de datos | SQLite en desarrollo, PostgreSQL en producción, Redis para cache y sesiones |
| DevOps | Docker, PM2, GitHub Actions |

## Estructura del proyecto

```
whatsapp-bot-dashboard/
│
├── index.html              Entry point del dashboard
├── styles.css               Estilos del frontend
├── app.js                   Lógica del cliente
│
├── src/
│   ├── api/
│   │   ├── routes/           Endpoints de la API
│   │   ├── controllers/      Lógica de negocio de las rutas
│   │   ├── middleware/       Auth, validación, rate limiting
│   │   ├── services/         Procesos y transacciones complejas
│   │   └── websocket/        Manejadores de Socket.io
│   │
│   ├── bot/
│   │   ├── commands/          Comandos del bot
│   │   ├── handlers/          Eventos entrantes de Baileys
│   │   ├── sessions/          Credenciales de autenticación
│   │   └── instanceManager.js Gestor de instancias activas
│   │
│   ├── database/
│   │   ├── models/            Esquemas de datos
│   │   ├── migrations/        Historial de cambios de esquema
│   │   ├── seeds/             Datos iniciales
│   │   └── connection.js      Conexión a la base de datos
│   │
│   ├── shared/
│   │   ├── constants/         Valores globales y códigos de error
│   │   ├── utils/              Funciones reutilizables
│   │   └── types/              Interfaces y tipos
│   │
│   └── config/
│       ├── app.js
│       ├── database.js
│       ├── redis.js
│       └── whatsapp.js
│
├── scripts/
│   ├── migrate.js
│   ├── seed.js
│   └── deploy.sh
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── api-spec.yaml
│   └── architecture.md
│
├── logs/
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── package.json
```

## Requisitos previos

Antes de instalar el proyecto necesitas tener listo lo siguiente:

- Node.js versión 18 o superior
- npm o yarn
- Redis, para el manejo de cache y sesiones
- PostgreSQL, si vas a correr el proyecto en producción
- Una cuenta de WhatsApp para vincular

## Instalación

Clona el repositorio en tu máquina.

```bash
git clone https://github.com/tu-usuario/whatsapp-bot-dashboard.git
cd whatsapp-bot-dashboard
```

Instala las dependencias.

```bash
npm install
```

Copia el archivo de variables de entorno y complétalo con tus datos.

```bash
cp .env.example .env
```

## Configuración

Abre el archivo `.env` y define tus variables. Estas son las principales:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://usuario:password@localhost:5432/whatsapp_bot
REDIS_URL=redis://localhost:6379

SESSION_SECRET=tu_clave_secreta
JWT_SECRET=tu_clave_jwt

MAX_INSTANCES=5
```

Ajusta también `src/config/whatsapp.js` si necesitas cambiar el comportamiento del bot, como el prefijo de comandos o los delays entre mensajes.

## Uso

Inicia el servidor en modo desarrollo.

```bash
npm run dev
```

Inicia el servidor en modo producción.

```bash
npm start
```

Abre tu navegador en `http://localhost:3000` para acceder al dashboard. Desde ahí puedes crear una nueva instancia, escanear el código QR y comenzar a recibir mensajes.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Levanta el servidor con recarga automática |
| `npm start` | Levanta el servidor en modo producción |
| `npm run migrate` | Ejecuta las migraciones de la base de datos |
| `npm run seed` | Puebla la base de datos con datos iniciales |
| `npm test` | Corre la suite de pruebas completa |
| `npm run lint` | Revisa el estilo del código |

## API

La documentación completa de los endpoints está en `docs/api-spec.yaml`, en formato OpenAPI. Puedes cargarla en Swagger Editor para explorarla de forma visual.

Endpoints principales:

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/instances` | Crea una nueva instancia de bot |
| GET | `/api/instances` | Lista todas las instancias activas |
| DELETE | `/api/instances/:id` | Elimina una instancia |
| GET | `/api/instances/:id/qr` | Obtiene el código QR de una instancia |
| POST | `/api/messages/send` | Envía un mensaje desde una instancia |

## Docker

Si prefieres correr el proyecto con Docker, usa el archivo `docker-compose.yml` incluido. Este levanta la aplicación junto con PostgreSQL y Redis.

```bash
docker-compose up -d
```

Para detener los contenedores:

```bash
docker-compose down
```

## Pruebas

El proyecto separa las pruebas en tres niveles:

- **Unitarias**, en `tests/unit`, revisan funciones individuales
- **Integración**, en `tests/integration`, revisan la interacción entre módulos y la base de datos
- **End to end**, en `tests/e2e`, simulan el flujo completo de un usuario

Ejecuta toda la suite con:

```bash
npm test
```

## Roadmap

- [ ] Integración con GitHub Actions para CI/CD
- [ ] Panel de estadísticas de mensajes enviados y recibidos
- [ ] Soporte para plantillas de mensajes
- [ ] Sistema de roles y permisos por usuario
- [ ] Exportación de conversaciones a PDF

## Contribución

Las contribuciones son bienvenidas. Sigue estos pasos:

1. Haz un fork del repositorio
2. Crea una rama para tu función: `git checkout -b feature/nombre-de-tu-funcion`
3. Confirma tus cambios: `git commit -m "Agrega nueva función"`
4. Sube tu rama: `git push origin feature/nombre-de-tu-funcion`
5. Abre un Pull Request

Antes de enviar tu PR, corre `npm run lint` y `npm test` para confirmar que todo funciona bien.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

## Contacto

**Javier**
Full-Stack Developer, Ventanas, Los Ríos, Ecuador

Para reportar errores o proponer mejoras, abre un issue en este repositorio.
