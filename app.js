/* ============================================
   WHATSAPP BOT DASHBOARD - APP.JS
   Luxury UI Theme | Senior Refactor
   ============================================ */

// ============================================
// 1. UTILIDADES Y SEGURIDAD
// ============================================
const Utils = {
    // Previene ataques XSS al renderizar datos dinámicos
    sanitizeHTML: (str) => {
        if (typeof str !== 'string') return str;
        return str.replace(/[&<>"']/g, (match) => {
            const escapeMap = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return escapeMap[match];
        });
    },

    // Formato de fecha localizado (Ecuador/Latam)
    formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('es-EC', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    },

    generateId: () => Date.now().toString(36) + Math.random().toString(36).substr(2),

    debounce: (func, wait) => {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    },

    // Simulación de llamada a API (Ready for Backend)
    delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// ============================================
// 2. ESTADO GLOBAL (Centralizado)
// ============================================
const AppState = {
    currentPage: 'dashboard',
    sidebarOpen: window.innerWidth > 768,
    theme: localStorage.getItem('theme') || 'dark',
    user: { name: 'Administrador', email: 'admin@botplatform.com', role: 'Admin' },
    data: {
        instances: [],
        contacts: [],
        messages: [],
        flows: [],
        notifications: []
    },
    ui: {
        selectedChat: null,
        qrStep: 1,
        qrTimer: null
    }
};

// ============================================
// 3. DATOS SIMULADOS (MOCK DATA)
// ============================================
const MockData = {
    instances: [
        { id: 'inst_1', name: 'Bot Principal', phone: '+593 99 145 9589', connected: true, battery: 85, messagesToday: 156, lastSeen: 'Ahora', createdAt: '2024-01-15' },
        { id: 'inst_2', name: 'Bot Soporte', phone: '+593 98 765 4321', connected: true, battery: 92, messagesToday: 89, lastSeen: 'Ahora', createdAt: '2024-02-20' },
        { id: 'inst_3', name: 'Bot Ventas', phone: '+593 95 555 1234', connected: false, battery: 0, messagesToday: 0, lastSeen: 'Hace 2 horas', createdAt: '2024-03-10' }
    ],
    contacts: [
        { id: 'c_1', name: 'Juan Pérez', phone: '+593 99 111 2222', tags: ['Cliente', 'VIP'], lastMessage: 'Hola, ¿cómo estás?', lastMessageTime: '10:30 AM', unread: 2 },
        { id: 'c_2', name: 'María García', phone: '+593 98 333 4444', tags: ['Prospecto'], lastMessage: 'Gracias por la información', lastMessageTime: '9:15 AM', unread: 0 },
        { id: 'c_3', name: 'Carlos López', phone: '+593 95 555 6666', tags: ['Cliente'], lastMessage: 'Perfecto, quedamos así', lastMessageTime: 'Ayer', unread: 0 }
    ],
    messages: [
        { id: 'm_1', contactId: 'c_1', text: 'Hola, ¿cómo estás?', time: '10:30 AM', sent: false },
        { id: 'm_2', contactId: 'c_1', text: '¡Hola Juan! Todo bien, ¿y tú?', time: '10:31 AM', sent: true },
        { id: 'm_3', contactId: 'c_1', text: '¿Me puedes enviar el catálogo?', time: '10:32 AM', sent: false }
    ],
    flows: [
        { id: 'f_1', name: 'Bienvenida', status: 'active', triggers: 156, createdAt: '2024-01-15' },
        { id: 'f_2', name: 'Soporte Técnico', status: 'active', triggers: 89, createdAt: '2024-02-20' },
        { id: 'f_3', name: 'Ventas', status: 'draft', triggers: 0, createdAt: '2024-03-10' }
    ],
    notifications: [
        { id: 'n_1', type: 'success', title: 'Instancia conectada', message: 'Bot Principal se conectó exitosamente', time: 'Hace 5 min', read: false },
        { id: 'n_2', type: 'info', title: 'Nuevo mensaje', message: 'Juan Pérez envió un mensaje', time: 'Hace 10 min', read: false }
    ]
};

// ============================================
// 4. MÓDULO DE INTERFAZ DE USUARIO (UI)
// ============================================
const UI = {
    init: () => {
        UI.applyTheme();
        UI.toggleSidebar(AppState.sidebarOpen);
    },

    applyTheme: () => {
        document.documentElement.setAttribute('data-theme', AppState.theme);
        const icon = document.querySelector('#themeToggle i');
        if (icon) icon.className = AppState.theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    },

    toggleTheme: () => {
        AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', AppState.theme);
        UI.applyTheme();
        UI.showToast('info', 'Tema Actualizado', `Tema ${AppState.theme === 'dark' ? 'oscuro' : 'claro'} activado`);
    },

    toggleSidebar: (forceState = null) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        if (!sidebar) return;

        AppState.sidebarOpen = forceState !== null ? forceState : !AppState.sidebarOpen;
        
        sidebar.classList.toggle('show', AppState.sidebarOpen);
        sidebar.setAttribute('aria-expanded', AppState.sidebarOpen);
        if (menuToggle) menuToggle.setAttribute('aria-expanded', AppState.sidebarOpen);
    },

    showToast: (type, title, message) => {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <i class="fas ${icons[type]} toast-icon" aria-hidden="true"></i>
            <div class="toast-content">
                <div class="toast-title">${Utils.sanitizeHTML(title)}</div>
                <div class="toast-message">${Utils.sanitizeHTML(message)}</div>
            </div>
        `;

        container.appendChild(toast);
        // Trigger reflow for animation
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    animateCounter: (elementId, targetValue) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const duration = 800;
        const steps = 20;
        const increment = targetValue / steps;
        let current = 0;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            current = Math.min(Math.round(increment * step), targetValue);
            element.textContent = current;
            if (step >= steps) {
                clearInterval(timer);
                element.textContent = targetValue;
            }
        }, duration / steps);
    }
};

// ============================================
// 5. MÓDULO DE ENRUTAMIENTO (Router)
// ============================================
const Router = {
    navigate: (pageName) => {
        AppState.currentPage = pageName;

        // 1. Actualizar menú lateral (Clases y A11y)
        document.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.dataset.page === pageName;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-current', isActive ? 'page' : 'false');
        });

        // 2. Mostrar/Ocultar páginas usando el atributo nativo 'hidden' (Mejor A11y y rendimiento)
        document.querySelectorAll('.page').forEach(page => {
            page.hidden = page.id !== `page-${pageName}`;
        });

        // 3. Actualizar Breadcrumb
        const currentPageEl = document.getElementById('currentPage');
        if (currentPageEl) {
            const pageNames = {
                'dashboard': 'Dashboard', 'instances': 'Instancias', 'chat': 'Chat en Vivo',
                'flows': 'Flujos', 'contacts': 'Contactos', 'broadcasts': 'Difusiones',
                'analytics': 'Analíticas', 'settings': 'Configuración'
            };
            currentPageEl.textContent = pageNames[pageName] || 'Dashboard';
        }

        // 4. Renderizar contenido específico
        Components.renderPage(pageName);

        // 5. Cerrar sidebar en móvil
        if (window.innerWidth <= 768) {
            UI.toggleSidebar(false);
        }
    }
};

// ============================================
// 6. MÓDULO DE COMPONENTES (Renderizado)
// ============================================
const Components = {
    renderPage: (pageName) => {
        const actions = {
            dashboard: () => { Components.updateStats(); Components.renderRecentActivity(); Components.renderInstancesOverview(); },
            instances: () => Components.renderInstances(),
            chat: () => Components.renderChatList(),
            flows: () => Components.renderFlows(),
            contacts: () => Components.renderContacts(),
            broadcasts: () => Components.renderBroadcasts(),
            analytics: () => console.log('Renderizando analíticas (Integrar Chart.js aquí)')
        };
        if (actions[pageName]) actions[pageName]();
    },

    updateStats: () => {
        const activeInstances = AppState.data.instances.filter(i => i.connected).length;
        const totalMessages = AppState.data.instances.reduce((sum, i) => sum + i.messagesToday, 0);
        
        UI.animateCounter('statInstances', activeInstances);
        UI.animateCounter('statMessages', totalMessages);
        UI.animateCounter('statContacts', AppState.data.contacts.length);
        UI.animateCounter('statFlows', AppState.data.flows.filter(f => f.status === 'active').length);

        const instancesCount = document.getElementById('instancesCount');
        if (instancesCount) instancesCount.textContent = AppState.data.instances.length;
    },

    renderRecentActivity: () => {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;
        
        const activities = [
            { icon: 'fa-check-circle', class: 'text-success', text: 'Instancia conectada exitosamente', time: 'Hace 5 minutos' },
            { icon: 'fa-comment', class: 'text-info', text: 'Nuevo mensaje de Juan Pérez', time: 'Hace 10 minutos' },
            { icon: 'fa-battery-quarter', class: 'text-warning', text: 'Batería baja en Bot Soporte', time: 'Hace 3 horas' }
        ];
        
        activityList.innerHTML = activities.map(act => `
            <li class="activity-item">
                <i class="fas ${act.icon} ${act.class}" aria-hidden="true"></i>
                <div class="activity-content">
                    <p>${Utils.sanitizeHTML(act.text)}</p>
                    <span class="time">${act.time}</span>
                </div>
            </li>
        `).join('');
    },

    renderInstancesOverview: () => {
        const container = document.getElementById('instancesOverview');
        if (!container) return;
        
        container.innerHTML = AppState.data.instances.slice(0, 3).map(inst => `
            <article class="instance-card">
                <div class="instance-header">
                    <h3>${Utils.sanitizeHTML(inst.name)}</h3>
                    <span class="instance-status ${inst.connected ? 'status-connected' : 'status-disconnected'}">
                        ${inst.connected ? 'Conectado' : 'Desconectado'}
                    </span>
                </div>
                <div class="instance-info">
                    <p><i class="fas fa-phone" aria-hidden="true"></i> ${Utils.sanitizeHTML(inst.phone)}</p>
                    ${inst.connected ? `<p><i class="fas fa-battery-three-quarters" aria-hidden="true"></i> ${inst.battery}%</p>` : ''}
                    <p><i class="fas fa-clock" aria-hidden="true"></i> ${Utils.sanitizeHTML(inst.lastSeen)}</p>
                </div>
            </article>
        `).join('');
    },

    renderInstances: (filter = 'all', searchTerm = '') => {
        const grid = document.getElementById('instancesGrid');
        if (!grid) return;
        
        let filtered = AppState.data.instances;
        if (filter !== 'all') filtered = filtered.filter(i => filter === 'connected' ? i.connected : !i.connected);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(i => i.name.toLowerCase().includes(term) || i.phone.includes(term));
        }
        
        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state"><i class="fas fa-robot"></i><p>No se encontraron instancias</p></div>`;
            return;
        }
        
        grid.innerHTML = filtered.map(inst => `
            <article class="instance-card" data-id="${inst.id}">
                <div class="instance-header">
                    <h3>${Utils.sanitizeHTML(inst.name)}</h3>
                    <span class="instance-status ${inst.connected ? 'status-connected' : 'status-disconnected'}">
                        ${inst.connected ? 'Conectado' : 'Desconectado'}
                    </span>
                </div>
                <div class="instance-info">
                    <p><i class="fas fa-phone" aria-hidden="true"></i> ${Utils.sanitizeHTML(inst.phone)}</p>
                    ${inst.connected ? `<p><i class="fas fa-battery-three-quarters" aria-hidden="true"></i> ${inst.battery}%</p>` : ''}
                    <p><i class="fas fa-paper-plane" aria-hidden="true"></i> ${inst.messagesToday} mensajes hoy</p>
                </div>
                <div class="instance-actions">
                    ${inst.connected ? `
                        <button class="btn btn-sm btn-outline action-btn" data-action="restart"><i class="fas fa-sync"></i> Reiniciar</button>
                        <button class="btn btn-sm btn-outline action-btn text-danger" data-action="disconnect"><i class="fas fa-power-off"></i> Desconectar</button>
                    ` : `
                        <button class="btn btn-sm btn-primary action-btn" data-action="connect"><i class="fas fa-plug"></i> Conectar</button>
                    `}
                    <button class="btn btn-sm btn-outline action-btn text-danger" data-action="delete"><i class="fas fa-trash"></i></button>
                </div>
            </article>
        `).join('');
    },

    renderChatList: (filter = 'all', searchTerm = '') => {
        const chatList = document.getElementById('chatList');
        if (!chatList) return;
        
        let filtered = AppState.data.contacts;
        if (filter === 'unread') filtered = filtered.filter(c => c.unread > 0);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(c => c.name.toLowerCase().includes(term) || c.phone.includes(term));
        }
        
        chatList.innerHTML = filtered.length === 0 
            ? `<div class="empty-state"><i class="fas fa-comments"></i><p>No se encontraron chats</p></div>`
            : filtered.map(contact => `
            <li class="chat-item ${AppState.ui.selectedChat === contact.id ? 'active' : ''}" 
                role="option" 
                aria-selected="${AppState.ui.selectedChat === contact.id}" 
                data-id="${contact.id}">
                <div class="chat-item-avatar" aria-hidden="true"><i class="fas fa-user"></i></div>
                <div class="chat-item-content">
                    <div class="chat-item-name">${Utils.sanitizeHTML(contact.name)}</div>
                    <div class="chat-item-message">${Utils.sanitizeHTML(contact.lastMessage)}</div>
                </div>
                <div class="chat-item-meta">
                    <span class="chat-item-time">${Utils.sanitizeHTML(contact.lastMessageTime)}</span>
                    ${contact.unread > 0 ? `<span class="chat-item-badge" aria-label="${contact.unread} mensajes no leídos">${contact.unread}</span>` : ''}
                </div>
            </li>
        `).join('');
    },

    renderChatMessages: (contactId) => {
        const container = document.getElementById('chatMessages');
        if (!container) return;
        
        const messages = AppState.data.messages.filter(m => m.contactId === contactId);
        if (messages.length === 0) {
            container.innerHTML = `<div class="empty-state"><p>No hay mensajes aún. ¡Inicia la conversación!</p></div>`;
            return;
        }
        
        container.innerHTML = messages.map(msg => `
            <div class="message ${msg.sent ? 'sent' : 'received'}">
                <div class="message-bubble">
                    <p>${Utils.sanitizeHTML(msg.text)}</p>
                    <span class="message-time">${Utils.sanitizeHTML(msg.time)}</span>
                </div>
            </div>
        `).join('');
        container.scrollTop = container.scrollHeight;
    },

    renderContacts: () => {
        const tbody = document.getElementById('contactsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = AppState.data.contacts.map(contact => `
            <tr>
                <td><input type="checkbox" aria-label="Seleccionar ${Utils.sanitizeHTML(contact.name)}"></td>
                <td>
                    <div class="contact-info-cell">
                        <div class="contact-avatar" aria-hidden="true"><i class="fas fa-user"></i></div>
                        <div class="contact-name">${Utils.sanitizeHTML(contact.name)}</div>
                    </div>
                </td>
                <td>${Utils.sanitizeHTML(contact.phone)}</td>
                <td>${contact.tags.map(tag => `<span class="tag">${Utils.sanitizeHTML(tag)}</span>`).join('')}</td>
                <td class="text-muted">${Utils.sanitizeHTML(contact.lastMessage)}</td>
                <td>
                    <button class="btn-icon action-btn" data-action="view-contact" data-id="${contact.id}" aria-label="Ver contacto"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon action-btn" data-action="edit-contact" data-id="${contact.id}" aria-label="Editar contacto"><i class="fas fa-edit"></i></button>
                </td>
            </tr>
        `).join('');
    },

    renderFlows: () => {
        const grid = document.getElementById('flowsGrid');
        if (!grid) return;
        
        grid.innerHTML = AppState.data.flows.map(flow => `
            <article class="card flow-card" data-id="${flow.id}">
                <div class="flow-header">
                    <h3>${Utils.sanitizeHTML(flow.name)}</h3>
                    <span class="flow-status ${flow.status}">${flow.status === 'active' ? 'Activo' : 'Borrador'}</span>
                </div>
                <div class="flow-body">
                    <p><i class="fas fa-play"></i> ${flow.triggers} activaciones</p>
                    <p><i class="fas fa-calendar"></i> ${Utils.formatDate(flow.createdAt)}</p>
                </div>
                <div class="flow-actions">
                    <button class="btn btn-sm btn-primary action-btn" data-action="edit-flow"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-sm btn-outline action-btn" data-action="duplicate-flow"><i class="fas fa-copy"></i></button>
                    <button class="btn btn-sm btn-outline text-danger action-btn" data-action="delete-flow"><i class="fas fa-trash"></i></button>
                </div>
            </article>
        `).join('');
    },

    renderBroadcasts: () => {
        const list = document.getElementById('broadcastsList');
        if (!list) return;
        list.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullhorn"></i>
                <p>No hay difusiones creadas</p>
                <button class="btn btn-primary action-btn" data-action="create-broadcast"><i class="fas fa-plus"></i> Crear Primera Difusión</button>
            </div>
        `;
    }
};

