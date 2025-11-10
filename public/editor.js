import { io } from "/socket.io/socket.io.esm.min.js";

const socket = io();
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let drawing = false;
let tool = "select";

document.getElementById("rect").onclick = () => (tool = "rect");
document.getElementById("circle").onclick = () => (tool = "circle");
document.getElementById("text").onclick = () => (tool = "text");
document.getElementById("select").onclick = () => (tool = "select");
document.getElementById("clear").onclick = clearCanvas;

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mouseup", endDraw);
canvas.addEventListener("mousemove", draw);

function startDraw(e) {
  drawing = true;
  const { x, y } = getMousePos(e);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.strokeStyle = "#333";
}

function endDraw() {
  drawing = false;
  ctx.closePath();
}

function draw(e) {
  if (!drawing) return;
  const { x, y } = getMousePos(e);

  if (tool === "rect") {
    ctx.fillRect(x - 10, y - 10, 20, 20);
    sendDraw("rect", x, y);
  } else if (tool === "circle") {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.fill();
    sendDraw("circle", x, y);
  }
}

function sendDraw(type, x, y) {
  socket.emit("draw", { type, x, y });
}

socket.on("draw", (data) => {
  if (data.type === "rect") ctx.fillRect(data.x - 10, data.y - 10, 20, 20);
  if (data.type === "circle") {
    ctx.beginPath();
    ctx.arc(data.x, data.y, 10, 0, 2 * Math.PI);
    ctx.fill();
  }
});

function getMousePos(evt) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
