import React, { useCallback, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ColumnRow from './ColumnRow';
import CanvasElementPreview from './CanvasElementPreview';
import { useBuilderStore } from '../state/builderStore';
import { isLayoutType } from '../utils/layout';

/**
 * The root droppable canvas. Reads `formElements` and `selectedElementId`
 * directly from the Zustand store — no props needed.
 */
function DroppableArea() {
    const formElements = useBuilderStore((s) => s.formElements);
    const canvasRef = useRef(null);
    const { isOver, setNodeRef } = useDroppable({
        id: 'form-canvas',
        data: { type: 'container', containerId: 'root' },
    });

    const setRefs = useCallback(
        (node) => {
            canvasRef.current = node;
            setNodeRef(node);
        },
        [setNodeRef]
    );

    return (
        <div ref={setRefs} className={`canvas ${isOver ? 'canvas--active' : ''}`}>
            {formElements.length === 0 ? (
                <div className="canvas__empty">
                    <p className="canvas__empty-title">Drop fields here</p>
                    <p className="canvas__empty-subtitle">
                        Build your form by dragging blocks from the left sidebar.
                    </p>
                </div>
            ) : (
                <SortableContext
                    items={formElements.map((el) => el.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {formElements.map((element, index) => (
                        <SortableCanvasElement key={element.id} element={element} index={index} />
                    ))}
                </SortableContext>
            )}
        </div>
    );
}

const SortableCanvasElement = React.memo(function SortableCanvasElement({ element, index }) {
    const onSelect = useBuilderStore((s) => s.selectElement);
    const onDelete = useBuilderStore((s) => s.deleteElement);
    const isSelected = useBuilderStore((s) => s.selectedElementId === element.id);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: element.id,
        data: { source: 'canvas', type: 'element', containerId: 'root', index },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        cursor: 'grab',
    };

    const isRow = isLayoutType(element.type);
    const body = isRow ? (
        <ColumnRow element={element} />
    ) : (
        <div className="canvas-element__body">
            <CanvasElementPreview element={element} />
        </div>
    );

    return (
        <div
            ref={setNodeRef}
            style={style}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            className={`canvas-element ${isSelected ? 'canvas-element--selected' : ''}`}
            onClick={() => onSelect(element.id)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(element.id);
                }
            }}
        >
            {!isRow ? (
                <div className="canvas-element__header">
                    <span
                        className="drag-handle"
                        {...listeners}
                        {...attributes}
                        aria-label="Drag to reorder"
                        role="button"
                    />
                    <span className="canvas-element__label">
                        {element.type !== 'button' ? element.name || 'Untitled field' : 'Button'}
                    </span>
                    <span className="canvas-element__type">{element.type}</span>
                    <button
                        type="button"
                        className="canvas-element__delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(element.id);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        aria-label={`Remove ${element.name || element.type} element`}
                    >
                        ×
                    </button>
                </div>
            ) : (
                <span
                    className="drag-handle drag-handle--row"
                    {...listeners}
                    {...attributes}
                    aria-label="Drag row"
                    role="button"
                />
            )}
            {body}
        </div>
    );
});

export default DroppableArea;

