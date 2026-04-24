import React, { useCallback, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Chip } from '@mui/material';
import ColumnRow from './ColumnRow';
import CanvasElementPreview from './CanvasElementPreview';
import { useBuilderStore } from '../state/builderStore';
import { isLayoutType } from '../utils/layout';

const WIDTH_CLASS = {
    third: 'canvas-element--w-third',
    half: 'canvas-element--w-half',
    twoThirds: 'canvas-element--w-twoThirds',
    full: '',
};

/**
 * Root droppable canvas. Subscribes to `formElements` directly so adding,
 * removing, or reordering re-renders the grid but not the surrounding chrome.
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
                <CanvasEmptyState />
            ) : (
                <SortableContext
                    items={formElements.map((el) => el.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="canvas__grid">
                        {formElements.map((element, index) => (
                            <SortableCanvasElement key={element.id} element={element} index={index} />
                        ))}
                    </div>
                </SortableContext>
            )}
        </div>
    );
}

function CanvasEmptyState() {
    return (
        <div className="canvas__empty">
            <div className="canvas__empty-illustration" aria-hidden="true">
                ✦
            </div>
            <p className="canvas__empty-title">Start building your form</p>
            <p className="canvas__empty-subtitle">
                Drag fields from the left, or pick a template to skip ahead.
            </p>
            <Chip
                label="Tip · press ? for keyboard shortcuts"
                size="small"
                variant="outlined"
                sx={{ mt: 2 }}
            />
        </div>
    );
}

const SortableCanvasElement = React.memo(function SortableCanvasElement({ element, index }) {
    const onSelect = useBuilderStore((s) => s.selectElement);
    const onDelete = useBuilderStore((s) => s.deleteElement);
    const onDuplicate = useBuilderStore((s) => s.duplicateElement);
    const isSelected = useBuilderStore((s) => s.selectedElementId === element.id);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: element.id,
        data: { source: 'canvas', type: 'element', containerId: 'root', index },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const isRow = isLayoutType(element.type);
    const widthClass = isRow ? '' : WIDTH_CLASS[element.width || 'full'] || '';

    return (
        <div
            ref={setNodeRef}
            style={style}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            className={[
                'canvas-element',
                isSelected ? 'canvas-element--selected' : '',
                isDragging ? 'canvas-element--dragging' : '',
                widthClass,
            ]
                .filter(Boolean)
                .join(' ')}
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
                        {element.required && <span className="canvas-element__required" aria-label="Required">*</span>}
                    </span>
                    <span className="canvas-element__type">{element.type}</span>
                    <button
                        type="button"
                        className="canvas-element__action"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDuplicate(element.id);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        aria-label={`Duplicate ${element.name || element.type}`}
                        title="Duplicate (⌘D)"
                    >
                        ⧉
                    </button>
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
            {isRow ? (
                <ColumnRow element={element} />
            ) : (
                <div className="canvas-element__body">
                    <CanvasElementPreview element={element} />
                    {element.helperText && (
                        <p className="canvas-element__helper">{element.helperText}</p>
                    )}
                </div>
            )}
        </div>
    );
});

export default DroppableArea;

