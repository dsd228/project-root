// ai-enhanced.js - IA Generativa Mejorada
class AIEnhanced {
    constructor(editor) {
        this.editor = editor;
        this.isGenerating = false;
        this.init();
    }

    init() {
        this.setupEnhancedAI();
    }

    setupEnhancedAI() {
        // Mejorar el modal de IA existente
        this.enhanceAIModal();
    }

    enhanceAIModal() {
        // Agregar características avanzadas al modal de IA
        const aiModal = document.getElementById('ai-modal');
        if (!aiModal) return;

        // Agregar sección de generación de diseño
        const aiFeatures = aiModal.querySelector('.ai-features-grid');
        if (aiFeatures) {
            aiFeatures.innerHTML += `
                <button class="feature-card premium" data-feature="generate-full-design">
                    <div class="feature-icon">
                        <i class="ri-magic-line"></i>
                    </div>
                    <div class="feature-content">
                        <h4>Generar Diseño Completo</h4>
                        <p>Crea un diseño completo desde una descripción</p>
                    </div>
                    <i class="ri-arrow-right-s-line"></i>
                </button>
                
                <button class="feature-card premium" data-feature="analyze-design">
                    <div class="feature-icon">
                        <i class="ri-search-eye-line"></i>
                    </div>
                    <div class="feature-content">
                        <h4>Analizar Diseño</h4>
                        <p>Obtén feedback y mejoras para tu diseño</p>
                    </div>
                    <i class="ri-arrow-right-s-line"></i>
                </button>
                
                <button class="feature-card premium" data-feature="suggest-copy">
                    <div class="feature-icon">
                        <i class="ri-article-line"></i>
                    </div>
                    <div class="feature-content">
                        <h4>Generar Contenido</h4>
                        <p>Crea texto persuasivo para tu diseño</p>
                    </div>
                    <i class="ri-arrow-right-s-line"></i>
                </button>
                
                <button class="feature-card premium" data-feature="extract-from-image">
                    <div class="feature-icon">
                        <i class="ri-image-2-line"></i>
                    </div>
                    <div class="feature-content">
                        <h4>Extraer de Imagen</h4>
                        <p>Convierte imágenes en elementos editables</p>
                    </div>
                    <i class="ri-arrow-right-s-line"></i>
                </button>
            `;
        }

        // Actualizar event listeners
        this.setupEnhancedAIEvents();
    }

