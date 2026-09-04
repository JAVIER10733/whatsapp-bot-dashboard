# WhatsApp Bot Dashboard - Documentación de Arquitectura

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Flujo de Datos](#flujo-de-datos)
6. [Decisiones Técnicas](#decisiones-técnicas)
7. [Seguridad](#seguridad)
8. [Escalabilidad](#escalabilidad)
9. [Deployment](#deployment)

---

## Descripción General

WhatsApp Bot Dashboard es una plataforma profesional para gestionar múltiples instancias de bots de WhatsApp basados en la librería Baileys. El sistema permite:

- **Gestión de múltiples instancias**: Conectar, desconectar y monitorear varios números de WhatsApp simultáneamente
- **Dashboard en tiempo real**: Interfaz web moderna con actualizaciones en vivo vía WebSocket
- **Envío de mensajes**: API REST para enviar mensajes programáticamente
- **Flujos automatizados**: Constructor visual de automatizaciones
- **CRM integrado**: Gestión de contactos y conversaciones

---

## Arquitectura del Sistema

┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React/Vanilla JS) │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ Dashboard │ │ Chat Live │ │ Flow Builder │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│ API LAYER (Express + Socket.io) │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ Routes │ │ Controllers │ │ Middleware │ │
│ └──────────────┘ ──────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
↕
─────────────────────────────────────────────────────────────┐
│ BOT ENGINE (Baileys) │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ Instance Manager │ │
│ │ ┌─────────┐ ┌─────────┐ ┌───────── │ │
│ │ │Instance1│ │Instance2│ │Instance3│ ... │ │
│ │ └─────────┘ ─────────┘ └─────────┘ │ │
│ └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
↕
┌─────────────────────────────────────────────────────────────┐
│ DATA LAYER │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │
│ │ PostgreSQL │ │ Redis │ │ File System │ │
│ │ (Users, │ │ (Sessions, │ │ (Sessions, │ │
│ │ Flows, │ │ Cache) │ │ Assets) │ │
│ │ Contacts) │ │ │ │ │ │
│ └──────────────┘ └──────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────┘
whatsapp-bot-platform/
├── src/
│ ├── api/ # Capa de API REST y WebSockets
│ │ ├── routes/ # Definición de endpoints
│ │ ├── controllers/ # Lógica de negocio
│ │ ├── middleware/ # Auth, rate limiting, validación
│ │ ├── services/ # Lógica compleja
│ │ └── websocket/ # Manejadores de Socket.io
│ │
│ ├── bot/ # Motor de Baileys
│ │ ├── commands/ # Comandos del bot
│ │ ├── handlers/ # Manejadores de eventos
│ │ ├── sessions/ # Credenciales de Baileys
│ │ └── instanceManager.js # Gestor de instancias
│ │
│ ├── database/ # Capa de persistencia
│ │ ├── models/ # Modelos de datos
│ │ ├── migrations/ # Migraciones de esquema
│ │ └── connection.js # Conexión a BD
│ │
│ ├── shared/ # Código compartido
│ │ ├── constants/ # Constantes globales
│ │ ├── utils/ # Funciones utilitarias
│ │ └── types/ # Tipos/Interfaces
│ │
│ └── config/ # Configuración
│ ├── app.js # Config general
│ ├── database.js # Config de BD
│ └── whatsapp.js # Config de Baileys
│
── docs/ # Documentación
│ ├── api-spec.yaml # OpenAPI/Swagger
│ └── architecture.md # Este archivo
│
├── scripts/ # Scripts de automatización
│ ├── migrate.js # Migraciones de BD
│ └── seed.js # Datos iniciales
│
├── tests/ # Suite de pruebas
│ ├── unit/ # Tests unitarios
│ ├── integration/ # Tests de integración
│ ── e2e/ # Tests end-to-end
│
├── index.html # Dashboard frontend
├── styles.css # Estilos CSS
├── app.js # Lógica frontend
├── package.json # Dependencias
├── .env.example # Variables de entorno
└── docker-compose.yml # Orquestación de contenedores
