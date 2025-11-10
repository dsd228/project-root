// collaboration.js - Colaboración en Tiempo Real
class CollaborationManager {
    constructor(editor) {
        this.editor = editor;
        this.isCollaborating = false;
        this.roomId = null;
        this.peers = new Map();
        this.cursors = new Map();
        this.chatMessages = [];
        this.localUser = this.generateUser();
        this.init();
    }

    init() {
        this.setupCollaborationUI();
        this.setupSocketHandlers();
    }

    generateUser() {
        return {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: `User${Math.floor(Math.random() * 1000)}`,
            color: this.generateRandomColor(),
            avatar: this.generateAvatar(),
            isOnline: true
        };
    }

    generateRandomColor() {
        const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    generateAvatar() {
        const avatars = ['👤', '👨‍💻', '👩‍💻', '🧑‍🎨', '👨‍🎨', '👩‍🎨'];
        return avatars[Math.floor(Math.random() * avatars.length)];
    }

    setupCollaborationUI() {
        this.createCollaborationPanel();
        this.addCollaborationToolbar();
    }

    addCollaborationToolbar() {
        const workspaceHeader = document.querySelector('.workspace-header');
        if (!workspaceHeader) return;

        const collabControls = document.createElement('div');
        collabControls.className = 'collaboration-controls';
        collabControls.innerHTML = `
            <div class="collaboration-buttons">
                <button class="control-btn" id="toggle-collaboration" title="Start Collaboration">
                    <i class="ri-group-line"></i>
                    <span>Collaborate</span>
                </button>
                <button class="control-btn" id="invite-users" title="Invite Users">
                    <i class="ri-user-add-line"></i>
                </button>
                <button class="control-btn" id="collab-chat" title="Chat">
                    <i class="ri-chat-3-line"></i>
                </button>
            </div>
        `;

        workspaceHeader.querySelector('.workspace-controls').appendChild(collabControls);
        this.setupCollaborationEvents();
    }

    createCollaborationPanel() {
        const rightSidebar = document.querySelector('.right-sidebar');
        if (!rightSidebar) return;

        const collabPanel = document.createElement('div');
        collabPanel.className = 'collaboration-panel';
        collabPanel.innerHTML = `
            <div class="section-header">
                <h3><i class="ri-group-line"></i> Collaboration</h3>
                <button class="icon-btn" id="collab-settings">
                    <i class="ri-settings-3-line"></i>
                </button>
            </div>
            
            <div class="collab-status" id="collab-status">
                <div class="status-offline">
                    <i class="ri-wifi-off-line"></i>
                    <span>Collaboration offline</span>
                </div>
            </div>

            <div class="collab-users" id="collab-users">
                <div class="user-item local">
                    <div class="user-avatar" style="background: ${this.localUser.color}">
                        ${this.localUser.avatar}
                    </div>
                    <div class="user-info">
                        <span class="user-name">${this.localUser.name} (You)</span>
                        <span class="user-status online">Online</span>
                    </div>
                </div>
            </div>

            <div class="collab-actions">
                <button class="btn-secondary" onclick="editorApp.collaboration.copyInviteLink()">
                    Copy Invite Link
                </button>
                <button class="btn-primary" onclick="editorApp.collaboration.toggleCollaboration()">
                    Start Collaboration
                </button>
            </div>

            <div class="collab-chat">
                <div class="chat-header">
                    <h4>Team Chat</h4>
                </div>
                <div class="chat-messages" id="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" id="chat-input" placeholder="Type a message...">
                    <button class="icon-btn" id="chat-send">
                        <i class="ri-send-plane-line"></i>
                    </button>
                </div>
            </div>
        `;

        rightSidebar.appendChild(collabPanel);
        this.setupChatEvents();
    }

    setupCollaborationEvents() {
        document.getElementById('toggle-collaboration')?.addEventListener('click', () => {
            this.toggleCollaboration();
        });

        document.getElementById('invite-users')?.addEventListener('click', () => {
            this.showInviteModal();
        });

        document.getElementById('collab-chat')?.addEventListener('click', () => {
            this.toggleChat();
        });
    }

    setupChatEvents() {
        const chatInput = document.getElementById('chat-input');
        const chatSend = document.getElementById('chat-send');

        if (chatInput && chatSend) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendChatMessage();
                }
            });

            chatSend.addEventListener('click', () => {
                this.sendChatMessage();
            });
        }
    }

    setupSocketHandlers() {
        // Simular conexión WebSocket
        this.socket = {
            emit: (event, data) => {
                console.log('📡 Emitting:', event, data);
                this.handleSocketEvent(event, data);
            },
            on: (event, handler) => {
                this.socketHandlers = this.socketHandlers || {};
                this.socketHandlers[event] = handler;
            }
        };

        // Handlers de eventos simulados
        this.socket.on('user_joined', (data) => this.handleUserJoined(data));
        this.socket.on('user_left', (data) => this.handleUserLeft(data));
        this.socket.on('cursor_moved', (data) => this.handleCursorMoved(data));
        this.socket.on('element_updated', (data) => this.handleElementUpdated(data));
        this.socket.on('chat_message', (data) => this.handleChatMessage(data));
    }

    toggleCollaboration() {
        this.isCollaborating = !this.isCollaborating;

        const toggleBtn = document.getElementById('toggle-collaboration');
        const statusElement = document.getElementById('collab-status');

        if (this.isCollaborating) {
            this.startCollaboration();
            if (toggleBtn) toggleBtn.classList.add('active');
            if (statusElement) {
                statusElement.innerHTML = `
                    <div class="status-online">
                        <i class="ri-wifi-line"></i>
                        <span>Collaboration active - Room: ${this.roomId}</span>
                    </div>
                `;
            }
        } else {
            this.stopCollaboration();
            if (toggleBtn) toggleBtn.classList.remove('active');
            if (statusElement) {
                statusElement.innerHTML = `
                    <div class="status-offline">
                        <i class="ri-wifi-off-line"></i>
                        <span>Collaboration offline</span>
                    </div>
                `;
            }
        }

        this.editor.showNotification(
            this.isCollaborating ? '👥 Collaboration started' : '👥 Collaboration stopped'
        );
    }

    startCollaboration() {
        this.roomId = `room_${Date.now()}`;
        this.socket.emit('join_room', {
            roomId: this.roomId,
            user: this.localUser
        });

        this.startCursorTracking();
        this.syncCurrentState();
    }

    stopCollaboration() {
        this.socket.emit('leave_room', {
            roomId: this.roomId,
            userId: this.localUser.id
        });

        this.peers.clear();
        this.cursors.clear();
        this.stopCursorTracking();
        
        this.roomId = null;
        this.renderUsers();
        this.clearCursors();
    }

    startCursorTracking() {
        this.cursorInterval = setInterval(() => {
            this.broadcastCursorPosition();
        }, 100);

        this.canvasMouseMoveHandler = (e) => {
            this.lastCursorPosition = this.getCursorPosition(e);
        };

        this.editor.canvas.addEventListener('mousemove', this.canvasMouseMoveHandler);
    }

    stopCursorTracking() {
        if (this.cursorInterval) {
            clearInterval(this.cursorInterval);
        }
        if (this.canvasMouseMoveHandler) {
            this.editor.canvas.removeEventListener('mousemove', this.canvasMouseMoveHandler);
        }
    }

    broadcastCursorPosition() {
        if (this.lastCursorPosition && this.isCollaborating) {
            this.socket.emit('cursor_move', {
                roomId: this.roomId,
                userId: this.localUser.id,
                position: this.lastCursorPosition
            });
        }
    }

    getCursorPosition(e) {
        const rect = this.editor.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left - this.editor.offset.x) / this.editor.zoom,
            y: (e.clientY - rect.top - this.editor.offset.y) / this.editor.zoom
        };
    }

    handleUserJoined(data) {
        this.peers.set(data.user.id, data.user);
        this.renderUsers();
        this.addSystemMessage(`${data.user.name} joined the room`);
    }

    handleUserLeft(data) {
        this.peers.delete(data.userId);
        this.cursors.delete(data.userId);
        this.renderUsers();
        this.renderCursors();
        this.addSystemMessage(`${data.userName || 'User'} left the room`);
    }

    handleCursorMoved(data) {
        this.cursors.set(data.userId, {
            position: data.position,
            user: this.peers.get(data.userId)
        });
        this.renderCursors();
    }

    handleElementUpdated(data) {
        const element = this.editor.elements.find(el => el.id === data.elementId);
        if (element) {
            Object.assign(element, data.changes);
            this.editor.render();
        }
    }

    handleChatMessage(data) {
        this.addChatMessage(data.user, data.message, data.timestamp);
    }

    renderUsers() {
        const usersContainer = document.getElementById('collab-users');
        if (!usersContainer) return;

        const usersHTML = Array.from(this.peers.values()).map(user => `
            <div class="user-item">
                <div class="user-avatar" style="background: ${user.color}">
                    ${user.avatar}
                </div>
                <div class="user-info">
                    <span class="user-name">${user.name}</span>
                    <span class="user-status online">Online</span>
                </div>
            </div>
        `).join('');

        usersContainer.innerHTML = `
            <div class="user-item local">
                <div class="user-avatar" style="background: ${this.localUser.color}">
                    ${this.localUser.avatar}
                </div>
                <div class="user-info">
                    <span class="user-name">${this.localUser.name} (You)</span>
                    <span class="user-status online">Online</span>
                </div>
            </div>
            ${usersHTML}
        `;
    }

    renderCursors() {
        this.clearCursors();

        this.cursors.forEach((cursor, userId) => {
            if (userId !== this.localUser.id) {
                this.renderCursor(cursor);
            }
        });
    }

    renderCursor(cursor) {
        const ctx = this.editor.ctx;
        ctx.save();

        const screenX = cursor.position.x * this.editor.zoom + this.editor.offset.x;
        const screenY = cursor.position.y * this.editor.zoom + this.editor.offset.y;

        // Cursor
        ctx.fillStyle = cursor.user.color;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY);
        ctx.lineTo(screenX - 10, screenY - 5);
        ctx.lineTo(screenX - 5, screenY - 10);
        ctx.closePath();
        ctx.fill();

        // Etiqueta de usuario
        ctx.fillStyle = cursor.user.color;
        ctx.fillRect(screenX - 20, screenY - 30, 40, 20);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(cursor.user.name, screenX, screenY - 17);

        ctx.restore();
    }

    clearCursors() {
        // Los cursores se redibujan en cada frame
    }

    sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput) return;

        const message = chatInput.value.trim();
        if (!message) return;

        this.socket.emit('chat_message', {
            roomId: this.roomId,
            userId: this.localUser.id,
            message: message,
            timestamp: new Date().toISOString()
        });

        this.addChatMessage(this.localUser, message, new Date().toISOString());
        chatInput.value = '';
    }

    addChatMessage(user, message, timestamp) {
        this.chatMessages.push({ user, message, timestamp });
        this.renderChatMessages();

        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    addSystemMessage(message) {
        this.addChatMessage(
            { name: 'System', avatar: '🤖', color: '#64748b' },
            message,
            new Date().toISOString()
        );
    }

    renderChatMessages() {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;

        chatMessages.innerHTML = this.chatMessages.map(msg => `
            <div class="chat-message ${msg.user.id === this.localUser.id ? 'own' : ''}">
                <div class="message-avatar" style="background: ${msg.user.color}">
                    ${msg.user.avatar}
                </div>
                <div class="message-content">
                    <div class="message-header">
                        <span class="message-sender">${msg.user.name}</span>
                        <span class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div class="message-text">${msg.message}</div>
                </div>
            </div>
        `).join('');
    }

    copyInviteLink() {
        if (!this.roomId) {
            this.editor.showNotification('⚠️ Start collaboration first');
            return;
        }

        const inviteLink = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            this.editor.showNotification('📋 Invite link copied to clipboard');
        });
    }

    showInviteModal() {
        if (!this.isCollaborating) {
            this.editor.showNotification('⚠️ Start collaboration to invite users');
            return;
        }

        const inviteLink = `${window.location.origin}${window.location.pathname}?room=${this.roomId}`;
        prompt('Share this link with your team:', inviteLink);
    }

    toggleChat() {
        const chatPanel = document.querySelector('.collab-chat');
        if (chatPanel) {
            chatPanel.style.display = chatPanel.style.display === 'none' ? 'block' : 'none';
        }
    }

    syncCurrentState() {
        this.socket.emit('sync_state', {
            roomId: this.roomId,
            elements: this.editor.elements
        });
    }

    handleSocketEvent(event, data) {
        if (this.socketHandlers && this.socketHandlers[event]) {
            this.socketHandlers[event](data);
        }
    }

    broadcastElementChange(elementId, changes) {
        if (this.isCollaborating) {
            this.socket.emit('element_update', {
                roomId: this.roomId,
                userId: this.localUser.id,
                elementId: elementId,
                changes: changes
            });
        }
    }
}