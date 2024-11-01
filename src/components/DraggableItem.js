import React from 'react';
import { useDraggable } from '@dnd-kit/core';

function DraggableItem({ item }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: item.id,
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '15px',
                margin: '10px 0',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                cursor: 'grab',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            {item.icon}
            <span style={{ fontWeight: 'bold', color: '#333' }}>{item.label}</span>
        </div>
    );
}

export default DraggableItem;
