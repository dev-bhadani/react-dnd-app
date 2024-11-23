import React from 'react';
import {TextField, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel, Button} from '@mui/material';

function EditSidebar({
                         selectedElement,
                         onNameChange,
                         onOptionsChange,
                         onButtonPropertyChange,
                         onCheckboxPropertyChange,
                         onCheckboxOptionChange,
                         addCheckboxOption,
                         deleteCheckboxOption
                     }) {
    return (<div
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

        {selectedElement.type === 'checkbox' && (<>
            <h4 style={{marginTop: '20px', color: '#333'}}>Checkbox Options</h4>
            {selectedElement.checkboxOptions.map((option, index) => (
                <div key={index} style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                    <TextField
                        label={`Option ${index + 1} Label`}
                        value={option.label}
                        onChange={(e) => onCheckboxOptionChange(index, 'label', e.target.value)}
                        variant="outlined"
                        fullWidth
                        style={{marginRight: '10px'}}
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => deleteCheckboxOption(index)}
                    >
                        Delete
                    </Button>
                </div>))}
            <Button
                variant="outlined"
                color="primary"
                onClick={addCheckboxOption}
                style={{marginTop: '10px'}}
            >
                Add Checkbox Option
            </Button>
        </>)}

        {selectedElement.type === 'button' && (<>
            <TextField
                label="Button Label"
                value={selectedElement.label}
                onChange={(e) => onButtonPropertyChange('label', e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <FormControl fullWidth margin="normal">
                <InputLabel>Variant</InputLabel>
                <Select
                    value={selectedElement.variant}
                    onChange={(e) => onButtonPropertyChange('variant', e.target.value)}
                >
                    <MenuItem value="text">Text</MenuItem>
                    <MenuItem value="contained">Contained</MenuItem>
                    <MenuItem value="outlined">Outlined</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel>Color</InputLabel>
                <Select
                    value={selectedElement.color}
                    onChange={(e) => onButtonPropertyChange('color', e.target.value)}
                >
                    <MenuItem value="primary">Primary</MenuItem>
                    <MenuItem value="secondary">Secondary</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                </Select>
            </FormControl>
        </>)}

        {selectedElement.type === 'radio' || selectedElement.type === 'select' ? (<>
            <h4 style={{marginTop: '20px', color: '#333'}}>Options</h4>
            {selectedElement.options.map((option, index) => (
                <div key={index} style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                    <TextField
                        value={option}
                        onChange={(e) => onOptionsChange(index, e.target.value)}
                        variant="outlined"
                        fullWidth
                        placeholder={`Option ${index + 1}`}
                        style={{marginRight: '10px'}}
                    />
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => onOptionsChange(index, null)}
                    >
                        Delete
                    </Button>
                </div>))}
            <Button
                variant="outlined"
                color="primary"
                onClick={() => onOptionsChange(selectedElement.options.length, '')}
                style={{marginTop: '10px'}}
            >
                Add Option
            </Button>
        </>) : null}
    </div>);
}

export default EditSidebar;
