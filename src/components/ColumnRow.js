import React from 'react';
import {useDroppable} from '@dnd-kit/core';
import {SortableContext, useSortable, verticalListSortingStrategy} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {Button, Checkbox, CircularProgress, FormControlLabel, Rating, Switch, TextField} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';

function ColumnRow({element, onDelete, onSelect, selectedElementId}) {
    const columns = element.type === 'twoColumnRow' ? 2 : element.type === 'threeColumnRow' ? 3 : 4;

    return (<div className="column-row">
            <button
                type="button"
                className="column-row__delete"
                onClick={() => onDelete(element.id)}
                aria-label="Remove row"
            >
                &times;
            </button>
            <div className={`column-row__grid columns-${columns}`}>
                {[...Array(columns)].map((_, index) => (<DroppableColumn
                        key={index}
                        columnId={`${element.id}-column-${index}`}
                    elements={element.columns?.[index] || []}
                        onDelete={onDelete}
                        onSelect={onSelect}
                        selectedElementId={selectedElementId}
                    />))}
            </div>
        </div>);
}

function DroppableColumn({columnId, elements, onDelete, onSelect, selectedElementId}) {
    const {isOver, setNodeRef} = useDroppable({
        id: columnId,
        data: { type: 'container', containerId: columnId },
    });

    return (<div
            ref={setNodeRef}
            className={`column ${isOver ? 'column--active' : ''}`}
        >
            {elements.length === 0 ? (
                <p className="column__empty">Drop here</p>
            ) : (
                <SortableContext items={elements.map((el) => el.id)} strategy={verticalListSortingStrategy}>
                    {elements.map((el, index) => (
                        <SortableColumnElement
                            key={el.id}
                            element={el}
                            index={index}
                            columnId={columnId}
                            onDelete={onDelete}
                            onSelect={onSelect}
                            selectedElementId={selectedElementId}
                        />
                    ))}
                </SortableContext>
            )}
        </div>);
}

function SortableColumnElement({ element, index, columnId, onDelete, onSelect, selectedElementId }) {
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
            className={`column__element ${selectedElementId === element.id ? 'column__element--selected' : ''}`}
            onClick={() => onSelect(element.id)}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(element.id);
                }
            }}
        >
            <div className="column__element-header">
                <span className="drag-handle drag-handle--column" {...listeners} {...attributes} aria-label="Drag to reorder" role="button" />
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
                    aria-label="Remove element"
                >
                    ×
                </button>
            </div>
            <div className="column__element-body">
                {renderElementPreview(element)}
            </div>
        </div>
    );
}

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

function renderElementPreview(element) {
    switch (element.type) {
        case 'text':
            return <TextField fullWidth placeholder={element.placeholder || 'Enter text'} size="small" />;
        case 'textarea':
            return <TextField fullWidth multiline rows={element.rows || 3} placeholder={element.placeholder || 'Enter details'} size="small" />;
        case 'number':
            return <TextField fullWidth type="number" placeholder={element.placeholder || ''} size="small" />;
        case 'email':
            return <TextField fullWidth type="email" placeholder={element.placeholder || 'name@example.com'} size="small" />;
        case 'phone':
            return <TextField fullWidth type="tel" placeholder={element.placeholder || '(555) 123-4567'} size="small" />;
        case 'radio':
            return <div style={{ display: 'flex', flexDirection: element.radioLayout === 'horizontal' ? 'row' : 'column', gap: 6 }}>
                {(element.options || []).map((opt, idx) => (
                    <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        <input type="radio" name={element.id} disabled /> {opt}
                    </label>
                ))}
            </div>;
        case 'checkbox':
            return <div style={{ display: 'flex', flexDirection: element.checkboxLayout === 'horizontal' ? 'row' : 'column', gap: 6 }}>
                {(element.checkboxOptions || []).map((opt, idx) => (
                    <FormControlLabel
                        key={idx}
                        control={<Checkbox size="small" disabled checked={opt.checked} />}
                        label={opt.label}
                    />
                ))}
            </div>;
        case 'select':
            return (
                <select style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #d0d5e2' }} disabled>
                    {(element.options || []).map((opt, idx) => (
                        <option key={idx}>{opt}</option>
                    ))}
                </select>
            );
        case 'date': {
            const format = element.dateFormat || 'YYYY-MM-DD';
            const isIso = format === 'YYYY-MM-DD';
            const pattern = dateFormatPattern(format);
            const formattedDefault = isIso ? element.defaultDate || '' : formatDateValue(element.defaultDate, format);
            return (
                <TextField
                    fullWidth
                    type={isIso ? 'date' : 'text'}
                    size="small"
                    defaultValue={formattedDefault}
                    placeholder={format}
                    inputProps={{
                        min: isIso ? element.minDate || undefined : undefined,
                        max: isIso ? element.maxDate || undefined : undefined,
                        pattern,
                    }}
                />
            );
        }
        case 'rating':
            return <Rating size="small" precision={element.precision ?? 0.5} max={element.max ?? 5} defaultValue={element.defaultValue ?? 0} />;
        case 'slider':
            return (
                <input
                    type="range"
                    min={element.min ?? 0}
                    max={element.max ?? 100}
                    step={element.step ?? 1}
                    defaultValue={element.defaultValue ?? element.min ?? 0}
                    style={{ width: '100%' }}
                    disabled
                />
            );
        case 'toggle':
            return <FormControlLabel control={<Switch size="small" defaultChecked={element.checked} disabled />} label={element.checked ? element.onLabel : element.offLabel} />;
        case 'file':
            return <TextField fullWidth type="file" size="small" disabled />;
        case 'divider':
            return <div style={{ borderTop: '1px solid #d7dce9', paddingTop: 6, color: '#475072', fontSize: 13 }}>{element.label || 'Divider'}</div>;
        case 'button':
            return (
                <Button
                    variant={element.variant || 'contained'}
                    color={element.color || 'primary'}
                    size={element.size || 'small'}
                    disableElevation={!!element.disableElevation}
                    disabled={!!element.disabled || !!element.loading}
                    startIcon={element.loading ? <CircularProgress size={14} color="inherit" /> : iconForName(element.startIcon)}
                    endIcon={element.loading ? null : iconForName(element.endIcon)}
                    sx={{ borderRadius: element.borderRadius ?? 8 }}
                >
                    {element.label || 'Button'}
                </Button>
            );
        default:
            return null;
    }
}

export default ColumnRow;