    setupEnhancedAIEvents() {
        document.querySelectorAll('.feature-card[data-feature="generate-full-design"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.generateFullDesign();
            });
        });

        document.querySelectorAll('.feature-card[data-feature="analyze-design"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.analyzeDesign();
            });
        });

        document.querySelectorAll('.feature-card[data-feature="suggest-copy"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.suggestCopy();
            });
        });

        document.querySelectorAll('.feature-card[data-feature="extract-from-image"]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.extractFromImage();
            });
        });
    }

    async generateFullDesign() {
        const prompt = prompt('Describe el diseño que quieres crear:\nEj: "Un dashboard moderno con sidebar, gráficos y métricas"');
        if (!prompt) return;

        this.showAILoading('Generando diseño completo...');

        try {
            const design = await this.generateDesignFromPrompt(prompt);
            this.applyGeneratedDesign(design);
            this.hideAILoading();
        } catch (error) {
            this.hideAILoading();
            this.showAIError('Error generando diseño');
        }
    }

    async generateDesignFromPrompt(prompt) {
        // En una implementación real, esto llamaría a una API de IA
        // Por ahora, usaremos diseños predefinidos basados en el prompt
        
        const promptLower = prompt.toLowerCase();
        let designTemplate = null;

        if (promptLower.includes('dashboard')) {
            designTemplate = this.generateDashboardTemplate();
        } else if (promptLower.includes('landing') || promptLower.includes('hero')) {
            designTemplate = this.generateLandingPageTemplate();
        } else if (promptLower.includes('card') || promptLower.includes('product')) {
            designTemplate = this.generateCardTemplate();
        } else if (promptLower.includes('form') || promptLower.includes('login')) {
            designTemplate = this.generateFormTemplate();
        } else {
            designTemplate = this.generateGenericTemplate();
        }

        // Simular delay de IA
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return designTemplate;
    }

    generateDashboardTemplate() {
        return {
            name: 'Dashboard Generado por IA',
            elements: [
                {
                    type: 'rectangle',
                    x: 0, y: 0, width: 280, height: 1024,
                    fill: '#1e293b',
                    stroke: 'none'
                },
                {
                    type: 'rectangle',
                    x: 280, y: 0, width: 1160, height: 80,
                    fill: '#ffffff',
                    stroke: '#e2e8f0',
                    strokeWidth: 1
                },
                {
                    type: 'text',
                    x: 320, y: 140,
                    content: 'Métricas Principales',
                    fontSize: 24,
                    fontFamily: 'Inter',
                    fill: '#1e293b',
                    fontWeight: 600
                },
                {
                    type: 'rectangle',
                    x: 320, y: 200,
                    width: 300, height: 120,
                    fill: '#6366f1',
                    stroke: 'none',
                    borderRadius: 12
                },
                {
                    type: 'rectangle',
                    x: 660, y: 200,
                    width: 300, height: 120,
                    fill: '#10b981',
                    stroke: 'none',
                    borderRadius: 12
                },
                {
                    type: 'rectangle',
                    x: 1000, y: 200,
                    width: 300, height: 120,
                    fill: '#f59e0b',
                    stroke: 'none',
                    borderRadius: 12
                }
            ]
        };
    }

    generateLandingPageTemplate() {
        return {
            name: 'Landing Page Generada por IA',
            elements: [
                {
                    type: 'rectangle',
                    x: 0, y: 0, width: 1440, height: 800,
                    fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    stroke: 'none'
                },
                {
                    type: 'text',
                    x: 200, y: 300,
                    content: 'Transforma tu Idea en Realidad',
                    fontSize: 48,
                    fontFamily: 'Inter',
                    fill: '#ffffff',
                    fontWeight: 700
                },
                {
                    type: 'text',
                    x: 200, y: 370,
                    content: 'Crea experiencias digitales extraordinarias con nuestra plataforma',
                    fontSize: 18,
                    fontFamily: 'Inter',
                    fill: 'rgba(255, 255, 255, 0.9)',
                    fontWeight: 400
                },
                {
                    type: 'rectangle',
                    x: 200, y: 450,
                    width: 200, height: 60,
                    fill: '#ffffff',
                    stroke: 'none',
                    borderRadius: 12
                },
                {
                    type: 'text',
                    x: 280, y: 485,
                    content: 'Comenzar Ahora',
                    fontSize: 16,
                    fontFamily: 'Inter',
                    fill: '#6366f1',
                    fontWeight: 600
                }
            ]
        };
    }

    applyGeneratedDesign(design) {
        // Limpiar canvas actual
        this.editor.elements = [];

        // Aplicar elementos generados
        design.elements.forEach(element => {
            this.editor.elements.push({
                ...element,
                id: `${element.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            });
        });

        this.editor.render();
        this.editor.updateLayersPanel();
        this.editor.showNotification(`🎨 Diseño "${design.name}" aplicado`);
    }

    async analyzeDesign() {
        if (this.editor.elements.length === 0) {
            this.editor.showNotification('⚠️ Crea un diseño primero para analizarlo');
            return;
        }

        this.showAILoading('Analizando diseño...');

        try {
            const analysis = await this.performDesignAnalysis();
            this.showDesignAnalysis(analysis);
            this.hideAILoading();
        } catch (error) {
            this.hideAILoading();
            this.showAIError('Error analizando diseño');
        }
    }

    async performDesignAnalysis() {
        const elements = this.editor.elements;
        
        // Análisis básico del diseño
        const analysis = {
            score: 0,
            strengths: [],
            improvements: [],
            colors: this.analyzeColorUsage(elements),
            typography: this.analyzeTypography(elements),
            spacing: this.analyzeSpacing(elements),
            contrast: this.analyzeContrast(elements)
        };

        // Calcular puntuación
        analysis.score = this.calculateDesignScore(analysis);

        // Generar recomendaciones
        analysis.recommendations = this.generateRecommendations(analysis);

        // Simular procesamiento de IA
        await new Promise(resolve => setTimeout(resolve, 1500));

        return analysis;
    }

    analyzeColorUsage(elements) {
        const colors = new Set();
        elements.forEach(element => {
            if (element.fill && element.fill !== 'transparent') {
                colors.add(element.fill);
            }
            if (element.stroke && element.stroke !== 'transparent') {
                colors.add(element.stroke);
            }
        });

        return {
            count: colors.size,
            palette: Array.from(colors),
            hasGoodContrast: colors.size >= 3 && colors.size <= 6
        };
    }

    analyzeTypography(elements) {
        const fonts = new Set();
        const sizes = new Set();
        
        elements.forEach(element => {
            if (element.type === 'text') {
                if (element.fontFamily) fonts.add(element.fontFamily);
                if (element.fontSize) sizes.add(element.fontSize);
            }
        });

        return {
            fontCount: fonts.size,
            sizeCount: sizes.size,
            hasHierarchy: sizes.size >= 3
        };
    }

    analyzeSpacing(elements) {
        // Análisis básico de espaciado
        return {
            consistent: true,
            recommendation: 'Considera usar un sistema de espaciado consistente'
        };
    }

    analyzeContrast(elements) {
        // Análisis básico de contraste
        return {
            good: true,
            issues: []
        };
    }

    calculateDesignScore(analysis) {
        let score = 100;

        // Penalizar por demasiados colores
        if (analysis.colors.count > 8) score -= 20;
        if (analysis.colors.count < 2) score -= 15;

        // Recompensar por buena jerarquía tipográfica
        if (analysis.typography.hasHierarchy) score += 10;

        return Math.max(0, Math.min(100, score));
    }

    generateRecommendations(analysis) {
        const recommendations = [];

        if (analysis.colors.count > 6) {
            recommendations.push('Considera reducir tu paleta de colores a 3-6 colores principales');
        }

        if (analysis.typography.fontCount > 2) {
            recommendations.push('Usa máximo 2 familias tipográficas para mejor consistencia');
        }

        if (!analysis.typography.hasHierarchy) {
            recommendations.push('Crea una jerarquía tipográfica clara con diferentes tamaños');
        }

        if (analysis.score < 70) {
            recommendations.push('Tu diseño puede beneficiarse de un sistema de diseño más estructurado');
        }

        return recommendations.length > 0 ? recommendations : ['¡Buen trabajo! Tu diseño tiene buenos fundamentos.'];
    }

    showDesignAnalysis(analysis) {
        const messagesContainer = document.getElementById('ai-messages');
        if (!messagesContainer) return;

        const analysisHTML = `
            <div class="message assistant">
                <div class="message-avatar">
                    <i class="ri-robot-2-fill"></i>
                </div>
                <div class="message-content">
                    <h4>📊 Análisis de tu Diseño</h4>
                    <div class="design-score">
                        <div class="score-circle" style="--score: ${analysis.score}">
                            <span>${analysis.score}/100</span>
                        </div>
                    </div>
                    
                    <div class="analysis-details">
                        <div class="analysis-section">
                            <h5>🎨 Colores</h5>
                            <p>${analysis.colors.count} colores usados</p>
                            <div class="color-palette">
                                ${analysis.colors.palette.map(color => `
                                    <div class="color-chip" style="background: ${color}"></div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="analysis-section">
                            <h5>🔤 Tipografía</h5>
                            <p>${analysis.typography.fontCount} fuentes, ${analysis.typography.sizeCount} tamaños</p>
                        </div>
                    </div>
                    
                    <div class="recommendations">
                        <h5>💡 Recomendaciones</h5>
                        <ul>
                            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;

        messagesContainer.innerHTML += analysisHTML;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    async suggestCopy() {
        const context = prompt('Describe el contexto para el texto:\nEj: "Un botón de call-to-action para una app de productividad"');
        if (!context) return;

        this.showAILoading('Generando contenido...');

        try {
            const copy = await this.generateCopy(context);
            this.showGeneratedCopy(copy);
            this.hideAILoading();
        } catch (error) {
            this.hideAILoading();
            this.showAIError('Error generando contenido');
        }
    }

    async generateCopy(context) {
        // Simular generación de contenido con IA
        const copyExamples = {
            'call-to-action': [
                'Comenzar Ahora',
                'Explorar Características',
                'Descubrir Más',
                'Únete Gratis',
                'Solicitar Demo'
            ],
            'headline': [
                'Transforma tu Productividad',
                'El Futuro es Ahora',
                'Innovación que Inspira',
                'Soluciones para el Mundo Moderno',
                'Experiencias que Importan'
            ],
            'description': [
                'Descubre una nueva forma de trabajar diseñada para maximizar tu eficiencia y creatividad.',
                'Nuestra plataforma combina potencia y simplicidad para ofrecer resultados excepcionales.',
                'Únete a miles de profesionales que ya están transformando su forma de trabajar.'
            ]
        };

        let copyType = 'description';
        if (context.toLowerCase().includes('botón') || context.toLowerCase().includes('button')) {
            copyType = 'call-to-action';
        } else if (context.toLowerCase().includes('titulo') || context.toLowerCase().includes('headline')) {
            copyType = 'headline';
        }

        const options = copyExamples[copyType] || copyExamples.description;
        const selectedCopy = options[Math.floor(Math.random() * options.length)];

        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
            type: copyType,
            content: selectedCopy,
            alternatives: options.filter(opt => opt !== selectedCopy).slice(0, 3)
        };
    }

    showGeneratedCopy(copy) {
        const messagesContainer = document.getElementById('ai-messages');
        if (!messagesContainer) return;

        const copyHTML = `
            <div class="message assistant">
                <div class="message-avatar">
                    <i class="ri-robot-2-fill"></i>
                </div>
                <div class="message-content">
                    <h4>📝 Contenido Generado</h4>
                    <div class="copy-suggestion">
                        <div class="copy-main">
                            <strong>Recomendado:</strong>
                            <p class="copy-content">${copy.content}</p>
                            <button class="btn-sm" onclick="editorApp.aiEnhanced.applyCopyToSelection('${copy.content.replace(/'/g, "\\'")}')">
                                Aplicar al Elemento Seleccionado
                            </button>
                        </div>
                        
                        ${copy.alternatives.length > 0 ? `
                        <div class="copy-alternatives">
                            <strong>Alternativas:</strong>
                            <ul>
                                ${copy.alternatives.map(alt => `
                                    <li>
                                        <span>${alt}</span>
                                        <button class="icon-btn sm" onclick="editorApp.aiEnhanced.applyCopyToSelection('${alt.replace(/'/g, "\\'")}')">
                                            <i class="ri-check-line"></i>
                                        </button>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        messagesContainer.innerHTML += copyHTML;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    applyCopyToSelection(text) {
        if (!this.editor.selectedElement) {
            this.editor.showNotification('⚠️ Selecciona un elemento de texto primero');
            return;
        }

        if (this.editor.selectedElement.type !== 'text') {
            this.editor.showNotification('⚠️ El elemento seleccionado no es de texto');
            return;
        }

        this.editor.selectedElement.content = text;
        this.editor.render();
        this.editor.showNotification('📝 Texto aplicado al elemento');
    }

    async extractFromImage() {
        this.editor.showNotification('🖼️ Esta característica requiere integración con APIs de visión por computadora');
        // En una implementación real, aquí se integraría con:
        // - Google Vision API
        // - AWS Rekognition
        // - Azure Computer Vision
        // - OCR para texto
    }

    showAILoading(message) {
        this.isGenerating = true;
        // Mostrar indicador de carga en la UI
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'ai-loading';
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <span>${message}</span>
        `;
        document.getElementById('ai-messages')?.appendChild(loadingIndicator);
    }

    hideAILoading() {
        this.isGenerating = false;
        document.querySelector('.ai-loading')?.remove();
    }

    showAIError(message) {
        const messagesContainer = document.getElementById('ai-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML += `
                <div class="message assistant error">
                    <div class="message-avatar">
                        <i class="ri-robot-2-fill"></i>
                    </div>
                    <div class="message-content">
                        <p>❌ ${message}</p>
                    </div>
                </div>
            `;
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Método para generar componentes desde descripción
    async generateComponentFromDescription(description) {
        this.showAILoading('Generando componente...');

        try {
            const component = await this.createComponentFromAI(description);
            this.editor.componentSystem.createMasterFromSelection();
            this.hideAILoading();
        } catch (error) {
            this.hideAILoading();
            this.showAIError('Error generando componente');
        }
    }

    async createComponentFromAI(description) {
        // Lógica para generar componentes basados en descripción
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Crear elemento basado en la descripción
        const element = {
            type: 'rectangle',
            x: 100, y: 100, width: 200, height: 60,
            fill: '#6366f1',
            stroke: 'none',
            borderRadius: 8
        };

        if (description.toLowerCase().includes('card')) {
            element.width = 300;
            element.height = 200;
            element.borderRadius = 12;
        } else if (description.toLowerCase().includes('button')) {
            element.width = 140;
            element.height = 48;
            element.borderRadius = 8;
        }

        return element;
    }
}