// init.js - Editor Pro+ Premium Corregido
console.log('🚀 Inicializando Editor Pro+ Premium...');

// ==================== COMPONENTES PREMIUM ====================
if (typeof ButtonComponents === 'undefined') {
    window.ButtonComponents = {
        'primary-button': {
            name: 'Botón Primario',
            element: {
                type: 'rectangle',
                width: 140,
                height: 48,
                fill: '#6366f1',
                stroke: 'none',
                borderRadius: 12
            },
            text: {
                type: 'text',
                content: 'Click Me',
                fontSize: 16,
                fontFamily: 'Inter',
                fill: '#ffffff',
                fontWeight: '600'
            }
        },
        'secondary-button': {
            name: 'Botón Secundario',
            element: {
                type: 'rectangle',
                width: 140,
                height: 48,
                fill: 'transparent',
                stroke: '#6366f1',
                strokeWidth: 2,
                borderRadius: 12
            },
            text: {
                type: 'text',
                content: 'Secondary',
                fontSize: 16,
                fontFamily: 'Inter',
                fill: '#6366f1',
                fontWeight: '600'
            }
        },
        'card-modern': {
            name: 'Card Moderno',
            element: {
                type: 'rectangle',
                width: 300,
                height: 200,
                fill: '#ffffff',
                stroke: '#e2e8f0',
                strokeWidth: 1,
                borderRadius: 16
            },
            text: {
                type: 'text',
                content: 'Card Title',
                fontSize: 18,
                fontFamily: 'Inter',
                fill: '#1e293b',
                fontWeight: '700'
            }
        }
    };
}

// ==================== PLANTILLAS PREMIUM ====================
if (typeof WebTemplates === 'undefined') {
    window.WebTemplates = {
        'landing-moderna': {
            name: 'Landing Page Moderna',
            category: 'web',
            device: 'desktop',
            elements: [
                {
                    id: 'bg_1',
                    type: 'rectangle',
                    x: 0, y: 0, width: 1440, height: 800,
                    fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    stroke: 'none'
                },
                {
                    id: 'navbar_1',
                    type: 'rectangle',
                    x: 0, y: 0, width: 1440, height: 80,
                    fill: 'rgba(255, 255, 255, 0.95)',
                    stroke: 'none'
                },
                {
                    id: 'logo_1',
                    type: 'text',
                    x: 100, y: 35,
                    content: 'StartupPro',
                    fontSize: 24,
                    fontFamily: 'Inter',
                    fill: '#1e293b',
                    fontWeight: '700'
                }
            ]
        }
    };
}

if (typeof MobileTemplates === 'undefined') {
    window.MobileTemplates = {
        'app-movil': {
            name: 'App Móvil Premium',
            category: 'mobile',
            device: 'mobile',
            elements: [
                {
                    id: 'bg_mobile',
                    type: 'rectangle',
                    x: 0, y: 0, width: 375, height: 812,
                    fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    stroke: 'none'
                },
                {
                    id: 'card_mobile',
                    type: 'rectangle',
                    x: 20, y: 120,
                    width: 335, height: 200,
                    fill: 'rgba(255, 255, 255, 0.15)',
                    stroke: 'none',
                    borderRadius: 20
                }
            ]
        }
    };
}

// ==================== MANAGERS PREMIUM ====================

