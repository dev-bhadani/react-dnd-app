import React from 'react';
import { useDraggable } from '@dnd-kit/core';

function DraggableItem({ item }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: item.id,
    });

    return (
        <button
            ref={setNodeRef}
            type="button"
            className="draggable-item"
            {...listeners}
            {...attributes}
        >
            <span className="draggable-item__icon" aria-hidden="true">
                {item.icon}
            </span>
            <span className="draggable-item__label">{item.label}</span>
            <span className="draggable-item__hint">drag</span>
        </button>
    );
}

export default DraggableItem;
