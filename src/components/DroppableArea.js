import React, { useCallback, useEffect, useRef } from 'react';
import {useDroppable} from '@dnd-kit/core';
import ColumnRow from './ColumnRow';
import {Button, Checkbox, FormControlLabel, Rating} from "@mui/material";

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

    useEffect(() => {
        const updateWidth = () => {
            const header = document.querySelector('.workspace__header');
            if (header && canvasRef.current) {
                canvasRef.current.style.width = `${header.offsetWidth}px`;
                canvasRef.current.style.boxSizing = 'border-box';
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        return () => window.removeEventListener('resize', updateWidth);
    }, []);

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
                            </div>

                            <div className="canvas-element__body">
                                {renderElement(element)}
                            </div>

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
                    }}
                />
            );
        case 'checkbox':
            return (
                <>
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
                </>
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
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    {element.options.map((option, index) => (
                        <label key={index}>
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
                        marginLeft: '10px',
                        border: '1px solid #ccc',
                        fontSize: '16px',
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
                        marginLeft: '10px',
                        border: '1px solid #ccc',
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
                    style={{width: '100%', marginLeft: '10px', accentColor: '#007bff'}}
                />
            );
        default:
            return null;
    }
}

export default DroppableArea;
