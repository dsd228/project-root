// export-engine.js - Motor de Exportación para Desarrollo
class ExportEngine {
    constructor(editor) {
        this.editor = editor;
        this.exportFormats = {
            react: 'React Component',
            vue: 'Vue Component', 
            html: 'HTML/CSS',
            flutter: 'Flutter Widget',
            swiftui: 'SwiftUI View',
            android: 'Android XML'
        };
        this.init();
    }

    init() {
        this.setupExportUI();
    }

    setupExportUI() {
        this.createExportPanel();
        this.addExportToolbar();
    }

    addExportToolbar() {
        const workspaceHeader = document.querySelector('.workspace-header');
        if (!workspaceHeader) return;

        const exportControls = document.createElement('div');
        exportControls.className = 'export-controls';
        exportControls.innerHTML = `
            <div class="export-buttons">
                <button class="control-btn" id="quick-export" title="Quick Export">
                    <i class="ri-download-line"></i>
                    <span>Export</span>
                </button>
                <button class="control-btn" id="export-settings" title="Export Settings">
                    <i class="ri-settings-3-line"></i>
                </button>
            </div>
        `;

        workspaceHeader.querySelector('.workspace-controls').appendChild(exportControls);
        this.setupExportEvents();
    }

    createExportPanel() {
        const rightSidebar = document.querySelector('.right-sidebar');
        if (!rightSidebar) return;

        const exportPanel = document.createElement('div');
        exportPanel.className = 'export-panel';
        exportPanel.innerHTML = `
            <div class="section-header">
                <h3><i class="ri-download-line"></i> Export</h3>
            </div>
            
            <div class="export-format-selector">
                <label>Export Format</label>
                <select id="export-format">
                    ${Object.entries(this.exportFormats).map(([key, name]) => 
                        `<option value="${key}">${name}</option>`
                    ).join('')}
                </select>
            </div>

            <div class="export-options">
                <div class="option-group">
                    <h4>Code Options</h4>
                    <label class="checkbox-option">
                        <input type="checkbox" id="export-responsive" checked>
                        <span>Responsive</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="export-semantic" checked>
                        <span>Semantic HTML</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="export-accessible">
                        <span>Accessible (ARIA)</span>
                    </label>
                </div>

                <div class="option-group">
                    <h4>Style Options</h4>
                    <label class="checkbox-option">
                        <input type="checkbox" id="export-css-variables" checked>
                        <span>CSS Variables</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="export-tailwind">
                        <span>Tailwind CSS</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="export-styled-components">
                        <span>Styled Components</span>
                    </label>
                </div>
            </div>

            <div class="export-preview" id="export-preview">
                <div class="preview-placeholder">
                    <p>Select export options to see preview</p>
                </div>
            </div>

            <div class="export-actions">
                <button class="btn-secondary" onclick="editorApp.exportEngine.copyCode()">
                    Copy Code
                </button>
                <button class="btn-primary" onclick="editorApp.exportEngine.generateExport()">
                    Generate Export
                </button>
            </div>
        `;

        rightSidebar.appendChild(exportPanel);
        this.setupExportOptions();
    }

    setupExportEvents() {
        document.getElementById('quick-export')?.addEventListener('click', () => {
            this.quickExport();
        });

        document.getElementById('export-settings')?.addEventListener('click', () => {
            this.showExportSettings();
        });
    }

    setupExportOptions() {
        document.querySelectorAll('#export-panel input, #export-panel select').forEach(element => {
            element.addEventListener('change', () => {
                this.updateExportPreview();
            });
        });
    }

    quickExport() {
        const format = document.getElementById('export-format')?.value || 'html';
        this.generateCode(format);
    }

    generateExport() {
        const format = document.getElementById('export-format')?.value || 'html';
        const code = this.generateCode(format);
        this.showExportModal(code, format);
    }

