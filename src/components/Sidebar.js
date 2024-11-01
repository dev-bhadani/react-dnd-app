import React from 'react';
import DraggableItem from './DraggableItem';

function Sidebar({ items }) {
    return (
        <div
            style={{
                width: '90%',
                maxWidth: '300px',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            <h3 style={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>Form Elements</h3>
            {items.map((item) => (
                <DraggableItem key={item.id} item={item} />
            ))}
        </div>
    );
}

export default Sidebar;
