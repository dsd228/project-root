const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs').promises;
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const STORAGE_PATH = path.join(__dirname, 'storage');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API para proyectos
app.get('/api/projects', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(STORAGE_PATH, 'projects.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.json([]);
  }
});

app.post('/api/projects', async (req, res) => {
  try {
    const projects = JSON.parse(await fs.readFile(path.join(STORAGE_PATH, 'projects.json'), 'utf8') || '[]');
    const newProject = { id: Date.now().toString(), ...req.body, createdAt: new Date() };
    projects.push(newProject);
    await fs.writeFile(path.join(STORAGE_PATH, 'projects.json'), JSON.stringify(projects, null, 2));
    res.json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Error saving project' });
  }
});

// WebSocket para colaboración en tiempo real
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('join-project', (projectId) => {
    socket.join(projectId);
    socket.to(projectId).emit('user-joined', socket.id);
  });

  socket.on('canvas-update', (data) => {
    socket.to(data.projectId).emit('canvas-update', data);
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

// Inicializar storage
async function initializeStorage() {
  try {
    await fs.access(STORAGE_PATH);
  } catch {
    await fs.mkdir(STORAGE_PATH, { recursive: true });
    await fs.writeFile(path.join(STORAGE_PATH, 'projects.json'), '[]');
    await fs.writeFile(path.join(STORAGE_PATH, 'users.json'), '[]');
  }
}

initializeStorage().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Editor Pro+ running on http://localhost:${PORT}`);
  });
});