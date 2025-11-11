// init-core.js - Núcleo del Editor con soporte añadido para shape/pen/line/frame y con managers completos.
// Copia completa y autónoma del core para pegar en public/init-core.js

console.log('🚀 Inicializando Editor Pro+ Premium... (init-core con herramientas extendidas)');

/* ==================== MANAGERS ==================== */

class TemplateManager {
    constructor(editor) {
        this.editor = editor;
        this.templates = {
            'landing-moderna': {
                name: 'Landing Page Moderna',
                category: 'web',
                device: 'desktop',
                elements: [
                    { id: 'bg_1', type: 'rectangle', x: 0, y: 0, width: 1440, height: 800, fill: '#f3f4f6', stroke: 'none' },
                    { id: 'navbar_1', type: 'rectangle', x: 0, y: 0, width: 1440, height: 80, fill: '#ffffff', stroke: 'none' }
                ]
            },
            'app-movil': {
                name: 'App Móvil Premium',
                category: 'mobile',
                device: 'mobile',
                elements: [
                    { id: 'bg_mobile', type: 'rectangle', x: 0, y: 0, width: 375, height: 812, fill: '#f3f4f6', stroke: 'none' }
                ]
            }
        };
    }

    getTemplatesByCategory(category) {
        return Object.entries(this.templates).filter(([k, t]) => t.category === category);
    }

    loadTemplate(templateId) {
        const template = this.templates[templateId];
        if (!template) return false;
        this.editor.elements = [];
        template.elements.forEach(el => {
            this.editor.elements.push({ ...el, id: el.id || `${el.type}_${Date.now()}` });
        });
        if (template.device && this.editor.responsiveManager && typeof this.editor.responsiveManager.setDevice === 'function') {
            this.editor.responsiveManager.setDevice(template.device);
        }
        this.editor.render();
        this.editor.updateLayersPanel && this.editor.updateLayersPanel();
        this.editor.showNotification && this.editor.showNotification(`🎨 Plantilla "${template.name}" cargada`);
        return true;
    }
}

class ComponentManager {
    constructor(editor) {
        this.editor = editor;
        this.components = {
            'primary-button': {
                name: 'Botón Primario',
                element: { type: 'rectangle', width: 140, height: 48, fill: '#6366f1', stroke: 'none', borderRadius: 12 },
                text: { type: 'text', content: 'Click Me', fontSize: 16, fontFamily: 'Inter', fill: '#ffffff', fontWeight: '600' }
            }
        };
    }

    addComponent(componentType, x, y) {
        const component = this.components[componentType];
        if (!component) return false;
        const ts = Date.now();
        const rand = Math.random().toString(36).substr(2, 9);
        const bg = { ...component.element, x: x || 150, y: y || 150, id: `comp_${ts}_${rand}` };
        const text = component.text ? { ...component.text, x: (x || 150) + (bg.width / 2) - 30, y: (y || 150) + (bg.height / 2) + 5, id: `text_${ts}_${rand}` } : null;
        this.editor.elements.push(bg);
        if (text) this.editor.elements.push(text);
        this.editor.selectedElement = bg;
        this.editor.render();
        this.editor.updateLayersPanel && this.editor.updateLayersPanel();
        this.editor.showNotification && this.editor.showNotification(`🧩 Componente "${component.name}" agregado`);
        return true;
    }
}

class LayerManager {
    constructor(editor) {
        this.editor = editor;
        this.layers = [];
    }
    syncWithElements() {
        this.layers = this.editor.elements.map(e => ({ id: e.id, name: e.name || `${e.type} ${e.id.slice(-4)}`, type: e.type, visible: true, locked: false, element: e }));
    }
}

