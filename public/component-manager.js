class ComponentManager {
    constructor(editor) {
        this.editor = editor;
        this.components = { ...ButtonComponents };
    }

    getComponent(type) {
        return this.components[type];
    }

    getAllComponents() {
        return this.components;
    }

    addComponent(componentType, x, y) {
        const component = this.components[componentType];
        if (component) {
            const bgElement = { 
                ...component.element, 
                x, y, 
                id: 'comp_' + Date.now() 
            };
            const textElement = { 
                ...component.text, 
                x: x + bgElement.width/2 - 30, 
                y: y + bgElement.height/2 + 5,
                id: 'text_' + Date.now()
            };
            
            this.editor.elements.push(bgElement);
            this.editor.elements.push(textElement);
            this.editor.selectedElement = bgElement;
            this.editor.render();
            this.editor.updateLayersPanel();
            return true;
        }
        return false;
    }
}