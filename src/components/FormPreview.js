import React from 'react';
import {TextField, Checkbox, Button, Radio, Select, MenuItem, Slider} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';

function FormPreview({formElements, onClose}) {
    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '500px',
                maxHeight: '90vh',
                padding: '40px',
                border: '1px solid #ddd',
                borderRadius: '15px',
                backgroundColor: '#ffffff',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
                overflowY: 'auto',
                zIndex: '1000',
            }}
        >
            <h2 style={{textAlign: 'center', fontWeight: 'bold', marginBottom: '20px'}}>Form Preview</h2>
            {formElements.map((element) => (
                <div key={element.id} style={{marginBottom: '20px'}}>
                    <label style={{fontWeight: 'bold', display: 'block', marginBottom: '8px'}}>
                        {element.type !== 'button' && element.name}
                    </label>
                    {renderElement(element)}
                </div>
            ))}
            <div style={{textAlign: 'center', marginTop: '30px'}}>
                <Button
                    variant="contained"
                    color="primary"
                    style={{marginRight: '10px'}}
                    onClick={() => alert('Form Submitted')}
                >
                    Submit
                </Button>
                <Button variant="outlined" color="secondary" onClick={onClose}>
                    Close
                </Button>
            </div>
        </div>
    );
}

function renderElement(element) {
    switch (element.type) {
        case 'text':
            return <TextField label="Text Field" variant="outlined" fullWidth margin="normal"/>;
        case 'checkbox':
            return <Checkbox label="Aged?"/>;
        case 'button':
            return <Button variant="contained" color="primary">{element.name || 'Button'}</Button>;
        case 'radio':
            return (
                <div>
                    <Radio/> Option 1
                    <Radio/> Option 2
                </div>
            );
        case 'select':
            return (
                <Select fullWidth displayEmpty defaultValue="">
                    <MenuItem value="" disabled>
                        Select an option
                    </MenuItem>
                    <MenuItem value="option1">Option 1</MenuItem>
                    <MenuItem value="option2">Option 2</MenuItem>
                </Select>
            );
        case 'date':
            return (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="Select Date"
                        renderInput={(params) => <TextField {...params} fullWidth margin="normal"/>}
                    />
                </LocalizationProvider>
            );
        case 'slider':
            return <Slider defaultValue={30} aria-label="Slider"/>;
        default:
            return null;
    }
}

export default FormPreview;
