// Añade/actualiza dentro de la clase EditorApp:

    // llama a esta función desde createText(...) justo después de agregar el elemento
    activateTextEditing(textElement) {
        try {
            if (!textElement || textElement.type !== 'text') return;

            // Si ya hay un editor activo, cerrarlo primero
            if (this._activeTextInput) {
                try { this._activeTextInput.remove(); } catch (e) {}
                this._activeTextInput = null;
            }

            const rect = this.canvas.getBoundingClientRect();

            // Crear input
            const input = document.createElement('input');
            input.type = 'text';
            input.value = textElement.content || '';
            input.className = 'editor-text-input';
            input.style.position = 'absolute';
            input.style.zIndex = 100000;
            input.style.background = 'transparent';
            input.style.color = textElement.fill || '#000';
            input.style.border = '1px dashed rgba(99,102,241,0.8)';
            input.style.padding = '2px 6px';
            input.style.outline = 'none';
            input.style.boxSizing = 'border-box';

            // Compute position relative to viewport using canvas rect, zoom and offset
            const left = rect.left + window.scrollX + (textElement.x * this.zoom + this.offset.x);
            const top  = rect.top  + window.scrollY + (textElement.y * this.zoom + this.offset.y) - (textElement.fontSize || 16) * this.zoom;

            input.style.left = `${Math.round(left)}px`;
            input.style.top  = `${Math.round(top)}px`;

            // Font styling to match canvas text
            const fontSizePx = ((textElement.fontSize || 16) * this.zoom) + 'px';
            const fontWeight = textElement.fontWeight || '400';
            const fontFamily = textElement.fontFamily || 'Inter';
            input.style.font = `${fontWeight} ${fontSizePx} ${fontFamily}`;

            // Width estimate: base on text length or element width
            const baseWidth = textElement.width || Math.max(120, (textElement.content || '').length * 8);
            input.style.minWidth = Math.max(60, Math.round(baseWidth * this.zoom)) + 'px';

            // Append and focus
            document.body.appendChild(input);
            input.focus();
            input.select();

            // Save refs so we can remove later
            this._activeTextInput = input;
            this._editingTextElement = textElement;

            // Handlers
            const commit = () => {
                if (!this._editingTextElement) return;
                this._editingTextElement.content = input.value;
                // If desired, update properties like width/height
                if (typeof this.updateLayersPanel === 'function') this.updateLayersPanel();
                if (typeof this.render === 'function') this.render();
                cleanup();
            };

            const cancel = () => {
                cleanup();
            };

            function cleanup() {
                try { if (input && input.parentNode) input.parentNode.removeChild(input); } catch (e){}
                if (this) { this._activeTextInput = null; this._editingTextElement = null; }
            }

            // Bind events
            input.addEventListener('blur', () => commit());
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    commit();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancel();
                }
            });

            // Reposition on window resize/scroll so input stays in place
            const reposition = () => {
                if (!this._editingTextElement || !this._activeTextInput) return;
                const rect2 = this.canvas.getBoundingClientRect();
                const left2 = rect2.left + window.scrollX + (this._editingTextElement.x * this.zoom + this.offset.x);
                const top2  = rect2.top  + window.scrollY + (this._editingTextElement.y * this.zoom + this.offset.y) - (this._editingTextElement.fontSize || 16) * this.zoom;
                this._activeTextInput.style.left = `${Math.round(left2)}px`;
                this._activeTextInput.style.top  = `${Math.round(top2)}px`;
                // update font size if zoom changed
                this._activeTextInput.style.font = `${this._editingTextElement.fontWeight || '400'} ${((this._editingTextElement.fontSize || 16) * this.zoom)}px ${this._editingTextElement.fontFamily || 'Inter'}`;
            };

            // keep reference to handler so we can remove later if needed
            this._textRepositionHandler = reposition.bind(this);
            window.addEventListener('scroll', this._textRepositionHandler, true);
            window.addEventListener('resize', this._textRepositionHandler, true);

            // cleanup should also remove listeners
            const originalCleanup = cleanup.bind(this);
            cleanup = () => {
                try {
                    window.removeEventListener('scroll', this._textRepositionHandler, true);
                    window.removeEventListener('resize', this._textRepositionHandler, true);
                } catch (err) {}
                try { if (input && input.parentNode) input.parentNode.removeChild(input); } catch (e){}
                this._activeTextInput = null;
                this._editingTextElement = null;
            };
        } catch (err) {
            console.warn('activateTextEditing failed', err);
        }
    }

    // Modifica setupCanvasListeners() para añadir dblclick handling (si no lo tienes aún)
    // dentro de setupCanvasListeners, añade justo después de mouse listeners:
    // this.canvas.addEventListener('dblclick', (e) => { ... });

    // Ejemplo a pegar dentro de setupCanvasListeners() (asegúrate de no duplicar)
    // (si ya tienes setupCanvasListeners en tu init-core.js, busca el bloque y añade el siguiente listener)
    // -------------------------
    // this.canvas.addEventListener('dblclick', (e) => {
    //     try {
    //         const rect = this.canvas.getBoundingClientRect();
    //         const x = (e.clientX - rect.left - this.offset.x) / this.zoom;
    //         const y = (e.clientY - rect.top - this.offset.y) / this.zoom;
    //         // Si hay elemento seleccionado de tipo texto, entrar en edición
    //         if (this.selectedElement && this.selectedElement.type === 'text') {
    //             this.activateTextEditing(this.selectedElement);
    //             return;
    //         }
    //         // Si la herramienta actual es text, crear y editar de inmediato
    //         if (this.currentTool === 'text') {
    //             const textEl = {
    //                 id: `text_${Date.now()}`,
    //                 type: 'text',
    //                 x, y,
    //                 content: '',
    //                 fontSize: 16,
    //                 fontFamily: 'Inter',
    //                 fill: '#000000',
    //                 fontWeight: '400'
    //             };
    //             this.elements.push(textEl);
    //             this.selectedElement = textEl;
    //             this.render();
    //             this.activateTextEditing(textEl);
    //         }
    //     } catch (err) {
    //         console.warn('dblclick handler failed', err);
    //     }
    // });
    // -------------------------

// FIN del bloque a pegar en init-core.js
