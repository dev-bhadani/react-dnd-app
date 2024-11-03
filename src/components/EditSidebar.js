import React from 'react';
import {TextField} from '@mui/material';

function EditSidebar({selectedElement, onNameChange}) {
    return (
        <div
            style={{
                width: '100%',
                maxWidth: '300px',
                padding: '40px',
                border: '1px solid #ddd',
                borderRadius: '10px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                boxSizing: 'border-box',
                fontFamily: 'Arial, sans-serif',
                marginLeft: '20px',
            }}
        >
            <h3 style={{textAlign: 'center', fontWeight: 'bold', color: '#333'}}>Edit Properties</h3>
            <TextField
                label="Element Name"
                value={selectedElement.name}
                onChange={(e) => onNameChange(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
                placeholder="Enter element name"
            />
        </div>
    );
}

export default EditSidebar;
