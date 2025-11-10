class LayerManager {
    constructor(editor) {
        this.editor = editor;
        this.layers = [];
    }

    addLayer(element) {
        this.layers.push({
            id: element.id,
            name: `${element.type} Layer`,
            visible: true,
            locked: false,
            element: element
        });
        this.updateUI();
    }

    removeLayer(layerId) {
        this.layers = this.layers.filter(layer => layer.id !== layerId);
        this.updateUI();
    }

    toggleVisibility(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
            this.updateUI();
        }
    }

    updateUI() {
        // Actualizar la interfaz de usuario de capas
    }
}