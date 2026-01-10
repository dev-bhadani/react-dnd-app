import React, { useCallback, useRef } from 'react';
import {useDroppable} from '@dnd-kit/core';
import {SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import ColumnRow from './ColumnRow';
import {Button, Checkbox, CircularProgress, FormControlLabel, Rating, Switch, TextField} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';

// Format an ISO yyyy-mm-dd string into the chosen display format for non-ISO inputs.
const formatDateValue = (dateStr, format) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [yyyy, mm, dd] = parts;
    switch (format) {
        case 'MM/DD/YYYY':
            return `${mm}/${dd}/${yyyy}`;
        case 'DD/MM/YYYY':
            return `${dd}/${mm}/${yyyy}`;
        case 'DD.MM.YYYY':
            return `${dd}.${mm}.${yyyy}`;
        default:
            return dateStr;
    }
};

const dateFormatPattern = (format) => {
    switch (format) {
        case 'MM/DD/YYYY':
        case 'DD/MM/YYYY':
            return '^\\d{2}/\\d{2}/\\d{4}$';
        case 'DD.MM.YYYY':
            return '^\\d{2}\\.\\d{2}\\.\\d{4}$';
        default:
            return '^\\d{4}-\\d{2}-\\d{2}$';
    }
};

const iconForName = (name) => {
    switch (name) {
        case 'save':
            return <SaveIcon fontSize="small" />;
        case 'send':
            return <SendIcon fontSize="small" />;
        case 'add':
            return <AddIcon fontSize="small" />;
        case 'delete':
            return <DeleteIcon fontSize="small" />;
        case 'check':
            return <CheckIcon fontSize="small" />;
        default:
            return null;
    }
};

function DroppableArea({formElements, onDelete, onSelect, selectedElementId}) {
    const canvasRef = useRef(null);
    const {isOver, setNodeRef} = useDroppable({
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
        <div
            ref={setRefs}
            className={`canvas ${isOver ? 'canvas--active' : ''}`}
        >
            {formElements.length === 0 ? (
                <div className="canvas__empty">
                    <p className="canvas__empty-title">Drop items here</p>
                    <p className="canvas__empty-subtitle">Build your form by dragging blocks from the left sidebar.</p>
                </div>
            ) : (
                <SortableContext items={formElements.map((el) => el.id)} strategy={verticalListSortingStrategy}>
                    {formElements.map((element, index) => (
                        <SortableCanvasElement
                            key={element.id}
                            element={element}
                            index={index}
                            onDelete={onDelete}
                            onSelect={onSelect}
                            selectedElementId={selectedElementId}
                        />
                    ))}
                </SortableContext>
            )}
        </div>
    );
}

function SortableCanvasElement({ element, index, onDelete, onSelect, selectedElementId }) {
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

    const isSelected = element.id === selectedElementId;

    const body = element.type === 'twoColumnRow' || element.type === 'threeColumnRow' || element.type === 'fourColumnRow'
        ? <ColumnRow element={element} onDelete={onDelete} onSelect={onSelect} selectedElementId={selectedElementId} />
        : (
            <div className="canvas-element__body">
                {renderElement(element)}
            </div>
        );

    const showHeader = !(element.type === 'twoColumnRow' || element.type === 'threeColumnRow' || element.type === 'fourColumnRow');

    return (
        <div
            ref={setNodeRef}
            style={style}
            role="button"
            tabIndex={0}
            className={`canvas-element ${isSelected ? 'canvas-element--selected' : ''}`}
            onClick={() => onSelect(element.id)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(element.id);
                }
            }}
        >
            {showHeader ? (
                <div className="canvas-element__header">
                    <span className="drag-handle" {...listeners} {...attributes} aria-label="Drag to reorder" role="button" />
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
                        aria-label="Remove element"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <span className="drag-handle drag-handle--row" {...listeners} {...attributes} aria-label="Drag row" role="button" />
            )}
            {body}
        </div>
    );
}

