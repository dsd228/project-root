class ResponsiveManager {
    constructor(editor) {
        this.editor = editor;
        this.currentDevice = 'desktop';
        this.deviceSizes = {
            'desktop': { width: 1440, height: 1024, name: 'Desktop' },
            'tablet': { width: 768, height: 1024, name: 'Tablet' },
            'mobile': { width: 375, height: 812, name: 'Mobile' }
        };
        
        this.init();
    }

    init() {
        this.setupDeviceSelector();
        this.setupEventListeners();
        this.updateDeviceView();
    }

    setupDeviceSelector() {
        document.querySelectorAll('.device-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.device-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDevice = e.target.dataset.device;
                this.updateDeviceView();
            });
        });
    }

    setupEventListeners() {
        // Vista previa responsive
        document.getElementById('preview-btn').addEventListener('click', () => {
            this.showPreview();
        });

        // Controles de grid y reglas
        document.getElementById('show-grid').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            this.toggleGrid();
        });

        document.getElementById('show-rulers').addEventListener('click', (e) => {
            e.target.classList.toggle('active');
            this.toggleRulers();
        });
    }

    updateDeviceView() {
        const deviceFrame = document.getElementById('device-frame');
        const currentSize = document.getElementById('current-size');
        const deviceInfo = this.deviceSizes[this.currentDevice];

        // Actualizar clases CSS
        deviceFrame.className = 'device-frame ' + this.currentDevice;
        
        // Actualizar tamaño mostrado
        currentSize.textContent = `${deviceInfo.width}×${deviceInfo.height}`;

        // Actualizar canvas
        this.editor.canvas.width = deviceInfo.width;
        this.editor.canvas.height = deviceInfo.height;

        // Centrar en el viewport
        this.centerCanvas();

        // Re-renderizar
        this.editor.render();
    }

    centerCanvas() {
        const deviceFrame = document.getElementById('device-frame');
        const workspace = document.querySelector('.workspace');
        
        deviceFrame.style.margin = '20px auto';
    }

    toggleGrid() {
        const grid = document.getElementById('grid-overlay');
        grid.style.display = grid.style.display === 'none' ? 'block' : 'none';
    }

    toggleRulers() {
        const rulerH = document.getElementById('ruler-h');
        const rulerV = document.getElementById('ruler-v');
        
        rulerH.style.display = rulerH.style.display === 'none' ? 'block' : 'none';
        rulerV.style.display = rulerV.style.display === 'none' ? 'block' : 'none';
    }

    showPreview() {
        const modal = document.getElementById('preview-modal');
        const previewContainer = document.getElementById('preview-container');
        const previewDevice = document.getElementById('preview-device');

        previewDevice.textContent = this.deviceSizes[this.currentDevice].name;
        
        // Crear preview del diseño actual
        previewContainer.innerHTML = `
            <div style="width: 100%; height: 100%; background: white; position: relative;">
                ${this.generateHTMLPreview()}
            </div>
        `;

        modal.style.display = 'block';
    }

    generateHTMLPreview() {
        // Generar HTML/CSS a partir de los elementos del canvas
        let html = '<div style="position: relative; width: 100%; height: 100%;">';
        
        this.editor.elements.forEach(element => {
            if (element.type === 'rectangle') {
                html += `
                    <div style="
                        position: absolute;
                        left: ${element.x}px;
                        top: ${element.y}px;
                        width: ${element.width}px;
                        height: ${element.height}px;
                        background: ${element.fill};
                        border: ${element.strokeWidth}px solid ${element.stroke};
                    "></div>
                `;
            } else if (element.type === 'text') {
                html += `
                    <div style="
                        position: absolute;
                        left: ${element.x}px;
                        top: ${element.y}px;
                        font-family: ${element.fontFamily};
                        font-size: ${element.fontSize}px;
                        color: ${element.fill};
                    ">${element.content}</div>
                `;
            }
        });

        html += '</div>';
        return html;
    }

    // Convertir diseño entre dispositivos
    convertLayoutToDevice(targetDevice) {
        const currentSize = this.deviceSizes[this.currentDevice];
        const targetSize = this.deviceSizes[targetDevice];
        
        const scaleX = targetSize.width / currentSize.width;
        const scaleY = targetSize.height / currentSize.height;
        
        this.editor.elements.forEach(element => {
            element.x *= scaleX;
            element.y *= scaleY;
            element.width *= scaleX;
            element.height *= scaleY;
            if (element.fontSize) {
                element.fontSize *= Math.min(scaleX, scaleY);
            }
        });
        
        this.currentDevice = targetDevice;
        this.updateDeviceView();
    }
}