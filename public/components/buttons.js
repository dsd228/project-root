const ButtonComponents = {
    'primary': {
        name: 'Botón Primario',
        element: {
            type: 'rectangle',
            width: 120, 
            height: 44,
            fill: '#4f46e5',
            stroke: 'none',
            borderRadius: 8
        },
        text: {
            type: 'text',
            content: 'Button',
            fontSize: 14,
            fontFamily: 'Inter',
            fill: 'white',
            fontWeight: '600'
        }
    },
    'secondary': {
        name: 'Botón Secundario',
        element: {
            type: 'rectangle',
            width: 120, 
            height: 44,
            fill: 'transparent',
            stroke: '#4f46e5',
            strokeWidth: 2,
            borderRadius: 8
        },
        text: {
            type: 'text',
            content: 'Button',
            fontSize: 14,
            fontFamily: 'Inter',
            fill: '#4f46e5',
            fontWeight: '600'
        }
    }
};