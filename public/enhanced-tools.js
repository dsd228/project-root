// enhanced-tools.js - Herramientas Mejoradas para Prototipado Web
class EnhancedTools {
    constructor(editor) {
        this.editor = editor;
        this.images = new Map();
        this.icons = new Map();
        this.frames = new Map();
        this.currentFrame = null;
        this.init();
    }

    init() {
        this.setupEnhancedTools();
        this.loadIconLibrary();
        this.setupImageHandling();
    }

    setupEnhancedTools() {
        this.addEnhancedToolbar();
        this.createFramesPanel();
    }

    addEnhancedToolbar() {
        const toolbar = document.querySelector('.toolbar');
        if (!toolbar) return;

        // Agregar herramientas adicionales
        const enhancedTools = document.createElement('div');
        enhancedTools.className = 'enhanced-tools';
        enhancedTools.innerHTML = `
            <div class="tool-group">
                <button class="tool-btn" data-tool="frame" title="Frame">
                    <i class="ri-layout-line"></i>
                    <span>Frame</span>
                </button>
                <button class="tool-btn" data-tool="image" title="Insert Image">
                    <i class="ri-image-line"></i>
                    <span>Image</span>
                </button>
                <button class="tool-btn" data-tool="icon" title="Insert Icon">
                    <i class="ri-emotion-line"></i>
                    <span>Icon</span>
                </button>
                <button class="tool-btn" data-tool="input" title="Input Field">
                    <i class="ri-input-field"></i>
                    <span>Input</span>
                </button>
                <button class="tool-btn" data-tool="button" title="Button">
                    <i class="ri-checkbox-blank-line"></i>
                    <span>Button</span>
                </button>
                <button class="tool-btn" data-tool="navbar" title="Navigation Bar">
                    <i class="ri-menu-line"></i>
                    <span>Navbar</span>
                </button>
            </div>
        `;

        toolbar.appendChild(enhancedTools);
        this.setupEnhancedToolEvents();
    }

