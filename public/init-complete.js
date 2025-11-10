// init-final.js - Editor Final con Todas las Funcionalidades
console.log('🚀 Inicializando Editor Pro+ Premium Final...');

// Clase principal extendida con todas las funcionalidades
class EditorAppFinal extends EditorApp {
    constructor() {
        super();
        this.initAllSystems();
    }

    initAllSystems() {
        console.log('🎯 Inicializando todos los sistemas...');
        
        // Sistemas básicos
        this.designSystem = new DesignSystem(this);
        this.aiEnhanced = new AIEnhanced(this);
        this.autoLayout = new AutoLayoutManager(this);
        this.componentSystem = new ComponentSystem(this);
        this.prototypeMode = new PrototypeMode(this);
        this.collaboration = new CollaborationManager(this);
        this.plugins = new PluginSystem(this);
        this.exportEngine = new ExportEngine(this);
        this.analytics = new DesignAnalytics(this);
        
        // Nuevos sistemas para prototipado web
        this.enhancedTools = new EnhancedTools(this);
        this.interactiveElements = new InteractiveElements(this);
        
        console.log('✅ Todos los sistemas inicializados');
    }

    // Sobrescribir métodos de renderizado para soportar nuevos elementos
    renderElement(element) {
        // Elementos de formulario interactivos
        if (element.type === 'form-element') {
            this.interactiveElements.renderFormElement(this.ctx, element);
            return;
        }
        
        // Imágenes
        if (element.type === 'image') {
            this.enhancedTools.renderImageElement(this.ctx, element);
            return;
        }
        
        // Llamar al renderizado original para otros elementos
        super.renderElement(element);
    }

    // Sobrescribir creación de elementos para tracking
    createRectangle(x, y) {
        super.createRectangle(x, y);
        this.analytics.trackAction('element_created', { type: 'rectangle' });
    }

    createText(x, y) {
        super.createText(x, y);
        this.analytics.trackAction('element_created', { type: 'text' });
    }

    createCircle(x, y) {
        super.createCircle(x, y);
        this.analytics.trackAction('element_created', { type: 'circle' });
    }

    deleteSelected() {
        if (this.selectedElement) {
            this.analytics.trackAction('element_deleted', { type: this.selectedElement.type });
        }
        super.deleteSelected();
    }

    render() {
        const startTime = performance.now();
        super.render();
        const renderTime = performance.now() - startTime;
        
        this.analytics.trackPerformanceMetric('render', renderTime);
    }

    // Nuevos métodos de acceso rápido
    uploadImage() {
        this.enhancedTools.openImageUpload();
    }

    insertIcon() {
        this.enhancedTools.openIconLibrary();
    }

    createWebPage() {
        this.enhancedTools.createNewFrame();
    }

    createForm() {
        this.interactiveElements.createContactForm();
    }

    // Exportación mejorada
    exportAsWebsite() {
        const html = this.enhancedTools.exportFrameAsHTML(this.enhancedTools.currentFrame);
        this.downloadAsFile('website.html', html);
        this.showNotification('🌐 Website exported as HTML');
    }

    downloadAsFile(filename, content) {
        const blob = new Blob([content], { type: 'text/html' });
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // Métodos de productividad
    quickSetup(template) {
        const templates = {
            'landing-page': this.setupLandingPage.bind(this),
            'dashboard': this.setupDashboard.bind(this),
            'portfolio': this.setupPortfolio.bind(this),
            'ecommerce': this.setupEcommerce.bind(this)
        };

        if (templates[template]) {
            templates[template]();
        }
    }

    setupLandingPage() {
        this.enhancedTools.createNewFrame();
        this.interactiveElements.createHeroSection();
        this.showNotification('🎯 Landing page template applied');
    }

    setupDashboard() {
        // Implementar template de dashboard
        this.showNotification('📊 Dashboard template applied');
    }

    setupPortfolio() {
        // Implementar template de portfolio
        this.showNotification('🎨 Portfolio template applied');
    }

    setupEcommerce() {
        // Implementar template de e-commerce
        this.showNotification('🛒 E-commerce template applied');
    }
}

// Inicialización final
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Inicializando Editor Pro+ Premium Final...');
    
