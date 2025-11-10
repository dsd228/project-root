class TemplateManager {
    constructor(editor) {
        this.editor = editor;
        this.templates = { ...WebTemplates, ...MobileTemplates };
    }

    getTemplatesByCategory(category) {
        return Object.entries(this.templates).filter(([key, template]) => 
            template.category === category
        );
    }

    getTemplatesByDevice(device) {
        return Object.entries(this.templates).filter(([key, template]) => 
            template.device === device
        );
    }

    loadTemplate(templateId) {
        const template = this.templates[templateId];
        if (template) {
            this.editor.elements = JSON.parse(JSON.stringify(template.elements));
            this.editor.responsiveManager.setDevice(template.device);
            this.editor.render();
            this.editor.updateLayersPanel();
            return true;
        }
        return false;
    }
}