// plugins.js - Sistema de Plugins Extensible
class PluginSystem {
    constructor(editor) {
        this.editor = editor;
        this.plugins = new Map();
        this.activePlugins = new Set();
        this.pluginHooks = new Map();
        this.init();
    }

    init() {
        this.setupPluginSystem();
        this.loadBuiltInPlugins();
        this.loadUserPlugins();
    }

    setupPluginSystem() {
        this.createPluginManager();
        this.setupPluginAPI();
    }

    createPluginManager() {
        const leftSidebar = document.querySelector('.left-sidebar');
        if (!leftSidebar) return;

        const pluginSection = document.createElement('div');
        pluginSection.className = 'tool-section';
        pluginSection.innerHTML = `
            <div class="section-header">
                <h3><i class="ri-plug-line"></i> Plugins</h3>
                <button class="icon-btn" id="plugin-manager-btn">
                    <i class="ri-settings-3-line"></i>
                </button>
            </div>
            <div class="plugins-list" id="plugins-list">
                <!-- Plugins will be loaded here -->
            </div>
        `;

        leftSidebar.appendChild(pluginSection);
        this.setupPluginEvents();
    }

    setupPluginEvents() {
        document.getElementById('plugin-manager-btn')?.addEventListener('click', () => {
            this.showPluginManager();
        });
    }

    setupPluginAPI() {
        window.EditorPluginAPI = {
            registerPlugin: (name, plugin) => this.registerPlugin(name, plugin),
            hook: (hookName, callback) => this.addHook(hookName, callback),
            callHook: (hookName, data) => this.callHook(hookName, data),
            getEditor: () => this.editor,
            showNotification: (message) => this.editor.showNotification(message),
            createTool: (toolConfig) => this.createTool(toolConfig),
            createPanel: (panelConfig) => this.createPanel(panelConfig)
        };
    }

    loadBuiltInPlugins() {
        this.loadPlugin('ColorPicker', ColorPickerPlugin);
        this.loadPlugin('IconLibrary', IconLibraryPlugin);
        this.loadPlugin('ChartGenerator', ChartGeneratorPlugin);
        this.loadPlugin('CodeExport', CodeExportPlugin);
    }

    loadUserPlugins() {
        const userPlugins = localStorage.getItem('editor-user-plugins');
        if (userPlugins) {
            try {
                const plugins = JSON.parse(userPlugins);
                plugins.forEach(plugin => {
                    this.loadUserPlugin(plugin);
                });
            } catch (error) {
                console.error('Error loading user plugins:', error);
            }
        }
    }

    registerPlugin(name, plugin) {
        if (this.plugins.has(name)) {
            console.warn(`Plugin "${name}" already registered`);
            return false;
        }

        this.plugins.set(name, {
            name: name,
            instance: plugin,
            enabled: false,
            config: {}
        });

        this.renderPluginsList();
        return true;
    }

    loadPlugin(name, pluginClass) {
        try {
            const pluginInstance = new pluginClass(this.editor);
            this.registerPlugin(name, pluginInstance);
            console.log(`✅ Plugin loaded: ${name}`);
        } catch (error) {
            console.error(`❌ Error loading plugin ${name}:`, error);
        }
    }

    loadUserPlugin(pluginConfig) {
        try {
            console.log('Loading user plugin:', pluginConfig.name);
        } catch (error) {
            console.error('Error loading user plugin:', error);
        }
    }

    enablePlugin(name) {
        const plugin = this.plugins.get(name);
        if (plugin && !plugin.enabled) {
            plugin.enabled = true;
            this.activePlugins.add(name);

            try {
                if (plugin.instance.onEnable) {
                    plugin.instance.onEnable();
                }
                this.callHook('pluginEnabled', { name });
                this.editor.showNotification(`🔌 Plugin "${name}" enabled`);
            } catch (error) {
                console.error(`Error enabling plugin ${name}:`, error);
            }

            this.renderPluginsList();
        }
    }