// ============================================
// 7. MANEJO DE EVENTOS (Delegación)
// ============================================
const EventManager = {
    init: () => {
        // Navegación
        document.querySelector('.sidebar-nav')?.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                Router.navigate(navItem.dataset.page);
            }
        });

        // Toggles UI
        document.getElementById('menuToggle')?.addEventListener('click', () => UI.toggleSidebar());
        document.getElementById('sidebarToggle')?.addEventListener('click', () => UI.toggleSidebar());
        document.getElementById('themeToggle')?.addEventListener('click', UI.toggleTheme);
        document.getElementById('newInstanceBtn')?.addEventListener('click', () => Modals.openQR());
        document.getElementById('createInstanceBtn')?.addEventListener('click', () => Modals.openQR());

        // Delegación de eventos para elementos dinámicos (Instancias)
        document.getElementById('instancesGrid')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (!btn) return;
            const card = btn.closest('.instance-card');
            const id = card?.dataset.id;
            const action = btn.dataset.action;

            if (action === 'connect') Actions.connectInstance(id);
            if (action === 'disconnect') Actions.disconnectInstance(id);
            if (action === 'restart') Actions.restartInstance(id);
            if (action === 'delete') Actions.deleteInstance(id);
        });

        // Delegación de eventos para Chat
        document.getElementById('chatList')?.addEventListener('click', (e) => {
            const chatItem = e.target.closest('.chat-item');
            if (chatItem) Actions.selectChat(chatItem.dataset.id);
        });

        document.getElementById('chatForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            Actions.sendMessage();
        });

        // Delegación de eventos para Contactos y Flujos
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'view-contact') UI.showToast('info', 'Contacto', `Viendo perfil de ${id}`);
            if (action === 'edit-contact') UI.showToast('info', 'Editar', `Editando contacto ${id}`);
            if (action === 'edit-flow') UI.showToast('info', 'Flujos', 'Abriendo editor visual...');
            if (action === 'create-broadcast') UI.showToast('info', 'Difusión', 'Abriendo creador...');
            
            if (action === 'delete-flow' && confirm('¿Eliminar este flujo?')) {
                AppState.data.flows = AppState.data.flows.filter(f => f.id !== id);
                Components.renderFlows();
                UI.showToast('success', 'Eliminado', 'Flujo eliminado correctamente');
            }
            if (action === 'duplicate-flow') {
                const flow = AppState.data.flows.find(f => f.id === id);
                if (flow) {
                    AppState.data.flows.push({ ...flow, id: Utils.generateId(), name: `${flow.name} (Copia)`, status: 'draft', triggers: 0 });
                    Components.renderFlows();
                    UI.showToast('success', 'Duplicado', 'Flujo duplicado exitosamente');
                }
            }
        });

        // Búsquedas (Debounce)
        document.getElementById('instancesSearch')?.addEventListener('input', Utils.debounce((e) => {
            Components.renderInstances('all', e.target.value);
        }, 300));

        document.getElementById('chatSearchInput')?.addEventListener('input', Utils.debounce((e) => {
            Components.renderChatList('all', e.target.value);
        }, 300));

        // Cerrar modales al hacer click fuera
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close')) {
                Modals.closeAll();
            }
        });

        // Atajo de teclado Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('globalSearch')?.focus();
            }
        });
    }
};

