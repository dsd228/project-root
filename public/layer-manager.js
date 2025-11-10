class LayerManager {
    constructor(editor) {
        this.editor = editor;
        this.layers = [];
    }

    syncWithElements() {
        this.layers = this.editor.elements.map(element => ({
            id: element.id,
            name: element.name || `${element.type} ${element.id.slice(-4)}`,
            type: element.type,
            visible: true,
            locked: false,
            element: element
        }));
    }

    toggleVisibility(layerId) {
        const layer = this.layers.find(l => l.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
            // Aquí puedes agregar lógica para ocultar/mostrar elementos en el render
        }
    }

    deleteLayer(layerId) {
        this.layers = this.layers.filter(layer => layer.id !== layerId);
        this.editor.elements = this.editor.elements.filter(element => element.id !== layerId);
    }

    moveLayer(layerId, direction) {
        const index = this.layers.findIndex(layer => layer.id === layerId);
        if (index === -1) return;

        if (direction === 'up' && index < this.layers.length - 1) {
            [this.layers[index], this.layers[index + 1]] = [this.layers[index + 1], this.layers[index]];
            [this.editor.elements[index], this.editor.elements[index + 1]] = [this.editor.elements[index + 1], this.editor.elements[index]];
        } else if (direction === 'down' && index > 0) {
            [this.layers[index], this.layers[index - 1]] = [this.layers[index - 1], this.layers[index]];
            [this.editor.elements[index], this.editor.elements[index - 1]] = [this.editor.elements[index - 1], this.editor.elements[index]];
        }
    }
}