class AIAssistant {
    constructor(editor) { this.editor = editor; }
    async sendMessage(message) {
        try {
            const resp = await this.callOllama(message);
            return resp;
        } catch (err) {
            return '⚠️ No se pudo conectar con el asistente IA.';
        }
    }
    async callOllama(prompt) {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: 'llama3', prompt: `Eres un asistente de diseño: ${prompt}`, stream: false })
        });
        if (!response.ok) throw new Error('Ollama error');
        const data = await response.json();
        return data.response;
    }
    generateDesign() {
        const designs = [{ fill: '#6366f1', width: 200, height: 120, borderRadius: 16 }, { fill: '#10b981', width: 180, height: 180, borderRadius: 20 }];
        const d = designs[Math.floor(Math.random() * designs.length)];
        const el = { id: `ai_${Date.now()}`, type: 'rectangle', x: 120 + Math.random() * 200, y: 120 + Math.random() * 200, width: d.width, height: d.height, fill: d.fill, stroke: 'none', borderRadius: d.borderRadius };
        this.editor.elements.push(el);
        this.editor.selectedElement = el;
        this.editor.render();
        this.editor.updateLayersPanel && this.editor.updateLayersPanel();
        return '🎨 Elemento de diseño creado';
    }
    suggestColors() {
        const palettes = [['#6366f1','#8b5cf6'], ['#10b981','#34d399'], ['#f59e0b','#fbbf24']];
        const p = palettes[Math.floor(Math.random()*palettes.length)];
        return `🎨 Paleta sugerida: ${p.join(', ')}`;
    }
}

class ResponsiveManager {
    constructor(editor) {
        this.editor = editor;
        this.currentDevice = 'desktop';
        this.deviceSizes = { desktop: { width: 1440, height: 1024, name: 'Desktop' }, tablet: { width: 768, height: 1024, name: 'Tablet' }, mobile: { width: 375, height: 812, name: 'Mobile' } };
    }
    setDevice(device) {
        if (!this.deviceSizes[device]) return;
        this.currentDevice = device;
        const deviceFrame = document.getElementById('device-frame');
        const currentSize = document.getElementById('current-size');
        const info = this.deviceSizes[device];
        if (deviceFrame) deviceFrame.className = 'device-frame ' + device;
        if (currentSize) currentSize.textContent = `${info.width}×${info.height} - ${info.name}`;
        if (this.editor && this.editor.canvas) {
            this.editor.canvas.width = info.width;
            this.editor.canvas.height = info.height;
            this.editor.render();
        }
    }
    showPreview() { /* optional preview */ }
}

