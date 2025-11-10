// component-system.js - Sistema de Componentes Maestros
class ComponentSystem {
    constructor(editor) {
        this.editor = editor;
        this.masterComponents = new Map();
        this.componentInstances = new Map();
        this.init();
    }

    init() {
        this.loadComponentLibrary();
        this.setupComponentUI();
    }

    setupComponentUI() {
        this.createComponentPanel();
    }

    createComponentPanel() {
        const leftSidebar = document.querySelector('.left-sidebar');
        if (!leftSidebar) return;

        const componentSection = document.createElement('div');
        componentSection.className = 'tool-section';
        componentSection.innerHTML = `
            <div class="section-header">
                <h3><i class="ri-box-3-line"></i> Master Components</h3>
                <button class="icon-btn" id="create-master-component">
                    <i class="ri-add-line"></i>
                </button>
            </div>
            <div class="master-components-list" id="master-components-list">
                <!-- Los componentes maestros se cargarán aquí -->
            </div>
        `;

        leftSidebar.appendChild(componentSection);
        this.renderMasterComponents();
        this.setupComponentEvents();
    }

    setupComponentEvents() {
        document.getElementById('create-master-component')?.addEventListener('click', () => {
            this.createMasterFromSelection();
        });
    }

    createMasterFromSelection() {
        if (!this.editor.selectedElement) {
            this.editor.showNotification('⚠️ Select an element to create master component');
            return;
        }

        const name = prompt('Enter component name:');
        if (!name) return;

        const masterComponent = {
            id: `master_${Date.now()}`,
            name: name,
            type: 'master',
            baseElement: JSON.parse(JSON.stringify(this.editor.selectedElement)),
            variants: {},
            instances: [],
            createdAt: new Date().toISOString()
        };

        this.masterComponents.set(masterComponent.id, masterComponent);
        this.saveComponentLibrary();
        this.renderMasterComponents();

        this.editor.showNotification(`🧩 Master component "${name}" created`);
    }

    createInstance(masterId, x, y) {
        const master = this.masterComponents.get(masterId);
        if (!master) return null;

        const instance = {
            id: `instance_${Date.now()}`,
            masterId: masterId,
            type: 'instance',
            ...JSON.parse(JSON.stringify(master.baseElement)),
            x: x || 100,
            y: y || 100
        };

        // Registrar instancia
        if (!this.componentInstances.has(masterId)) {
            this.componentInstances.set(masterId, []);
        }
        this.componentInstances.get(masterId).push(instance.id);

        // Agregar al editor
        this.editor.elements.push(instance);
        this.editor.selectedElement = instance;
        this.editor.render();
        this.editor.updateLayersPanel();

        return instance;
    }

    syncMasterChanges(masterId, changes) {
        const master = this.masterComponents.get(masterId);
        if (!master) return;

        // Aplicar cambios al componente maestro
        Object.assign(master.baseElement, changes);

        // Sincronizar todas las instancias
        const instances = this.componentInstances.get(masterId) || [];
        instances.forEach(instanceId => {
            const instance = this.editor.elements.find(el => el.id === instanceId);
            if (instance) {
                Object.assign(instance, JSON.parse(JSON.stringify(changes)));
            }
        });

        this.editor.render();
        this.editor.showNotification(`🔄 Synced changes to ${instances.length} instances`);
    }

