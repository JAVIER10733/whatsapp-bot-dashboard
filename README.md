# 🤖 WhatsApp Bot Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Baileys](https://img.shields.io/badge/Baileys-6.x-blue.svg)](https://github.com/WhiskeySockets/Baileys)
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)](https://expressjs.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Panel de control profesional y de alto rendimiento para la gestión de múltiples instancias de bots de WhatsApp, construido con **Baileys**, **Express** y una interfaz **Luxury UI**.

> **Autor:** Javier  
> **Ubicación:** Ventanas, Los Ríos, Ecuador  
> **Experiencia:** +7 años como Full-Stack Developer

---

## ✨ Características Principales

- 📱 **Gestión Multi-Instancia**: Conecta, monitorea y controla múltiples números de WhatsApp simultáneamente.
- ⚡ **Tiempo Real**: Sincronización instantánea de mensajes, estados y notificaciones vía **WebSocket (Socket.io)**.
- 🎨 **Luxury UI**: Interfaz moderna, oscura y elegante con acentos dorados, totalmente responsive.
- 🔐 **Conexión Segura**: Soporte para escaneo de código QR y vinculación por código de emparejamiento (Pairing Code).
- 🛡️ **Anti-Ban & Optimización**: Gestión inteligente de memoria, delays humanizados y reconexión automática.
- 📦 **Arquitectura Escalable**: Separación clara de responsabilidades (API, Bot Engine, Database, Frontend).

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend** | HTML5, CSS3 (Luxury Theme), Vanilla JavaScript, Socket.io-client |
| **Backend** | Node.js, Express.js, Socket.io |
| **Bot Engine** | `@whiskeysockets/baileys`, `pino`, `node-cache` |
| **Base de Datos** | SQLite (Dev) / PostgreSQL (Prod) + Redis (Cache/Sesiones) |
| **DevOps** | Docker, PM2, GitHub Actions (próximamente) |

---

## 📂 Estructura del Proyecto

```text
whatsapp-bot-dashboard/
├── src/
│   ├── api/              # Controladores, rutas y middlewares de la API REST
│   ├── bot/              # Motor de Baileys (Instance Manager, handlers, sesiones)
│   ├── database/         # Modelos y conexiones a base de datos
│   ├── shared/           # Constantes, utilidades y tipos compartidos
│   └── config/           # Configuraciones centralizadas (.env)
├── docs/                 # Documentación OpenAPI (Swagger) y Arquitectura
├── scripts/              # Scripts de migración y seed de base de datos
├── index.html            # Entry point del Dashboard (Frontend)
├── styles.css            # Estilos Luxury UI
├── app.js                # Lógica del cliente (Frontend)
└── package.json          # Dependencias y scripts del proyecto
