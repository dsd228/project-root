// init-core.js - Núcleo del Editor corregido y con soporte adicional para herramientas: shape, pen, line, frame, path
console.log('🚀 Inicializando Editor Pro+ Premium... (init-core con herramientas extendidas)');

/* 
  NOTA: Este archivo contiene el EditorApp central con soporte añadido para:
  - 'shape' (alias rectangle), 'pen' (dibujo libre), 'line', 'frame'
  - Delegación de imagen/iconos a EnhancedTools si existe (o fallback).
  Mantén las demás clases managers (TemplateManager, ComponentManager, etc.) de tu versión original.
*/

// ----------------- (Asegúrate de conservar las definiciones originales de tus managers aquí) -----------------
// Si copias/pegas el contenido, conserva las clases TemplateManager, ComponentManager, LayerManager,
// AIAssistant, ResponsiveManager, ExportManager, HistoryManager, etc., exactamente como en tu repo.
// -----------------------------------------------------------------------------------------------------------

// ==================== EDITOR APP (extendido) ====================
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

        // Inicializar managers (asume que las clases existen en el archivo original)
        this.responsiveManager = new ResponsiveManager(this);
        this.templateManager = new TemplateManager(this);
        this.componentManager = new ComponentManager(this);
        this.aiAssistant = new AIAssistant(this);
        this.layerManager = new LayerManager(this);
        this.exportManager = new ExportManager(this);
        this.historyManager = new HistoryManager(this);

        // State usado para dibujo libre (pen)
        this._currentPath = null;

        // EnhancedTools (si existe, instanciamos y inicializamos)
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

    setupEventListeners() {
        this.setupToolListeners();
        this.setupComponentListeners();
        this.setupDeviceListeners();
        this.setupControlListeners();
        this.setupCanvasListeners();
        this.setupModalListeners();

        // Global keyboard shortcuts (defensivos)
        document.addEventListener('keydown', (e) => {
            // Ctrl+I -> Upload Image
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
                e.preventDefault();
                this.uploadImage();
                return;
            }
            // Ctrl+B -> Enhanced createButton (if available)
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
                e.preventDefault();
                if (this.enhancedTools && typeof this.enhancedTools.createButton === 'function') {
                    try { this.enhancedTools.createButton(); } catch (err) { console.warn('createButton failed', err); }
                } else if (this.componentManager) {
                    this.componentManager.addComponent('primary-button', 150, 150);
                }
                return;
            }

            // Other editor shortcuts handled elsewhere if needed
            this.onKeyDown && this.onKeyDown(e);
        });
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

                // Normalizar nombres del UI a las implementaciones internas
                let toolName = e.currentTarget.dataset.tool;
                if (!toolName) {
                    console.warn('tool button missing data-tool');
                    return;
                }
                toolName = toolName.toLowerCase();
                if (toolName === 'shape') toolName = 'rectangle';
                if (toolName === 'pencil') toolName = 'pen';
                if (toolName === 'pen') toolName = 'pen';
                if (toolName === 'frame') toolName = 'frame';
                if (toolName === 'line') toolName = 'line';
                // fallback: allow direct names that match implementation
                this.currentTool = toolName;
                console.log('Herramienta seleccionada:', this.currentTool);
            });
        });
    }

    setupCanvasListeners() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
    }

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
                this.historyManager.saveState && this.historyManager.saveState();
                break;
            case 'frame':
                this.createFrame(x, y);
                this.historyManager.saveState && this.historyManager.saveState();
                break;
            case 'text':
                this.createText(x, y);
                this.historyManager.saveState && this.historyManager.saveState();
                break;
            case 'circle':
                this.createCircle(x, y);
                this.historyManager.saveState && this.historyManager.saveState();
                break;
            case 'line':
                this.createLine(x, y);
                this.isDrawing = true;
                break;
            case 'pen':
                // Start a freehand path
                this._currentPath = {
                    id: `path_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'path',
                    points: [{ x, y }],
                    stroke: '#000000',
                    strokeWidth: 2
                };
                this.elements.push(this._currentPath);
                this.selectedElement = this._currentPath;
                this.isDrawing = true;
                break;
            default:
                console.log('Tool not handled on mousedown:', this.currentTool);
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
                this.selectedElement.x2 = x;
                this.selectedElement.y2 = y;
            } else if (this.currentTool === 'pen' && this.selectedElement.type === 'path') {
                this.selectedElement.points.push({ x, y });
            } else if (this.currentTool === 'select' && this.selectedElement) {
                const deltaX = x - this.dragStart.x;
                const deltaY = y - this.dragStart.y;
                if (this.selectedElement.x !== undefined) this.selectedElement.x += deltaX;
                if (this.selectedElement.y !== undefined) this.selectedElement.y += deltaY;
                // For line endpoints move both
                if (this.selectedElement.type === 'line') {
                    this.selectedElement.x1 += deltaX;
                    this.selectedElement.y1 += deltaY;
                    this.selectedElement.x2 += deltaX;
                    this.selectedElement.y2 += deltaY;
                }
                this.dragStart = { x, y };
            }
            this.render();
        }
    }

    onMouseUp() {
        this.isDragging = false;
        if (this.isDrawing) {
            this.isDrawing = false;
            this._currentPath = null;
            if (this.historyManager) this.historyManager.saveState();
        } else {
            if (this.historyManager) this.historyManager.saveState();
        }
    }

    // ==================== CREATION HELPERS ====================
    createLine(x, y) {
        const line = {
            id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'line',
            x1: x,
            y1: y,
            x2: x + 100,
            y2: y,
            stroke: '#000000',
            strokeWidth: 2
        };
        this.elements.push(line);
        this.selectedElement = line;
        this.render();
        this.updateLayersPanel && this.updateLayersPanel();
    }

    createFrame(x, y) {
        const frame = {
            id: `frame_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'frame',
            x: x,
            y: y,
            width: 600,
            height: 400,
            fill: 'transparent',
            stroke: '#e2e8f0',
            strokeWidth: 2,
            name: 'Nuevo Frame'
        };
        this.elements.push(frame);
        this.selectedElement = frame;
        this.render();
        this.updateLayersPanel && this.updateLayersPanel();
    }

    // createRectangle/createText/createCircle: usa las implementaciones originales que tenías en el archivo
    // Asegúrate de mantener las funciones originales y no duplicarlas.

    // ==================== RENDER / DRAW ====================
    render() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.offset.x, this.offset.y);
        this.ctx.scale(this.zoom, this.zoom);

        this.elements.forEach(element => {
            this.renderElement(element);
        });

        if (this.selectedElement) {
            this.renderSelection && this.renderSelection(this.selectedElement);
        }

        this.ctx.restore();
    }

    renderElement(element) {
        if (!element) return;
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

            case 'frame':
                this.ctx.strokeStyle = element.stroke || '#e2e8f0';
                this.ctx.lineWidth = element.strokeWidth || 2;
                this.ctx.strokeRect(element.x, element.y, element.width, element.height);
                this.ctx.fillStyle = '#64748b';
                this.ctx.font = '12px Inter';
                this.ctx.fillText(element.name || 'Frame', element.x + 6, element.y - 6);
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

            case 'line':
                this.ctx.beginPath();
                this.ctx.moveTo(element.x1, element.y1);
                this.ctx.lineTo(element.x2, element.y2);
                this.ctx.strokeStyle = element.stroke || '#000';
                this.ctx.lineWidth = element.strokeWidth || 2;
                this.ctx.stroke();
                break;

            case 'path':
                if (Array.isArray(element.points) && element.points.length > 0) {
                    this.ctx.beginPath();
                    const p0 = element.points[0];
                    this.ctx.moveTo(p0.x, p0.y);
                    for (let i = 1; i < element.points.length; i++) {
                        const p = element.points[i];
                        this.ctx.lineTo(p.x, p.y);
                    }
                    this.ctx.strokeStyle = element.stroke || '#000';
                    this.ctx.lineWidth = element.strokeWidth || 2;
                    this.ctx.stroke();
                }
                break;

            case 'image':
                // Prefer enhancedTools rendering if available
                try {
                    if (this.enhancedTools && typeof this.enhancedTools.renderImageElement === 'function') {
                        this.enhancedTools.renderImageElement(this.ctx, element);
                    } else if (element._img && element._img.complete) {
                        this.ctx.drawImage(element._img, element.x, element.y, element.width || element._img.width, element.height || element._img.height);
                    } else {
                        this.ctx.fillStyle = '#e2e8f0';
                        this.ctx.fillRect(element.x, element.y, element.width || 100, element.height || 60);
                        this.ctx.fillStyle = '#64748b';
                        this.ctx.font = '12px Inter';
                        this.ctx.fillText('Image', element.x + 8, element.y + 20);
                    }
                } catch (err) {
                    console.warn('image render error', err);
                }
                break;

            default:
                // unknown: skip
                break;
        }

        this.ctx.restore();
    }

    getLayerIcon(type) {
        const icons = {
            'rectangle': '⬜',
            'circle': '⭕',
            'text': '🔤',
            'line': '📏',
            'frame': '📦',
            'path': '✏️',
            'image': '🖼️'
        };
        return icons[type] || '📄';
    }

    // ==================== ENHANCED TOOLS HELPERS ====================
    uploadImage() {
        if (this.enhancedTools && typeof this.enhancedTools.openImageUpload === 'function') {
            try { this.enhancedTools.openImageUpload(); } catch (err) { console.warn('uploadImage failed', err); }
        } else {
            // fallback: show notification
            this.showNotification && this.showNotification('🔍 Upload image feature not available');
        }
    }

    insertIcon() {
        if (this.enhancedTools && typeof this.enhancedTools.openIconLibrary === 'function') {
            try { this.enhancedTools.openIconLibrary(); } catch (err) { console.warn('insertIcon failed', err); }
        } else {
            this.showNotification && this.showNotification('🔍 Icon library not available');
        }
    }
}

// Inicialización (igual que antes)
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Inicializando Editor Pro+ Premium...');
    try {
        window.editorApp = new EditorApp();
        if (window.editorApp && window.editorApp.canvas) {
            window.editorApp.loadAutoSave && window.editorApp.loadAutoSave();
            console.log('🚀 Editor Pro+ Premium inicializado correctamente!');
            setTimeout(() => {
                window.editorApp.showNotification && window.editorApp.showNotification('🎉 ¡Editor Pro+ listo! Comienza a diseñar.');
            }, 1000);
        } else {
            console.error('❌ No se pudo inicializar EditorApp - Canvas no encontrado');
        }
    } catch (error) {
        console.error('❌ Error inicializando EditorApp:', error);
    }
});
