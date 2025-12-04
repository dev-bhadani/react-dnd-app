import React from 'react';
import {TextField, Select, MenuItem, FormControl, InputLabel, Button, IconButton} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function EditSidebar({
                         selectedElement,
                         onNameChange,
                         onOptionsChange,
                         onButtonPropertyChange,
                         onCheckboxOptionChange,
                         addCheckboxOption,
                         deleteCheckboxOption,
                         onCloseProperties
                     }) {
    return (<div className="edit-sidebar__panel">
        <div className="edit-sidebar__header">
            <h3 className="edit-sidebar__title">Edit Properties</h3>
            <IconButton aria-label="Close properties" size="small" onClick={onCloseProperties}>
                <CloseIcon fontSize="small" />
            </IconButton>
        </div>
        <TextField
            label="Element Name"
            value={selectedElement.name}
            onChange={(e) => onNameChange(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="Enter element name"
        />

        {selectedElement.type === 'checkbox' && (<section className="edit-sidebar__section">
            <h4>Checkbox Options</h4>
            {selectedElement.checkboxOptions.map((option, index) => (
                <div key={index} className="edit-sidebar__row">
                    <TextField
                        label={`Option ${index + 1} Label`}
                        value={option.label}
                        onChange={(e) => onCheckboxOptionChange(index, 'label', e.target.value)}
                        variant="outlined"
                        fullWidth
                    />
                    <Button
                        variant="text"
                        color="error"
                        onClick={() => deleteCheckboxOption(index)}
                    >
                        Remove
                    </Button>
                </div>))}
            <Button
                variant="contained"
                color="primary"
                onClick={addCheckboxOption}
                className="edit-sidebar__add"
            >
                Add Checkbox Option
            </Button>
        </section>)}

        {selectedElement.type === 'button' && (<section className="edit-sidebar__section">
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
        </section>)}

        {(selectedElement.type === 'radio' || selectedElement.type === 'select') && (<section className="edit-sidebar__section">
            <h4>Options</h4>
            {selectedElement.options.map((option, index) => (
                <div key={index} className="edit-sidebar__row">
                    <TextField
                        value={option}
                        onChange={(e) => onOptionsChange(index, e.target.value)}
                        variant="outlined"
                        fullWidth
                        placeholder={`Option ${index + 1}`}
                    />
                    <Button
                        variant="text"
                        color="error"
                        onClick={() => onOptionsChange(index, null)}
                    >
                        Remove
                    </Button>
                </div>))}
            <Button
                variant="contained"
                color="primary"
                onClick={() => onOptionsChange(selectedElement.options.length, '')}
                className="edit-sidebar__add"
            >
                Add Option
            </Button>
        </section>)}
    </div>);
}

export default EditSidebar;