class ExportManager {
    constructor(editor) { this.editor = editor; }
    exportAsPNG() {
        try {
            const canvas = this.editor.canvas;
            const link = document.createElement('a');
            link.download = `design-${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            this.editor.showNotification && this.editor.showNotification('📸 Diseño exportado como PNG');
        } catch (err) { console.error('Export PNG failed', err); }
    }
    exportAsSVG() {
        try {
            const elems = this.editor.elements;
            let svg = `<svg xmlns="http://www.w3.org/2000/svg">`;
            elems.forEach(e => {
                if (e.type === 'rectangle') svg += `<rect x="${e.x}" y="${e.y}" width="${e.width}" height="${e.height}" fill="${e.fill}" />`;
                if (e.type === 'text') svg += `<text x="${e.x}" y="${e.y}" font-size="${e.fontSize}">${e.content}</text>`;
            });
            svg += `</svg>`;
            const blob = new Blob([svg], { type: 'image/svg+xml' });
            const link = document.createElement('a');
            link.download = `design-${Date.now()}.svg`;
            link.href = URL.createObjectURL(blob);
            link.click();
            this.editor.showNotification && this.editor.showNotification('🖼️ Diseño exportado como SVG');
        } catch (err) { console.error('Export SVG failed', err); }
    }
}

class HistoryManager {
    constructor(editor) { this.editor = editor; this.history = []; this.currentIndex = -1; this.maxHistory = 50; this.saveState(); }
    saveState() {
        try {
            const s = JSON.parse(JSON.stringify(this.editor.elements || []));
            if (this.currentIndex < this.history.length - 1) this.history = this.history.slice(0, this.currentIndex + 1);
            this.history.push(s); this.currentIndex++;
            if (this.history.length > this.maxHistory) { this.history.shift(); this.currentIndex--; }
        } catch (err) { console.warn('history save failed', err); }
    }
    undo() {
        if (this.currentIndex > 0) { this.currentIndex--; this.editor.elements = JSON.parse(JSON.stringify(this.history[this.currentIndex])); this.editor.render(); this.editor.updateLayersPanel && this.editor.updateLayersPanel(); this.editor.showNotification && this.editor.showNotification('↩️ Deshecho'); }
    }
    redo() {
        if (this.currentIndex < this.history.length - 1) { this.currentIndex++; this.editor.elements = JSON.parse(JSON.stringify(this.history[this.currentIndex])); this.editor.render(); this.editor.updateLayersPanel && this.editor.updateLayersPanel(); this.editor.showNotification && this.editor.showNotification('↪️ Rehecho'); }
    }
}

/* ==================== EDITOR APP ==================== */

class EditorApp {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        if (!this.canvas) { console.error('❌ No se encontró el canvas principal'); return; }
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'select';
        this.elements = [];
        this.selectedElement = null;
        this.zoom = 1;
        this.offset = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };

        // Defensive manager initialization (in case some files didn't load)
        this.responsiveManager = (typeof ResponsiveManager === 'function') ? new ResponsiveManager(this) : { setDevice: () => {}, showPreview: () => {}, currentDevice: 'desktop' };
        this.templateManager = (typeof TemplateManager === 'function') ? new TemplateManager(this) : { getTemplatesByCategory: () => [], loadTemplate: () => false };
        this.componentManager = (typeof ComponentManager === 'function') ? new ComponentManager(this) : { addComponent: () => false };
        this.aiAssistant = (typeof AIAssistant === 'function') ? new AIAssistant(this) : { sendMessage: async () => 'IA no disponible', generateDesign: () => null, suggestColors: () => '' };
        this.layerManager = (typeof LayerManager === 'function') ? new LayerManager(this) : { syncWithElements: () => {} };
        this.exportManager = (typeof ExportManager === 'function') ? new ExportManager(this) : { exportAsPNG: () => {}, exportAsSVG: () => {} };
        this.historyManager = (typeof HistoryManager === 'function') ? new HistoryManager(this) : { saveState: () => {}, undo: () => {}, redo: () => {} };

        // path state for pen tool
        this._currentPath = null;

        // Try to instantiate EnhancedTools fallback (if present)
        try {
            if (typeof window.EnhancedTools === 'function') {
                this.enhancedTools = new window.EnhancedTools(this);
                if (typeof this.enhancedTools.init === 'function') {
                    try { this.enhancedTools.init({ app: this }); } catch (err) { console.warn('enhancedTools.init failed', err); }
                }
            } else {
                this.enhancedTools = null;
            }
        } catch (err) {
            console.warn('Failed to instantiate EnhancedTools', err);
            this.enhancedTools = null;
        }

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
        this.setupToolListeners();
        this.setupComponentListeners();
        this.setupDeviceListeners();
        this.setupControlListeners();
        this.setupCanvasListeners();
        this.setupModalListeners();

        // Global shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
                e.preventDefault();
                this.uploadImage();
            }
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                if (this.enhancedTools && typeof this.enhancedTools.createButton === 'function') {
                    try { this.enhancedTools.createButton(); } catch (err) { console.warn('createButton failed', err); }
                } else if (this.componentManager) {
                    this.componentManager.addComponent('primary-button', 150, 150);
                }
            }
        });
    }

    setupToolListeners() {
        const toolButtons = document.querySelectorAll('.tool-btn');
        if (!toolButtons || toolButtons.length === 0) { console.log('⚠️ No se encontraron botones de herramientas'); return; }
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                let name = e.currentTarget.dataset.tool || '';
                name = name.toLowerCase();
                if (name === 'shape') name = 'rectangle';
                if (name === 'pencil') name = 'pen';
                this.currentTool = name;
                console.log('Herramienta seleccionada:', this.currentTool);
            });
        });
    }

    setupComponentListeners() {
        const componentButtons = document.querySelectorAll('.component-btn');
        if (!componentButtons || componentButtons.length === 0) { console.log('⚠️ No se encontraron botones de componentes'); return; }
        componentButtons.forEach(btn => {
            btn.addEventListener('click', (e) => { const t = e.currentTarget.dataset.component; this.componentManager.addComponent(t, 150, 150); this.historyManager.saveState && this.historyManager.saveState(); });
        });
    }

    setupDeviceListeners() {
        const deviceButtons = document.querySelectorAll('.device-btn');
        if (!deviceButtons || deviceButtons.length === 0) { console.log('⚠️ No se encontraron botones de dispositivo'); return; }
        deviceButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.responsiveManager.setDevice(e.currentTarget.dataset.device);
            });
        });
    }

    setupControlListeners() {
        const zi = document.getElementById('zoom-in'); if (zi) zi.addEventListener('click', () => this.setZoom(this.zoom * 1.2));
        const zo = document.getElementById('zoom-out'); if (zo) zo.addEventListener('click', () => this.setZoom(this.zoom / 1.2));
        const fit = document.getElementById('fit-to-screen'); if (fit) fit.addEventListener('click', () => this.fitToScreen());
        const templatesBtn = document.getElementById('templates-btn'); if (templatesBtn) templatesBtn.addEventListener('click', () => this.openTemplatesModal());
        const aiBtn = document.getElementById('ai-assistant'); if (aiBtn) aiBtn.addEventListener('click', () => this.openAIModal());
        const exportBtn = document.getElementById('export-btn'); if (exportBtn) exportBtn.addEventListener('click', () => this.exportManager.exportAsPNG());
    }

    setupCanvasListeners() {
        if (!this.canvas) return;
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
    }

    setupModalListeners() {
        const aiSend = document.getElementById('ai-send'); if (aiSend) aiSend.addEventListener('click', () => this.sendAIMessage());
        document.querySelectorAll('.close').forEach(c => c.addEventListener('click', (e) => e.currentTarget.closest('.modal').style.display = 'none'));
        document.querySelectorAll('.feature-card').forEach(btn => btn.addEventListener('click', (e) => this.useAIFeature(e.currentTarget.dataset.feature)));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', (e) => { document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active')); e.currentTarget.classList.add('active'); this.loadTemplatesByCategory(e.currentTarget.dataset.category); }));
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offset.x) / this.zoom;
        const y = (e.clientY - rect.top - this.offset.y) / this.zoom;
        this.dragStart = { x, y };
        this.isDragging = true;
        switch (this.currentTool) {
            case 'select': this.selectElement(x, y); break;
            case 'rectangle': this.createRectangle(x, y); this.historyManager.saveState && this.historyManager.saveState(); break;
            case 'frame': this.createFrame(x, y); this.historyManager.saveState && this.historyManager.saveState(); break;
            case 'text': this.createText(x, y); this.historyManager.saveState && this.historyManager.saveState(); break;
            case 'circle': this.createCircle(x, y); this.historyManager.saveState && this.historyManager.saveState(); break;
            case 'line': this.createLine(x, y); this.isDrawing = true; break;
            case 'pen':
                this._currentPath = { id: `path_${Date.now()}`, type: 'path', points: [{ x, y }], stroke: '#000', strokeWidth: 2 };
                this.elements.push(this._currentPath);
                this.selectedElement = this._currentPath;
                this.isDrawing = true;
                break;
            default: console.log('Tool not handled on mousedown:', this.currentTool);
        }
        this.render();
    }

    onMouseMove(e) {
        if (!this.isDragging) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offset.x) / this.zoom;
        const y = (e.clientY - rect.top - this.offset.y) / this.zoom;
        if (this.isDrawing && this.selectedElement) {
            if (this.currentTool === 'line' && this.selectedElement.type === 'line') {
                this.selectedElement.x2 = x; this.selectedElement.y2 = y;
            } else if (this.currentTool === 'pen' && this.selectedElement.type === 'path') {
                this.selectedElement.points.push({ x, y });
            } else if (this.currentTool === 'select' && this.selectedElement) {
                const dx = x - this.dragStart.x, dy = y - this.dragStart.y;
                if (this.selectedElement.x !== undefined) this.selectedElement.x += dx;
                if (this.selectedElement.y !== undefined) this.selectedElement.y += dy;
                if (this.selectedElement.type === 'line') { this.selectedElement.x1 += dx; this.selectedElement.y1 += dy; this.selectedElement.x2 += dx; this.selectedElement.y2 += dy; }
                this.dragStart = { x, y };
            }
            this.render();
        }
    }

    onMouseUp() {
        this.isDragging = false;
        if (this.isDrawing) { this.isDrawing = false; this._currentPath = null; this.historyManager.saveState && this.historyManager.saveState(); } else { this.historyManager.saveState && this.historyManager.saveState(); }
    }

    createLine(x, y) {
        const line = { id: `line_${Date.now()}`, type: 'line', x1: x, y1: y, x2: x + 100, y2: y, stroke: '#000', strokeWidth: 2 };
        this.elements.push(line); this.selectedElement = line; this.render(); this.updateLayersPanel && this.updateLayersPanel();
    }

    createFrame(x, y) {
        const frame = { id: `frame_${Date.now()}`, type: 'frame', x, y, width: 600, height: 400, fill: 'transparent', stroke: '#e2e8f0', strokeWidth: 2, name: 'Nuevo Frame' };
        this.elements.push(frame); this.selectedElement = frame; this.render(); this.updateLayersPanel && this.updateLayersPanel();
    }

    createRectangle(x, y) {
        const rect = { id: `rect_${Date.now()}`, type: 'rectangle', x, y, width: 100, height: 80, fill: '#6366f1', stroke: '#000', strokeWidth: 2, borderRadius: 8 };
        this.elements.push(rect); this.selectedElement = rect; this.render(); this.updateLayersPanel && this.updateLayersPanel();
    }

    createText(x, y) {
        const t = { id: `text_${Date.now()}`, type: 'text', x, y, content: 'Nuevo texto', fontSize: 16, fontFamily: 'Inter', fill: '#000', fontWeight: '400' };
        this.elements.push(t); this.selectedElement = t; this.render(); this.updateLayersPanel && this.updateLayersPanel();
    }

    createCircle(x, y) {
        const c = { id: `circle_${Date.now()}`, type: 'circle', x, y, radius: 50, fill: '#6366f1', stroke: '#000', strokeWidth: 2 };
        this.elements.push(c); this.selectedElement = c; this.render(); this.updateLayersPanel && this.updateLayersPanel();
    }

    selectElement(x, y) {
        this.selectedElement = null;
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const el = this.elements[i];
            if (this.isPointInElement(x, y, el)) { this.selectedElement = el; break; }
        }
        this.render();
    }

    isPointInElement(x, y, el) {
        switch (el.type) {
            case 'rectangle': case 'frame': return x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height;
            case 'circle': const d = Math.sqrt((x - el.x) ** 2 + (y - el.y) ** 2); return d <= el.radius;
            case 'text': return x >= el.x && x <= el.x + 100 && y >= el.y - 20 && y <= el.y;
            case 'line': // simple bounding box for line selection
                const minX = Math.min(el.x1, el.x2), maxX = Math.max(el.x1, el.x2), minY = Math.min(el.y1, el.y2), maxY = Math.max(el.y1, el.y2);
                return x >= minX - 6 && x <= maxX + 6 && y >= minY - 6 && y <= maxY + 6;
            case 'path': // approximate by checking points
                if (!el.points || !el.points.length) return false;
                for (let p of el.points) { if (Math.hypot(p.x - x, p.y - y) < 6) return true; }
                return false;
            default: return false;
        }
    }

    render() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save(); this.ctx.translate(this.offset.x, this.offset.y); this.ctx.scale(this.zoom, this.zoom);
        this.elements.forEach(el => this.renderElement(el));
        if (this.selectedElement) this.renderSelection && this.renderSelection(this.selectedElement);
        this.ctx.restore();
    }

    renderElement(el) {
        if (!el) return;
        this.ctx.save();
        const fillColor = el.fill === 'transparent' ? 'transparent' : (el.fill || '#6366f1');
        const strokeColor = el.stroke === 'transparent' ? 'transparent' : (el.stroke || '#000');
        this.ctx.fillStyle = fillColor; this.ctx.strokeStyle = strokeColor; this.ctx.lineWidth = el.strokeWidth || 1;
        switch (el.type) {
            case 'rectangle':
                if (el.borderRadius && el.borderRadius > 0) this.drawRoundedRect(el.x, el.y, el.width, el.height, el.borderRadius);
                else { this.ctx.fillRect(el.x, el.y, el.width, el.height); this.ctx.strokeRect(el.x, el.y, el.width, el.height); }
                break;
            case 'frame':
                this.ctx.strokeStyle = el.stroke || '#e2e8f0'; this.ctx.lineWidth = el.strokeWidth || 2;
                this.ctx.strokeRect(el.x, el.y, el.width, el.height);
                this.ctx.fillStyle = '#64748b'; this.ctx.font = '12px Inter'; this.ctx.fillText(el.name || 'Frame', el.x + 6, el.y - 6);
                break;
            case 'circle': this.ctx.beginPath(); this.ctx.arc(el.x, el.y, el.radius, 0, Math.PI*2); this.ctx.fill(); this.ctx.stroke(); break;
            case 'text': this.ctx.font = `${el.fontWeight||'400'} ${el.fontSize||16}px ${el.fontFamily||'Inter'}`; this.ctx.fillStyle = el.fill || '#000'; this.ctx.fillText(el.content, el.x, el.y); break;
            case 'line':
                this.ctx.beginPath(); this.ctx.moveTo(el.x1, el.y1); this.ctx.lineTo(el.x2, el.y2); this.ctx.strokeStyle = el.stroke || '#000'; this.ctx.lineWidth = el.strokeWidth || 2; this.ctx.stroke(); break;
            case 'path':
                if (Array.isArray(el.points) && el.points.length) { this.ctx.beginPath(); this.ctx.moveTo(el.points[0].x, el.points[0].y); for (let i=1;i<el.points.length;i++) this.ctx.lineTo(el.points[i].x, el.points[i].y); this.ctx.strokeStyle = el.stroke || '#000'; this.ctx.lineWidth = el.strokeWidth || 2; this.ctx.stroke(); }
                break;
            case 'image':
                try {
                    if (this.enhancedTools && typeof this.enhancedTools.renderImageElement === 'function') { this.enhancedTools.renderImageElement(this.ctx, el); }
                    else if (el._img && el._img.complete) { this.ctx.drawImage(el._img, el.x, el.y, el.width || el._img.width, el.height || el._img.height); }
                    else { this.ctx.fillStyle = '#e2e8f0'; this.ctx.fillRect(el.x, el.y, el.width || 100, el.height || 60); this.ctx.fillStyle = '#64748b'; this.ctx.font = '12px Inter'; this.ctx.fillText('Image', el.x + 8, el.y + 20); }
                } catch (err) { console.warn('image render error', err); }
                break;
            default: break;
        }
        this.ctx.restore();
    }

    drawRoundedRect(x, y, w, h, r) {
        this.ctx.beginPath(); this.ctx.moveTo(x + r, y); this.ctx.lineTo(x + w - r, y); this.ctx.quadraticCurveTo(x + w, y, x + w, y + r); this.ctx.lineTo(x + w, y + h - r); this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h); this.ctx.lineTo(x + r, y + h); this.ctx.quadraticCurveTo(x, y + h, x, y + h - r); this.ctx.lineTo(x, y + r); this.ctx.quadraticCurveTo(x, y, x + r, y); this.ctx.closePath(); this.ctx.fill(); this.ctx.stroke();
    }

    renderSelection(el) {
        try {
            const bounds = this.getElementBounds(el);
            this.ctx.save();
            this.ctx.strokeStyle = '#6366f1';
            this.ctx.lineWidth = 2 / this.zoom;
            this.ctx.setLineDash([5 / this.zoom, 5 / this.zoom]);
            this.ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
            this.ctx.setLineDash([]);
            this.ctx.restore();
        } catch (err) { console.warn('renderSelection failed', err); }
    }

    getElementBounds(el) {
        switch (el.type) {
            case 'rectangle': case 'frame': return { x: el.x, y: el.y, width: el.width, height: el.height };
            case 'circle': return { x: el.x - el.radius, y: el.y - el.radius, width: el.radius*2, height: el.radius*2 };
            case 'text': return { x: el.x, y: el.y - 20, width: 100, height: 20 };
            case 'line': const minX = Math.min(el.x1, el.x2), minY = Math.min(el.y1, el.y2), w = Math.abs(el.x2 - el.x1), h = Math.abs(el.y2 - el.y1); return { x: minX, y: minY, width: w, height: h };
            case 'path': if (el.points && el.points.length) { const xs = el.points.map(p=>p.x), ys = el.points.map(p=>p.y); const minxx = Math.min(...xs), minyy = Math.min(...ys), maxxx = Math.max(...xs), maxyy = Math.max(...ys); return { x: minxx, y: minyy, width: maxxx-minxx, height: maxyy-minyy }; } return { x: el.x||0, y: el.y||0, width:0, height:0 };
            default: return { x: el.x || 0, y: el.y || 0, width: el.width || 0, height: el.height || 0 };
        }
    }

    updateLayersPanel() {
        const layersList = document.getElementById('layers-list');
        if (!layersList) return;
        try {
            this.layerManager.syncWithElements && this.layerManager.syncWithElements();
            layersList.innerHTML = this.elements.map(el => {
                const id = el.id || 'unknown';
                const displayId = id.length > 8 ? id.slice(-6) : id;
                return `<div class="layer-item ${this.selectedElement===el?'active':''}" data-id="${id}"><span class="layer-icon">${this.getLayerIcon(el.type)}</span><span class="layer-name">${el.type}</span><span class="layer-type">${displayId}</span></div>`;
            }).join('');
            layersList.querySelectorAll('.layer-item').forEach(item => {
                item.addEventListener('click', () => { const id = item.dataset.id; this.selectedElement = this.elements.find(e => e.id === id); this.render(); });
            });
        } catch (err) { console.error('Error updating layers panel', err); }
    }

    getLayerIcon(type) {
        const icons = { rectangle: '⬜', circle: '⭕', text: '🔤', line: '📏', frame: '📦', path: '✏️', image: '🖼️' };
        return icons[type] || '📄';
    }

    setZoom(z) { this.zoom = Math.max(0.1, Math.min(5, z)); const zl = document.getElementById('zoom-level'); if (zl) zl.textContent = Math.round(this.zoom*100)+'%'; this.render(); }
    fitToScreen() { this.zoom = 1; this.offset = { x:0, y:0 }; this.setZoom(1); }

    openTemplatesModal() { const m = document.getElementById('templates-modal'); if (m) { m.style.display = 'block'; this.loadTemplatesByCategory('web'); } }
    openAIModal() { const m = document.getElementById('ai-modal'); if (m) m.style.display = 'block'; }

    loadTemplatesByCategory(category) {
        const grid = document.getElementById('modal-templates'); if (!grid) return; const templates = this.templateManager.getTemplatesByCategory(category); grid.innerHTML = templates.map(([k,t]) => `<div class="template-card" onclick="editorApp.templateManager.loadTemplate('${k}')"><div class="template-preview">${t.device==='mobile'?'📱':'💻'}</div><div class="template-info"><h4>${t.name}</h4><p>${t.device} • ${t.elements.length} elementos</p></div></div>`).join('');
    }

    async sendAIMessage() {
        const input = document.getElementById('ai-chat-input'); if (!input) return; const msg = input.value.trim(); if (!msg) return;
        const container = document.getElementById('ai-messages'); if (!container) return;
        container.innerHTML += `<div class="message user">👤 Tú: ${msg}</div>`; input.value = ''; container.scrollTop = container.scrollHeight;
        try { const resp = await this.aiAssistant.sendMessage(msg); container.innerHTML += `<div class="message assistant">🤖 IA: ${resp}</div>`; container.scrollTop = container.scrollHeight; } catch (err) { container.innerHTML += `<div class="message assistant">🤖 IA: Error de conexión</div>`; container.scrollTop = container.scrollHeight; }
    }

    useAIFeature(feature) {
        const container = document.getElementById('ai-messages'); if (!container) return; let resp = ''; switch (feature) { case 'generate-design': resp = this.aiAssistant.generateDesign(); break; case 'suggest-colors': resp = this.aiAssistant.suggestColors(); break; default: resp = '❌ Característica no reconocida'; } container.innerHTML += `<div class="message assistant">🤖 IA: ${resp}</div>`; container.scrollTop = container.scrollHeight;
    }

    autoSave() {
        try { localStorage.setItem('editor-pro-plus-autosave', JSON.stringify({ elements: this.elements, timestamp: new Date().toISOString() })); } catch (err) { console.error('autoguardado failed', err); }
    }
    loadAutoSave() {
        try { const s = localStorage.getItem('editor-pro-plus-autosave'); if (s) { const d = JSON.parse(s); this.elements = d.elements || []; this.render(); this.updateLayersPanel && this.updateLayersPanel(); this.historyManager.saveState && this.historyManager.saveState(); } } catch (err) { console.error('load autosave failed', err); }
    }

    saveProject() {
        const p = { name: 'Proyecto ' + new Date().toLocaleDateString(), elements: this.elements, device: this.responsiveManager.currentDevice, createdAt: new Date().toISOString() };
        localStorage.setItem('editor-pro-plus-project', JSON.stringify(p)); this.showNotification && this.showNotification('💾 Proyecto guardado');
    }

    duplicateSelected() { if (this.selectedElement) { const dup = JSON.parse(JSON.stringify(this.selectedElement)); dup.id = `${dup.type}_${Date.now()}`; dup.x += 20; dup.y += 20; this.elements.push(dup); this.selectedElement = dup; this.render(); this.updateLayersPanel && this.updateLayersPanel(); this.historyManager.saveState && this.historyManager.saveState(); } }

    deleteSelected() { if (this.selectedElement) { this.elements = this.elements.filter(el => el.id !== this.selectedElement.id); this.selectedElement = null; this.render(); this.updateLayersPanel && this.updateLayersPanel(); this.historyManager.saveState && this.historyManager.saveState(); } }

    toggleGrid() { const grid = document.getElementById('grid-overlay'); if (grid) grid.style.display = grid.style.display === 'none' ? 'block' : 'none'; }

    showNotification(msg) { console.log('📢', msg); const ex = document.querySelector('.editor-notification'); if (ex) ex.remove(); const n = document.createElement('div'); n.className = 'editor-notification'; n.style.cssText = 'position:fixed;top:80px;right:20px;background:#6366f1;color:white;padding:12px 20px;border-radius:8px;z-index:10000;font-size:14px;font-weight:500;'; n.textContent = msg; document.body.appendChild(n); setTimeout(() => { if (document.body.contains(n)) document.body.removeChild(n); }, 3000); }

    uploadImage() {
        if (this.enhancedTools && typeof this.enhancedTools.openImageUpload === 'function') { try { this.enhancedTools.openImageUpload(); } catch (err) { console.warn('uploadImage failed', err); } } else { this.showNotification && this.showNotification('🔍 Upload image feature not available'); }
    }

    insertIcon() {
        if (this.enhancedTools && typeof this.enhancedTools.openIconLibrary === 'function') { try { this.enhancedTools.openIconLibrary(); } catch (err) { console.warn('insertIcon failed', err); } } else { this.showNotification && this.showNotification('🔍 Icon library not available'); }
    }
}

/* ==================== INICIALIZACIÓN ==================== */
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Inicializando Editor Pro+ Premium...');
    try {
        window.editorApp = new EditorApp();
        if (window.editorApp && window.editorApp.canvas) {
            window.editorApp.loadAutoSave && window.editorApp.loadAutoSave();
            console.log('🚀 Editor Pro+ Premium inicializado correctamente!');
            setTimeout(() => { window.editorApp.showNotification && window.editorApp.showNotification('🎉 ¡Editor Pro+ listo! Comienza a diseñar.'); }, 1000);
        } else console.error('❌ No se pudo inicializar EditorApp - Canvas no encontrado');
    } catch (error) {
        console.error('❌ Error inicializando EditorApp:', error);
    }
});