// ============================================
// 8. ACCIONES Y LÓGICA DE NEGOCIO
// ============================================
const Actions = {
    connectInstance: async (id) => {
        const instance = AppState.data.instances.find(i => i.id === id);
        if (!instance) return;
        
        UI.showToast('info', 'Conectando', `Estableciendo conexión con ${instance.name}...`);
        await Utils.delay(1500); // Simula llamada a API
        
        instance.connected = true;
        instance.battery = 100;
        instance.lastSeen = 'Ahora';
        Components.renderInstances();
        Components.updateStats();
        UI.showToast('success', 'Conectado', `${instance.name} se conectó exitosamente`);
    },

    disconnectInstance: async (id) => {
        const instance = AppState.data.instances.find(i => i.id === id);
        if (!instance) return;

        instance.connected = false;
        instance.battery = 0;
        instance.lastSeen = 'Ahora';
        Components.renderInstances();
        Components.updateStats();
        UI.showToast('warning', 'Desconectado', `${instance.name} fue desconectada`);
    },

    restartInstance: async (id) => {
        const instance = AppState.data.instances.find(i => i.id === id);
        if (!instance) return;
        UI.showToast('info', 'Reiniciando', `Reiniciando ${instance.name}...`);
        await Utils.delay(2000);
        UI.showToast('success', 'Reiniciado', `${instance.name} se reinició correctamente`);
    },

    deleteInstance: (id) => {
        if (!confirm('¿Estás seguro de eliminar esta instancia? Esta acción no se puede deshacer.')) return;
        AppState.data.instances = AppState.data.instances.filter(i => i.id !== id);
        Components.renderInstances();
        Components.updateStats();
        UI.showToast('success', 'Eliminado', 'La instancia fue eliminada correctamente');
    },

    selectChat: (contactId) => {
        AppState.ui.selectedChat = contactId;
        const contact = AppState.data.contacts.find(c => c.id === contactId);
        if (!contact) return;

        contact.unread = 0;
        document.getElementById('chatEmpty')?.classList.add('hidden');
        document.getElementById('chatContent')?.classList.remove('hidden');
        
        document.getElementById('chatContactName').textContent = contact.name;
        document.getElementById('chatContactStatus').textContent = 'En línea';
        
        Components.renderChatMessages(contactId);
        Components.renderChatList(); // Actualiza badges
        Components.updateStats();
    },

    sendMessage: async () => {
        const input = document.getElementById('chatInput');
        if (!input || !AppState.ui.selectedChat || !input.value.trim()) return;

        const text = input.value.trim();
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        AppState.data.messages.push({
            id: Utils.generateId(),
            contactId: AppState.ui.selectedChat,
            text: text,
            time: time,
            sent: true
        });

        input.value = '';
        Components.renderChatMessages(AppState.ui.selectedChat);

        // Simular respuesta del bot/usuario
        await Utils.delay(1500);
        Actions.simulateResponse();
    },

    simulateResponse: () => {
        if (!AppState.ui.selectedChat) return;
        const responses = ['Entendido, gracias', 'Perfecto', '¿Me puedes dar más detalles?', 'Ok, quedamos así'];
        const now = new Date();
        const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        AppState.data.messages.push({
            id: Utils.generateId(),
            contactId: AppState.ui.selectedChat,
            text: responses[Math.floor(Math.random() * responses.length)],
            time: time,
            sent: false
        });

        Components.renderChatMessages(AppState.ui.selectedChat);
        UI.showToast('info', 'Nuevo mensaje', 'Recibiste un nuevo mensaje');
    }
};

