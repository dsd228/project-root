const WebTemplates = {
    'landing-page': {
        name: 'Landing Page Moderna',
        category: 'web',
        device: 'desktop',
        elements: [
            {
                type: 'rectangle',
                x: 0, y: 0, width: 1440, height: 800,
                fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                stroke: 'none'
            },
            {
                type: 'rectangle',
                x: 0, y: 0, width: 1440, height: 80,
                fill: 'rgba(255,255,255,0.95)',
                stroke: 'none'
            },
            {
                type: 'text',
                x: 100, y: 35,
                content: 'Mi Startup',
                fontSize: 24,
                fontFamily: 'Inter',
                fill: '#333',
                fontWeight: '700'
            },
            {
                type: 'text',
                x: 600, y: 300,
                content: 'Transforma tu idea en realidad',
                fontSize: 48,
                fontFamily: 'Inter',
                fill: 'white',
                fontWeight: '700',
                textAlign: 'center'
            },
            {
                type: 'rectangle',
                x: 620, y: 400,
                width: 200, height: 60,
                fill: '#ff6b6b',
                stroke: 'none',
                borderRadius: 30
            },
            {
                type: 'text',
                x: 670, y: 435,
                content: 'Comenzar',
                fontSize: 18,
                fontFamily: 'Inter',
                fill: 'white',
                fontWeight: '600'
            }
        ]
    },

    'dashboard': {
        name: 'Dashboard Admin',
        category: 'dashboard',
        device: 'desktop',
        elements: [
            {
                type: 'rectangle',
                x: 0, y: 0, width: 250, height: 1024,
                fill: '#1e293b',
                stroke: 'none'
            },
            {
                type: 'rectangle',
                x: 250, y: 0, width: 1190, height: 70,
                fill: 'white',
                stroke: '#e2e8f0'
            },
            {
                type: 'text',
                x: 280, y: 35,
                content: 'Dashboard Principal',
                fontSize: 20,
                fontFamily: 'Inter',
                fill: '#1e293b',
                fontWeight: '600'
            },
            {
                type: 'rectangle',
                x: 280, y: 100,
                width: 350, height: 150,
                fill: '#4f46e5',
                stroke: 'none',
                borderRadius: 12
            },
            {
                type: 'rectangle',
                x: 670, y: 100,
                width: 350, height: 150,
                fill: '#10b981',
                stroke: 'none',
                borderRadius: 12
            }
        ]
    },

    'ecommerce': {
        name: 'Tienda Online',
        category: 'ecommerce',
        device: 'desktop',
        elements: [
            {
                type: 'rectangle',
                x: 0, y: 0, width: 1440, height: 600,
                fill: '#f8fafc',
                stroke: 'none'
            },
            {
                type: 'rectangle',
                x: 200, y: 150,
                width: 300, height: 400,
                fill: 'white',
                stroke: '#e2e8f0',
                borderRadius: 12,
                shadow: '0 10px 25px rgba(0,0,0,0.1)'
            },
            {
                type: 'rectangle',
                x: 550, y: 150,
                width: 300, height: 400,
                fill: 'white',
                stroke: '#e2e8f0',
                borderRadius: 12,
                shadow: '0 10px 25px rgba(0,0,0,0.1)'
            },
            {
                type: 'rectangle',
                x: 900, y: 150,
                width: 300, height: 400,
                fill: 'white',
                stroke: '#e2e8f0',
                borderRadius: 12,
                shadow: '0 10px 25px rgba(0,0,0,0.1)'
            }
        ]
    }
};