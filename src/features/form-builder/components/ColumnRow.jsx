import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '../state/builderStore';
import { getColumnCount } from '../utils/layout';
import CanvasElementPreview from './CanvasElementPreview';

function ColumnRow({ element }) {
    const onDelete = useBuilderStore((s) => s.deleteElement);
    const columns = getColumnCount(element.type) || 1;

    // Pull layout-level visual props with safe fallbacks (older saved forms
    // won't have them set yet).
    const gap = Number.isFinite(element.gap) ? element.gap : 10;
    const padding = Number.isFinite(element.padding) ? element.padding : 12;
    const verticalAlign = element.verticalAlign || 'stretch';
    const stackOnMobile = element.stackOnMobile !== false;
    const background = element.background || 'muted';
    const border = element.border || 'dashed';

    const ratios = Array.isArray(element.columnRatios) && element.columnRatios.length === columns
        ? element.columnRatios
        : Array.from({ length: columns }, () => 1);

    const gridTemplateColumns = ratios
        .map((r) => `${Math.max(0.1, Number(r) || 1)}fr`)
        .join(' ');

    const bgVar = {
        none: 'transparent',
        muted: 'var(--fc-bg-muted)',
        accent: 'rgba(79, 70, 229, 0.06)',
    }[background] || 'var(--fc-bg-muted)';

    const borderStyle = border === 'none' ? 'none' : `1px ${border} var(--fc-border-dashed)`;

    return (
        <div
            className="column-row"
            style={{ padding, background: bgVar, border: borderStyle }}
        >
            <button
                type="button"
                className="column-row__delete"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(element.id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label="Remove row"
            >
                &times;
            </button>
            <div
                className={`column-row__grid ${stackOnMobile ? 'column-row__grid--stack-mobile' : ''}`}
                style={{ display: 'grid', gridTemplateColumns, gap, alignItems: verticalAlign }}
            >
                {Array.from({ length: columns }, (_, index) => (
                    <DroppableColumn
                        key={index}
                        columnId={`${element.id}-column-${index}`}
                        elements={element.columns?.[index] || []}
                    />
                ))}
            </div>
        </div>
    );
}

function DroppableColumn({ columnId, elements }) {
    const { isOver, setNodeRef } = useDroppable({
        id: columnId,
        data: { type: 'container', containerId: columnId },
    });

    return (
        <div ref={setNodeRef} className={`column ${isOver ? 'column--active' : ''}`}>
            {elements.length === 0 ? (
                <p className="column__empty">Drop here</p>
            ) : (
                <SortableContext
                    items={elements.map((el) => el.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {elements.map((el, index) => (
                        <SortableColumnElement
                            key={el.id}
                            element={el}
                            index={index}
                            columnId={columnId}
                        />
                    ))}
                </SortableContext>
            )}
        </div>
    );
}

const SortableColumnElement = React.memo(function SortableColumnElement({ element, index, columnId }) {
    const onSelect = useBuilderStore((s) => s.selectElement);
    const onDelete = useBuilderStore((s) => s.deleteElement);
    const isSelected = useBuilderStore((s) => s.selectedElementId === element.id);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: element.id,
        data: { source: 'canvas', type: 'element', containerId: columnId, index },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        cursor: 'grab',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            role="button"
            tabIndex={0}
            aria-pressed={isSelected}
            className={`column__element ${isSelected ? 'column__element--selected' : ''}`}
            onClick={(event) => {
                event.stopPropagation();
                onSelect(element.id);
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    onSelect(element.id);
                }
            }}
        >
            <div className="column__element-header">
                <span
                    className="drag-handle drag-handle--column"
                    {...listeners}
                    {...attributes}
                    aria-label="Drag to reorder"
                    role="button"
                />
                <span className="column__element-label">{element.name || 'Untitled field'}</span>
                <span className="column__element-type">{element.type}</span>
                <button
                    type="button"
                    className="column__element-delete"
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
            <div className="column__element-body">
                <CanvasElementPreview element={element} />
            </div>
        </div>
    );
});

export default ColumnRow;