// ============================================
// 9. MODALES
// ============================================
const Modals = {
    openQR: () => {
        const modal = document.getElementById('qrModal');
        if (!modal) return;
        modal.hidden = false;
        AppState.ui.qrStep = 1;
        Modals.updateQRSteps();
    },

    closeAll: () => {
        document.querySelectorAll('.modal, .dropdown-modal').forEach(m => m.hidden = true);
        if (AppState.ui.qrTimer) {
            clearInterval(AppState.ui.qrTimer);
            AppState.ui.qrTimer = null;
        }
    },

    updateQRSteps: () => {
        document.querySelectorAll('.qr-step').forEach((step, index) => {
            step.hidden = (index + 1) !== AppState.ui.qrStep;
            step.classList.toggle('active', (index + 1) === AppState.ui.qrStep);
        });

        const backBtn = document.getElementById('qrBackBtn');
        const nextBtn = document.getElementById('qrNextBtn');
        
        if (backBtn) backBtn.style.display = AppState.ui.qrStep > 1 ? 'inline-flex' : 'none';
        if (nextBtn) {
            nextBtn.innerHTML = AppState.ui.qrStep === 3 
                ? '<i class="fas fa-check"></i> Finalizar' 
                : 'Siguiente <i class="fas fa-arrow-right"></i>';
        }
    },

    nextQRStep: async () => {
        if (AppState.ui.qrStep === 1) {
            const instanceName = document.getElementById('instanceName')?.value;
            if (!instanceName?.trim()) {
                UI.showToast('error', 'Error', 'Por favor ingresa un nombre para la instancia');
                return;
            }
        }

        if (AppState.ui.qrStep < 3) {
            AppState.ui.qrStep++;
            Modals.updateQRSteps();
            
            if (AppState.ui.qrStep === 2) {
                Modals.startQRTimer();
                // Simular escaneo después de 3 segundos
                setTimeout(() => {
                    if (AppState.ui.qrStep === 2) {
                        UI.showToast('success', '¡QR Escaneado!', 'Dispositivo vinculado correctamente');
                        setTimeout(() => Modals.nextQRStep(), 1000);
                    }
                }, 3000);
            }
        } else {
            const instanceName = document.getElementById('instanceName')?.value || 'Nueva Instancia';
            AppState.data.instances.push({
                id: Utils.generateId(),
                name: instanceName,
                phone: '+593 99 000 0000',
                connected: true,
                battery: 100,
                messagesToday: 0,
                lastSeen: 'Ahora',
                createdAt: new Date().toISOString().split('T')[0]
            });
            
            Modals.closeAll();
            Components.updateStats();
            Components.renderInstances();
            UI.showToast('success', '¡Conectado!', 'La nueva instancia se añadió exitosamente');
        }
    },

    previousQRStep: () => {
        if (AppState.ui.qrStep > 1) {
            AppState.ui.qrStep--;
            Modals.updateQRSteps();
            if (AppState.ui.qrStep !== 2 && AppState.ui.qrTimer) {
                clearInterval(AppState.ui.qrTimer);
                AppState.ui.qrTimer = null;
            }
        }
    },

    startQRTimer: () => {
        let timeLeft = 60;
        const timerEl = document.getElementById('qrTimer');
        AppState.ui.qrTimer = setInterval(() => {
            timeLeft--;
            if (timerEl) timerEl.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(AppState.ui.qrTimer);
                UI.showToast('warning', 'QR Expirado', 'Generando nuevo código...');
                setTimeout(() => {
                    if (AppState.ui.qrStep === 2) Modals.startQRTimer();
                }, 2000);
            }
        }, 1000);
    }
};

// Asignar eventos de botones del modal QR
document.getElementById('qrNextBtn')?.addEventListener('click', Modals.nextQRStep);
document.getElementById('qrBackBtn')?.addEventListener('click', Modals.previousQRStep);
document.getElementById('closeQrModal')?.addEventListener('click', Modals.closeAll);

// ============================================
// 10. INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 WhatsApp Bot Dashboard Iniciado (Modo Senior)');
    
    // 1. Cargar datos (Simula fetch a API)
    AppState.data.instances = [...MockData.instances];
    AppState.data.contacts = [...MockData.contacts];
    AppState.data.messages = [...MockData.messages];
    AppState.data.flows = [...MockData.flows];
    AppState.data.notifications = [...MockData.notifications];

    // 2. Configurar UI inicial
    UI.init();
    
    // 3. Configurar Event Listeners (Delegación)
    EventManager.init();
    
    // 4. Renderizar vista inicial
    Router.navigate('dashboard');

    // 5. Ocultar pantalla de carga
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 500);
        }
    }, 800);

    // 6. Simular WebSocket
    console.log('🔌 Conectando WebSocket simulado...');
    setTimeout(() => UI.showToast('success', 'Sistema en línea', 'Conexión en tiempo real establecida'), 1500);
});