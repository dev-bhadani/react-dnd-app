import React from 'react';
import {TextField, Checkbox, Button, Radio, Select, MenuItem, Slider} from '@mui/material';
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';

function FormCanvas({formElements, onDelete}) {
    const handleDelete = (id) => {
        if (typeof onDelete === 'function') {
            onDelete(id);
        } else {
            console.error('onDelete is not a function');
        }
    };

    return (
        <div
            style={{
                border: '2px dashed #ccc',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
                color: '#aaa',
                fontSize: '40px',
                width: '95%',
                minHeight: '800px',
                backgroundColor: '#ffffff',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Arial, sans-serif',
            }}
        >
            {formElements.length === 0 ? (
                <div>Dropzone</div>
            ) : (
                formElements.map((element) => (
                    <div
                        key={element.id}
                        style={{
                            position: 'relative',
                            marginBottom: '20px',
                            padding: '15px',
                            borderRadius: '8px',
                            backgroundColor: '#f5f5f5',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <button
                            onClick={() => handleDelete(element.id)}
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
                        {renderElement(element)}
                    </div>
                ))
            )}
        </div>
    );
}

function renderElement(element) {
    switch (element.type) {
        case 'text':
            return <TextField label="Text Field" variant="outlined" fullWidth margin="normal"/>;
        case 'checkbox':
            return <Checkbox/>;
        case 'button':
            return <Button variant="contained" color="primary">Button</Button>;
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

export default FormCanvas;
