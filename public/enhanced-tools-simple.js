// init-complete-simple.js - Versión Simplificada y Funcional
console.log('🚀 Inicializando Editor Pro+ Premium Simplificado...');

// Clase principal extendida con funcionalidades básicas
class EditorAppComplete extends EditorApp {
    constructor() {
        super();
        this.initEnhancedFeatures();
    }

    initEnhancedFeatures() {
        console.log('🎯 Inicializando características mejoradas...');
        
        // Inicializar herramientas mejoradas
        this.enhancedTools = new EnhancedTools(this);
        
        console.log('✅ Características mejoradas inicializadas');
    }

    // Sobrescribir render para soportar nuevos elementos
    renderElement(element) {
        // Si es una imagen, usar el renderizado de EnhancedTools
        if (element.type === 'image' && this.enhancedTools) {
            this.enhancedTools.renderImageElement(this.ctx, element);
            return;
        }
        
        // Llamar al renderizado original para otros elementos
        super.renderElement(element);
    }
}

// Inicialización mejorada
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 Inicializando Editor Pro+ Premium Completo...');
    
    try {
        // Usar la versión completa
        window.EditorApp = EditorAppComplete;
        window.editorApp = new EditorAppComplete();
        
        if (window.editorApp.canvas) {
            window.editorApp.loadAutoSave();
            console.log('🚀 Editor Pro+ Premium Completo inicializado correctamente!');
            
            setTimeout(() => {
                window.editorApp.showNotification('🎉 ¡Editor Pro+ Premium listo!');
                window.editorApp.showNotification('✨ Nuevas características: Imágenes, Iconos, Botones');
            }, 1000);

            // Agregar atajos de teclado
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                    e.preventDefault();
                    window.editorApp.enhancedTools.openImageUpload();
                }
                
                if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                    e.preventDefault();
                    window.editorApp.enhancedTools.createButton();
                }
            });

        } else {
            console.error('❌ No se pudo inicializar EditorApp Completo - Canvas no encontrado');
        }
        
    } catch (error) {
        console.error('❌ Error inicializando EditorApp Completo:', error);
    }
});

// Panel de bienvenida simple
function showWelcomePanel() {
    const welcomePanel = document.createElement('div');
    welcomePanel.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    welcomePanel.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 12px; max-width: 500px; text-align: center;">
            <h2 style="margin-top: 0;">🎉 ¡Bienvenido a Editor Pro+ Premium!</h2>
            <p><strong>Nuevas características disponibles:</strong></p>
            <ul style="text-align: left; margin: 20px 0;">
                <li>🖼️ Subir imágenes</li>
                <li>🔠 Insertar iconos</li>
                <li>🔘 Crear botones</li>
                <li>🎨 Sistema de diseño</li>
                <li>🤖 Asistente IA</li>
            </ul>
            <p><strong>Atajos de teclado:</strong></p>
            <ul style="text-align: left; margin: 20px 0;">
                <li>Ctrl+I: Subir imagen</li>
                <li>Ctrl+B: Crear botón</li>
                <li>Ctrl+Z: Deshacer</li>
                <li>Ctrl+Y: Rehacer</li>
            </ul>
            <button onclick="this.closest('div').parentElement.remove()" 
                    style="background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                Comenzar a Diseñar
            </button>
        </div>
    `;

    document.body.appendChild(welcomePanel);
}

// Mostrar panel de bienvenida después de la carga
setTimeout(showWelcomePanel, 2000);