    renderMasterComponents() {
        const list = document.getElementById('master-components-list');
        if (!list) return;

        list.innerHTML = Array.from(this.masterComponents.values()).map(master => `
            <div class="master-component-item" data-master-id="${master.id}">
                <div class="component-preview">
                    <div class="preview-content" style="
                        width: 40px; 
                        height: 24px; 
                        background: ${master.baseElement.fill || '#6366f1'};
                        border-radius: ${master.baseElement.borderRadius || 0}px;
                    "></div>
                </div>
                <div class="component-info">
                    <span class="component-name">${master.name}</span>
                    <span class="component-instances">${this.componentInstances.get(master.id)?.length || 0} instances</span>
                </div>
                <div class="component-actions">
                    <button class="icon-btn sm" onclick="editorApp.componentSystem.createInstance('${master.id}', 100, 100)" title="Add Instance">
                        <i class="ri-add-line"></i>
                    </button>
                    <button class="icon-btn sm" onclick="editorApp.componentSystem.editMaster('${master.id}')" title="Edit Master">
                        <i class="ri-edit-line"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    editMaster(masterId) {
        const master = this.masterComponents.get(masterId);
        if (!master) return;

        // Seleccionar el componente maestro para edición
        const masterElement = { ...master.baseElement, isMaster: true, masterId };
        this.editor.selectedElement = masterElement;
        
        // Mostrar panel de edición de componentes
        this.showMasterProperties(master);
    }

    showMasterProperties(master) {
        // Crear o mostrar panel de propiedades del componente maestro
        const existingPanel = document.getElementById('master-properties-panel');
        if (existingPanel) {
            existingPanel.remove();
        }

        const propertiesPanel = document.createElement('div');
        propertiesPanel.id = 'master-properties-panel';
        propertiesPanel.className = 'property-group';
        propertiesPanel.innerHTML = `
            <div class="property-header">
                <i class="ri-box-3-line"></i>
                <label class="property-label">Master: ${master.name}</label>
            </div>
            <div class="property-field">
                <label>Component Name</label>
                <input type="text" value="${master.name}" id="master-name-input">
            </div>
            <div class="property-field">
                <label>Description</label>
                <textarea id="master-desc-input" placeholder="Component description..."></textarea>
            </div>
            <div class="property-actions">
                <button class="btn-secondary" onclick="editorApp.componentSystem.detachInstance()">
                    Detach Instance
                </button>
                <button class="btn-primary" onclick="editorApp.componentSystem.updateMaster('${master.id}')">
                    Update Master
                </button>
            </div>
        `;

        document.querySelector('.properties-panel')?.appendChild(propertiesPanel);
    }

    updateMaster(masterId) {
        const master = this.masterComponents.get(masterId);
        if (!master || !this.editor.selectedElement) return;

        const nameInput = document.getElementById('master-name-input');
        if (nameInput) {
            master.name = nameInput.value;
        }

        // Sincronizar cambios con todas las instancias
        this.syncMasterChanges(masterId, this.editor.selectedElement);

        this.saveComponentLibrary();
        this.renderMasterComponents();
        this.editor.showNotification(`✅ Master component updated`);
    }

    detachInstance() {
        if (!this.editor.selectedElement || !this.editor.selectedElement.masterId) {
            this.editor.showNotification('⚠️ Select a component instance to detach');
            return;
        }

        const instance = this.editor.selectedElement;
        const masterId = instance.masterId;

        // Remover del sistema de componentes
        delete instance.masterId;
        delete instance.isMaster;

        const instances = this.componentInstances.get(masterId);
        if (instances) {
            const index = instances.indexOf(instance.id);
            if (index > -1) {
                instances.splice(index, 1);
            }
        }

        this.editor.showNotification('🔓 Instance detached from master');
    }

    saveComponentLibrary() {
        const library = {
            masters: Array.from(this.masterComponents.values()),
            instances: Object.fromEntries(this.componentInstances)
        };
        localStorage.setItem('editor-component-library', JSON.stringify(library));
    }

    loadComponentLibrary() {
        const saved = localStorage.getItem('editor-component-library');
        if (saved) {
            try {
                const library = JSON.parse(saved);
                
                library.masters.forEach(master => {
                    this.masterComponents.set(master.id, master);
                });

                Object.entries(library.instances).forEach(([masterId, instances]) => {
                    this.componentInstances.set(masterId, instances);
                });

                console.log('✅ Component library loaded');
            } catch (error) {
                console.error('❌ Error loading component library:', error);
            }
        }
    }

    // Analytics de uso de componentes
    getComponentUsageStats() {
        const stats = {
            totalMasters: this.masterComponents.size,
            totalInstances: 0,
            mostUsed: null
        };

        let maxInstances = 0;

        this.masterComponents.forEach((master, id) => {
            const instances = this.componentInstances.get(id) || [];
            stats.totalInstances += instances.length;

            if (instances.length > maxInstances) {
                maxInstances = instances.length;
                stats.mostUsed = master.name;
            }
        });

        return stats;
    }

    // Sistema de variantes
    createVariant(masterId, variantName, changes) {
        const master = this.masterComponents.get(masterId);
        if (!master) return;

        if (!master.variants) {
            master.variants = {};
        }

        master.variants[variantName] = changes;
        this.saveComponentLibrary();
        this.editor.showNotification(`🎨 Variant "${variantName}" created`);
    }

    applyVariant(instanceId, variantName) {
        const instance = this.editor.elements.find(el => el.id === instanceId);
        if (!instance || !instance.masterId) return;

        const master = this.masterComponents.get(instance.masterId);
        if (!master || !master.variants || !master.variants[variantName]) return;

        Object.assign(instance, JSON.parse(JSON.stringify(master.variants[variantName])));
        this.editor.render();
    }
}