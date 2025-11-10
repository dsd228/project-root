// auto-layout.js - Sistema de Auto-Layout Avanzado
class AutoLayoutManager {
    constructor(editor) {
        this.editor = editor;
        this.layouts = new Map();
        this.init();
    }

    init() {
        this.setupLayoutUI();
    }

    setupLayoutUI() {
        // Agregar controles de layout al toolbar
        this.addLayoutToolbar();
    }

    addLayoutToolbar() {
        const workspaceHeader = document.querySelector('.workspace-header');
        if (!workspaceHeader) return;

        const layoutControls = document.createElement('div');
        layoutControls.className = 'layout-controls';
        layoutControls.innerHTML = `
            <div class="layout-buttons">
                <button class="control-btn" id="auto-layout-horizontal" title="Horizontal Layout">
                    <i class="ri-layout-row-line"></i>
                </button>
                <button class="control-btn" id="auto-layout-vertical" title="Vertical Layout">
                    <i class="ri-layout-column-line"></i>
                </button>
                <button class="control-btn" id="auto-layout-grid" title="Grid Layout">
                    <i class="ri-grid-line"></i>
                </button>
                <button class="control-btn" id="distribute-horizontal" title="Distribute Horizontally">
                    <i class="ri-space"></i>
                </button>
                <button class="control-btn" id="distribute-vertical" title="Distribute Vertically">
                    <i class="ri-space-vertical"></i>
                </button>
            </div>
        `;

        workspaceHeader.querySelector('.workspace-controls').prepend(layoutControls);
        this.setupLayoutEvents();
    }

    setupLayoutEvents() {
        document.getElementById('auto-layout-horizontal')?.addEventListener('click', () => {
            this.applyHorizontalLayout();
        });

        document.getElementById('auto-layout-vertical')?.addEventListener('click', () => {
            this.applyVerticalLayout();
        });

        document.getElementById('auto-layout-grid')?.addEventListener('click', () => {
            this.applyGridLayout();
        });

        document.getElementById('distribute-horizontal')?.addEventListener('click', () => {
            this.distributeHorizontally();
        });

        document.getElementById('distribute-vertical')?.addEventListener('click', () => {
            this.distributeVertically();
        });
    }

    applyHorizontalLayout(elements = null, spacing = 20, alignment = 'center') {
        const targetElements = elements || this.getSelectedElements();
        if (targetElements.length < 2) {
            this.editor.showNotification('⚠️ Select at least 2 elements');
            return;
        }

        // Ordenar elementos por posición X actual
        targetElements.sort((a, b) => a.x - b.x);

        // Calcular posición inicial
        const startX = Math.min(...targetElements.map(el => el.x));
        let currentX = startX;

        // Aplicar layout horizontal
        targetElements.forEach(element => {
            element.x = currentX;
            
            // Alinear verticalmente
            if (alignment === 'center') {
                const maxHeight = Math.max(...targetElements.map(el => el.height));
                element.y = startX + (maxHeight - element.height) / 2;
            } else if (alignment === 'top') {
                element.y = startX;
            }

            currentX += element.width + spacing;
        });

        this.editor.render();
        this.editor.updateLayersPanel();
        this.editor.showNotification('↔️ Applied horizontal layout');
    }

    applyVerticalLayout(elements = null, spacing = 20, alignment = 'center') {
        const targetElements = elements || this.getSelectedElements();
        if (targetElements.length < 2) {
            this.editor.showNotification('⚠️ Select at least 2 elements');
            return;
        }

        // Ordenar elementos por posición Y actual
        targetElements.sort((a, b) => a.y - b.y);

        // Calcular posición inicial
        const startY = Math.min(...targetElements.map(el => el.y));
        let currentY = startY;

        // Aplicar layout vertical
        targetElements.forEach(element => {
            element.y = currentY;
            
            // Alinear horizontalmente
            if (alignment === 'center') {
                const maxWidth = Math.max(...targetElements.map(el => el.width));
                element.x = startY + (maxWidth - element.width) / 2;
            } else if (alignment === 'left') {
                element.x = startY;
            }

            currentY += element.height + spacing;
        });

        this.editor.render();
        this.editor.updateLayersPanel();
        this.editor.showNotification('↕️ Applied vertical layout');
    }

    applyGridLayout(elements = null, columns = 3, rowGap = 20, columnGap = 20) {
        const targetElements = elements || this.getSelectedElements();
        if (targetElements.length < 2) {
            this.editor.showNotification('⚠️ Select at least 2 elements');
            return;
        }

        // Calcular dimensiones del grid
        const startX = Math.min(...targetElements.map(el => el.x));
        const startY = Math.min(...targetElements.map(el => el.y));
        
        const cellWidth = Math.max(...targetElements.map(el => el.width));
        const cellHeight = Math.max(...targetElements.map(el => el.height));

        // Aplicar grid
        targetElements.forEach((element, index) => {
            const row = Math.floor(index / columns);
            const col = index % columns;

            element.x = startX + col * (cellWidth + columnGap);
            element.y = startY + row * (cellHeight + rowGap);
        });

        this.editor.render();
        this.editor.updateLayersPanel();
        this.editor.showNotification('🔲 Applied grid layout');
    }

