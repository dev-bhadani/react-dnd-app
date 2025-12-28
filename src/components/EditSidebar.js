import React from 'react';
import {TextField, Select, MenuItem, FormControl, InputLabel, Button, IconButton, Switch, FormControlLabel} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function EditSidebar({
                         selectedElement,
                         onNameChange,
                         onOptionsChange,
                         onButtonPropertyChange,
                         onCheckboxOptionChange,
                         addCheckboxOption,
                         deleteCheckboxOption,
                         onElementPropertyChange,
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

        {['textarea', 'number', 'email', 'phone', 'toggle', 'file', 'divider', 'text'].includes(selectedElement.type) && (
            <section className="edit-sidebar__section">
                {selectedElement.type === 'text' && (
                    <TextField
                        label="Placeholder"
                        value={selectedElement.placeholder || ''}
                        onChange={(e) => onElementPropertyChange('placeholder', e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                )}
                {selectedElement.type === 'textarea' && (
                    <>
                        <TextField
                            label="Placeholder"
                            value={selectedElement.placeholder || ''}
                            onChange={(e) => onElementPropertyChange('placeholder', e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Rows"
                            type="number"
                            value={selectedElement.rows || 4}
                            onChange={(e) => onElementPropertyChange('rows', Number(e.target.value))}
                            fullWidth
                            margin="normal"
                            inputProps={{ min: 2, max: 10 }}
                        />
                    </>
                )}
                {selectedElement.type === 'number' && (
                    <>
                        <TextField
                            label="Placeholder"
                            value={selectedElement.placeholder || ''}
                            onChange={(e) => onElementPropertyChange('placeholder', e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Minimum"
                            type="number"
                            value={selectedElement.min ?? ''}
                            onChange={(e) => onElementPropertyChange('min', e.target.value ? Number(e.target.value) : '')}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Maximum"
                            type="number"
                            value={selectedElement.max ?? ''}
                            onChange={(e) => onElementPropertyChange('max', e.target.value ? Number(e.target.value) : '')}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Step"
                            type="number"
                            value={selectedElement.step ?? 1}
                            onChange={(e) => onElementPropertyChange('step', e.target.value ? Number(e.target.value) : '')}
                            fullWidth
                            margin="normal"
                        />
                    </>
                )}
                {selectedElement.type === 'email' && (
                    <TextField
                        label="Placeholder"
                        value={selectedElement.placeholder || ''}
                        onChange={(e) => onElementPropertyChange('placeholder', e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                )}
                {selectedElement.type === 'phone' && (
                    <>
                        <TextField
                            label="Placeholder"
                            value={selectedElement.placeholder || ''}
                            onChange={(e) => onElementPropertyChange('placeholder', e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Pattern (optional)"
                            value={selectedElement.pattern || ''}
                            onChange={(e) => onElementPropertyChange('pattern', e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                    </>
                )}
                {selectedElement.type === 'toggle' && (
                    <>
                        <TextField
                            label="On Label"
                            value={selectedElement.onLabel || ''}
                            onChange={(e) => onElementPropertyChange('onLabel', e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <TextField
                            label="Off Label"
                            value={selectedElement.offLabel || ''}
                            onChange={(e) => onElementPropertyChange('offLabel', e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={selectedElement.checked || false}
                                    onChange={(_, checked) => onElementPropertyChange('checked', checked)}
                                />
                            }
                            label="Default to On"
                        />
                    </>
                )}
                {selectedElement.type === 'file' && (
                    <>
                        <TextField
                            label="Accept"
                            value={selectedElement.accept || ''}
                            onChange={(e) => onElementPropertyChange('accept', e.target.value)}
                            helperText="Comma separated MIME types or extensions"
                            fullWidth
                            margin="normal"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={selectedElement.multiple || false}
                                    onChange={(_, checked) => onElementPropertyChange('multiple', checked)}
                                />
                            }
                            label="Allow multiple files"
                        />
                    </>
                )}
                {selectedElement.type === 'divider' && (
                    <TextField
                        label="Divider Label"
                        value={selectedElement.label || ''}
                        onChange={(e) => onElementPropertyChange('label', e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                )}
            </section>
        )}
    </div>);
}

export default EditSidebar;
