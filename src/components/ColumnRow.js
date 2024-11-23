import React from 'react';
import {useDroppable} from '@dnd-kit/core';

function ColumnRow({element, onDelete, onSelect}) {
    const columns = element.type === 'twoColumnRow' ? 2 : element.type === 'threeColumnRow' ? 3 : 4;

    const columnContainerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        gap: '10px',
        width: '100%',
        padding: '15px',
        boxSizing: 'border-box',
        border: '1px dashed #ccc',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
    };

    return (<div style={{marginBottom: '20px', position: 'relative'}}>
            <button
                onClick={() => onDelete(element.id)}
                style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                }}
            >
                &times;
            </button>
            <div style={columnContainerStyle}>
                {[...Array(columns)].map((_, index) => (<DroppableColumn
                        key={index}
                        columnId={`${element.id}-column-${index}`}
                        elements={element.columns[index] || []}
                        onSelect={onSelect}
                    />))}
            </div>
        </div>);
}

function DroppableColumn({columnId, elements, onSelect}) {
    const {isOver, setNodeRef} = useDroppable({
        id: columnId,
    });

    const style = {
        flex: 1,
        minHeight: '100px',
        border: isOver ? '2px solid #4caf50' : '1px dashed #ccc',
        padding: '10px',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
    };

    return (<div ref={setNodeRef} style={style}>
            {elements.length === 0 ? (<div>Drop here</div>) : (elements.map((el) => (<div
                        key={el.id}
                        style={{
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: '#fafafa',
                            marginBottom: '10px',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                        onClick={() => onSelect(el.id)}
                    >
                        {el.type}
                    </div>)))}
        </div>);
}

export default ColumnRow;
