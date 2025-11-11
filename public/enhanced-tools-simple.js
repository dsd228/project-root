// enhanced-tools-simple.js
// Fallback y utilidades mínimas para EnhancedTools adaptadas a las llamadas que hace init-complete / init-final.
// Implementa renderImageElement, openImageUpload, createButton, openIconLibrary, createNewFrame, exportFrameAsHTML
// y algunos helpers para no romper el flujo si la librería real no existe.

(function (global) {
    'use strict';

    function looksLikeConstructor(v) {
        return typeof v === 'function' && (v.prototype && Object.getOwnPropertyNames(v.prototype).length > 1);
    }

    // Si ya existe la librería real, la envolvemos para atrapar errores al construir.
    if (looksLikeConstructor(global.EnhancedTools)) {
        const Native = global.EnhancedTools;
        global.EnhancedTools = function (...args) {
            try {
                return new Native(...args);
            } catch (err) {
                console.warn('EnhancedTools native constructor failed, using fallback. Error:', err);
                return new EnhancedToolsFallback(...args);
            }
        };
        global.EnhancedTools.prototype = Native.prototype;
        return;
    }

    // Fallback completo
    console.info('EnhancedTools not found — installing fallback implementation.');

    class EnhancedToolsFallback {
        constructor(app) {
            this.app = app || null;
            this.currentFrame = null;
            this.__isEnhancedToolsFallback = true;
            this._images = {}; // cache of created images
        }

        init() {
            // no-op
        }

        // Render image element: expects element.src or element.dataUrl
        renderImageElement(ctx, element) {
            if (!ctx || !element) return;
            try {
                if (!element._img && element.src) {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.src = element.src;
                    element._img = img;
                    img.onload = () => {
                        if (this.app && typeof this.app.render === 'function') {
                            this.app.render();
                        }
                    };
                }
                const img = element._img;
                if (img && img.complete) {
                    const w = element.width || img.width;
                    const h = element.height || img.height;
                    ctx.drawImage(img, element.x || 0, element.y || 0, w, h);
                } else {
                    // placeholder box while image loads
                    ctx.fillStyle = element.fill || '#e2e8f0';
                    ctx.fillRect(element.x || 0, element.y || 0, element.width || 100, element.height || 60);
                    ctx.fillStyle = '#64748b';
                    ctx.font = '12px Inter';
                    ctx.fillText('Loading image...', (element.x || 0) + 8, (element.y || 0) + 20);
                }
            } catch (err) {
                console.warn('renderImageElement failed', err);
            }
        }

        // Open simple image upload and create an image element on canvas
        openImageUpload() {
            try {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.style.display = 'none';
                document.body.appendChild(input);
                input.addEventListener('change', (ev) => {
                    const file = ev.target.files && ev.target.files[0];
                    if (!file) {
                        document.body.removeChild(input);
                        return;
                    }
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const dataUrl = e.target.result;
                        // create image element on the base app
                        if (this.app && this.app.elements) {
                            const el = {
                                id: `image_${Date.now()}`,
                                type: 'image',
                                x: 100,
                                y: 100,
                                width: 240,
                                height: 160,
                                src: dataUrl
                            };
                            this.app.elements.push(el);
                            this.app.selectedElement = el;
                            if (typeof this.app.updateLayersPanel === 'function') this.app.updateLayersPanel();
                            if (typeof this.app.render === 'function') this.app.render();
                            if (typeof this.app.showNotification === 'function') this.app.showNotification('🖼️ Imagen subida');
                        }
                        document.body.removeChild(input);
                    };
                    reader.readAsDataURL(file);
                });
                input.click();
            } catch (err) {
                console.warn('openImageUpload fallback failed', err);
            }
        }

        // Create a simple button component (rectangle + text)
        createButton() {
            if (!this.app || !this.app.elements) return;
            const timestamp = Date.now();
            const btnRect = {
                id: `enh_btn_${timestamp}`,
                type: 'rectangle',
                x: 120,
                y: 120,
                width: 140,
                height: 48,
                fill: '#06b6d4',
                stroke: 'none',
                borderRadius: 8
            };
            const btnText = {
                id: `enh_btn_text_${timestamp}`,
                type: 'text',
                x: btnRect.x + btnRect.width / 2 - 30,
                y: btnRect.y + btnRect.height / 2 + 5,
                content: 'Botón',
                fontSize: 16,
                fontFamily: 'Inter',
                fill: '#ffffff',
                fontWeight: '600'
            };
            this.app.elements.push(btnRect);
            this.app.elements.push(btnText);
            this.app.selectedElement = btnRect;
            if (typeof this.app.updateLayersPanel === 'function') this.app.updateLayersPanel();
            if (typeof this.app.render === 'function') this.app.render();
            if (typeof this.app.showNotification === 'function') this.app.showNotification('🔘 Botón creado');
        }

        openIconLibrary() {
            // Simple stub: insert a colored square as an "icon"
            if (!this.app) return;
            const timestamp = Date.now();
            const icon = {
                id: `icon_${timestamp}`,
                type: 'rectangle',
                x: 140,
                y: 140,
                width: 48,
                height: 48,
                fill: '#f97316',
                stroke: 'none',
                borderRadius: 8
            };
            this.app.elements.push(icon);
            this.app.selectedElement = icon;
            if (typeof this.app.updateLayersPanel === 'function') this.app.updateLayersPanel();
            if (typeof this.app.render === 'function') this.app.render();
            if (typeof this.app.showNotification === 'function') this.app.showNotification('🔠 Icono insertado (fallback)');
        }

        createNewFrame() {
            if (!this.app) return;
            const frame = {
                id: `frame_${Date.now()}`,
                type: 'frame',
                x: 60,
                y: 60,
                width: 900,
                height: 600,
                fill: 'transparent',
                stroke: '#e2e8f0',
                strokeWidth: 2,
                name: 'Nuevo Frame'
            };
            this.app.elements.push(frame);
            this.app.selectedElement = frame;
            if (typeof this.app.updateLayersPanel === 'function') this.app.updateLayersPanel();
            if (typeof this.app.render === 'function') this.app.render();
            if (typeof this.app.showNotification === 'function') this.app.showNotification('📱 Frame creado (fallback)');
            this.currentFrame = frame;
            return frame;
        }

        exportFrameAsHTML(frame) {
            try {
                const target = frame || this.currentFrame || (this.app && this.app.selectedElement);
                const elems = this.app && this.app.elements ? this.app.elements : [];
                let body = '';
                elems.forEach(e => {
                    if (!target || (e.x >= (target.x || 0) && e.y >= (target.y || 0) &&
                        e.x <= (target.x || 0) + (target.width || 1000))) {
                        if (e.type === 'rectangle' || e.type === 'frame') {
                            body += `<div style="position:absolute; left:${e.x}px; top:${e.y}px; width:${e.width}px; height:${e.height}px; background:${e.fill}; border:${e.strokeWidth||0}px solid ${e.stroke||'transparent'}; border-radius:${e.borderRadius||0}px"></div>\n`;
                        } else if (e.type === 'text') {
                            body += `<div style="position:absolute; left:${e.x}px; top:${e.y}px; font-size:${e.fontSize||16}px; font-family:${e.fontFamily||'Inter'}; color:${e.fill||'#000'}">${e.content}</div>\n`;
                        } else if (e.type === 'image') {
                            body += `<img src="${e.src||''}" style="position:absolute; left:${e.x}px; top:${e.y}px; width:${e.width||100}px; height:${e.height||100}px" />\n`;
                        } else if (e.type === 'line') {
                            body += `<!-- line at ${e.x1},${e.y1} to ${e.x2},${e.y2} -->\n`;
                        } else if (e.type === 'path') {
                            body += `<!-- path (freehand) -->\n`;
                        }
                    }
                });
                const html = `<!doctype html><html><head><meta charset="utf-8"><title>Export</title><style>body{position:relative;margin:0;padding:0}</style></head><body>${body}</body></html>`;
                return html;
            } catch (err) {
                console.warn('exportFrameAsHTML failed', err);
                return '<!-- export failed -->';
            }
        }

        // Generic event hooks for compatibility
        on() {}
        off() {}
        enable() { return false; }
        disable() { return false; }
    }

    global.EnhancedTools = EnhancedToolsFallback;

})(window);