    generateCode(format) {
        const elements = this.editor.elements;
        let code = '';

        const options = {
            responsive: document.getElementById('export-responsive')?.checked || false,
            semantic: document.getElementById('export-semantic')?.checked || false,
            accessible: document.getElementById('export-accessible')?.checked || false,
            cssVariables: document.getElementById('export-css-variables')?.checked || false,
            tailwind: document.getElementById('export-tailwind')?.checked || false,
            styledComponents: document.getElementById('export-styled-components')?.checked || false
        };

        switch (format) {
            case 'react':
                code = this.generateReactCode(elements, options);
                break;
            case 'vue':
                code = this.generateVueCode(elements, options);
                break;
            case 'html':
                code = this.generateHTMLCode(elements, options);
                break;
            case 'flutter':
                code = this.generateFlutterCode(elements, options);
                break;
            case 'swiftui':
                code = this.generateSwiftUICode(elements, options);
                break;
            case 'android':
                code = this.generateAndroidCode(elements, options);
                break;
        }

        return code;
    }

    generateReactCode(elements, options) {
        let code = `import React from 'react';\n`;

        if (options.styledComponents) {
            code += `import styled from 'styled-components';\n\n`;
        } else if (options.cssVariables) {
            code += `import './styles.css';\n\n`;
        }

        code += `const DesignComponent = () => {\n`;
        code += `  return (\n`;
        code += `    <div className="design-container">\n`;

        elements.forEach(element => {
            switch (element.type) {
                case 'rectangle':
                    code += this.generateReactRectangle(element, options);
                    break;
                case 'text':
                    code += this.generateReactText(element, options);
                    break;
                case 'circle':
                    code += this.generateReactCircle(element, options);
                    break;
            }
        });

        code += `    </div>\n`;
        code += `  );\n`;
        code += `};\n\n`;
        code += `export default DesignComponent;\n`;

        return code;
    }

    generateReactRectangle(element, options) {
        const style = {
            position: 'absolute',
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
            backgroundColor: element.fill,
            border: element.stroke !== 'none' ? `1px solid ${element.stroke}` : 'none',
            borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0'
        };

        const styleString = Object.entries(style)
            .map(([key, value]) => `${key}: '${value}'`)
            .join(', ');

        return `      <div style={{${styleString}}}></div>\n`;
    }

    generateReactText(element, options) {
        const style = {
            position: 'absolute',
            left: `${element.x}px`,
            top: `${element.y}px`,
            fontSize: `${element.fontSize}px`,
            fontFamily: element.fontFamily,
            color: element.fill,
            fontWeight: element.fontWeight
        };

        const styleString = Object.entries(style)
            .map(([key, value]) => `${key}: '${value}'`)
            .join(', ');

        return `      <div style={{${styleString}}}>${element.content}</div>\n`;
    }

    generateHTMLCode(elements, options) {
        let code = `<!DOCTYPE html>\n`;
        code += `<html lang="en">\n`;
        code += `<head>\n`;
        code += `  <meta charset="UTF-8">\n`;
        code += `  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n`;
        code += `  <title>Exported Design</title>\n`;
        
        if (options.cssVariables) {
            code += this.generateCSSVariables();
        }
        
        code += `  <style>\n`;
        code += this.generateCSSCode(elements, options);
        code += `  </style>\n`;
        code += `</head>\n`;
        code += `<body>\n`;
        code += `  <div class="design-container">\n`;

        elements.forEach((element, index) => {
            code += this.generateHTMLElement(element, index, options);
        });

        code += `  </div>\n`;
        code += `</body>\n`;
        code += `</html>\n`;

        return code;
    }