    distributeHorizontally(elements = null) {
        const targetElements = elements || this.getSelectedElements();
        if (targetElements.length < 3) {
            this.editor.showNotification('⚠️ Select at least 3 elements');
            return;
        }

        // Ordenar por posición X
        targetElements.sort((a, b) => a.x - b.x);

        const firstElement = targetElements[0];
        const lastElement = targetElements[targetElements.length - 1];
        const totalWidth = lastElement.x - firstElement.x;
        const spacing = totalWidth / (targetElements.length - 1);

        // Distribuir equitativamente
        targetElements.forEach((element, index) => {
            element.x = firstElement.x + (spacing * index);
        });

        this.editor.render();
        this.editor.updateLayersPanel();
        this.editor.showNotification('⇆ Distributed horizontally');
    }

    distributeVertically(elements = null) {
        const targetElements = elements || this.getSelectedElements();
        if (targetElements.length < 3) {
            this.editor.showNotification('⚠️ Select at least 3 elements');
            return;
        }

        // Ordenar por posición Y
        targetElements.sort((a, b) => a.y - b.y);

        const firstElement = targetElements[0];
        const lastElement = targetElements[targetElements.length - 1];
        const totalHeight = lastElement.y - firstElement.y;
        const spacing = totalHeight / (targetElements.length - 1);

        // Distribuir equitativamente
        targetElements.forEach((element, index) => {
            element.y = firstElement.y + (spacing * index);
        });

        this.editor.render();
        this.editor.updateLayersPanel();
        this.editor.showNotification('⇅ Distributed vertically');
    }

    getSelectedElements() {
        if (this.editor.selectedElement) {
            return [this.editor.selectedElement];
        }
        return this.editor.elements.filter(el => el.selected);
    }

    // Layout constraints inteligentes
    setConstraints(element, constraints) {
        if (!element.constraints) {
            element.constraints = {};
        }

        Object.assign(element.constraints, constraints);
        this.applyConstraints(element);
    }

    applyConstraints(element) {
        if (!element.constraints) return;

        const constraints = element.constraints;
        const parent = this.findParentElement(element);

        if (parent) {
            if (constraints.left && constraints.right) {
                element.width = parent.width - constraints.left - constraints.right;
                element.x = parent.x + constraints.left;
            }

            if (constraints.top && constraints.bottom) {
                element.height = parent.height - constraints.top - constraints.bottom;
                element.y = parent.y + constraints.top;
            }

            if (constraints.centerX) {
                element.x = parent.x + (parent.width - element.width) / 2;
            }

            if (constraints.centerY) {
                element.y = parent.y + (parent.height - element.height) / 2;
            }
        }
    }

    findParentElement(element) {
        // Buscar elemento padre (para frames/groups)
        return this.editor.elements.find(el => 
            el.type === 'frame' && 
            element.x >= el.x && 
            element.x <= el.x + el.width &&
            element.y >= el.y && 
            element.y <= el.y + el.height
        );
    }

    // Smart guides para alineación
    showSmartGuides() {
        this.smartGuidesEnabled = true;
        this.calculateSmartGuides();
    }

    calculateSmartGuides() {
        const elements = this.editor.elements;
        const guides = [];

        // Calcular alineaciones posibles
        elements.forEach(element => {
            const edges = {
                left: element.x,
                right: element.x + element.width,
                top: element.y,
                bottom: element.y + element.height,
                centerX: element.x + element.width / 2,
                centerY: element.y + element.height / 2
            };

            // Comparar con otros elementos
            elements.forEach(otherElement => {
                if (element === otherElement) return;

                const otherEdges = {
                    left: otherElement.x,
                    right: otherElement.x + otherElement.width,
                    top: otherElement.y,
                    bottom: otherElement.y + otherElement.height,
                    centerX: otherElement.x + otherElement.width / 2,
                    centerY: otherElement.y + otherElement.height / 2
                };

                // Buscar alineaciones
                Object.entries(edges).forEach(([edge, value]) => {
                    Object.entries(otherEdges).forEach(([otherEdge, otherValue]) => {
                        if (Math.abs(value - otherValue) < 5) { // 5px de tolerancia
                            guides.push({
                                type: `${edge}-${otherEdge}`,
                                value: value,
                                elements: [element, otherElement]
                            });
                        }
                    });
                });
            });
        });

        return guides;
    }

    // Auto-resize basado en contenido
    autoResizeToContent(element) {
        if (element.type === 'text') {
            // Calcular ancho del texto
            this.editor.ctx.font = `${element.fontWeight || '400'} ${element.fontSize || 16}px ${element.fontFamily || 'Inter'}`;
            const metrics = this.editor.ctx.measureText(element.content);
            element.width = metrics.width + 20; // Padding
            element.height = element.fontSize + 10;
        }
    }
}