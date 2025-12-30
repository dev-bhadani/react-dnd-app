import React, { useCallback, useRef } from 'react';
import {useDroppable} from '@dnd-kit/core';
import ColumnRow from './ColumnRow';
import {Button, Checkbox, FormControlLabel, Rating, Switch, TextField} from "@mui/material";

function DroppableArea({formElements, onDelete, onSelect, selectedElementId}) {
    const canvasRef = useRef(null);
    const {isOver, setNodeRef} = useDroppable({
        id: 'form-canvas',
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
                formElements.map((element) => {
                    if (element.type === 'twoColumnRow' || element.type === 'threeColumnRow' || element.type === 'fourColumnRow') {
                        return (
                            <ColumnRow
                                key={element.id}
                                element={element}
                                onDelete={onDelete}
                                onSelect={onSelect}
                                selectedElementId={selectedElementId}
                            />
                        );
                    }

                    const isSelected = element.id === selectedElementId;

                    return (
                        <div
                            key={element.id}
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
                            <div className="canvas-element__header">
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
                                    aria-label="Remove element"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="canvas-element__body">
                                {renderElement(element)}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}

function renderElement(element) {
    switch (element.type) {
        case 'text':
            return (
                <input
                    type="text"
                    placeholder="Text Field"
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
                    disabled={element.disabled || false}
                    href={element.href || null}
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
            return (
                <input
                    type="date"
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #ccc',
                        boxSizing: 'border-box',
                    }}
                />
            );
        case 'rating':
            return (
                <Rating name="half-rating" defaultValue={2.5} precision={0.5}/>
            );
        case 'slider':
            return (
                <input
                    type="range"
                    min="0"
                    max="100"
                    style={{width: '100%', accentColor: '#007bff'}}
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
                <TextField type="tel" placeholder={element.placeholder || '(555) 123-4567'} fullWidth />
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
