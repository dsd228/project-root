class AIAssistant {
    constructor(editor) {
        this.editor = editor;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('ai-send').addEventListener('click', () => this.sendMessage());
        document.getElementById('ai-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    async sendMessage() {
        const input = document.getElementById('ai-chat-input');
        const message = input.value.trim();
        
        if (!message) return;

        this.addMessage('user', message);
        input.value = '';

        try {
            const response = await this.callOllama(message);
            this.addMessage('assistant', response);
        } catch (error) {
            console.error('Error con IA:', error);
            this.addMessage('assistant', 'Error al conectar con el asistente IA. Asegúrate de que Ollama esté ejecutándose.');
        }
    }

    async callOllama(prompt) {
        try {
            const response = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama3',
                    prompt: `Eres un asistente de diseño gráfico experto. El usuario está usando un editor de diseño. Responde de manera concisa y útil: ${prompt}`,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error('Error en la respuesta de Ollama');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            throw new Error('No se pudo conectar con Ollama: ' + error.message);
        }
    }

    addMessage(sender, text) {
        const messagesContainer = document.getElementById('ai-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = `${sender === 'user' ? '👤 Tú' : '🤖 IA'}: ${text}`;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateDesign() {
        const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const newElement = {
            id: 'ai_rect_' + Date.now(),
            type: 'rectangle',
            x: 100, y: 100,
            width: 200, height: 150,
            fill: randomColor,
            stroke: '#000000',
            strokeWidth: 2,
            borderRadius: 8
        };
        
        this.editor.elements.push(newElement);
        this.editor.selectedElement = newElement;
        this.editor.render();
        this.editor.updateLayersPanel();
        
        this.addMessage('assistant', 'He creado un elemento de diseño con colores modernos. ¿Te gusta?');
    }

    improveLayout() {
        this.addMessage('assistant', 'Sugiero alinear los elementos a una cuadrícula de 8px y mejorar el espaciado consistente.');
    }

    suggestColors() {
        const palettes = [
            ['#4f46e5', '#7c3aed', '#a855f7', '#c026d3'],
            ['#059669', '#10b981', '#34d399', '#6ee7b7'],
            ['#dc2626', '#ef4444', '#f87171', '#fca5a5'],
            ['#d97706', '#f59e0b', '#fbbf24', '#fcd34d']
        ];
        
        const randomPalette = palettes[Math.floor(Math.random() * palettes.length)];
        this.addMessage('assistant', `Paleta sugerida: ${randomPalette.join(', ')}`);
    }

    generateContent() {
        const contents = [
            'Transforma tu visión en realidad',
            'Innovación y creatividad sin límites',
            'Diseño que inspira y conecta',
            'Soluciones modernas para desafíos contemporáneos'
        ];
        
        const randomContent = contents[Math.floor(Math.random() * contents.length)];
        this.addMessage('assistant', `Texto sugerido: "${randomContent}"`);
    }
}