    setupEnhancedToolEvents() {
        document.querySelectorAll('.tool-btn[data-tool="frame"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.createFrame();
            });
        });

        document.querySelectorAll('.tool-btn[data-tool="image"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openImageUpload();
            });
        });

        document.querySelectorAll('.tool-btn[data-tool="icon"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.openIconLibrary();
            });
        });

        document.querySelectorAll('.tool-btn[data-tool="input"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.createInputField();
            });
        });

        document.querySelectorAll('.tool-btn[data-tool="button"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.createButton();
            });
        });

        document.querySelectorAll('.tool-btn[data-tool="navbar"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.createNavbar();
            });
        });
    }

    createFramesPanel() {
        const leftSidebar = document.querySelector('.left-sidebar');
        if (!leftSidebar) return;

        const framesPanel = document.createElement('div');
        framesPanel.className = 'tool-section';
        framesPanel.innerHTML = `
            <div class="section-header">
                <h3><i class="ri-pages-line"></i> Frames</h3>
                <button class="icon-btn" id="add-frame-btn">
                    <i class="ri-add-line"></i>
                </button>
            </div>
            <div class="frames-list" id="frames-list">
                <div class="frame-item active" data-frame="main">
                    <i class="ri-layout-line"></i>
                    <span>Main Frame</span>
                </div>
            </div>
            <div class="frame-actions">
                <button class="btn-sm" onclick="editorApp.enhancedTools.duplicateFrame()">Duplicate</button>
                <button class="btn-sm" onclick="editorApp.enhancedTools.deleteFrame()">Delete</button>
            </div>
        `;

        leftSidebar.appendChild(framesPanel);
        this.setupFramesEvents();
    }

    setupFramesEvents() {
        document.getElementById('add-frame-btn')?.addEventListener('click', () => {
            this.createNewFrame();
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('.frame-item')) {
                const frameItem = e.target.closest('.frame-item');
                const frameId = frameItem.dataset.frame;
                this.switchToFrame(frameId);
            }
        });
    }

    createFrame(x = 100, y = 100, width = 800, height = 600) {
        const frame = {
            id: `frame_${Date.now()}`,
            type: 'frame',
            x: x,
            y: y,
            width: width,
            height: height,
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            children: [],
            name: `Frame ${this.frames.size + 1}`
        };

        this.frames.set(frame.id, frame);
        this.editor.elements.push(frame);
        this.editor.selectedElement = frame;
        this.editor.render();
        this.editor.updateLayersPanel();
        this.updateFramesList();

        this.editor.showNotification('📱 Frame created');
        return frame;
    }

    createNewFrame() {
        const name = prompt('Enter frame name:', `Page ${this.frames.size + 1}`);
        if (!name) return;

        const frame = this.createFrame(50, 50, 1440, 1024);
        frame.name = name;
        
        // Agregar elementos básicos de página
        this.addBasicPageElements(frame);
    }

    addBasicPageElements(frame) {
        // Header
        const header = {
            id: `header_${Date.now()}`,
            type: 'rectangle',
            x: 0,
            y: 0,
            width: frame.width,
            height: 80,
            fill: '#ffffff',
            stroke: '#e2e8f0',
            strokeWidth: 1,
            parent: frame.id
        };

        // Logo
        const logo = {
            id: `logo_${Date.now()}`,
            type: 'text',
            x: 40,
            y: 30,
            content: 'Logo',
            fontSize: 24,
            fontFamily: 'Inter',
            fill: '#1e293b',
            fontWeight: 'bold',
            parent: frame.id
        };

        // Navigation
        const navItems = ['Home', 'About', 'Services', 'Contact'];
        navItems.forEach((item, index) => {
            const navItem = {
                id: `nav_${item.toLowerCase()}_${Date.now()}`,
                type: 'text',
                x: frame.width - 300 + (index * 80),
                y: 30,
                content: item,
                fontSize: 16,
                fontFamily: 'Inter',
                fill: '#64748b',
                parent: frame.id
            };
            frame.children.push(navItem.id);
            this.editor.elements.push(navItem);
        });

        frame.children.push(header.id, logo.id);
        this.editor.elements.push(header, logo);
        this.editor.render();
    }

    switchToFrame(frameId) {
        this.currentFrame = frameId;
        
        // Actualizar UI
        document.querySelectorAll('.frame-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.frame-item[data-frame="${frameId}"]`)?.classList.add('active');

        // Filtrar elementos para mostrar solo los del frame actual
        this.editor.elements = this.editor.elements.filter(el => 
            el.parent === frameId || el.type === 'frame'
        );
        
        this.editor.render();
        this.editor.updateLayersPanel();
        this.editor.showNotification(`📄 Switched to ${this.frames.get(frameId)?.name || 'frame'}`);
    }

    updateFramesList() {
        const framesList = document.getElementById('frames-list');
        if (!framesList) return;

        framesList.innerHTML = Array.from(this.frames.values()).map(frame => `
            <div class="frame-item ${this.currentFrame === frame.id ? 'active' : ''}" 
                 data-frame="${frame.id}">
                <i class="ri-layout-line"></i>
                <span>${frame.name}</span>
            </div>
        `).join('');
    }

    // Sistema de imágenes
    setupImageHandling() {
        this.setupImageUpload();
    }

    setupImageUpload() {
        const imageInput = document.createElement('input');
        imageInput.type = 'file';
        imageInput.accept = 'image/*';
        imageInput.style.display = 'none';
        imageInput.id = 'image-upload-input';
        document.body.appendChild(imageInput);

        imageInput.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });
    }

    openImageUpload() {
        document.getElementById('image-upload-input').click();
    }

    handleImageUpload(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const image = {
                id: `image_${Date.now()}`,
                type: 'image',
                x: 100,
                y: 100,
                width: 200,
                height: 150,
                src: e.target.result,
                name: file.name
            };

            this.images.set(image.id, image);
            this.editor.elements.push(image);
            this.editor.selectedElement = image;
            this.editor.render();
            this.editor.updateLayersPanel();

            this.editor.showNotification('🖼️ Image uploaded and added to canvas');
        };
        reader.readAsDataURL(file);
    }

    // Sistema de iconos
    loadIconLibrary() {
        const iconCategories = {
            'Interface': ['🔍', '⚙️', '👤', '❤️', '⭐', '🔔', '📱', '💻'],
            'Arrows': ['⬆️', '⬇️', '⬅️', '➡️', '↗️', '↘️', '↙️', '↖️'],
            'Media': ['▶️', '⏸️', '⏹️', '⏭️', '⏮️', '🔊', '🔇', '🎵'],
            'Business': ['💰', '📊', '📈', '📉', '🏢', '💼', '📋', '📅'],
            'Communication': ['📞', '📧', '💬', '📢', '🔗', '📎', '📍', '🌐']
        };

        this.icons = new Map(Object.entries(iconCategories));
    }

    openIconLibrary() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Icon Library</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="icon-categories-tabs">
                        ${Array.from(this.icons.keys()).map(category => `
                            <button class="tab-btn" data-category="${category}">${category}</button>
                        `).join('')}
                    </div>
                    <div class="icons-grid" id="icons-modal-grid">
                        ${this.icons.get('Interface')?.map(icon => `
                            <div class="icon-modal-item" onclick="editorApp.enhancedTools.insertIcon('${icon}')">
                                <span class="icon-preview">${icon}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupIconModalEvents(modal);
    }

    setupIconModalEvents(modal) {
        // Tabs de categorías
        modal.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const icons = this.icons.get(category) || [];
                
                const grid = modal.querySelector('#icons-modal-grid');
                grid.innerHTML = icons.map(icon => `
                    <div class="icon-modal-item" onclick="editorApp.enhancedTools.insertIcon('${icon}')">
                        <span class="icon-preview">${icon}</span>
                    </div>
                `).join('');
            });
        });

        // Cerrar modal
        modal.querySelector('.close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    insertIcon(iconChar) {
        const iconElement = {
            id: `icon_${Date.now()}`,
            type: 'text',
            x: 150,
            y: 150,
            content: iconChar,
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#000000',
            isIcon: true
        };

        this.editor.elements.push(iconElement);
        this.editor.selectedElement = iconElement;
        this.editor.render();
        this.editor.updateLayersPanel();
        
        document.querySelector('.modal')?.remove();
        this.editor.showNotification('✅ Icon inserted');
    }

    // Componentes de UI
    createInputField() {
        const inputGroup = {
            id: `input_group_${Date.now()}`,
            type: 'group',
            x: 100,
            y: 200,
            width: 300,
            height: 80,
            children: []
        };

        // Label
        const label = {
            id: `label_${Date.now()}`,
            type: 'text',
            x: 100,
            y: 180,
            content: 'Input Label',
            fontSize: 14,
            fontFamily: 'Inter',
            fill: '#374151',
            parent: inputGroup.id
        };

        // Input background
        const inputBg = {
            id: `input_bg_${Date.now()}`,
            type: 'rectangle',
            x: 100,
            y: 200,
            width: 300,
            height: 48,
            fill: '#ffffff',
            stroke: '#d1d5db',
            strokeWidth: 1,
            borderRadius: 6,
            parent: inputGroup.id
        };

        // Input text
        const inputText = {
            id: `input_text_${Date.now()}`,
            type: 'text',
            x: 112,
            y: 215,
            content: 'Type here...',
            fontSize: 16,
            fontFamily: 'Inter',
            fill: '#6b7280',
            parent: inputGroup.id
        };

        inputGroup.children = [label.id, inputBg.id, inputText.id];
        this.editor.elements.push(inputGroup, label, inputBg, inputText);
        this.editor.selectedElement = inputGroup;
        this.editor.render();
        this.editor.updateLayersPanel();

        this.editor.showNotification('📝 Input field created');
    }

    createButton() {
        const button = {
            id: `button_${Date.now()}`,
            type: 'rectangle',
            x: 100,
            y: 300,
            width: 120,
            height: 48,
            fill: '#6366f1',
            stroke: 'none',
            borderRadius: 8,
            isButton: true
        };

        const buttonText = {
            id: `button_text_${Date.now()}`,
            type: 'text',
            x: 160,
            y: 325,
            content: 'Button',
            fontSize: 16,
            fontFamily: 'Inter',
            fill: '#ffffff',
            fontWeight: '600',
            textAlign: 'center'
        };

        this.editor.elements.push(button, buttonText);
        this.editor.selectedElement = button;
        this.editor.render();
        this.editor.updateLayersPanel();

        this.editor.showNotification('🔘 Button created');
    }

    createNavbar() {
        const navbar = {
            id: `navbar_${Date.now()}`,
            type: 'rectangle',
            x: 0,
            y: 0,
            width: 1440,
            height: 80,
            fill: '#ffffff',
            stroke: '#e2e8f0',
            strokeWidth: 1,
            isNavbar: true
        };

        // Logo
        const logo = {
            id: `nav_logo_${Date.now()}`,
            type: 'text',
            x: 40,
            y: 30,
            content: 'Brand',
            fontSize: 24,
            fontFamily: 'Inter',
            fill: '#1e293b',
            fontWeight: 'bold'
        };

        // Menu items
        const menuItems = ['Home', 'About', 'Services', 'Contact'];
        menuItems.forEach((item, index) => {
            const menuItem = {
                id: `nav_item_${item.toLowerCase()}_${Date.now()}`,
                type: 'text',
                x: 1200 + (index * 100),
                y: 30,
                content: item,
                fontSize: 16,
                fontFamily: 'Inter',
                fill: '#64748b'
            };
            this.editor.elements.push(menuItem);
        });

        this.editor.elements.push(navbar, logo);
        this.editor.selectedElement = navbar;
        this.editor.render();
        this.editor.updateLayersPanel();

        this.editor.showNotification('🧭 Navigation bar created');
    }

    // Métodos de gestión de frames
    duplicateFrame() {
        if (!this.currentFrame) {
            this.editor.showNotification('⚠️ Select a frame first');
            return;
        }

        const originalFrame = this.frames.get(this.currentFrame);
        if (!originalFrame) return;

        const newFrame = {
            ...originalFrame,
            id: `frame_${Date.now()}`,
            name: `${originalFrame.name} Copy`,
            x: originalFrame.x + 50,
            y: originalFrame.y + 50
        };

        this.frames.set(newFrame.id, newFrame);
        this.editor.elements.push(newFrame);
        this.updateFramesList();

        this.editor.showNotification('📑 Frame duplicated');
    }

    deleteFrame() {
        if (!this.currentFrame || this.frames.size <= 1) {
            this.editor.showNotification('⚠️ Cannot delete the only frame');
            return;
        }

        // Encontrar otro frame para cambiar
        const otherFrame = Array.from(this.frames.keys()).find(id => id !== this.currentFrame);
        
        this.frames.delete(this.currentFrame);
        this.editor.elements = this.editor.elements.filter(el => 
            el.id !== this.currentFrame && el.parent !== this.currentFrame
        );
        
        this.switchToFrame(otherFrame);
        this.editor.showNotification('🗑️ Frame deleted');
    }

    // Renderizado mejorado
    renderImageElement(ctx, element) {
        const img = new Image();
        img.onload = () => {
            ctx.save();
            
            // Aplicar transformaciones
            ctx.translate(element.x, element.y);
            
            // Dibujar imagen
            ctx.drawImage(img, 0, 0, element.width, element.height);
            
            // Borde de selección
            if (this.editor.selectedElement === element) {
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(-2, -2, element.width + 4, element.height + 4);
                ctx.setLineDash([]);
            }
            
            ctx.restore();
        };
        img.src = element.src;
    }

    // Exportación mejorada
    exportFrameAsHTML(frameId) {
        const frame = this.frames.get(frameId);
        if (!frame) return '';

        const frameElements = this.editor.elements.filter(el => 
            el.parent === frameId || el.id === frameId
        );

        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${frame.name}</title>
    <style>
        body {
            margin: 0;
            font-family: 'Inter', sans-serif;
            background: ${frame.backgroundColor || '#ffffff'};
        }
        .frame {
            position: relative;
            width: ${frame.width}px;
            height: ${frame.height}px;
            margin: 0 auto;
            border: ${frame.border};
            border-radius: ${frame.borderRadius}px;
            overflow: hidden;
        }
    </style>
</head>
<body>
    <div class="frame">
`;

        frameElements.forEach(element => {
            if (element.type === 'rectangle') {
                html += `        <div style="
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            width: ${element.width}px;
            height: ${element.height}px;
            background: ${element.fill};
            border: ${element.strokeWidth}px solid ${element.stroke};
            border-radius: ${element.borderRadius}px;
        "></div>\n`;
            } else if (element.type === 'text') {
                html += `        <div style="
            position: absolute;
            left: ${element.x}px;
            top: ${element.y}px;
            font-size: ${element.fontSize}px;
            font-family: ${element.fontFamily};
            color: ${element.fill};
            font-weight: ${element.fontWeight};
        ">${element.content}</div>\n`;
            }
        });

        html += `    </div>
</body>
</html>`;

        return html;
    }
}