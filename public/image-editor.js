export class ImageEditor {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    if (!this.container) throw new Error('Container not found');
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'image-editor-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.controls = document.createElement('div');
    this.controls.className = 'image-editor-controls';
    this.container.appendChild(this.controls);

    this._buildControls();

    this.image = new Image();
    this.state = { angle: 0, scale: 1, opacity: 1, crop: null };
  }

  _buildControls() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,image/svg+xml';
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) this.loadFile(file);
    });
    this.controls.appendChild(fileInput);

    const rotateBtn = document.createElement('button');
    rotateBtn.textContent = 'Rotar 90°';
    rotateBtn.addEventListener('click', () => {
      this.state.angle = (this.state.angle + 90) % 360;
      this._render();
    });
    this.controls.appendChild(rotateBtn);

    const scaleInput = document.createElement('input');
    scaleInput.type = 'range';
    scaleInput.min = 0.1; scaleInput.max = 3; scaleInput.step = 0.1; scaleInput.value = 1;
    scaleInput.addEventListener('input', (e) => {
      this.state.scale = parseFloat(e.target.value);
      this._render();
    });
    this.controls.appendChild(scaleInput);

    const opacityInput = document.createElement('input');
    opacityInput.type = 'range';
    opacityInput.min = 0; opacityInput.max = 1; opacityInput.step = 0.05; opacityInput.value = 1;
    opacityInput.addEventListener('input', (e) => {
      this.state.opacity = parseFloat(e.target.value);
      this._render();
    });
    this.controls.appendChild(opacityInput);

    const cropBtn = document.createElement('button');
    cropBtn.textContent = 'Crop (drag)';
    cropBtn.addEventListener('click', () => this._enableCropMode());
    this.controls.appendChild(cropBtn);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar edición';
    saveBtn.addEventListener('click', () => this.exportAndUpload());
    this.controls.appendChild(saveBtn);
  }

  async loadFile(file) {
    if (typeof file === 'string') {
      this.image.src = file;
      await this._waitImageLoad();
      this._initCanvas();
      this._render();
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      this.image.src = reader.result;
      await this._waitImageLoad();
      this._initCanvas();
      this._render();
      this._currentFile = file;
    };
    reader.readAsDataURL(file);
  }

  _waitImageLoad() {
    return new Promise((resolve, reject) => {
      if (this.image.complete && this.image.naturalWidth) return resolve();
      this.image.onload = () => resolve();
      this.image.onerror = (e) => reject(e);
    });
  }

  _initCanvas() {
    const maxW = 1200;
    const scale = Math.min(1, maxW / this.image.naturalWidth);
    this.canvas.width = Math.round(this.image.naturalWidth * scale);
    this.canvas.height = Math.round(this.image.naturalHeight * scale);
    this.state.scale = 1;
    this.state.angle = 0;
    this.state.opacity = 1;
  }

  _render() {
    const ctx = this.ctx;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.globalAlpha = this.state.opacity;
    ctx.translate(cw / 2, ch / 2);
    ctx.rotate((this.state.angle * Math.PI) / 180);
    ctx.scale(this.state.scale, this.state.scale);
    ctx.drawImage(this.image, -this.image.naturalWidth / 2, -this.image.naturalHeight / 2,
      this.image.naturalWidth, this.image.naturalHeight);
    ctx.restore();

    if (this.state.crop) {
      const { x, y, w, h } = this.state.crop;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.clearRect(x, y, w, h);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    }
  }

  _enableCropMode() {
    const start = {};
    const onDown = (e) => {
      start.x = e.offsetX; start.y = e.offsetY;
      this.state.crop = { x: start.x, y: start.y, w: 0, h: 0 };
      this._render();
      this.canvas.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    };
    const onMove = (e) => {
      const w = e.offsetX - start.x;
      const h = e.offsetY - start.y;
      this.state.crop.w = w; this.state.crop.h = h;
      this._render();
    };
    const onUp = () => {
      this.canvas.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (this.state.crop.w < 0) {
        this.state.crop.x += this.state.crop.w;
        this.state.crop.w = Math.abs(this.state.crop.w);
      }
      if (this.state.crop.h < 0) {
        this.state.crop.y += this.state.crop.h;
        this.state.crop.h = Math.abs(this.state.crop.h);
      }
      this._render();
    };
    this.canvas.addEventListener('mousedown', onDown, { once: true });
  }

  async exportBlob() {
    const finalCanvas = document.createElement('canvas');
    const srcCanvas = this.canvas;
    if (this.state.crop) {
      const { x, y, w, h } = this.state.crop;
      finalCanvas.width = Math.abs(w);
      finalCanvas.height = Math.abs(h);
      const fctx = finalCanvas.getContext('2d');
      fctx.drawImage(srcCanvas, x, y, w, h, 0, 0, w, h);
    } else {
      finalCanvas.width = srcCanvas.width;
      finalCanvas.height = srcCanvas.height;
      finalCanvas.getContext('2d').drawImage(srcCanvas, 0, 0);
    }
    return new Promise((resolve) => finalCanvas.toBlob(resolve, 'image/png', 0.92));
  }

  async exportAndUpload() {
    const blob = await this.exportBlob();
    const form = new FormData();
    form.append('image', blob, this._currentFile?.name || `edited-${Date.now()}.png`);
    try {
      const resp = await fetch('/api/upload-image', { method: 'POST', body: form, credentials: 'include' });
      const body = await resp.json();
      if (body && body.url) {
        alert('Imagen subida: ' + body.url);
        return body;
      } else {
        alert('Error subida');
        return null;
      }
    } catch (err) {
      console.error(err);
      alert('Error al subir la imagen');
      return null;
    }
  }
}