// TemplateManager Premium
if (typeof TemplateManager === 'undefined') {
    class TemplateManager {
        constructor(editor) {
            this.editor = editor;
            this.templates = { ...WebTemplates, ...MobileTemplates };
        }

        getTemplatesByCategory(category) {
            return Object.entries(this.templates).filter(([key, template]) => 
                template.category === category
            );
        }

        loadTemplate(templateId) {
            const template = this.templates[templateId];
            if (template) {
                this.editor.elements = [];
                
                template.elements.forEach(element => {
                    this.editor.elements.push({
                        ...element,
                        id: element.id || `${element.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                    });
                });
                
                if (template.device) {
                    this.editor.responsiveManager.setDevice(template.device);
                }
                
                this.editor.render();
                this.editor.updateLayersPanel();
                
                this.editor.showNotification(`🎨 Plantilla "${template.name}" cargada`);
                return true;
            }
            return false;
        }
    }
    window.TemplateManager = TemplateManager;
}

// ComponentManager Premium
if (typeof ComponentManager === 'undefined') {
    class ComponentManager {
        constructor(editor) {
            this.editor = editor;
            this.components = { ...ButtonComponents };
        }

        addComponent(componentType, x, y) {
            const component = this.components[componentType];
            if (component) {
                const timestamp = Date.now();
                const randomId = Math.random().toString(36).substr(2, 9);
                
                const bgElement = { 
                    ...component.element, 
                    x: x || 150, 
                    y: y || 150,
                    id: `comp_${timestamp}_${randomId}`
                };
                
                let textElement = null;
                if (component.text) {
                    textElement = { 
                        ...component.text, 
                        x: (x || 150) + (bgElement.width / 2) - 40,
                        y: (y || 150) + (bgElement.height / 2) + 5,
                        id: `text_${timestamp}_${randomId}`
                    };
                }
                
                this.editor.elements.push(bgElement);
                if (textElement) {
                    this.editor.elements.push(textElement);
                }
                
                this.editor.selectedElement = bgElement;
                this.editor.render();
                this.editor.updateLayersPanel();
                
                this.editor.showNotification(`🧩 Componente "${component.name}" agregado`);
                return true;
            }
            return false;
        }
    }
    window.ComponentManager = ComponentManager;
}

// LayerManager Premium
if (typeof LayerManager === 'undefined') {
    class LayerManager {
        constructor(editor) {
            this.editor = editor;
            this.layers = [];
        }

        syncWithElements() {
            this.layers = this.editor.elements.map(element => ({
                id: element.id,
                name: element.name || `${element.type} ${element.id.slice(-4)}`,
                type: element.type,
                visible: true,
                locked: false,
                element: element
            }));
        }
    }
    window.LayerManager = LayerManager;
}

// AIAssistant Premium
if (typeof AIAssistant === 'undefined') {
    class AIAssistant {
        constructor(editor) {
            this.editor = editor;
        }

        async sendMessage(message) {
            try {
                const response = await this.callOllama(message);
                return response;
            } catch (error) {
                return '⚠️ No se pudo conectar con el asistente IA. Asegúrate de que Ollama esté ejecutándose en http://localhost:11434';
            }
        }

        async callOllama(prompt) {
            try {
                const response = await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'llama3',
                        prompt: `Eres un asistente de diseño gráfico. Responde de manera concisa y útil: ${prompt}`,
                        stream: false
                    })
                });

                if (!response.ok) throw new Error('Error en Ollama');
                const data = await response.json();
                return data.response;
            } catch (error) {
                throw new Error('No se pudo conectar con Ollama');
            }
        }

        generateDesign() {
            const designs = [
                { fill: '#6366f1', width: 200, height: 120, borderRadius: 16 },
                { fill: '#10b981', width: 180, height: 180, borderRadius: 20 },
                { fill: '#f59e0b', width: 160, height: 160, borderRadius: 80 }
            ];
            
            const design = designs[Math.floor(Math.random() * designs.length)];
            const x = 100 + Math.random() * 200;
            const y = 100 + Math.random() * 200;
            
            const newElement = {
                id: `ai_design_${Date.now()}`,
                type: 'rectangle',
                x: x,
                y: y,
                width: design.width,
                height: design.height,
                fill: design.fill,
                stroke: 'none',
                borderRadius: design.borderRadius
            };
            
            this.editor.elements.push(newElement);
            this.editor.selectedElement = newElement;
            this.editor.render();
            this.editor.updateLayersPanel();
            
            return '🎨 He creado un elemento de diseño para ti. ¿Te gusta?';
        }

        suggestColors() {
            const palettes = [
                ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'],
                ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
                ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a']
            ];
            
            const palette = palettes[Math.floor(Math.random() * palettes.length)];
            return `🎨 Paleta de colores sugerida: ${palette.join(', ')}`;
        }
    }
    window.AIAssistant = AIAssistant;
}

// ResponsiveManager Premium
if (typeof ResponsiveManager === 'undefined') {
    class ResponsiveManager {
        constructor(editor) {
            this.editor = editor;
            this.currentDevice = 'desktop';
            this.deviceSizes = {
                'desktop': { width: 1440, height: 1024, name: 'Desktop' },
                'tablet': { width: 768, height: 1024, name: 'Tablet' },
                'mobile': { width: 375, height: 812, name: 'Mobile' }
            };
        }

        setDevice(device) {
            if (this.deviceSizes[device]) {
                this.currentDevice = device;
                this.updateDeviceView();
            }
        }

        updateDeviceView() {
            const deviceFrame = document.getElementById('device-frame');
            const currentSize = document.getElementById('current-size');
            const deviceInfo = this.deviceSizes[this.currentDevice];

            if (deviceFrame && currentSize) {
                deviceFrame.className = 'device-frame ' + this.currentDevice;
                currentSize.textContent = `${deviceInfo.width}×${deviceInfo.height} - ${deviceInfo.name}`;

                this.editor.canvas.width = deviceInfo.width;
                this.editor.canvas.height = deviceInfo.height;

                this.editor.render();
            }
        }
    }
    window.ResponsiveManager = ResponsiveManager;
}

// ExportManager Premium
if (typeof ExportManager === 'undefined') {
    class ExportManager {
        constructor(editor) {
            this.editor = editor;
        }

        exportAsPNG() {
            const canvas = this.editor.canvas;
            const link = document.createElement('a');
            link.download = `design-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.editor.showNotification('📸 Diseño exportado como PNG');
        }

        exportAsSVG() {
            const elements = this.editor.elements;
            let svgContent = `<svg width="1440" height="1024" xmlns="http://www.w3.org/2000/svg">`;
            
            elements.forEach(element => {
                if (element.type === 'rectangle') {
                    svgContent += `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth || 0}" rx="${element.borderRadius || 0}"/>`;
                } else if (element.type === 'text') {
                    svgContent += `<text x="${element.x}" y="${element.y}" font-family="${element.fontFamily}" font-size="${element.fontSize}" fill="${element.fill}">${element.content}</text>`;
                }
            });
            
            svgContent += '</svg>';
            
            const blob = new Blob([svgContent], { type: 'image/svg+xml' });
            const link = document.createElement('a');
            link.download = `design-${Date.now()}.svg`;
            link.href = URL.createObjectURL(blob);
            link.click();
            this.editor.showNotification('🖼️ Diseño exportado como SVG');
        }
    }
    window.ExportManager = ExportManager;
}

// HistoryManager Premium
if (typeof HistoryManager === 'undefined') {
    class HistoryManager {
        constructor(editor) {
            this.editor = editor;
            this.history = [];
            this.currentIndex = -1;
            this.maxHistory = 50;
            this.saveState();
        }

        saveState() {
            const state = JSON.parse(JSON.stringify(this.editor.elements));
            
            if (this.currentIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.currentIndex + 1);
            }
            
            this.history.push(state);
            this.currentIndex++;
            
            if (this.history.length > this.maxHistory) {
                this.history.shift();
                this.currentIndex--;
            }
        }

        undo() {
            if (this.currentIndex > 0) {
                this.currentIndex--;
                this.editor.elements = JSON.parse(JSON.stringify(this.history[this.currentIndex]));
                this.editor.render();
                this.editor.updateLayersPanel();
                this.editor.showNotification('↩️ Deshecho');
            }
        }

        redo() {
            if (this.currentIndex < this.history.length - 1) {
                this.currentIndex++;
                this.editor.elements = JSON.parse(JSON.stringify(this.history[this.currentIndex]));
                this.editor.render();
                this.editor.updateLayersPanel();
                this.editor.showNotification('↪️ Rehecho');
            }
        }
    }
    window.HistoryManager = HistoryManager;
}

// ==================== EDITOR APP PREMIUM CORREGIDO ====================

if (typeof EditorApp === 'undefined') {
    class EditorApp {
        constructor() {
            this.canvas = document.getElementById('main-canvas');
            if (!this.canvas) {
                console.error('❌ No se encontró el canvas principal');
                return;
            }
            
            this.ctx = this.canvas.getContext('2d');
            this.currentTool = 'select';
            this.elements = [];
            this.selectedElement = null;
            this.zoom = 1;
            this.offset = { x: 0, y: 0 };
            this.isDragging = false;
            this.dragStart = { x: 0, y: 0 };
            
            // Inicializar managers
            this.responsiveManager = new ResponsiveManager(this);
            this.templateManager = new TemplateManager(this);
            this.componentManager = new ComponentManager(this);
            this.aiAssistant = new AIAssistant(this);
            this.layerManager = new LayerManager(this);
            this.exportManager = new ExportManager(this);
            this.historyManager = new HistoryManager(this);
            
            this.init();
        }

        init() {
            this.setupCanvas();
            this.setupEventListeners();
            this.render();
        }

        setupCanvas() {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        resizeCanvas() {
            const deviceMockup = document.getElementById('device-mockup');
            if (deviceMockup && this.canvas) {
                this.canvas.width = deviceMockup.clientWidth;
                this.canvas.height = deviceMockup.clientHeight;
            }
            this.render();
        }

        setupEventListeners() {
            // Herramientas - Solo agregar listeners si los elementos existen
            this.setupToolListeners();
            
            // Componentes Rápidos
            this.setupComponentListeners();
            
            // Dispositivo
            this.setupDeviceListeners();
            
            // Zoom y controles básicos
            this.setupControlListeners();
            
            // Canvas events
            this.setupCanvasListeners();
            
            // Modales
            this.setupModalListeners();
            
            // Teclado
            document.addEventListener('keydown', (e) => this.onKeyDown(e));
        }

        setupToolListeners() {
            const toolButtons = document.querySelectorAll('.tool-btn');
            if (toolButtons.length === 0) {
                console.log('⚠️ No se encontraron botones de herramientas');
                return;
            }
            
            toolButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.currentTool = e.currentTarget.dataset.tool;
                });
            });
        }

        setupComponentListeners() {
            const componentButtons = document.querySelectorAll('.component-btn');
            if (componentButtons.length === 0) {
                console.log('⚠️ No se encontraron botones de componentes');
                return;
            }
            
            componentButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const componentType = e.currentTarget.dataset.component;
                    this.componentManager.addComponent(componentType, 150, 150);
                    this.historyManager.saveState();
                });
            });
        }

        setupDeviceListeners() {
            const deviceButtons = document.querySelectorAll('.device-btn');
            if (deviceButtons.length === 0) {
                console.log('⚠️ No se encontraron botones de dispositivo');
                return;
            }
            
            deviceButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.responsiveManager.setDevice(e.currentTarget.dataset.device);
                });
            });
        }

        setupControlListeners() {
            // Zoom in
            const zoomIn = document.getElementById('zoom-in');
            if (zoomIn) {
                zoomIn.addEventListener('click', () => {
                    this.setZoom(this.zoom * 1.2);
                });
            }
            
            // Zoom out
            const zoomOut = document.getElementById('zoom-out');
            if (zoomOut) {
                zoomOut.addEventListener('click', () => {
                    this.setZoom(this.zoom / 1.2);
                });
            }
            
            // Fit to screen
            const fitScreen = document.getElementById('fit-to-screen');
            if (fitScreen) {
                fitScreen.addEventListener('click', () => {
                    this.fitToScreen();
                });
            }
            
            // Templates
            const templatesBtn = document.getElementById('templates-btn');
            if (templatesBtn) {
                templatesBtn.addEventListener('click', () => {
                    this.openTemplatesModal();
                });
            }
            
            // AI Assistant
            const aiBtn = document.getElementById('ai-assistant');
            if (aiBtn) {
                aiBtn.addEventListener('click', () => {
                    this.openAIModal();
                });
            }
            
            // Export
            const exportBtn = document.getElementById('export-btn');
            if (exportBtn) {
                exportBtn.addEventListener('click', () => {
                    this.exportManager.exportAsPNG();
                });
            }
        }

        setupCanvasListeners() {
            if (!this.canvas) return;
            
            this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
            this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
            this.canvas.addEventListener('mouseup', () => this.onMouseUp());
            this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        }

        setupModalListeners() {
            // AI Send
            const aiSend = document.getElementById('ai-send');
            if (aiSend) {
                aiSend.addEventListener('click', () => this.sendAIMessage());
            }
            
            // Close modals
            document.querySelectorAll('.close').forEach(closeBtn => {
                closeBtn.addEventListener('click', (e) => {
                    e.currentTarget.closest('.modal').style.display = 'none';
                });
            });
            
            // AI Features
            document.querySelectorAll('.feature-card').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    this.useAIFeature(e.currentTarget.dataset.feature);
                });
            });
            
            // Template tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.loadTemplatesByCategory(e.currentTarget.dataset.category);
                });
            });
        }

        // ==================== MÉTODOS DE INTERACCIÓN ====================

        onMouseDown(e) {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offset.x) / this.zoom;
            const y = (e.clientY - rect.top - this.offset.y) / this.zoom;

            this.dragStart = { x, y };
            this.isDragging = true;

            switch (this.currentTool) {
                case 'select':
                    this.selectElement(x, y);
                    break;
                case 'rectangle':
                    this.createRectangle(x, y);
                    this.historyManager.saveState();
                    break;
                case 'text':
                    this.createText(x, y);
                    this.historyManager.saveState();
                    break;
                case 'circle':
                    this.createCircle(x, y);
                    this.historyManager.saveState();
                    break;
            }
        }

        onMouseMove(e) {
            if (!this.isDragging) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left - this.offset.x) / this.zoom;
            const y = (e.clientY - rect.top - this.offset.y) / this.zoom;

            if (this.selectedElement && this.currentTool === 'select') {
                const deltaX = x - this.dragStart.x;
                const deltaY = y - this.dragStart.y;
                this.selectedElement.x += deltaX;
                this.selectedElement.y += deltaY;
                this.dragStart = { x, y };
                this.render();
            }
        }

        onMouseUp() {
            this.isDragging = false;
            if (this.selectedElement) {
                this.historyManager.saveState();
            }
        }

        onWheel(e) {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.setZoom(this.zoom * zoomFactor);
        }

        onKeyDown(e) {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'z':
                        e.preventDefault();
                        this.historyManager.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        this.historyManager.redo();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveProject();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.duplicateSelected();
                        break;
                }
            } else {
                switch (e.key) {
                    case 'Delete':
                    case 'Backspace':
                        this.deleteSelected();
                        break;
                    case 'Escape':
                        this.selectedElement = null;
                        this.render();
                        break;
                }
            }
        }

        // ==================== MÉTODOS DE CREACIÓN ====================

        createRectangle(x, y) {
            const rect = {
                id: `rect_${Date.now()}`,
                type: 'rectangle',
                x: x,
                y: y,
                width: 100,
                height: 80,
                fill: '#6366f1',
                stroke: '#000000',
                strokeWidth: 2,
                borderRadius: 8
            };
            this.elements.push(rect);
            this.selectedElement = rect;
            this.render();
            this.updateLayersPanel();
        }

        createText(x, y) {
            const text = {
                id: `text_${Date.now()}`,
                type: 'text',
                x: x,
                y: y,
                content: 'Nuevo texto',
                fontSize: 16,
                fontFamily: 'Inter',
                fill: '#000000',
                fontWeight: '400'
            };
            this.elements.push(text);
            this.selectedElement = text;
            this.render();
            this.updateLayersPanel();
        }

        createCircle(x, y) {
            const circle = {
                id: `circle_${Date.now()}`,
                type: 'circle',
                x: x,
                y: y,
                radius: 50,
                fill: '#6366f1',
                stroke: '#000000',
                strokeWidth: 2
            };
            this.elements.push(circle);
            this.selectedElement = circle;
            this.render();
            this.updateLayersPanel();
        }

        // ==================== MÉTODOS DE SELECCIÓN ====================

        selectElement(x, y) {
            this.selectedElement = null;
            for (let i = this.elements.length - 1; i >= 0; i--) {
                const element = this.elements[i];
                if (this.isPointInElement(x, y, element)) {
                    this.selectedElement = element;
                    break;
                }
            }
            this.render();
        }

        isPointInElement(x, y, element) {
            switch (element.type) {
                case 'rectangle':
                    return x >= element.x && x <= element.x + element.width &&
                           y >= element.y && y <= element.y + element.height;
                case 'circle':
                    const distance = Math.sqrt((x - element.x) ** 2 + (y - element.y) ** 2);
                    return distance <= element.radius;
                case 'text':
                    return x >= element.x && x <= element.x + 100 &&
                           y >= element.y - 20 && y <= element.y;
                default:
                    return false;
            }
        }

        // ==================== RENDERIZADO ====================

        render() {
            if (!this.ctx) return;
            
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.save();
            this.ctx.translate(this.offset.x, this.offset.y);
            this.ctx.scale(this.zoom, this.zoom);

            // Renderizar elementos
            this.elements.forEach(element => {
                this.renderElement(element);
            });

            // Renderizar selección
            if (this.selectedElement) {
                this.renderSelection(this.selectedElement);
            }

            this.ctx.restore();
        }

        renderElement(element) {
            this.ctx.save();

            const fillColor = element.fill === 'transparent' ? 'transparent' : (element.fill || '#6366f1');
            const strokeColor = element.stroke === 'transparent' ? 'transparent' : (element.stroke || '#000000');
            
            this.ctx.fillStyle = fillColor;
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = element.strokeWidth || 1;

            switch (element.type) {
                case 'rectangle':
                    if (element.borderRadius && element.borderRadius > 0) {
                        this.drawRoundedRect(element.x, element.y, element.width, element.height, element.borderRadius);
                    } else {
                        this.ctx.fillRect(element.x, element.y, element.width, element.height);
                        this.ctx.strokeRect(element.x, element.y, element.width, element.height);
                    }
                    break;
                    
                case 'circle':
                    this.ctx.beginPath();
                    this.ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.stroke();
                    break;
                    
                case 'text':
                    this.ctx.font = `${element.fontWeight || '400'} ${element.fontSize || 16}px ${element.fontFamily || 'Inter'}`;
                    this.ctx.fillStyle = element.fill || '#000000';
                    this.ctx.fillText(element.content, element.x, element.y);
                    break;
            }

            this.ctx.restore();
        }

        drawRoundedRect(x, y, width, height, radius) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + radius, y);
            this.ctx.lineTo(x + width - radius, y);
            this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.ctx.lineTo(x + width, y + height - radius);
            this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.ctx.lineTo(x + radius, y + height);
            this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.ctx.lineTo(x, y + radius);
            this.ctx.quadraticCurveTo(x, y, x + radius, y);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }

        renderSelection(element) {
            this.ctx.save();
            
            this.ctx.strokeStyle = '#6366f1';
            this.ctx.lineWidth = 2 / this.zoom;
            this.ctx.setLineDash([5 / this.zoom, 5 / this.zoom]);
            
            const bounds = this.getElementBounds(element);
            this.ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
            
            this.ctx.setLineDash([]);
            this.ctx.restore();
        }

        getElementBounds(element) {
            switch (element.type) {
                case 'rectangle':
                    return { x: element.x, y: element.y, width: element.width, height: element.height };
                case 'circle':
                    return { 
                        x: element.x - element.radius, 
                        y: element.y - element.radius, 
                        width: element.radius * 2, 
                        height: element.radius * 2 
                    };
                case 'text':
                    return { x: element.x, y: element.y - 20, width: 100, height: 20 };
                default:
                    return { x: element.x, y: element.y, width: 0, height: 0 };
            }
        }

        // ==================== INTERFAZ DE USUARIO ====================

        updateLayersPanel() {
            const layersList = document.getElementById('layers-list');
            if (!layersList) return;

            try {
                this.layerManager.syncWithElements();
                
                layersList.innerHTML = this.elements.map(element => {
                    const elementId = element.id || 'unknown';
                    const displayId = elementId.length > 8 ? elementId.slice(-6) : elementId;
                    
                    return `
                        <div class="layer-item ${this.selectedElement === element ? 'active' : ''}" 
                             data-id="${elementId}">
                            <span class="layer-icon">${this.getLayerIcon(element.type)}</span>
                            <span class="layer-name">${element.type}</span>
                            <span class="layer-type">${displayId}</span>
                        </div>
                    `;
                }).join('');

                layersList.querySelectorAll('.layer-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const elementId = item.dataset.id;
                        this.selectedElement = this.elements.find(el => el.id === elementId);
                        this.render();
                    });
                });

            } catch (error) {
                console.error('❌ Error actualizando panel de capas:', error);
            }
        }

        getLayerIcon(type) {
            const icons = {
                'rectangle': '⬜',
                'circle': '⭕',
                'text': '🔤'
            };
            return icons[type] || '📄';
        }

        setZoom(newZoom) {
            this.zoom = Math.max(0.1, Math.min(5, newZoom));
            const zoomLevel = document.getElementById('zoom-level');
            if (zoomLevel) {
                zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
            }
            this.render();
        }

        fitToScreen() {
            this.zoom = 1;
            this.offset = { x: 0, y: 0 };
            this.setZoom(1);
        }

        // ==================== MÉTODOS DE MODALES ====================

        openTemplatesModal() {
            const modal = document.getElementById('templates-modal');
            if (modal) {
                modal.style.display = 'block';
                this.loadTemplatesByCategory('web');
            }
        }

        openAIModal() {
            const modal = document.getElementById('ai-modal');
            if (modal) {
                modal.style.display = 'block';
            }
        }

        loadTemplatesByCategory(category) {
            const templatesGrid = document.getElementById('modal-templates');
            if (!templatesGrid) return;

            const templates = this.templateManager.getTemplatesByCategory(category);
            
            templatesGrid.innerHTML = templates.map(([key, template]) => `
                <div class="template-card" onclick="editorApp.templateManager.loadTemplate('${key}')">
                    <div class="template-preview">
                        ${template.device === 'mobile' ? '📱' : '💻'}
                    </div>
                    <div class="template-info">
                        <h4>${template.name}</h4>
                        <p>${template.device} • ${template.elements.length} elementos</p>
                    </div>
                </div>
            `).join('');
        }

        async sendAIMessage() {
            const input = document.getElementById('ai-chat-input');
            const message = input.value.trim();
            
            if (!message) return;

            const messagesContainer = document.getElementById('ai-messages');
            if (!messagesContainer) return;

            // Agregar mensaje del usuario
            messagesContainer.innerHTML += `<div class="message user">👤 Tú: ${message}</div>`;
            input.value = '';
            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            try {
                const response = await this.aiAssistant.sendMessage(message);
                
                messagesContainer.innerHTML += `<div class="message assistant">🤖 IA: ${response}</div>`;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;

            } catch (error) {
                messagesContainer.innerHTML += `<div class="message assistant">🤖 IA: Error de conexión</div>`;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }

        useAIFeature(feature) {
            const messagesContainer = document.getElementById('ai-messages');
            if (!messagesContainer) return;

            let response = '';
            
            switch (feature) {
                case 'generate-design':
                    response = this.aiAssistant.generateDesign();
                    break;
                case 'suggest-colors':
                    response = this.aiAssistant.suggestColors();
                    break;
                case 'improve-layout':
                    response = '📐 Sugiero usar una cuadrícula de 8px para mejor espaciado';
                    break;
                case 'generate-content':
                    response = '📝 "Transforma tus ideas en experiencias digitales extraordinarias"';
                    break;
                default:
                    response = '❌ Característica no reconocida';
            }

            messagesContainer.innerHTML += `<div class="message assistant">🤖 IA: ${response}</div>`;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // ==================== MÉTODOS DE GESTIÓN ====================

        autoSave() {
            try {
                localStorage.setItem('editor-pro-plus-autosave', JSON.stringify({
                    elements: this.elements,
                    timestamp: new Date().toISOString()
                }));
            } catch (error) {
                console.error('❌ Error en autoguardado:', error);
            }
        }

        loadAutoSave() {
            try {
                const saved = localStorage.getItem('editor-pro-plus-autosave');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.elements = data.elements || [];
                    this.render();
                    this.updateLayersPanel();
                    this.historyManager.saveState();
                }
            } catch (error) {
                console.error('❌ Error cargando autoguardado:', error);
            }
        }

        saveProject() {
            const project = {
                name: 'Proyecto ' + new Date().toLocaleDateString(),
                elements: this.elements,
                device: this.responsiveManager.currentDevice,
                createdAt: new Date().toISOString()
            };
            
            localStorage.setItem('editor-pro-plus-project', JSON.stringify(project));
            this.showNotification('💾 Proyecto guardado');
        }

        // ==================== MÉTODOS DE EDICIÓN ====================

        duplicateSelected() {
            if (this.selectedElement) {
                const duplicate = JSON.parse(JSON.stringify(this.selectedElement));
                duplicate.id = `${duplicate.type}_${Date.now()}`;
                duplicate.x += 20;
                duplicate.y += 20;
                this.elements.push(duplicate);
                this.selectedElement = duplicate;
                this.render();
                this.updateLayersPanel();
                this.historyManager.saveState();
            }
        }

        deleteSelected() {
            if (this.selectedElement) {
                this.elements = this.elements.filter(el => el.id !== this.selectedElement.id);
                this.selectedElement = null;
                this.render();
                this.updateLayersPanel();
                this.historyManager.saveState();
            }
        }

        // ==================== SISTEMA DE NOTIFICACIONES ====================

        showNotification(message) {
            console.log('📢', message);
            
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 80px;
                right: 20px;
                background: #6366f1;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
                z-index: 10000;
                font-size: 14px;
                font-weight: 500;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 3000);
        }
    }
    window.EditorApp = EditorApp;
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Inicializando Editor Pro+ Premium...');
    
    try {
        window.editorApp = new EditorApp();
        if (window.editorApp.canvas) {
            window.editorApp.loadAutoSave();
            console.log('🚀 Editor Pro+ Premium inicializado correctamente!');
            
            setTimeout(() => {
                window.editorApp.showNotification('🎉 ¡Editor Pro+ listo! Comienza a diseñar.');
            }, 1000);
        } else {
            console.error('❌ No se pudo inicializar EditorApp - Canvas no encontrado');
        }
        
    } catch (error) {
        console.error('❌ Error inicializando EditorApp:', error);
    }
});