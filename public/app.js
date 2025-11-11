class EditorApp {
    constructor() {
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'select';
        this.elements = [];
        this.selectedElement = null;
        this.zoom = 1;
        this.offset = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.isDrawing = false;
        this.currentComponent = null;
        
        // Inicializar managers (se crearán aunque las clases no existan aún)
        this.responsiveManager = new ResponsiveManager(this);
        this.templateManager = new TemplateManager(this);
        this.componentManager = new ComponentManager(this);
        this.aiAssistant = new AIAssistant(this);
        this.layerManager = new LayerManager(this);
        
        // Defensive analytics fallback: asegura que this.analytics exista aún si no se cargó la librería Analytics.
        this.analytics = window.Analytics || {
            trackPerformanceMetric: () => {},
            trackEvent: () => {},
            init: () => {}
        };
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.setupEventListeners();
        this.setupSocket();
        this.setupTemplates();
        this.setupComponents();
        this.render();
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const deviceFrame = document.querySelector('.device-mockup');
        if (deviceFrame) {
            this.canvas.width = deviceFrame.clientWidth;
            this.canvas.height = deviceFrame.clientHeight;
        } else {
            const workspace = document.querySelector('.workspace');
            this.canvas.width = workspace.clientWidth;
            this.canvas.height = workspace.clientHeight;
        }
        this.render();
    }

    setupEventListeners() {
        // Herramientas
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
                this.updatePropertyPanel();
                this.updateCursor();
            });
        });

        // Componentes rápidos
        document.querySelectorAll('.component-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentComponent = e.target.dataset.component;
                this.currentTool = 'component';
                this.updateCursor();
            });
        });

        // Zoom y navegación
        document.getElementById('zoom-in').addEventListener('click', () => this.setZoom(this.zoom * 1.2));
        document.getElementById('zoom-out').addEventListener('click', () => this.setZoom(this.zoom / 1.2));
        document.getElementById('fit-to-screen').addEventListener('click', () => this.fitToScreen());

        // Dispositivo
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const device = e.target.dataset.device;
                this.responsiveManager.setDevice(device);
            });
        });

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('dblclick', (e) => this.onDoubleClick(e));

        // Propiedades
        document.getElementById('fill-color').addEventListener('change', (e) => this.updateSelectedProperty('fill', e.target.value));
        document.getElementById('stroke-color').addEventListener('change', (e) => this.updateSelectedProperty('stroke', e.target.value));
        document.getElementById('stroke-width').addEventListener('change', (e) => this.updateSelectedProperty('strokeWidth', parseInt(e.target.value)));
        document.getElementById('text-content').addEventListener('input', (e) => this.updateSelectedProperty('content', e.target.value));
        document.getElementById('font-family').addEventListener('change', (e) => this.updateSelectedProperty('fontFamily', e.target.value));
        document.getElementById('font-size').addEventListener('change', (e) => this.updateSelectedProperty('fontSize', parseInt(e.target.value)));

        // Tamaño y posición
        document.getElementById('element-width').addEventListener('change', (e) => this.updateSelectedProperty('width', parseInt(e.target.value)));
        document.getElementById('element-height').addEventListener('change', (e) => this.updateSelectedProperty('height', parseInt(e.target.value)));
        document.getElementById('element-x').addEventListener('change', (e) => this.updateSelectedProperty('x', parseInt(e.target.value)));
        document.getElementById('element-y').addEventListener('change', (e) => this.updateSelectedProperty('y', parseInt(e.target.value)));

        // IA y modales
        document.getElementById('ai-assistant').addEventListener('click', () => this.openAIModal());
        document.getElementById('templates-btn').addEventListener('click', () => this.openTemplatesModal());
        document.getElementById('components-btn').addEventListener('click', () => this.openComponentsModal());
        document.getElementById('preview-btn').addEventListener('click', () => this.showPreview());

        // Teclado
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        // Cerrar modales
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });
    }

    setupSocket() {
        this.socket = io();
        this.socket.on('canvas-update', (data) => {
            this.elements = data.elements;
            this.render();
            this.updateLayersPanel();
        });
        
        this.socket.on('user-joined', (userId) => {
            this.showNotification(`Usuario ${userId} se unió al proyecto`);
        });
    }

    setupTemplates() {
        // Cargar categorías de plantillas
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.loadTemplatesByCategory(e.target.dataset.category);
            });
        });
    }

    setupComponents() {
        // Configurar componentes predefinidos
        document.querySelectorAll('.ai-feature-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.useAIFeature(e.target.dataset.feature);
            });
        });
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offset.x) / this.zoom;
        const y = (e.clientY - rect.top - this.offset.y) / this.zoom;

        this.dragStart = { x, y };
        this.isDragging = true;

        // Lógica de herramientas
        switch (this.currentTool) {
            case 'select':
                this.selectElement(x, y);
                break;
            case 'rectangle':
                this.createRectangle(x, y);
                break;
            case 'circle':
                this.createCircle(x, y);
                break;
            case 'text':
                this.createText(x, y);
                break;
            case 'line':
                this.createLine(x, y);
                break;
            case 'frame':
                this.createFrame(x, y);
                break;
            case 'component':
                if (this.currentComponent) {
                    this.addComponent(this.currentComponent, x, y);
                }
                break;
        }
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left - this.offset.x) / this.zoom;
        const y = (e.clientY - rect.top - this.offset.y) / this.zoom;

        if (this.isDragging && this.selectedElement) {
            if (this.currentTool === 'select') {
                // Mover elemento
                const deltaX = x - this.dragStart.x;
                const deltaY = y - this.dragStart.y;
                this.selectedElement.x += deltaX;
                this.selectedElement.y += deltaY;
                this.dragStart = { x, y };
            } else if (this.isDrawing) {
                // Redimensionar durante creación
                this.selectedElement.width = x - this.selectedElement.x;
                this.selectedElement.height = y - this.selectedElement.y;
            }
            this.render();
        }
    }

    onMouseUp() {
        this.isDragging = false;
        this.isDrawing = false;
        this.syncWithServer();
        this.updatePropertiesPanel();
    }

    onDoubleClick(e) {
        if (this.currentTool === 'select' && this.selectedElement && this.selectedElement.type === 'text') {
            this.activateTextEditing(this.selectedElement);
        }
    }

    onWheel(e) {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.setZoom(this.zoom * zoomFactor);
    }

    onKeyDown(e) {
        // Atajos de teclado
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'z':
                    e.preventDefault();
                    this.undo();
                    break;
                case 'y':
                    e.preventDefault();
                    this.redo();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveProject();
                    break;
                case 'd':
                    e.preventDefault();
                    this.duplicateSelected();
                    break;
                case 'g':
                    e.preventDefault();
                    this.toggleGrid();
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

    // Métodos de herramientas
    createRectangle(x, y) {
        const rect = {
            id: 'rect_' + Date.now(),
            type: 'rectangle',
            x, y,
            width: 100, height: 80,
            fill: document.getElementById('fill-color').value,
            stroke: document.getElementById('stroke-color').value,
            strokeWidth: parseInt(document.getElementById('stroke-width').value),
            borderRadius: 0
        };
        this.elements.push(rect);
        this.selectedElement = rect;
        this.isDrawing = true;
        this.render();
        this.updateLayersPanel();
    }

    createCircle(x, y) {
        const circle = {
            id: 'circle_' + Date.now(),
            type: 'circle',
            x, y,
            radius: 50,
            fill: document.getElementById('fill-color').value,
            stroke: document.getElementById('stroke-color').value,
            strokeWidth: parseInt(document.getElementById('stroke-width').value)
        };
        this.elements.push(circle);
        this.selectedElement = circle;
        this.render();
        this.updateLayersPanel();
    }

    createText(x, y) {
        const text = {
            id: 'text_' + Date.now(),
            type: 'text',
            x, y,
            content: 'Nuevo texto',
            fontSize: parseInt(document.getElementById('font-size').value) || 16,
            fontFamily: document.getElementById('font-family').value,
            fill: document.getElementById('fill-color').value,
            fontWeight: 'normal'
        };
        this.elements.push(text);
        this.selectedElement = text;
        this.render();
        this.updateLayersPanel();
        this.activateTextEditing(text);
    }

    createLine(x, y) {
        const line = {
            id: 'line_' + Date.now(),
            type: 'line',
            x1: x, y1: y,
            x2: x + 100, y2: y,
            stroke: document.getElementById('stroke-color').value,
            strokeWidth: parseInt(document.getElementById('stroke-width').value)
        };
        this.elements.push(line);
        this.selectedElement = line;
        this.isDrawing = true;
        this.render();
        this.updateLayersPanel();
    }

    createFrame(x, y) {
        const frame = {
            id: 'frame_' + Date.now(),
            type: 'frame',
            x, y,
            width: 400, height: 300,
            fill: 'transparent',
            stroke: '#e2e8f0',
            strokeWidth: 2,
            name: 'Nuevo Frame'
        };
        this.elements.push(frame);
        this.selectedElement = frame;
        this.isDrawing = true;
        this.render();
        this.updateLayersPanel();
    }

    selectElement(x, y) {
        this.selectedElement = null;
        for (let i = this.elements.length - 1; i >= 0; i--) {
            const element = this.elements[i];
            if (this.isPointInElement(x, y, element)) {
                this.selectedElement = element;
                break;
            }
        }
        this.updatePropertiesPanel();
        this.render();
    }

    isPointInElement(x, y, element) {
        switch (element.type) {
            case 'rectangle':
            case 'frame':
                return x >= element.x && x <= element.x + element.width &&
                       y >= element.y && y <= element.y + element.height;
            case 'circle':
                const distance = Math.sqrt((x - element.x) ** 2 + (y - element.y) ** 2);
                return distance <= element.radius;
            case 'text':
                // Aproximación simple para texto
                return x >= element.x && x <= element.x + 100 &&
                       y >= element.y - 20 && y <= element.y;
            default:
                return false;
        }
    }

    // Métodos de plantillas y componentes
    loadTemplate(templateId) {
        const template = WebTemplates[templateId] || MobileTemplates[templateId];
        if (template) {
            this.elements = JSON.parse(JSON.stringify(template.elements));
            this.responsiveManager.setDevice(template.device);
            this.render();
            this.updateLayersPanel();
            this.showNotification(`Plantilla "${template.name}" cargada`);
        }
    }

    addComponent(componentType, x, y) {
        const component = ButtonComponents[componentType];
        if (component) {
            const bgElement = { 
                ...component.element, 
                x, y, 
                id: 'comp_' + Date.now() 
            };
            const textElement = { 
                ...component.text, 
                x: x + bgElement.width/2 - 30, 
                y: y + bgElement.height/2 + 5,
                id: 'text_' + Date.now()
            };
            
            this.elements.push(bgElement);
            this.elements.push(textElement);
            this.selectedElement = bgElement;
            this.render();
            this.updateLayersPanel();
            this.showNotification(`Componente ${component.name} agregado`);
        }
    }

    // Métodos de UI
    updatePropertiesPanel() {
        if (this.selectedElement) {
            // Actualizar valores de propiedades
            document.getElementById('element-width').value = Math.round(this.selectedElement.width || 0);
            document.getElementById('element-height').value = Math.round(this.selectedElement.height || 0);
            document.getElementById('element-x').value = Math.round(this.selectedElement.x);
            document.getElementById('element-y').value = Math.round(this.selectedElement.y);
            
            document.getElementById('fill-color').value = this.selectedElement.fill || '#000000';
            document.getElementById('stroke-color').value = this.selectedElement.stroke || '#000000';
            document.getElementById('stroke-width').value = this.selectedElement.strokeWidth || 1;

            // Mostrar/ocultar paneles según el tipo
            const textPanel = document.getElementById('text-properties');
            textPanel.style.display = this.selectedElement.type === 'text' ? 'block' : 'none';

            if (this.selectedElement.type === 'text') {
                document.getElementById('text-content').value = this.selectedElement.content || '';
                document.getElementById('font-family').value = this.selectedElement.fontFamily || 'Inter';
                document.getElementById('font-size').value = this.selectedElement.fontSize || 16;
            }
        }
    }

    updatePropertyPanel() {
        const textPanel = document.getElementById('text-properties');
        textPanel.style.display = this.currentTool === 'text' ? 'block' : 'none';
    }

    updateLayersPanel() {
        const layersList = document.getElementById('layers-list');
        layersList.innerHTML = this.elements.map(element => `
            <div class="layer-item ${this.selectedElement === element ? 'active' : ''}" 
                 data-id="${element.id}">
                <span class="layer-icon">${this.getLayerIcon(element.type)}</span>
                <span class="layer-name">${element.name || element.type} - ${element.id.slice(-4)}</span>
                <div class="layer-actions">
                    <button class="layer-visibility">👁️</button>
                    <button class="layer-lock">🔒</button>
                </div>
            </div>
        `).join('');

        // Event listeners para las capas
        layersList.querySelectorAll('.layer-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('layer-actions')) {
                    const elementId = item.dataset.id;
                    this.selectedElement = this.elements.find(el => el.id === elementId);
                    this.updatePropertiesPanel();
                    this.render();
                }
            });
        });
    }

    getLayerIcon(type) {
        const icons = {
            'rectangle': '⬜',
            'circle': '⭕',
            'text': '🔤',
            'line': '📏',
            'frame': '📦',
            'component': '🧩'
        };
        return icons[type] || '📄';
    }

    updateCursor() {
        const cursors = {
            'select': 'default',
            'rectangle': 'crosshair',
            'circle': 'crosshair',
            'text': 'text',
            'line': 'crosshair',
            'pen': 'crosshair',
            'frame': 'crosshair',
            'component': 'copy'
        };
        this.canvas.style.cursor = cursors[this.currentTool] || 'default';
    }

    // Métodos de visualización
    setZoom(newZoom) {
        this.zoom = Math.max(0.1, Math.min(5, newZoom));
        document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';
        this.render();
    }

    fitToScreen() {
        if (this.elements.length === 0) return;
        
        // Calcular bounds de todos los elementos
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        this.elements.forEach(element => {
            const bounds = this.getElementBounds(element);
            minX = Math.min(minX, bounds.x);
            minY = Math.min(minY, bounds.y);
            maxX = Math.max(maxX, bounds.x + bounds.width);
            maxY = Math.max(maxY, bounds.y + bounds.height);
        });

        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        
        // Calcular zoom para ajustar al viewport
        const scaleX = this.canvas.width / contentWidth;
        const scaleY = this.canvas.height / contentHeight;
        this.zoom = Math.min(scaleX, scaleY) * 0.9; // 10% de margen
        
        // Centrar
        this.offset.x = (this.canvas.width - contentWidth * this.zoom) / 2 - minX * this.zoom;
        this.offset.y = (this.canvas.height - contentHeight * this.zoom) / 2 - minY * this.zoom;
        
        this.setZoom(this.zoom);
    }

    getElementBounds(element) {
        switch (element.type) {
            case 'rectangle':
            case 'frame':
                return { x: element.x, y: element.y, width: element.width, height: element.height };
            case 'circle':
                return { x: element.x - element.radius, y: element.y - element.radius, 
                         width: element.radius * 2, height: element.radius * 2 };
            case 'text':
                return { x: element.x, y: element.y - 20, width: 100, height: 20 };
            default:
                return { x: element.x, y: element.y, width: 0, height: 0 };
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Aplicar zoom y offset
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
        this.ctx.fillStyle = element.fill || 'transparent';
        this.ctx.strokeStyle = element.stroke || 'transparent';
        this.ctx.lineWidth = element.strokeWidth || 1;

        switch (element.type) {
            case 'rectangle':
                if (element.borderRadius > 0) {
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
                this.ctx.font = `${element.fontWeight} ${element.fontSize}px ${element.fontFamily}`;
                this.ctx.fillStyle = element.fill;
                this.ctx.fillText(element.content, element.x, element.y);
                break;
            case 'line':
                this.ctx.beginPath();
                this.ctx.moveTo(element.x1, element.y1);
                this.ctx.lineTo(element.x2, element.y2);
                this.ctx.stroke();
                break;
            case 'frame':
                this.ctx.strokeStyle = element.stroke;
                this.ctx.lineWidth = element.strokeWidth;
                this.ctx.strokeRect(element.x, element.y, element.width, element.height);
                
                // Nombre del frame
                this.ctx.fillStyle = '#64748b';
                this.ctx.font = '12px Inter';
                this.ctx.fillText(element.name, element.x + 5, element.y - 5);
                break;
        }
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
        this.ctx.strokeStyle = '#4f46e5';
        this.ctx.lineWidth = 2 / this.zoom;
        this.ctx.setLineDash([5 / this.zoom, 5 / this.zoom]);
        
        const bounds = this.getElementBounds(element);
        this.ctx.strokeRect(bounds.x - 4, bounds.y - 4, bounds.width + 8, bounds.height + 8);
        
        // Handles de redimensionamiento
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = '#4f46e5';
        const handles = [
            { x: bounds.x - 4, y: bounds.y - 4 },
            { x: bounds.x + bounds.width/2, y: bounds.y - 4 },
            { x: bounds.x + bounds.width + 4, y: bounds.y - 4 },
            { x: bounds.x + bounds.width + 4, y: bounds.y + bounds.height/2 },
            { x: bounds.x + bounds.width + 4, y: bounds.y + bounds.height + 4 },
            { x: bounds.x + bounds.width/2, y: bounds.y + bounds.height + 4 },
            { x: bounds.x - 4, y: bounds.y + bounds.height + 4 },
            { x: bounds.x - 4, y: bounds.y + bounds.height/2 }
        ];
        
        handles.forEach(handle => {
            this.ctx.fillRect(handle.x - 3, handle.y - 3, 6, 6);
        });
    }

    // Métodos de utilidad
    activateTextEditing(textElement) {
        // Implementar edición de texto en el canvas
        const input = document.createElement('input');
        input.type = 'text';
        input.value = textElement.content;
        input.style.position = 'absolute';
        input.style.left = (textElement.x * this.zoom + this.offset.x) + 'px';
        input.style.top = (textElement.y * this.zoom + this.offset.y - 20) + 'px';
        input.style.font = `${textElement.fontWeight} ${textElement.fontSize * this.zoom}px ${textElement.fontFamily}`;
        input.style.color = textElement.fill;
        input.style.background = 'transparent';
        input.style.border = '1px dashed #4f46e5';
        
        input.onblur = () => {
            textElement.content = input.value;
            document.body.removeChild(input);
            this.render();
        };
        
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                input.blur();
            }
        };
        
        document.body.appendChild(input);
        input.focus();
        input.select();
    }

    updateSelectedProperty(property, value) {
        if (this.selectedElement) {
            this.selectedElement[property] = value;
            this.render();
            this.syncWithServer();
        }
    }

    // Métodos de modales
    openAIModal() {
        document.getElementById('ai-modal').style.display = 'block';
    }

    openTemplatesModal() {
        document.getElementById('templates-modal').style.display = 'block';
        this.loadTemplatesByCategory('web');
    }

    openComponentsModal() {
        document.getElementById('components-modal').style.display = 'block';
        this.loadComponents();
    }

    showPreview() {
        this.responsiveManager.showPreview();
    }

    // Métodos de plantillas
    loadTemplatesByCategory(category) {
        const templatesGrid = document.getElementById('modal-templates');
        const templates = { ...WebTemplates, ...MobileTemplates };
        const filtered = Object.entries(templates).filter(([key, template]) => 
            template.category === category
        );

        templatesGrid.innerHTML = filtered.map(([key, template]) => `
            <div class="template-item" onclick="editorApp.loadTemplate('${key}')">
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

    loadComponents() {
        const componentsLibrary = document.getElementById('components-library');
        componentsLibrary.innerHTML = Object.entries(ButtonComponents).map(([key, component]) => `
            <div class="template-item" onclick="editorApp.addComponent('${key}', 100, 100)">
                <div class="template-preview" style="background: ${component.element.fill}; display: flex; align-items: center; justify-content: center;">
                    <span style="color: ${component.text.fill}; font-family: ${component.text.fontFamily}">
                        ${component.text.content}
                    </span>
                </div>
                <div class="template-info">
                    <h4>${component.name}</h4>
                    <p>Botón</p>
                </div>
            </div>
        `).join('');
    }

    // Métodos de IA
    useAIFeature(feature) {
        switch (feature) {
            case 'generate-design':
                this.aiAssistant.generateDesign();
                break;
            case 'improve-layout':
                this.aiAssistant.improveLayout();
                break;
            case 'suggest-colors':
                this.aiAssistant.suggestColors();
                break;
            case 'generate-content':
                this.aiAssistant.generateContent();
                break;
        }
    }

    // Métodos de gestión
    syncWithServer() {
        if (this.socket) {
            this.socket.emit('canvas-update', {
                projectId: 'default',
                elements: this.elements
            });
        }
        
        // Autoguardado local
        this.autoSave();
    }

    autoSave() {
        localStorage.setItem('editor-pro-plus-autosave', JSON.stringify({
            elements: this.elements,
            timestamp: new Date().toISOString()
        }));
    }

    loadAutoSave() {
        const saved = localStorage.getItem('editor-pro-plus-autosave');
        if (saved) {
            const data = JSON.parse(saved);
            this.elements = data.elements || [];
            this.render();
            this.updateLayersPanel();
            this.showNotification('Autoguardado recuperado');
        }
    }

    saveProject() {
        const project = {
            name: 'Proyecto ' + new Date().toLocaleDateString(),
            elements: this.elements,
            device: this.responsiveManager.currentDevice,
            createdAt: new Date().toISOString()
        };
        
        // Aquí iría la lógica para guardar en el servidor
        localStorage.setItem('editor-pro-plus-project', JSON.stringify(project));
        this.showNotification('Proyecto guardado');
    }

    // Métodos de edición
    undo() {
        // Implementar historial
        this.showNotification('Deshacer');
    }

    redo() {
        this.showNotification('Rehacer');
    }

    duplicateSelected() {
        if (this.selectedElement) {
            const duplicate = JSON.parse(JSON.stringify(this.selectedElement));
            duplicate.id = duplicate.type + '_' + Date.now();
            duplicate.x += 20;
            duplicate.y += 20;
            this.elements.push(duplicate);
            this.selectedElement = duplicate;
            this.render();
            this.updateLayersPanel();
        }
    }

    deleteSelected() {
        if (this.selectedElement) {
            this.elements = this.elements.filter(el => el.id !== this.selectedElement.id);
            this.selectedElement = null;
            this.render();
            this.updateLayersPanel();
            this.syncWithServer();
        }
    }

    toggleGrid() {
        const grid = document.getElementById('grid-overlay');
        grid.style.display = grid.style.display === 'none' ? 'block' : 'none';
    }

    // Utilidades
    showNotification(message) {
        // Implementar sistema de notificaciones
        console.log('Notification:', message);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.editorApp = new EditorApp();
    window.editorApp.loadAutoSave();
});
