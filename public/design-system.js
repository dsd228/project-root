// design-system.js - Sistema de Design Tokens
class DesignSystem {
    constructor(editor) {
        this.editor = editor;
        this.tokens = this.loadTokens();
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        this.setupUI();
        this.applyTheme(this.currentTheme);
    }

    loadTokens() {
        const saved = localStorage.getItem('editor-design-tokens');
        if (saved) {
            return JSON.parse(saved);
        }

        return {
            version: '1.0.0',
            colors: {
                primary: { value: '#6366f1', type: 'color' },
                secondary: { value: '#8b5cf6', type: 'color' },
                success: { value: '#10b981', type: 'color' },
                warning: { value: '#f59e0b', type: 'color' },
                error: { value: '#ef4444', type: 'color' },
                background: { value: '#ffffff', type: 'color' },
                surface: { value: '#f8fafc', type: 'color' },
                text: { value: '#1e293b', type: 'color' },
                textMuted: { value: '#64748b', type: 'color' }
            },
            typography: {
                h1: { 
                    value: { fontSize: 48, fontWeight: 700, lineHeight: 1.2 },
                    type: 'typography' 
                },
                h2: { 
                    value: { fontSize: 36, fontWeight: 600, lineHeight: 1.3 },
                    type: 'typography' 
                },
                h3: { 
                    value: { fontSize: 24, fontWeight: 600, lineHeight: 1.4 },
                    type: 'typography' 
                },
                body: { 
                    value: { fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
                    type: 'typography' 
                },
                caption: { 
                    value: { fontSize: 14, fontWeight: 400, lineHeight: 1.4 },
                    type: 'typography' 
                }
            },
            spacing: {
                xs: { value: 4, type: 'spacing' },
                sm: { value: 8, type: 'spacing' },
                md: { value: 16, type: 'spacing' },
                lg: { value: 24, type: 'spacing' },
                xl: { value: 32, type: 'spacing' },
                '2xl': { value: 48, type: 'spacing' }
            },
            borderRadius: {
                sm: { value: 4, type: 'borderRadius' },
                md: { value: 8, type: 'borderRadius' },
                lg: { value: 12, type: 'borderRadius' },
                xl: { value: 16, type: 'borderRadius' },
                full: { value: 9999, type: 'borderRadius' }
            },
            shadows: {
                sm: { value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', type: 'shadow' },
                md: { value: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', type: 'shadow' },
                lg: { value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', type: 'shadow' },
                xl: { value: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', type: 'shadow' }
            }
        };
    }

    saveTokens() {
        localStorage.setItem('editor-design-tokens', JSON.stringify(this.tokens));
    }

    setupUI() {
        // Crear panel de design system en el sidebar derecho
        this.createDesignSystemPanel();
    }

    createDesignSystemPanel() {
        const rightSidebar = document.querySelector('.right-sidebar');
        if (!rightSidebar) return;

        const dsPanel = document.createElement('div');
        dsPanel.className = 'design-system-panel';
        dsPanel.innerHTML = `
            <div class="section-header">
                <h3><i class="ri-palette-line"></i> Design System</h3>
                <button class="icon-btn" id="ds-settings">
                    <i class="ri-settings-3-line"></i>
                </button>
            </div>
            
            <div class="ds-tabs">
                <button class="ds-tab active" data-tab="colors">Colors</button>
                <button class="ds-tab" data-tab="typography">Typography</button>
                <button class="ds-tab" data-tab="spacing">Spacing</button>
            </div>

            <div class="ds-content">
                <div class="ds-tab-content active" id="colors-tab">
                    <div class="color-grid" id="color-grid"></div>
                    <button class="add-token-btn" onclick="editorApp.designSystem.addColorToken()">
                        <i class="ri-add-line"></i> Add Color
                    </button>
                </div>
                
                <div class="ds-tab-content" id="typography-tab">
                    <div class="typography-list" id="typography-list"></div>
                </div>
                
                <div class="ds-tab-content" id="spacing-tab">
                    <div class="spacing-list" id="spacing-list"></div>
                </div>
            </div>

            <div class="ds-actions">
                <button class="btn-secondary" onclick="editorApp.designSystem.exportTokens()">
                    Export Tokens
                </button>
                <button class="btn-primary" onclick="editorApp.designSystem.applyToSelection()">
                    Apply to Selection
                </button>
            </div>
        `;

        rightSidebar.insertBefore(dsPanel, rightSidebar.firstChild);
        this.setupDSTabs();
        this.renderColorTokens();
        this.renderTypographyTokens();
        this.renderSpacingTokens();
    }

    setupDSTabs() {
        document.querySelectorAll('.ds-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.ds-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.ds-tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-tab`).classList.add('active');
            });
        });
    }

    renderColorTokens() {
        const colorGrid = document.getElementById('color-grid');
        if (!colorGrid) return;

        colorGrid.innerHTML = Object.entries(this.tokens.colors).map(([name, token]) => `
            <div class="color-token" data-token="colors.${name}">
                <div class="color-preview" style="background: ${token.value}"></div>
                <div class="token-info">
                    <span class="token-name">${name}</span>
                    <span class="token-value">${token.value}</span>
                </div>
                <div class="token-actions">
                    <button class="icon-btn sm" onclick="editorApp.designSystem.editToken('colors.${name}')">
                        <i class="ri-edit-line"></i>
                    </button>
                    <button class="icon-btn sm" onclick="editorApp.designSystem.applyToken('colors.${name}')">
                        <i class="ri-brush-line"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderTypographyTokens() {
        const typographyList = document.getElementById('typography-list');
        if (!typographyList) return;

        typographyList.innerHTML = Object.entries(this.tokens.typography).map(([name, token]) => `
            <div class="typography-token" data-token="typography.${name}">
                <div class="typography-preview" style="font-size: ${token.value.fontSize}px; font-weight: ${token.value.fontWeight}">
                    ${name}
                </div>
                <div class="token-info">
                    <span class="token-value">${token.value.fontSize}px / ${token.value.fontWeight}</span>
                </div>
                <button class="icon-btn sm" onclick="editorApp.designSystem.applyToken('typography.${name}')">
                    <i class="ri-brush-line"></i>
                </button>
            </div>
        `).join('');
    }

    renderSpacingTokens() {
        const spacingList = document.getElementById('spacing-list');
        if (!spacingList) return;

        spacingList.innerHTML = Object.entries(this.tokens.spacing).map(([name, token]) => `
            <div class="spacing-token" data-token="spacing.${name}">
                <div class="spacing-preview">
                    <div class="spacing-visual" style="width: ${token.value}px"></div>
                </div>
                <div class="token-info">
                    <span class="token-name">${name}</span>
                    <span class="token-value">${token.value}px</span>
                </div>
                <button class="icon-btn sm" onclick="editorApp.designSystem.applyToken('spacing.${name}')">
                    <i class="ri-brush-line"></i>
                </button>
            </div>
        `).join('');
    }

    addColorToken() {
        const name = prompt('Enter color name:');
        if (!name) return;

        const value = prompt('Enter color value (hex, rgb, or hsl):', '#000000');
        if (!value) return;

        this.tokens.colors[name] = { value, type: 'color' };
        this.saveTokens();
        this.renderColorTokens();
        this.editor.showNotification(`🎨 Color token "${name}" added`);
    }

    editToken(tokenPath) {
        const [category, name] = tokenPath.split('.');
        const token = this.tokens[category]?.[name];
        if (!token) return;

        if (category === 'colors') {
            const newValue = prompt('Enter new color value:', token.value);
            if (newValue) {
                token.value = newValue;
                this.saveTokens();
                this.renderColorTokens();
            }
        }
    }

    applyToken(tokenPath) {
        if (!this.editor.selectedElement) {
            this.editor.showNotification('⚠️ Please select an element first');
            return;
        }

        const [category, name] = tokenPath.split('.');
        const token = this.tokens[category]?.[name];
        if (!token) return;

        const element = this.editor.selectedElement;

        switch (category) {
            case 'colors':
                if (element.type === 'text') {
                    element.fill = token.value;
                } else if (element.type === 'rectangle') {
                    element.fill = token.value;
                }
                break;

            case 'typography':
                if (element.type === 'text') {
                    element.fontSize = token.value.fontSize;
                    element.fontWeight = token.value.fontWeight;
                }
                break;

            case 'spacing':
                // Apply spacing to padding or margins
                if (element.type === 'rectangle') {
                    element.padding = token.value;
                }
                break;

            case 'borderRadius':
                if (element.type === 'rectangle') {
                    element.borderRadius = token.value;
                }
                break;
        }

        this.editor.render();
        this.editor.showNotification(`🎨 Applied ${tokenPath} to selection`);
    }

    applyToSelection() {
        if (!this.editor.selectedElement) {
            this.editor.showNotification('⚠️ Please select an element first');
            return;
        }

        // Apply a complete design system style
        const element = this.editor.selectedElement;

        if (element.type === 'text') {
            this.applyToken('typography.body');
            this.applyToken('colors.text');
        } else if (element.type === 'rectangle') {
            this.applyToken('colors.primary');
            this.applyToken('borderRadius.md');
        }

        this.editor.showNotification('🎨 Design system applied to selection');
    }

    applyTheme(theme) {
        this.currentTheme = theme;
        
        if (theme === 'dark') {
            this.tokens.colors.background.value = '#0f172a';
            this.tokens.colors.surface.value = '#1e293b';
            this.tokens.colors.text.value = '#f8fafc';
        } else {
            this.tokens.colors.background.value = '#ffffff';
            this.tokens.colors.surface.value = '#f8fafc';
            this.tokens.colors.text.value = '#1e293b';
        }

        this.saveTokens();
        this.renderColorTokens();
    }

    exportTokens() {
        const formats = {
            css: this.exportAsCSS(),
            json: this.exportAsJSON(),
            scss: this.exportAsSCSS(),
            js: this.exportAsJS()
        };

        const format = prompt('Choose format (css, json, scss, js):', 'css');
        if (formats[format]) {
            this.downloadFile(`design-tokens.${format}`, formats[format]);
            this.editor.showNotification(`📁 Tokens exported as ${format.toUpperCase()}`);
        }
    }

    exportAsCSS() {
        let css = ':root {\n';
        
        Object.entries(this.tokens.colors).forEach(([name, token]) => {
            css += `  --color-${name}: ${token.value};\n`;
        });

        Object.entries(this.tokens.spacing).forEach(([name, token]) => {
            css += `  --spacing-${name}: ${token.value}px;\n`;
        });

        css += '}';
        return css;
    }

    exportAsJSON() {
        return JSON.stringify(this.tokens, null, 2);
    }

    exportAsSCSS() {
        let scss = '';
        
        Object.entries(this.tokens.colors).forEach(([name, token]) => {
            scss += `$${name}: ${token.value};\n`;
        });

        return scss;
    }

    exportAsJS() {
        return `export const designTokens = ${JSON.stringify(this.tokens, null, 2)};`;
    }

    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = filename;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    }

    // Analytics para tokens
    getTokenUsage() {
        const usage = {};
        this.editor.elements.forEach(element => {
            // Analizar qué tokens se están usando
            if (element.fill && element.fill.includes('var')) {
                const token = element.fill.replace('var(--', '').replace(')', '');
                usage[token] = (usage[token] || 0) + 1;
            }
        });
        return usage;
    }
}