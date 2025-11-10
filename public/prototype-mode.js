// prototype-mode.js - Modo Prototipo Interactivo
class PrototypeMode {
    constructor(editor) {
        this.editor = editor;
        this.isPrototypeMode = false;
        this.interactions = new Map();
        this.hotspots = [];
        this.screens = new Map();
        this.currentScreen = 'main';
        this.init();
    }

    init() {
        this.setupPrototypeUI();
        this.loadPrototypeData();
    }

    setupPrototypeUI() {
        this.addPrototypeToolbar();
        this.createPrototypePanel();
    }

    addPrototypeToolbar() {
        const workspaceHeader = document.querySelector('.workspace-header');
        if (!workspaceHeader) return;

        const prototypeControls = document.createElement('div');
        prototypeControls.className = 'prototype-controls';
        prototypeControls.innerHTML = `
            <div class="prototype-buttons">
                <button class="control-btn" id="toggle-prototype-mode" title="Toggle Prototype Mode">
                    <i class="ri-play-circle-line"></i>
                    <span>Prototype</span>
                </button>
                <button class="control-btn" id="add-hotspot" title="Add Hotspot">
                    <i class="ri-cursor-line"></i>
                </button>
                <button class="control-btn" id="add-screen" title="Add Screen">
                    <i class="ri-layout-line"></i>
                </button>
                <button class="control-btn" id="preview-prototype" title="Preview Prototype">
                    <i class="ri-slideshow-line"></i>
                </button>
            </div>
        `;

        workspaceHeader.querySelector('.workspace-controls').appendChild(prototypeControls);
        this.setupPrototypeEvents();
    }

    createPrototypePanel() {
        const rightSidebar = document.querySelector('.right-sidebar');
        if (!rightSidebar) return;

        const prototypePanel = document.createElement('div');
        prototypePanel.className = 'prototype-panel';
        prototypePanel.innerHTML = `
            <div class="section-header">
                <h3><i class="ri-flask-line"></i> Prototype</h3>
                <button class="icon-btn" id="prototype-settings">
                    <i class="ri-settings-3-line"></i>
                </button>
            </div>
            
            <div class="prototype-tabs">
                <button class="prototype-tab active" data-tab="interactions">Interactions</button>
                <button class="prototype-tab" data-tab="screens">Screens</button>
                <button class="prototype-tab" data-tab="flows">Flows</button>
            </div>

            <div class="prototype-content">
                <div class="prototype-tab-content active" id="interactions-tab">
                    <div class="interactions-list" id="interactions-list"></div>
                    <button class="add-interaction-btn" onclick="editorApp.prototypeMode.addInteraction()">
                        <i class="ri-add-line"></i> Add Interaction
                    </button>
                </div>
                
                <div class="prototype-tab-content" id="screens-tab">
                    <div class="screens-list" id="screens-list"></div>
                    <button class="add-screen-btn" onclick="editorApp.prototypeMode.createScreen()">
                        <i class="ri-add-line"></i> Add Screen
                    </button>
                </div>
                
                <div class="prototype-tab-content" id="flows-tab">
                    <div class="flows-diagram" id="flows-diagram">
                        <div class="flow-placeholder">
                            <p>Create interactions to see flow diagram</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="prototype-actions">
                <button class="btn-secondary" onclick="editorApp.prototypeMode.exportPrototype()">
                    Export Prototype
                </button>
                <button class="btn-primary" onclick="editorApp.prototypeMode.togglePrototypeMode()">
                    Start Prototype
                </button>
            </div>
        `;

        rightSidebar.appendChild(prototypePanel);
        this.setupPrototypeTabs();
        this.renderInteractions();
        this.renderScreens();
    }

    setupPrototypeEvents() {
        document.getElementById('toggle-prototype-mode')?.addEventListener('click', () => {
            this.togglePrototypeMode();
        });

        document.getElementById('add-hotspot')?.addEventListener('click', () => {
            this.addHotspot();
        });

        document.getElementById('add-screen')?.addEventListener('click', () => {
            this.createScreen();
        });

        document.getElementById('preview-prototype')?.addEventListener('click', () => {
            this.previewPrototype();
        });
    }