    try {
        // Reemplazar EditorApp con la versión final
        window.EditorApp = EditorAppFinal;
        window.editorApp = new EditorAppFinal();
        
        if (window.editorApp.canvas) {
            // Cargar datos guardados
            window.editorApp.loadAutoSave();
            window.editorApp.analytics.loadAnalytics();
            window.editorApp.componentSystem.loadComponentLibrary();
            window.editorApp.prototypeMode.loadPrototypeData();
            
            console.log('🚀 Editor Pro+ Premium Final inicializado correctamente!');
            
            // Mostrar mensaje de bienvenida
            setTimeout(() => {
                window.editorApp.showNotification('🎉 ¡Editor Pro+ Premium Final listo!');
                
                setTimeout(() => {
                    const features = [
                        '🎨 Design System', '🤖 IA Generativa', '📐 Auto-Layout',
                        '🧩 Componentes', '🎭 Prototipado', '👥 Colaboración',
                        '🔌 Plugins', '💻 Exportación', '📊 Analytics',
                        '🖼️ Imágenes', '🔠 Iconos', '📱 Frames',
                        '📝 Formularios', '🎯 Componentes Web'
                    ];
                    
                    window.editorApp.showNotification(`✨ Características: ${features.join(', ')}`);
                }, 2000);
            }, 1000);

            // Agregar atajos de teclado adicionales
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                    e.preventDefault();
                    window.editorApp.uploadImage();
                }
                
                if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                    e.preventDefault();
                    window.editorApp.createWebPage();
                }
                
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
                    e.preventDefault();
                    window.editorApp.createForm();
                }
            });

        } else {
            console.error('❌ No se pudo inicializar EditorApp Final - Canvas no encontrado');
        }
        
    } catch (error) {
        console.error('❌ Error inicializando EditorApp Final:', error);
    }
});

// Panel de bienvenida y tutorial
function showWelcomePanel() {
    const welcomePanel = document.createElement('div');
    welcomePanel.className = 'welcome-panel';
    welcomePanel.innerHTML = `
        <div class="welcome-content">
            <h2>🎉 ¡Bienvenido a Editor Pro+ Premium!</h2>
            <div class="welcome-features">
                <div class="feature-item">
                    <i class="ri-layout-line"></i>
                    <span>Crea páginas web con frames</span>
                </div>
                <div class="feature-item">
                    <i class="ri-image-line"></i>
                    <span>Sube y edita imágenes</span>
                </div>
                <div class="feature-item">
                    <i class="ri-emotion-line"></i>
                    <span>Inserta iconos y elementos UI</span>
                </div>
                <div class="feature-item">
                    <i class="ri-input-field"></i>
                    <span>Formularios interactivos</span>
                </div>
                <div class="feature-item">
                    <i class="ri-flask-line"></i>
                    <span>Prototipado interactivo</span>
                </div>
            </div>
            <div class="welcome-actions">
                <button class="btn-primary" onclick="this.closest('.welcome-panel').remove()">
                    Comenzar a Diseñar
                </button>
                <button class="btn-secondary" onclick="showTutorial()">
                    Ver Tutorial
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(welcomePanel);
}

function showTutorial() {
    const steps = [
        '1. Usa la herramienta "Frame" para crear páginas',
        '2. Sube imágenes con el botón "Image"',
        '3. Inserta iconos desde la librería',
        '4. Agrega formularios y elementos interactivos',
        '5. Usa componentes predefinidos para rapidez',
        '6. Prototipa interacciones entre páginas',
        '7. Exporta como HTML funcional'
    ];

    alert('Tutorial Rápido:\n\n' + steps.join('\n'));
}

// Mostrar panel de bienvenida después de la carga
setTimeout(showWelcomePanel, 1500);

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EditorAppFinal,
        EnhancedTools,
        InteractiveElements,
        DesignSystem,
        AIEnhanced,
        AutoLayoutManager,
        ComponentSystem,
        PrototypeMode,
        CollaborationManager,
        PluginSystem,
        ExportEngine,
        DesignAnalytics
    };
}