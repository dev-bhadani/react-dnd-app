import React from 'react';
import {TextField, Select, MenuItem, FormControl, InputLabel, Button, IconButton, Switch, FormControlLabel} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

function EditSidebar({
                         selectedElement,
                         onNameChange,
                         onOptionsChange,
                         addOption,
                         deleteOption,
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
            <FormControl fullWidth margin="dense">
                <InputLabel>Alignment</InputLabel>
                <Select
                    value={selectedElement.checkboxLayout || 'vertical'}
                    label="Alignment"
                    onChange={(e) => onElementPropertyChange('checkboxLayout', e.target.value)}
                >
                    <MenuItem value="vertical">Vertical</MenuItem>
                    <MenuItem value="horizontal">Horizontal</MenuItem>
                </Select>
            </FormControl>
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

        {selectedElement.type === 'radio' && (<section className="edit-sidebar__section">
            <h4>Radio Options</h4>
            <FormControl fullWidth margin="dense">
                <InputLabel>Alignment</InputLabel>
                <Select
                    value={selectedElement.radioLayout || 'vertical'}
                    label="Alignment"
                    onChange={(e) => onElementPropertyChange('radioLayout', e.target.value)}
                >
                    <MenuItem value="vertical">Vertical</MenuItem>
                    <MenuItem value="horizontal">Horizontal</MenuItem>
                </Select>
            </FormControl>
            {selectedElement.options.map((option, index) => (
                <div key={index} className="edit-sidebar__row">
                    <TextField
                        label={`Option ${index + 1} Label`}
                        value={option}
                        onChange={(e) => onOptionsChange(index, e.target.value)}
                        variant="outlined"
                        fullWidth
                    />
                    <Button
                        variant="text"
                        color="error"
                        onClick={() => deleteOption(index)}
                    >
                        Remove
                    </Button>
                </div>))}
            <Button
                variant="contained"
                color="primary"
                onClick={addOption}
                className="edit-sidebar__add"
            >
                Add Radio Option
            </Button>
        </section>)}

        {selectedElement.type === 'select' && (<section className="edit-sidebar__section">
            <h4>Dropdown Options</h4>
            {(selectedElement.options || []).map((option, index) => (
                <div key={index} className="edit-sidebar__row">
                    <TextField
                        label={`Option ${index + 1} Label`}
                        value={option}
                        onChange={(e) => onOptionsChange(index, e.target.value)}
                        variant="outlined"
                        fullWidth
                    />
                    <Button
                        variant="text"
                        color="error"
                        onClick={() => deleteOption(index)}
                    >
                        Remove
                    </Button>
                </div>
            ))}
            <Button
                variant="contained"
                color="primary"
                onClick={addOption}
                className="edit-sidebar__add"
            >
                Add Dropdown Option
            </Button>
        </section>)}

        {selectedElement.type === 'rating' && (
            <section className="edit-sidebar__section">
                <TextField
                    label="Max stars"
                    type="number"
                    value={selectedElement.max ?? 5}
                    onChange={(e) => onElementPropertyChange('max', e.target.value ? Number(e.target.value) : 5)}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 1, max: 10 }}
                />
                <FormControl fullWidth margin="normal">
                    <InputLabel>Precision</InputLabel>
                    <Select
                        value={selectedElement.precision ?? 0.5}
                        label="Precision"
                        onChange={(e) => onElementPropertyChange('precision', Number(e.target.value))}
                    >
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={0.5}>0.5</MenuItem>
                        <MenuItem value={0.25}>0.25</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    label="Default value"
                    type="number"
                    value={selectedElement.defaultValue ?? 0}
                    onChange={(e) => onElementPropertyChange('defaultValue', e.target.value ? Number(e.target.value) : 0)}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0, max: selectedElement.max ?? 5, step: selectedElement.precision ?? 0.5 }}
                />
            </section>
        )}

        {selectedElement.type === 'slider' && (
            <section className="edit-sidebar__section">
                <TextField
                    label="Minimum"
                    type="number"
                    value={selectedElement.min ?? 0}
                    onChange={(e) => onElementPropertyChange('min', e.target.value ? Number(e.target.value) : 0)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Maximum"
                    type="number"
                    value={selectedElement.max ?? 100}
                    onChange={(e) => onElementPropertyChange('max', e.target.value ? Number(e.target.value) : 100)}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Step"
                    type="number"
                    value={selectedElement.step ?? 1}
                    onChange={(e) => onElementPropertyChange('step', e.target.value ? Number(e.target.value) : 1)}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: 0.01, step: 0.01 }}
                />
                <TextField
                    label="Default value"
                    type="number"
                    value={selectedElement.defaultValue ?? (selectedElement.min ?? 0)}
                    onChange={(e) => onElementPropertyChange('defaultValue', e.target.value ? Number(e.target.value) : selectedElement.min ?? 0)}
                    fullWidth
                    margin="normal"
                    inputProps={{ min: selectedElement.min ?? 0, max: selectedElement.max ?? 100, step: selectedElement.step ?? 1 }}
                />
            </section>
        )}

        {selectedElement.type === 'button' && (<section className="edit-sidebar__section">
            <TextField
                label="Button Label"
                value={selectedElement.label}
                onChange={(e) => (onButtonPropertyChange || onElementPropertyChange)('label', e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <FormControl fullWidth margin="normal">
                <InputLabel>Variant</InputLabel>
                <Select
                    value={selectedElement.variant}
                    onChange={(e) => (onButtonPropertyChange || onElementPropertyChange)('variant', e.target.value)}
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
                    onChange={(e) => (onButtonPropertyChange || onElementPropertyChange)('color', e.target.value)}
                >
                    <MenuItem value="primary">Primary</MenuItem>
                    <MenuItem value="secondary">Secondary</MenuItem>
                    <MenuItem value="success">Success</MenuItem>
                    <MenuItem value="error">Error</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel>Size</InputLabel>
                <Select
                    value={selectedElement.size || 'medium'}
                    onChange={(e) => (onButtonPropertyChange || onElementPropertyChange)('size', e.target.value)}
                >
                    <MenuItem value="small">Small</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="large">Large</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel>Type</InputLabel>
                <Select
                    value={selectedElement.typeAttr || 'button'}
                    onChange={(e) => (onButtonPropertyChange || onElementPropertyChange)('typeAttr', e.target.value)}
                >
                    <MenuItem value="button">Button</MenuItem>
                    <MenuItem value="submit">Submit</MenuItem>
                    <MenuItem value="reset">Reset</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="Link (href)"
                value={selectedElement.href || ''}
                onChange={(e) => (onButtonPropertyChange || onElementPropertyChange)('href', e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <FormControl fullWidth margin="normal">
                <InputLabel>Target</InputLabel>
                <Select
                    value={selectedElement.target || '_self'}
                    onChange={(e) => (onButtonPropertyChange || onElementPropertyChange)('target', e.target.value)}
                >
                    <MenuItem value="_self">Same tab</MenuItem>
                    <MenuItem value="_blank">New tab</MenuItem>
                    <MenuItem value="_parent">Parent</MenuItem>
                    <MenuItem value="_top">Top</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel>Start icon</InputLabel>
                <Select
                    value={selectedElement.startIcon || 'none'}
                    onChange={(e) => (onButtonPropertyChange || onElementPropertyChange)('startIcon', e.target.value)}
                >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="save">Save</MenuItem>
                    <MenuItem value="send">Send</MenuItem>
                    <MenuItem value="add">Add</MenuItem>
                    <MenuItem value="delete">Delete</MenuItem>
                    <MenuItem value="check">Check</MenuItem>
                </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
                <InputLabel>End icon</InputLabel>
                <Select
                    value={selectedElement.endIcon || 'none'}
                    onChange={(e) => (onButtonPropertyChange || onElementPropertyChange)('endIcon', e.target.value)}
                >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="save">Save</MenuItem>
                    <MenuItem value="send">Send</MenuItem>
                    <MenuItem value="add">Add</MenuItem>
                    <MenuItem value="delete">Delete</MenuItem>
                    <MenuItem value="check">Check</MenuItem>
                </Select>
            </FormControl>
            <TextField
                label="Border radius (px)"
                type="number"
                value={selectedElement.borderRadius ?? 8}
                onChange={(e) => (onButtonPropertyChange || onElementPropertyChange)('borderRadius', e.target.value ? Number(e.target.value) : 0)}
                variant="outlined"
                fullWidth
                margin="normal"
                inputProps={{ min: 0, max: 32, step: 1 }}
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={!!selectedElement.fullWidth}
                        onChange={(_, checked) => (onButtonPropertyChange || onElementPropertyChange)('fullWidth', checked)}
                    />
                }
                label="Full width"
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={!!selectedElement.disableElevation}
                        onChange={(_, checked) => (onButtonPropertyChange || onElementPropertyChange)('disableElevation', checked)}
                    />
                }
                label="Disable elevation"
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={!!selectedElement.disabled}
                        onChange={(_, checked) => (onButtonPropertyChange || onElementPropertyChange)('disabled', checked)}
                    />
                }
                label="Disabled"
            />
            <FormControlLabel
                control={
                    <Switch
                        checked={!!selectedElement.loading}
                        onChange={(_, checked) => (onButtonPropertyChange || onElementPropertyChange)('loading', checked)}
                    />
                }
                label="Show loading spinner"
            />
        </section>)}

        {['textarea', 'number', 'email', 'phone', 'toggle', 'file', 'divider', 'text', 'date'].includes(selectedElement.type) && (
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
                {selectedElement.type === 'date' && (
                    <>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Date format</InputLabel>
                            <Select
                                value={selectedElement.dateFormat || 'YYYY-MM-DD'}
                                label="Date format"
                                onChange={(e) => onElementPropertyChange('dateFormat', e.target.value)}
                            >
                                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</MenuItem>
                                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                                <MenuItem value="DD.MM.YYYY">DD.MM.YYYY</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            label="Default value"
                            type="date"
                            value={selectedElement.defaultDate || ''}
                            onChange={(e) => onElementPropertyChange('defaultDate', e.target.value)}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Minimum date"
                            type="date"
                            value={selectedElement.minDate || ''}
                            onChange={(e) => onElementPropertyChange('minDate', e.target.value)}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            helperText={selectedElement.dateFormat || 'YYYY-MM-DD'}
                        />
                        <TextField
                            label="Maximum date"
                            type="date"
                            value={selectedElement.maxDate || ''}
                            onChange={(e) => onElementPropertyChange('maxDate', e.target.value)}
                            fullWidth
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                            helperText={selectedElement.dateFormat || 'YYYY-MM-DD'}
                        />
                    </>
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