function renderElement(element) {
    switch (element.type) {
        case 'text':
            return (
                <input
                    type="text"
                    placeholder={element.placeholder || 'Enter text'}
                    style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                    }}
                />
            );
        case 'checkbox':
            return (
                <div style={{ display: 'flex', flexDirection: element.checkboxLayout === 'horizontal' ? 'row' : 'column', gap: '8px', flexWrap: 'wrap' }}>
                    {element.checkboxOptions.map((option, index) => (
                        <FormControlLabel
                            key={index}
                            control={
                                <Checkbox
                                    checked={option.checked}
                                    disabled={option.disabled}
                                    color={element.color}
                                />
                            }
                            label={option.label}
                        />
                    ))}
                </div>
            );
        case 'button':
            return (
                <Button
                    variant={element.variant}
                    color={element.color}
                    size={element.size || 'medium'}
                    fullWidth={!!element.fullWidth}
                    type={element.typeAttr || 'button'}
                    disableElevation={!!element.disableElevation}
                    disabled={!!element.disabled || !!element.loading}
                    href={element.href || null}
                    target={element.target || '_self'}
                    startIcon={element.loading ? <CircularProgress size={16} color="inherit" /> : iconForName(element.startIcon)}
                    endIcon={element.loading ? null : iconForName(element.endIcon)}
                    sx={{ borderRadius: element.borderRadius ?? 8 }}
                >
                    {element.label || 'Button'}
                </Button>
            );
        case 'radio':
            return (
                <div style={{display: 'flex', flexDirection: element.radioLayout === 'horizontal' ? 'row' : 'column', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap'}}>
                    {element.options.map((option, index) => (
                        <label key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input type="radio" name={element.id}/> {option}
                        </label>
                    ))}
                </div>
            );
        case 'select':
            return (
                <select
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                    }}
                >
                    {element.options.map((option, index) => (
                        <option key={index}>{option}</option>
                    ))}
                </select>
            );
        case 'date':
            const format = element.dateFormat || 'YYYY-MM-DD';
            const isIso = format === 'YYYY-MM-DD';
            const pattern = dateFormatPattern(format);
            const formattedDefault = isIso ? element.defaultDate || '' : formatDateValue(element.defaultDate, format);
            const formattedMin = isIso ? element.minDate || '' : formatDateValue(element.minDate, format);
            const formattedMax = isIso ? element.maxDate || '' : formatDateValue(element.maxDate, format);
            const rangeHint = [
                formattedMin ? `Min ${formattedMin}` : null,
                formattedMax ? `Max ${formattedMax}` : null,
            ].filter(Boolean).join(' · ') || undefined;
            return (
                <TextField
                    type={isIso ? 'date' : 'text'}
                    fullWidth
                    defaultValue={formattedDefault}
                    placeholder={format}
                    inputProps={{
                        min: isIso ? element.minDate || undefined : undefined,
                        max: isIso ? element.maxDate || undefined : undefined,
                        'data-min': !isIso && formattedMin ? formattedMin : undefined,
                        'data-max': !isIso && formattedMax ? formattedMax : undefined,
                        'data-format': format,
                        pattern,
                    }}
                    helperText={rangeHint}
                    InputLabelProps={{ shrink: true }}
                />
            );
        case 'rating':
            return (
                <Rating
                    name={`rating-${element.id}`}
                    defaultValue={element.defaultValue ?? 0}
                    precision={element.precision ?? 0.5}
                    max={element.max ?? 5}
                />
            );
        case 'slider':
            return (
                <input
                    type="range"
                    min={element.min ?? 0}
                    max={element.max ?? 100}
                    step={element.step ?? 1}
                    defaultValue={element.defaultValue ?? element.min ?? 0}
                    style={{width: '100%', accentColor: '#007bff'}}
                    aria-label={element.name || 'Slider'}
                />
            );
        case 'textarea':
            return (
                <TextField
                    multiline
                    minRows={element.rows || 4}
                    placeholder={element.placeholder || 'Long answer'}
                    fullWidth
                />
            );
        case 'number':
            return (
                <TextField
                    type="number"
                    placeholder={element.placeholder || 'Enter number'}
                    fullWidth
                    inputProps={{ min: element.min, max: element.max, step: element.step }}
                />
            );
        case 'email':
            return (
                <TextField type="email" placeholder={element.placeholder || 'name@example.com'} fullWidth />
            );
        case 'phone':
            return (
                <TextField
                    type="tel"
                    placeholder={element.placeholder || '(555) 123-4567'}
                    fullWidth
                    inputProps={{ pattern: element.pattern || undefined }}
                />
            );
        case 'toggle':
            return (
                <FormControlLabel
                    control={<Switch checked={element.checked} />}
                    label={element.checked ? element.onLabel : element.offLabel}
                />
            );
        case 'file':
            return (
                <TextField
                    type="file"
                    fullWidth
                    inputProps={{ accept: element.accept, multiple: element.multiple }}
                />
            );
        case 'divider':
            return (
                <div style={{ width: '100%' }}>
                    <hr />
                    <p style={{ marginTop: '8px', color: '#94a3b8', fontSize: '14px' }}>{element.label}</p>
                </div>
            );
        default:
            return null;
    }
}

export default DroppableArea;
