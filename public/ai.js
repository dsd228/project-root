class AIAssistant {
    constructor() {
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
            this.addMessage('assistant', 'Error al conectar con el asistente IA.');
        }
    }

    async callOllama(prompt) {
        // Conectar con Ollama local
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3',
                prompt: `Eres un asistente de diseño gráfico. Responde brevemente y de manera útil: ${prompt}`,
                stream: false
            })
        });

        const data = await response.json();
        return data.response;
    }

    addMessage(sender, text) {
        const messagesContainer = document.getElementById('ai-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    generateDesignSuggestion() {
        // Generar sugerencias de diseño basadas en el contenido actual
        const suggestions = [
            "Prueba con una paleta de colores más vibrante",
            "Considera aumentar el espaciado entre elementos",
            "El contraste podría mejorarse para mejor legibilidad",
            "Sugiero alinear los elementos a la cuadrícula"
        ];
        return suggestions[Math.floor(Math.random() * suggestions.length)];
    }
}

// Inicializar el asistente IA
document.addEventListener('DOMContentLoaded', () => {
    window.aiAssistant = new AIAssistant();
});