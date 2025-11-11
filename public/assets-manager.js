export async function fetchIcons() {
  const resp = await fetch('/api/icons');
  if (!resp.ok) throw new Error('No icons');
  const body = await resp.json();
  return body.icons || [];
}

export async function insertIcon(iconName) {
  const resp = await fetch(`/api/icons/${encodeURIComponent(iconName)}.svg`);
  if (!resp.ok) throw new Error('Icon not found');
  const svg = await resp.text();
  const container = document.querySelector('#device-mockup') || document.body;
  const wrapper = document.createElement('div');
  wrapper.className = 'inserted-icon';
  wrapper.innerHTML = svg;
  wrapper.style.position = 'absolute';
  wrapper.style.left = '50px'; wrapper.style.top = '50px';
  container.appendChild(wrapper);
  makeDraggable(wrapper);
  return wrapper;
}

export function insertImage(url) {
  const container = document.querySelector('#device-mockup') || document.body;
  const img = document.createElement('img');
  img.src = url;
  img.className = 'inserted-image';
  img.style.position = 'absolute';
  img.style.left = '60px'; img.style.top = '60px';
  img.style.maxWidth = '320px';
  img.style.maxHeight = '240px';
  container.appendChild(img);
  makeDraggable(img);
  return img;
}

function makeDraggable(el) {
  el.draggable = true;
  el.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', '');
    el.classList.add('dragging');
  });
  el.addEventListener('dragend', () => el.classList.remove('dragging'));
  let dragging = false, offsetX=0, offsetY=0;
  el.addEventListener('pointerdown', (e) => {
    dragging = true;
    offsetX = e.offsetX; offsetY = e.offsetY;
    el.setPointerCapture(e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    el.style.left = (e.clientX - offsetX) + 'px';
    el.style.top = (e.clientY - offsetY) + 'px';
  });
  window.addEventListener('pointerup', () => dragging = false);
}