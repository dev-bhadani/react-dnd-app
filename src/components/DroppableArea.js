import React from 'react';
import {useDroppable} from '@dnd-kit/core';
import ColumnRow from './ColumnRow';

function DroppableArea({formElements, onDelete, onSelect}) {
    const {isOver, setNodeRef} = useDroppable({
        id: 'form-canvas',
    });

    const style = {
        border: isOver ? '2px solid #4caf50' : '2px dashed #ccc',
        borderRadius: '12px',
        padding: '5px',
        textAlign: 'center',
        color: '#aaa',
        fontSize: '18px',
        width: '100%',
        minHeight: '800px',
        backgroundColor: '#fafafa',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        marginLeft: '10px',
        fontFamily: 'Arial, sans-serif',
    };

    const elementStyle = {
        position: 'relative',
        marginBottom: '25px',
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '95%',
        margin: '15px auto',
        transition: 'all 0.3s ease-in-out',
    };

    const labelStyle = {
        fontWeight: 'bold',
        marginBottom: '10px',
        textAlign: 'left',
        display: 'block',
        color: '#333',
        marginLeft: '8px',
        fontSize: '16px',
    };

    const deleteButtonStyle = {
        position: 'absolute',
        top: '10px',
        right: '10px',
        backgroundColor: 'red',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        cursor: 'pointer',
        fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    };

    const elementContentStyle = {
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        justifyContent: 'space-between',
    };

    return (
        <div ref={setNodeRef} style={style}>
            {formElements.length === 0 ? (
                <div>Dropzone</div>
            ) : (
                formElements.map((element) => {
                    if (element.type === 'twoColumnRow' || element.type === 'threeColumnRow' || element.type === 'fourColumnRow') {
                        return (
                            <ColumnRow
                                key={element.id}
                                element={element}
                                onDelete={onDelete}
                                onSelect={onSelect}
                            />
                        );
                    }
                    return (
                        <div
                            key={element.id}
                            style={elementStyle}
                            onClick={() => onSelect(element.id)}
                        >
                            <label style={labelStyle}>
                                {element.type !== 'button' && element.name}
                            </label>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(element.id);
                                }}
                                style={deleteButtonStyle}
                            >
                                &times;
                            </button>
                            <div style={elementContentStyle}>
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
                    }}
                />
            );
        case 'checkbox':
            return <input type="checkbox" style={{marginLeft: '10px', transform: 'scale(1.2)'}}/>;
        case 'radio':
            return (
                <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                    <label>
                        <input type="radio" name={element.id}/> Option 1
                    </label>
                    <label>
                        <input type="radio" name={element.id}/> Option 2
                    </label>
                </div>
            );
        case 'button':
            return (
                <button
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    {element.name || 'Button'}
                </button>
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
                    <option>Select an option</option>
                    <option>Option 1</option>
                    <option>Option 2</option>
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