    generateCSSCode(elements, options) {
        let css = `    .design-container {\n`;
        css += `      position: relative;\n`;
        css += `      width: 100vw;\n`;
        css += `      height: 100vh;\n`;
        css += `    }\n\n`;

        elements.forEach((element, index) => {
            css += `    .element-${index} {\n`;
            css += `      position: absolute;\n`;
            
            switch (element.type) {
                case 'rectangle':
                    css += `      left: ${element.x}px;\n`;
                    css += `      top: ${element.y}px;\n`;
                    css += `      width: ${element.width}px;\n`;
                    css += `      height: ${element.height}px;\n`;
                    css += `      background: ${element.fill};\n`;
                    if (element.stroke !== 'none') {
                        css += `      border: 1px solid ${element.stroke};\n`;
                    }
                    if (element.borderRadius) {
                        css += `      border-radius: ${element.borderRadius}px;\n`;
                    }
                    break;
                    
                case 'text':
                    css += `      left: ${element.x}px;\n`;
                    css += `      top: ${element.y}px;\n`;
                    css += `      font-size: ${element.fontSize}px;\n`;
                    css += `      font-family: ${element.fontFamily};\n`;
                    css += `      color: ${element.fill};\n`;
                    css += `      font-weight: ${element.fontWeight};\n`;
                    break;
            }
            
            css += `    }\n\n`;
        });

        return css;
    }

    generateHTMLElement(element, index, options) {
        switch (element.type) {
            case 'rectangle':
                return `    <div class="element-${index}"></div>\n`;
            case 'text':
                return `    <div class="element-${index}">${element.content}</div>\n`;
            case 'circle':
                return `    <div class="element-${index}"></div>\n`;
            default:
                return '';
        }
    }

    generateCSSVariables() {
        return `  <style>\n    :root {\n      --primary-color: #6366f1;\n      --text-color: #1e293b;\n      --background-color: #ffffff;\n    }\n  </style>\n`;
    }

    generateVueCode(elements, options) {
        let code = `<template>\n`;
        code += `  <div class="design-container">\n`;
        
        elements.forEach((element, index) => {
            code += this.generateVueElement(element, index);
        });
        
        code += `  </div>\n`;
        code += `</template>\n\n`;
        code += `<script>\n`;
        code += `export default {\n`;
        code += `  name: 'DesignComponent'\n`;
        code += `}\n`;
        code += `</script>\n\n`;
        code += `<style scoped>\n`;
        code += this.generateCSSCode(elements, options);
        code += `</style>\n`;

        return code;
    }

    generateVueElement(element, index) {
        const style = this.getElementStyle(element);
        return `    <div class="element-${index}" :style="${style}">${element.type === 'text' ? element.content : ''}</div>\n`;
    }

    getElementStyle(element) {
        const style = {};
        
        switch (element.type) {
            case 'rectangle':
                style.left = `${element.x}px`;
                style.top = `${element.y}px`;
                style.width = `${element.width}px`;
                style.height = `${element.height}px`;
                style.background = element.fill;
                if (element.stroke !== 'none') style.border = `1px solid ${element.stroke}`;
                if (element.borderRadius) style.borderRadius = `${element.borderRadius}px`;
                break;
                
            case 'text':
                style.left = `${element.x}px`;
                style.top = `${element.y}px`;
                style.fontSize = `${element.fontSize}px`;
                style.fontFamily = element.fontFamily;
                style.color = element.fill;
                style.fontWeight = element.fontWeight;
                break;
        }
        
        return JSON.stringify(style);
    }

    generateFlutterCode(elements, options) {
        let code = `import 'package:flutter/material.dart';\n\n`;
        code += `class DesignWidget extends StatelessWidget {\n`;
        code += `  @override\n`;
        code += `  Widget build(BuildContext context) {\n`;
        code += `    return Scaffold(\n`;
        code += `      body: Stack(\n`;
        code += `        children: [\n`;

        elements.forEach(element => {
            code += this.generateFlutterElement(element);
        });

        code += `        ],\n`;
        code += `      ),\n`;
        code += `    );\n`;
        code += `  }\n`;
        code += `}\n`;

        return code;
    }