    setupPrototypeTabs() {
        document.querySelectorAll('.prototype-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.prototype-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.prototype-tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-tab`).classList.add('active');
            });
        });
    }

    togglePrototypeMode() {
        this.isPrototypeMode = !this.isPrototypeMode;
        
        const toggleBtn = document.getElementById('toggle-prototype-mode');
        if (toggleBtn) {
            if (this.isPrototypeMode) {
                toggleBtn.classList.add('active');
                toggleBtn.innerHTML = '<i class="ri-stop-circle-line"></i><span>Stop Prototype</span>';
                this.enterPrototypeMode();
            } else {
                toggleBtn.classList.remove('active');
                toggleBtn.innerHTML = '<i class="ri-play-circle-line"></i><span>Prototype</span>';
                this.exitPrototypeMode();
            }
        }

        this.editor.showNotification(this.isPrototypeMode ? '🎭 Modo prototipo activado' : '🎭 Modo prototipo desactivado');
    }

    enterPrototypeMode() {
        this.editor.currentTool = 'prototype';
        this.showHotspots();
        this.setupPrototypeInteractions();
    }

    exitPrototypeMode() {
        this.editor.currentTool = 'select';
        this.hideHotspots();
        this.cleanupPrototypeInteractions();
    }

    addHotspot() {
        if (!this.editor.selectedElement) {
            this.editor.showNotification('⚠️ Select an element to add hotspot');
            return;
        }

        const hotspot = {
            id: `hotspot_${Date.now()}`,
            elementId: this.editor.selectedElement.id,
            x: this.editor.selectedElement.x,
            y: this.editor.selectedElement.y,
            width: this.editor.selectedElement.width,
            height: this.editor.selectedElement.height,
            interactions: []
        };

        this.hotspots.push(hotspot);
        this.renderHotspots();
        this.editor.showNotification('🎯 Hotspot added to selected element');
    }

    addInteraction() {
        if (this.hotspots.length === 0) {
            this.editor.showNotification('⚠️ Add a hotspot first');
            return;
        }

        const hotspotId = this.hotspots[0].id;
        const interaction = {
            id: `interaction_${Date.now()}`,
            hotspotId: hotspotId,
            trigger: 'click',
            action: 'navigate',
            target: 'screen_2',
            animation: 'fade',
            duration: 300
        };

        if (!this.interactions.has(hotspotId)) {
            this.interactions.set(hotspotId, []);
        }
        this.interactions.get(hotspotId).push(interaction);

        this.renderInteractions();
        this.editor.showNotification('🔄 Interaction added');
    }

    createScreen() {
        const name = prompt('Enter screen name:');
        if (!name) return;

        const screen = {
            id: `screen_${Date.now()}`,
            name: name,
            elements: JSON.parse(JSON.stringify(this.editor.elements)),
            createdAt: new Date().toISOString()
        };

        this.screens.set(screen.id, screen);
        this.renderScreens();
        this.editor.showNotification(`📱 Screen "${name}" created`);
    }

    navigateToScreen(screenId) {
        const screen = this.screens.get(screenId);
        if (screen) {
            this.currentScreen = screenId;
            this.editor.elements = JSON.parse(JSON.stringify(screen.elements));
            this.editor.render();
            this.editor.updateLayersPanel();
        }
    }

    showHotspots() {
        this.hotspots.forEach(hotspot => {
            this.renderHotspot(hotspot);
        });
    }

    hideHotspots() {
        this.editor.render();
    }

    renderHotspot(hotspot) {
        const ctx = this.editor.ctx;
        ctx.save();
        
        ctx.strokeStyle = '#ff3b30';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(hotspot.x - 5, hotspot.y - 5, hotspot.width + 10, hotspot.height + 10);
        
        ctx.fillStyle = 'rgba(255, 59, 48, 0.1)';
        ctx.fillRect(hotspot.x - 5, hotspot.y - 5, hotspot.width + 10, hotspot.height + 10);
        
        ctx.setLineDash([]);
        ctx.restore();
    }

    renderInteractions() {
        const interactionsList = document.getElementById('interactions-list');
        if (!interactionsList) return;

        interactionsList.innerHTML = '';
        
        this.interactions.forEach((interactions, hotspotId) => {
            interactions.forEach(interaction => {
                const interactionEl = document.createElement('div');
                interactionEl.className = 'interaction-item';
                interactionEl.innerHTML = `
                    <div class="interaction-info">
                        <strong>${interaction.trigger} → ${interaction.action}</strong>
                        <span>${interaction.target}</span>
                    </div>
                    <div class="interaction-actions">
                        <button class="icon-btn sm" onclick="editorApp.prototypeMode.editInteraction('${interaction.id}')">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="icon-btn sm" onclick="editorApp.prototypeMode.deleteInteraction('${interaction.id}')">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                `;
                interactionsList.appendChild(interactionEl);
            });
        });
    }

    renderScreens() {
        const screensList = document.getElementById('screens-list');
        if (!screensList) return;

        screensList.innerHTML = Array.from(this.screens.values()).map(screen => `
            <div class="screen-item ${this.currentScreen === screen.id ? 'active' : ''}" 
                 onclick="editorApp.prototypeMode.navigateToScreen('${screen.id}')">
                <div class="screen-preview">
                    <i class="ri-layout-line"></i>
                </div>
                <div class="screen-info">
                    <span class="screen-name">${screen.name}</span>
                    <span class="screen-elements">${screen.elements.length} elements</span>
                </div>
                <div class="screen-actions">
                    <button class="icon-btn sm" onclick="event.stopPropagation(); editorApp.prototypeMode.duplicateScreen('${screen.id}')">
                        <i class="ri-file-copy-line"></i>
                    </button>
                    <button class="icon-btn sm" onclick="event.stopPropagation(); editorApp.prototypeMode.deleteScreen('${screen.id}')">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupPrototypeInteractions() {
        this.editor.canvas.style.cursor = 'pointer';
        
        this.editor.canvas.addEventListener('click', (e) => {
            if (!this.isPrototypeMode) return;
            
            const rect = this.editor.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.editor.offset.x) / this.editor.zoom;
            const y = (e.clientY - rect.top - this.editor.offset.y) / this.editor.zoom;

            const clickedHotspot = this.hotspots.find(hotspot => 
                x >= hotspot.x && x <= hotspot.x + hotspot.width &&
                y >= hotspot.y && y <= hotspot.y + hotspot.height
            );

            if (clickedHotspot) {
                this.executeInteraction(clickedHotspot);
            }
        });
    }

    executeInteraction(hotspot) {
        const interactions = this.interactions.get(hotspot.id) || [];
        
        interactions.forEach(interaction => {
            switch (interaction.action) {
                case 'navigate':
                    this.navigateToScreen(interaction.target);
                    break;
                case 'show':
                    this.showOverlay(interaction.target);
                    break;
                case 'hide':
                    this.hideElement(interaction.target);
                    break;
                case 'animation':
                    this.playAnimation(interaction.target, interaction.animation);
                    break;
            }
        });
    }

    showOverlay(elementId) {
        const element = this.editor.elements.find(el => el.id === elementId);
        if (element) {
            element.visible = true;
            this.editor.render();
        }
    }

    hideElement(elementId) {
        const element = this.editor.elements.find(el => el.id === elementId);
        if (element) {
            element.visible = false;
            this.editor.render();
        }
    }

    playAnimation(elementId, animationType) {
        const element = this.editor.elements.find(el => el.id === elementId);
        if (element) {
            switch (animationType) {
                case 'fade':
                    this.fadeAnimation(element);
                    break;
                case 'slide':
                    this.slideAnimation(element);
                    break;
                case 'bounce':
                    this.bounceAnimation(element);
                    break;
            }
        }
    }

    fadeAnimation(element) {
        let opacity = 0;
        const fadeIn = () => {
            opacity += 0.1;
            element.opacity = opacity;
            this.editor.render();
            
            if (opacity < 1) {
                requestAnimationFrame(fadeIn);
            }
        };
        fadeIn();
    }

    previewPrototype() {
        this.togglePrototypeMode();
        this.editor.showNotification('👀 Starting prototype preview...');
    }

    exportPrototype() {
        const prototypeData = {
            screens: Object.fromEntries(this.screens),
            interactions: Object.fromEntries(this.interactions),
            hotspots: this.hotspots,
            flows: this.generateFlowData()
        };

        const blob = new Blob([JSON.stringify(prototypeData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = `prototype-${Date.now()}.json`;
        link.href = URL.createObjectURL(blob);
        link.click();
        
        this.editor.showNotification('📁 Prototype exported as JSON');
    }

    generateFlowData() {
        const flows = [];
        this.interactions.forEach((interactions, hotspotId) => {
            interactions.forEach(interaction => {
                flows.push({
                    from: hotspotId,
                    to: interaction.target,
                    trigger: interaction.trigger,
                    action: interaction.action
                });
            });
        });
        return flows;
    }

    loadPrototypeData() {
        const saved = localStorage.getItem('editor-prototype-data');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.screens = new Map(Object.entries(data.screens || {}));
                this.interactions = new Map(Object.entries(data.interactions || {}));
                this.hotspots = data.hotspots || [];
            } catch (error) {
                console.error('Error loading prototype data:', error);
            }
        }
    }

    savePrototypeData() {
        const data = {
            screens: Object.fromEntries(this.screens),
            interactions: Object.fromEntries(this.interactions),
            hotspots: this.hotspots
        };
        localStorage.setItem('editor-prototype-data', JSON.stringify(data));
    }

    cleanupPrototypeInteractions() {
        this.editor.canvas.style.cursor = 'default';
    }

    // Métodos auxiliares
    editInteraction(interactionId) {
        this.editor.showNotification('✏️ Edit interaction feature coming soon');
    }

    deleteInteraction(interactionId) {
        for (let [hotspotId, interactions] of this.interactions) {
            const index = interactions.findIndex(i => i.id === interactionId);
            if (index > -1) {
                interactions.splice(index, 1);
                break;
            }
        }
        this.renderInteractions();
        this.editor.showNotification('🗑️ Interaction deleted');
    }

    duplicateScreen(screenId) {
        const screen = this.screens.get(screenId);
        if (screen) {
            const newScreen = {
                ...screen,
                id: `screen_${Date.now()}`,
                name: `${screen.name} Copy`
            };
            this.screens.set(newScreen.id, newScreen);
            this.renderScreens();
            this.editor.showNotification('📱 Screen duplicated');
        }
    }

    deleteScreen(screenId) {
        this.screens.delete(screenId);
        this.renderScreens();
        this.editor.showNotification('🗑️ Screen deleted');
    }

    slideAnimation(element) {
        // Implementación básica de animación slide
        const originalX = element.x;
        element.x = originalX - 100;
        this.editor.render();
        
        let currentX = element.x;
        const slide = () => {
            currentX += 10;
            element.x = currentX;
            this.editor.render();
            
            if (currentX < originalX) {
                requestAnimationFrame(slide);
            }
        };
        slide();
    }

    bounceAnimation(element) {
        // Implementación básica de animación bounce
        const originalY = element.y;
        let bounceCount = 0;
        
        const bounce = () => {
            element.y = originalY + Math.sin(bounceCount) * 20;
            this.editor.render();
            bounceCount += 0.3;
            
            if (bounceCount < Math.PI * 2) {
                requestAnimationFrame(bounce);
            } else {
                element.y = originalY;
                this.editor.render();
            }
        };
        bounce();
    }
}