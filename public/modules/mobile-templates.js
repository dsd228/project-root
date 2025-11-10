const MobileTemplates = {
    'mobile-app': {
        name: 'App Móvil Moderna',
        category: 'mobile',
        device: 'mobile',
        elements: [
            {
                type: 'rectangle',
                x: 0, y: 0, width: 375, height: 812,
                fill: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                stroke: 'none'
            },
            {
                type: 'rectangle',
                x: 20, y: 100,
                width: 335, height: 200,
                fill: 'rgba(255,255,255,0.2)',
                stroke: 'none',
                borderRadius: 20
            },
            {
                type: 'text',
                x: 40, y: 130,
                content: 'Bienvenido de nuevo',
                fontSize: 24,
                fontFamily: 'Inter',
                fill: 'white',
                fontWeight: '700'
            },
            {
                type: 'rectangle',
                x: 40, y: 350,
                width: 295, height: 50,
                fill: 'white',
                stroke: 'none',
                borderRadius: 25
            },
            {
                type: 'text',
                x: 150, y: 380,
                content: 'Comenzar',
                fontSize: 16,
                fontFamily: 'Inter',
                fill: '#667eea',
                fontWeight: '600'
            }
        ]
    },

    'mobile-commerce': {
        name: 'E-commerce Móvil',
        category: 'mobile',
        device: 'mobile',
        elements: [
            {
                type: 'rectangle',
                x: 0, y: 0, width: 375, height: 60,
                fill: 'white',
                stroke: '#e2e8f0'
            },
            {
                type: 'text',
                x: 20, y: 35,
                content: '🛍️ Mi Tienda',
                fontSize: 18,
                fontFamily: 'Inter',
                fill: '#1e293b',
                fontWeight: '700'
            },
            {
                type: 'rectangle',
                x: 20, y: 80,
                width: 335, height: 120,
                fill: '#4f46e5',
                stroke: 'none',
                borderRadius: 12
            },
            {
                type: 'text',
                x: 40, y: 110,
                content: 'Oferta Especial',
                fontSize: 16,
                fontFamily: 'Inter',
                fill: 'white',
                fontWeight: '600'
            }
        ]
    }
};