    generateFlutterElement(element) {
        switch (element.type) {
            case 'rectangle':
                return `          Positioned(\n            left: ${element.x},\n            top: ${element.y},\n            child: Container(\n              width: ${element.width},\n              height: ${element.height},\n              decoration: BoxDecoration(\n                color: ${this.flutterColor(element.fill)},\n                border: ${element.stroke !== 'none' ? `Border.all(color: ${this.flutterColor(element.stroke)})` : 'null'},\n                borderRadius: ${element.borderRadius ? `BorderRadius.circular(${element.borderRadius})` : 'null'},\n              ),\n            ),\n          ),\n`;
            default:
                return '';
        }
    }

    flutterColor(color) {
        return `Color(0xFF${color.replace('#', '')})`;
    }

    updateExportPreview() {
        const preview = document.getElementById('export-preview');
        if (!preview) return;

        const format = document.getElementById('export-format')?.value || 'html';
        const code = this.generateCode(format);

        preview.innerHTML = `
            <div class="code-preview">
                <div class="preview-header">
                    <span>${this.exportFormats[format]} Preview</span>
                    <button class="icon-btn sm" onclick="editorApp.exportEngine.copyCode()">
                        <i class="ri-file-copy-line"></i>
                    </button>
                </div>
                <pre><code>${this.escapeHtml(code)}</code></pre>
            </div>
        `;
    }

    showExportModal(code, format) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content export-modal">
                <div class="modal-header">
                    <h3>Export ${this.exportFormats[format]}</h3>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="export-code">
                        <pre><code>${this.escapeHtml(code)}</code></pre>
                    </div>
                    <div class="export-actions-modal">
                        <button class="btn-secondary" onclick="editorApp.exportEngine.copyCode()">
                            Copy Code
                        </button>
                        <button class="btn-secondary" onclick="editorApp.exportEngine.downloadCode('${format}')">
                            Download
                        </button>
                        <button class="btn-primary" onclick="editorApp.exportEngine.closeExportModal()">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupExportModalEvents(modal);
    }

    setupExportModalEvents(modal) {
        modal.querySelector('.close').addEventListener('click', () => {
            modal.remove();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    closeExportModal() {
        document.querySelector('.export-modal')?.closest('.modal')?.remove();
    }

    copyCode() {
        const format = document.getElementById('export-format')?.value || 'html';
        const code = this.generateCode(format);
        
        navigator.clipboard.writeText(code).then(() => {
            this.editor.showNotification('📋 Code copied to clipboard');
        });
    }

    downloadCode(format) {
        const code = this.generateCode(format);
        const blob = new Blob([code], { type: 'text/plain' });
        const link = document.createElement('a');
        link.download = `design.${this.getFileExtension(format)}`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        
        this.editor.showNotification('💾 Code downloaded');
    }

    getFileExtension(format) {
        const extensions = {
            react: 'jsx',
            vue: 'vue',
            html: 'html',
            flutter: 'dart',
            swiftui: 'swift',
            android: 'xml'
        };
        return extensions[format] || 'txt';
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showExportSettings() {
        this.editor.showNotification('⚙️ Export settings opened');
    }

    generateSwiftUICode(elements, options) {
        return `// SwiftUI View\nimport SwiftUI\n\nstruct DesignView: View {\n    var body: some View {\n        ZStack {\n            // SwiftUI elements would go here\n        }\n    }\n}\n`;
    }

    generateAndroidCode(elements, options) {
        return `<!-- Android XML Layout -->\n<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"\n    android:layout_width="match_parent"\n    android:layout_height="match_parent">\n    \n    <!-- Android views would go here -->\n    \n</RelativeLayout>`;
    }

    generateReactCircle(element, options) {
        const style = {
            position: 'absolute',
            left: `${element.x - element.radius}px`,
            top: `${element.y - element.radius}px`,
            width: `${element.radius * 2}px`,
            height: `${element.radius * 2}px`,
            backgroundColor: element.fill,
            border: element.stroke !== 'none' ? `1px solid ${element.stroke}` : 'none',
            borderRadius: '50%'
        };

        const styleString = Object.entries(style)
            .map(([key, value]) => `${key}: '${value}'`)
            .join(', ');

        return `      <div style={{${styleString}}}></div>\n`;
    }
}