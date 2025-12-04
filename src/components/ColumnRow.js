import React from 'react';
import {useDroppable} from '@dnd-kit/core';

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
                        elements={element.columns[index] || []}
                        onSelect={onSelect}
                        selectedElementId={selectedElementId}
                    />))}
            </div>
        </div>);
}

function DroppableColumn({columnId, elements, onSelect, selectedElementId}) {
    const {isOver, setNodeRef} = useDroppable({
        id: columnId,
    });

    return (<div
            ref={setNodeRef}
            className={`column ${isOver ? 'column--active' : ''}`}
        >
            {elements.length === 0 ? (<p className="column__empty">Drop here</p>) : (elements.map((el) => (<div
                        key={el.id}
                        role="button"
                        tabIndex={0}
                        className={`column__element ${selectedElementId === el.id ? 'column__element--selected' : ''}`}
                        onClick={() => onSelect(el.id)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                onSelect(el.id);
                            }
                        }}
                    >
                        {el.type}
                    </div>)))}
        </div>);
}

export default ColumnRow;
