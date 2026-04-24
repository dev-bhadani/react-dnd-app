import React from 'react';
import { useDraggable } from '@dnd-kit/core';

/**
 * A single palette entry. Memoized — re-renders are pointless because the
 * `item` object is module-level constant.
 */
function DraggableItem({ item }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: item.id,
        data: { source: 'palette', type: item.id },
    });

    return (
        <button
            ref={setNodeRef}
            type="button"
            className="draggable-item"
            data-dragging={isDragging || undefined}
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

export default React.memo(DraggableItem);