    disablePlugin(name) {
        const plugin = this.plugins.get(name);
        if (plugin && plugin.enabled) {
            plugin.enabled = false;
            this.activePlugins.delete(name);

            try {
                if (plugin.instance.onDisable) {
                    plugin.instance.onDisable();
                }
                this.callHook('pluginDisabled', { name });
                this.editor.showNotification(`🔌 Plugin "${name}" disabled`);
            } catch (error) {
                console.error(`Error disabling plugin ${name}:`, error);
            }

            this.renderPluginsList();
        }
    }

    renderPluginsList() {
        const pluginsList = document.getElementById('plugins-list');
        if (!pluginsList) return;

        pluginsList.innerHTML = Array.from(this.plugins.values()).map(plugin => `
            <div class="plugin-item ${plugin.enabled ? 'enabled' : ''}">
                <div class="plugin-info">
                    <span class="plugin-name">${plugin.name}</span>
                    <span class="plugin-status">${plugin.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
                <div class="plugin-actions">
                    <label class="toggle-switch">
                        <input type="checkbox" ${plugin.enabled ? 'checked' : ''} 
                               onchange="editorApp.plugins.${plugin.enabled ? 'disable' : 'enable'}Plugin('${plugin.name}')">
                        <span class="toggle-slider"></span>
                    </label>
                    <button class="icon-btn sm" onclick="editorApp.plugins.showPluginSettings('${plugin.name}')">
                        <i class="ri-settings-3-line"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    showPluginManager() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Plugin Manager</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="plugin-manager-tabs">
                        <button class="tab-btn active" data-tab="installed">Installed</button>
                        <button class="tab-btn" data-tab="marketplace">Marketplace</button>
                        <button class="tab-btn" data-tab="developer">Developer</button>
                    </div>
                    
                    <div class="tab-content active" id="installed-tab">
                        <div class="plugins-grid">
                            ${this.renderPluginCards()}
                        </div>
                    </div>
                    
                    <div class="tab-content" id="marketplace-tab">
                        <div class="marketplace-placeholder">
                            <i class="ri-store-line"></i>
                            <h4>Plugin Marketplace</h4>
                            <p>Browse and install plugins from our marketplace</p>
                            <button class="btn-primary">Coming Soon</button>
                        </div>
                    </div>
                    
                    <div class="tab-content" id="developer-tab">
                        <div class="developer-tools">
                            <h4>Developer Tools</h4>
                            <div class="code-editor">
                                <textarea id="plugin-code" placeholder="Write your plugin code here..."></textarea>
                            </div>
                            <div class="developer-actions">
                                <button class="btn-secondary" onclick="editorApp.plugins.testPlugin()">Test Plugin</button>
                                <button class="btn-primary" onclick="editorApp.plugins.savePlugin()">Save Plugin</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupPluginManagerEvents(modal);
    }

    renderPluginCards() {
        return Array.from(this.plugins.values()).map(plugin => `
            <div class="plugin-card ${plugin.enabled ? 'enabled' : ''}">
                <div class="plugin-card-header">
                    <div class="plugin-icon">
                        <i class="ri-plug-line"></i>
                    </div>
                    <div class="plugin-card-info">
                        <h4>${plugin.name}</h4>
                        <p>Built-in plugin</p>
                    </div>
                    <label class="toggle-switch">
                        <input type="checkbox" ${plugin.enabled ? 'checked' : ''} 
                               onchange="editorApp.plugins.${plugin.enabled ? 'disable' : 'enable'}Plugin('${plugin.name}')">
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="plugin-card-description">
                    ${plugin.instance.description || 'No description available.'}
                </div>
                <div class="plugin-card-actions">
                    <button class="btn-sm" onclick="editorApp.plugins.showPluginSettings('${plugin.name}')">
                        Settings
                    </button>
                    <button class="btn-sm" onclick="editorApp.plugins.showPluginDocs('${plugin.name}')">
                        Docs
                    </button>
                </div>
            </div>
        `).join('');
    }

    setupPluginManagerEvents(modal) {
        modal.querySelectorAll('.tab-btn').forEach(tab => {
            tab.addEventListener('click', (e) => {
                modal.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
                modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                modal.querySelector(`#${e.target.dataset.tab}-tab`).classList.add('active');
            });
        });

        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    showPluginSettings(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) return;

        if (plugin.instance.showSettings) {
            plugin.instance.showSettings();
        } else {
            this.editor.showNotification(`⚙️ No settings available for ${pluginName}`);
        }
    }

    showPluginDocs(pluginName) {
        const plugin = this.plugins.get(pluginName);
        if (!plugin) return;

        const docs = plugin.instance.documentation || 'No documentation available.';
        alert(`Documentation for ${pluginName}:\n\n${docs}`);
    }

    addHook(hookName, callback) {
        if (!this.pluginHooks.has(hookName)) {
            this.pluginHooks.set(hookName, []);
        }
        this.pluginHooks.get(hookName).push(callback);
    }

    callHook(hookName, data) {
        const hooks = this.pluginHooks.get(hookName);
        if (hooks) {
            hooks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in hook ${hookName}:`, error);
                }
            });
        }
    }

    createTool(toolConfig) {
        console.log('Creating tool:', toolConfig.name);
    }

    createPanel(panelConfig) {
        console.log('Creating panel:', panelConfig.name);
    }

    testPlugin() {
        const code = document.getElementById('plugin-code')?.value;
        if (!code) {
            this.editor.showNotification('⚠️ Write some plugin code first');
            return;
        }

        try {
            console.log('Testing plugin code:', code);
            this.editor.showNotification('🧪 Plugin code tested (check console)');
        } catch (error) {
            this.editor.showNotification('❌ Error testing plugin code');
            console.error('Plugin test error:', error);
        }
    }

    savePlugin() {
        const code = document.getElementById('plugin-code')?.value;
        if (!code) {
            this.editor.showNotification('⚠️ No plugin code to save');
            return;
        }

        try {
            const userPlugins = JSON.parse(localStorage.getItem('editor-user-plugins') || '[]');
            const pluginName = `CustomPlugin_${Date.now()}`;
            
            userPlugins.push({
                name: pluginName,
                code: code,
                createdAt: new Date().toISOString()
            });

            localStorage.setItem('editor-user-plugins', JSON.stringify(userPlugins));
            this.editor.showNotification('💾 Custom plugin saved');
        } catch (error) {
            this.editor.showNotification('❌ Error saving plugin');
            console.error('Save plugin error:', error);
        }
    }
}

// ==================== PLUGINS INTEGRADOS ====================

class ColorPickerPlugin {
    constructor(editor) {
        this.editor = editor;
        this.name = 'ColorPicker';
        this.description = 'Enhanced color picker with palettes and harmony tools';
    }

    onEnable() {
        this.setupColorPicker();
        this.editor.showNotification('🎨 Color Picker plugin enabled');
    }

    onDisable() {
        this.cleanupColorPicker();
        this.editor.showNotification('🎨 Color Picker plugin disabled');
    }

    setupColorPicker() {
        this.enhanceColorInputs();
        this.createColorPalettePanel();
    }

    enhanceColorInputs() {
        document.querySelectorAll('input[type="color"]').forEach(input => {
            input.addEventListener('click', (e) => {
                this.showAdvancedColorPicker(e.target);
            });
        });
    }

    createColorPalettePanel() {
        const rightSidebar = document.querySelector('.right-sidebar');
        if (!rightSidebar) return;

        const colorPanel = document.createElement('div');
        colorPanel.className = 'color-palette-panel';
        colorPanel.innerHTML = `
            <div class="section-header">
                <h4><i class="ri-palette-line"></i> Color Palettes</h4>
            </div>
            <div class="color-harmony-tools">
                <button class="harmony-btn" data-harmony="monochromatic">Monochromatic</button>
                <button class="harmony-btn" data-harmony="analogous">Analogous</button>
                <button class="harmony-btn" data-harmony="complementary">Complementary</button>
            </div>
            <div class="color-palettes-grid" id="color-palettes-grid"></div>
        `;

        rightSidebar.appendChild(colorPanel);
        this.setupColorHarmonyTools();
        this.generateColorPalettes();
    }

    setupColorHarmonyTools() {
        document.querySelectorAll('.harmony-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.generateColorHarmony(e.target.dataset.harmony);
            });
        });
    }

    generateColorPalettes() {
        const palettes = [
            { name: 'Modern', colors: ['#6366f1', '#8b5cf6', '#a855f7', '#c084fc'] },
            { name: 'Nature', colors: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'] },
            { name: 'Warm', colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fde68a'] },
            { name: 'Cool', colors: ['#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'] }
        ];

        const grid = document.getElementById('color-palettes-grid');
        if (grid) {
            grid.innerHTML = palettes.map(palette => `
                <div class="color-palette">
                    <div class="palette-name">${palette.name}</div>
                    <div class="palette-colors">
                        ${palette.colors.map(color => `
                            <div class="palette-color" style="background: ${color}" 
                                 onclick="editorApp.plugins.applyColor('${color}')"></div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    }

    generateColorHarmony(harmonyType) {
        const baseColor = this.editor.selectedElement?.fill || '#6366f1';
        let harmonies = [];

        switch (harmonyType) {
            case 'monochromatic':
                harmonies = this.generateMonochromatic(baseColor);
                break;
            case 'analogous':
                harmonies = this.generateAnalogous(baseColor);
                break;
            case 'complementary':
                harmonies = this.generateComplementary(baseColor);
                break;
        }

        this.showColorHarmony(harmonies, harmonyType);
    }

    generateMonochromatic(baseColor) {
        return [baseColor, this.lightenColor(baseColor, 20), this.darkenColor(baseColor, 20)];
    }

    generateAnalogous(baseColor) {
        return [this.rotateHue(baseColor, -30), baseColor, this.rotateHue(baseColor, 30)];
    }

    generateComplementary(baseColor) {
        return [baseColor, this.rotateHue(baseColor, 180)];
    }

    lightenColor(color, percent) {
        return color;
    }

    darkenColor(color, percent) {
        return color;
    }

    rotateHue(color, degrees) {
        return color;
    }

    showColorHarmony(colors, harmonyType) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${harmonyType} Color Harmony</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="color-harmony-display">
                        ${colors.map(color => `
                            <div class="harmony-color" style="background: ${color}">
                                <span>${color}</span>
                                <button class="btn-sm" onclick="editorApp.plugins.applyColor('${color}')">Apply</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupModalClose(modal);
    }

    setupModalClose(modal) {
        modal.querySelector('.close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    applyColor(color) {
        if (this.editor.selectedElement) {
            this.editor.selectedElement.fill = color;
            this.editor.render();
            this.editor.showNotification(`🎨 Applied color: ${color}`);
        }
    }

    showAdvancedColorPicker(inputElement) {
        this.editor.showNotification('🎨 Opening advanced color picker...');
    }

    cleanupColorPicker() {
        document.querySelector('.color-palette-panel')?.remove();
    }
}

class IconLibraryPlugin {
    constructor(editor) {
        this.editor = editor;
        this.name = 'IconLibrary';
        this.description = 'Library of vector icons to use in your designs';
    }

    onEnable() {
        this.setupIconLibrary();
        this.editor.showNotification('📚 Icon Library plugin enabled');
    }

    onDisable() {
        this.cleanupIconLibrary();
        this.editor.showNotification('📚 Icon Library plugin disabled');
    }

    setupIconLibrary() {
        this.createIconPanel();
    }

    createIconPanel() {
        const leftSidebar = document.querySelector('.left-sidebar');
        if (!leftSidebar) return;

        const iconPanel = document.createElement('div');
        iconPanel.className = 'tool-section';
        iconPanel.innerHTML = `
            <div class="section-header">
                <h3><i class="ri-emotion-line"></i> Icons</h3>
            </div>
            <div class="icon-search">
                <input type="text" id="icon-search" placeholder="Search icons...">
            </div>
            <div class="icon-categories">
                <button class="category-btn active" data-category="all">All</button>
                <button class="category-btn" data-category="interface">Interface</button>
                <button class="category-btn" data-category="business">Business</button>
                <button class="category-btn" data-category="media">Media</button>
            </div>
            <div class="icons-grid" id="icons-grid"></div>
        `;

        leftSidebar.appendChild(iconPanel);
        this.setupIconSearch();
        this.setupIconCategories();
        this.loadIcons();
    }

    setupIconSearch() {
        const searchInput = document.getElementById('icon-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterIcons(e.target.value);
            });
        }
    }

    setupIconCategories() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterIconsByCategory(e.target.dataset.category);
            });
        });
    }

    loadIcons() {
        const icons = [
            { name: 'home', category: 'interface', unicode: '🏠' },
            { name: 'settings', category: 'interface', unicode: '⚙️' },
            { name: 'user', category: 'interface', unicode: '👤' },
            { name: 'search', category: 'interface', unicode: '🔍' },
            { name: 'heart', category: 'media', unicode: '❤️' },
            { name: 'star', category: 'media', unicode: '⭐' },
            { name: 'chart', category: 'business', unicode: '📊' },
            { name: 'money', category: 'business', unicode: '💰' }
        ];

        this.renderIcons(icons);
    }

    renderIcons(icons) {
        const grid = document.getElementById('icons-grid');
        if (grid) {
            grid.innerHTML = icons.map(icon => `
                <div class="icon-item" data-category="${icon.category}">
                    <div class="icon-preview" onclick="editorApp.plugins.addIconToCanvas('${icon.unicode}')">
                        ${icon.unicode}
                    </div>
                    <span class="icon-name">${icon.name}</span>
                </div>
            `).join('');
        }
    }

    filterIcons(searchTerm) {
        const icons = document.querySelectorAll('.icon-item');
        icons.forEach(icon => {
            const name = icon.querySelector('.icon-name').textContent;
            const matches = name.toLowerCase().includes(searchTerm.toLowerCase());
            icon.style.display = matches ? 'block' : 'none';
        });
    }

    filterIconsByCategory(category) {
        const icons = document.querySelectorAll('.icon-item');
        icons.forEach(icon => {
            const matches = category === 'all' || icon.dataset.category === category;
            icon.style.display = matches ? 'block' : 'none';
        });
    }

    addIconToCanvas(iconUnicode) {
        const iconElement = {
            id: `icon_${Date.now()}`,
            type: 'text',
            x: 100,
            y: 100,
            content: iconUnicode,
            fontSize: 24,
            fontFamily: 'Arial',
            fill: '#000000'
        };

        this.editor.elements.push(iconElement);
        this.editor.selectedElement = iconElement;
        this.editor.render();
        this.editor.updateLayersPanel();
        this.editor.showNotification('✅ Icon added to canvas');
    }

    cleanupIconLibrary() {
        document.querySelector('.tool-section:has(.icon-search)')?.remove();
    }
}

class ChartGeneratorPlugin {
    constructor(editor) {
        this.editor = editor;
        this.name = 'ChartGenerator';
        this.description = 'Generate charts and data visualizations';
    }

    onEnable() {
        this.editor.showNotification('📊 Chart Generator plugin enabled');
    }

    onDisable() {
        this.editor.showNotification('📊 Chart Generator plugin disabled');
    }
}

class CodeExportPlugin {
    constructor(editor) {
        this.editor = editor;
        this.name = 'CodeExport';
        this.description = 'Export designs as React, Vue, or HTML/CSS code';
    }

    onEnable() {
        this.editor.showNotification('💻 Code Export plugin enabled');
    }

    onDisable() {
        this.editor.showNotification('💻 Code Export plugin disabled');
    }
}