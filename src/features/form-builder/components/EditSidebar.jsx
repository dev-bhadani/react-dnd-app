import React, { useState } from 'react';
import {
    Button,
    Chip,
    FormControl,
    FormControlLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useBuilderStore, useSelectedElement } from '../state/builderStore';
import { isLayoutType, getColumnCount } from '../utils/layout';

/**
 * Properties panel.
 *
 * Three tabs keep the panel scannable as the property catalog grows:
 *   - Content    → label, options, type-specific look-and-feel
 *   - Validation → required, min/max/pattern (where applicable), helper text
 *   - Advanced   → width, raw id, layout-only knobs
 *
 * The component subscribes to the store via narrow selectors, so unrelated
 * state changes don't re-render the panel.
 */
export default function EditSidebar() {
    const selectedElement = useSelectedElement();
    const updateSelected = useBuilderStore((s) => s.updateSelected);
    const closeProperties = useBuilderStore((s) => s.closeProperties);
    const duplicateElement = useBuilderStore((s) => s.duplicateElement);
    const deleteElement = useBuilderStore((s) => s.deleteElement);
    const [tab, setTab] = useState('content');

    if (!selectedElement) return null;

    const set = (key, value) => updateSelected(key, value);
    const isLayout = isLayoutType(selectedElement.type);

    return (
        <div className="edit-sidebar__panel">
            <div className="edit-sidebar__header">
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                        label={selectedElement.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 10 }}
                    />
                    <Typography variant="subtitle1" fontWeight={700}>
                        Properties
                    </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Duplicate (⌘D)">
                        <IconButton
                            aria-label="Duplicate element"
                            size="small"
                            onClick={() => duplicateElement(selectedElement.id)}
                        >
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete (⌫)">
                        <IconButton
                            aria-label="Delete element"
                            size="small"
                            color="error"
                            onClick={() => deleteElement(selectedElement.id)}
                        >
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Close panel">
                        <IconButton aria-label="Close properties" size="small" onClick={closeProperties}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </div>

            <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                variant="fullWidth"
                sx={{ minHeight: 36, mb: 1, '.MuiTab-root': { minHeight: 36, fontSize: 13 } }}
            >
                <Tab value="content" label="Content" />
                {!isLayout && <Tab value="validation" label="Validation" />}
                <Tab value="advanced" label="Advanced" />
            </Tabs>

            {tab === 'content' && <ContentTab element={selectedElement} set={set} />}
            {tab === 'validation' && !isLayout && (
                <ValidationTab element={selectedElement} set={set} />
            )}
            {tab === 'advanced' && <AdvancedTab element={selectedElement} set={set} />}
        </div>
    );
}

/* --------------------------------------------------------------------------
 * Content tab
 * ----------------------------------------------------------------------- */

function ContentTab({ element, set }) {
    const setOption = useBuilderStore((s) => s.setOption);
    const addOption = useBuilderStore((s) => s.addOption);
    const deleteOption = useBuilderStore((s) => s.deleteOption);
    const setCheckboxOption = useBuilderStore((s) => s.setCheckboxOption);
    const addCheckboxOption = useBuilderStore((s) => s.addCheckboxOption);
    const deleteCheckboxOption = useBuilderStore((s) => s.deleteCheckboxOption);

    const isLayout = isLayoutType(element.type);
    const numericSetter = (key, fallback) => (e) =>
        set(key, e.target.value ? Number(e.target.value) : fallback);

    return (
        <Stack spacing={1.5} sx={{ pt: 1 }}>
            {!isLayout && (
                <TextField
                    label="Label"
                    value={element.name || ''}
                    onChange={(e) => set('name', e.target.value)}
                    fullWidth
                    placeholder="Field label"
                />
            )}

            {isLayout && <LayoutContent element={element} set={set} />}

            {/* Choice options */}
            {(element.type === 'radio' || element.type === 'select') && (
                <Section title={element.type === 'radio' ? 'Radio options' : 'Dropdown options'}>
                    {element.type === 'radio' && (
                        <FormControl fullWidth size="small">
                            <InputLabel>Alignment</InputLabel>
                            <Select
                                value={element.radioLayout || 'vertical'}
                                label="Alignment"
                                onChange={(e) => set('radioLayout', e.target.value)}
                            >
                                <MenuItem value="vertical">Vertical</MenuItem>
                                <MenuItem value="horizontal">Horizontal</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                    {(element.options || []).map((option, index) => (
                        <Stack direction="row" spacing={1} key={index}>
                            <TextField
                                value={option}
                                size="small"
                                fullWidth
                                onChange={(e) => setOption(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                            />
                            <IconButton
                                aria-label="Remove option"
                                size="small"
                                color="error"
                                onClick={() => deleteOption(index)}
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    ))}
                    <Button onClick={addOption} size="small" variant="outlined">
                        + Add option
                    </Button>
                </Section>
            )}

            {element.type === 'checkbox' && (
                <Section title="Checkbox options">
                    <FormControl fullWidth size="small">
                        <InputLabel>Alignment</InputLabel>
                        <Select
                            value={element.checkboxLayout || 'vertical'}
                            label="Alignment"
                            onChange={(e) => set('checkboxLayout', e.target.value)}
                        >
                            <MenuItem value="vertical">Vertical</MenuItem>
                            <MenuItem value="horizontal">Horizontal</MenuItem>
                        </Select>
                    </FormControl>
                    {element.checkboxOptions.map((option, index) => (
                        <Stack direction="row" spacing={1} key={index}>
                            <TextField
                                value={option.label}
                                size="small"
                                fullWidth
                                onChange={(e) => setCheckboxOption(index, 'label', e.target.value)}
                                placeholder={`Option ${index + 1}`}
                            />
                            <IconButton
                                aria-label="Remove option"
                                size="small"
                                color="error"
                                onClick={() => deleteCheckboxOption(index)}
                            >
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    ))}
                    <Button onClick={addCheckboxOption} size="small" variant="outlined">
                        + Add option
                    </Button>
                </Section>
            )}

            {/* Placeholder for typed inputs */}
            {['text', 'textarea', 'number', 'email', 'phone'].includes(element.type) && (
                <TextField
                    label="Placeholder"
                    value={element.placeholder || ''}
                    onChange={(e) => set('placeholder', e.target.value)}
                    fullWidth
                />
            )}

            {element.type === 'textarea' && (
                <TextField
                    label="Rows"
                    type="number"
                    value={element.rows || 4}
                    onChange={(e) => set('rows', Number(e.target.value))}
                    fullWidth
                    inputProps={{ min: 2, max: 12 }}
                />
            )}

            {element.type === 'date' && (
                <FormControl fullWidth>
                    <InputLabel>Date format</InputLabel>
                    <Select
                        value={element.dateFormat || 'YYYY-MM-DD'}
                        label="Date format"
                        onChange={(e) => set('dateFormat', e.target.value)}
                    >
                        <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</MenuItem>
                        <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                        <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                        <MenuItem value="DD.MM.YYYY">DD.MM.YYYY</MenuItem>
                    </Select>
                </FormControl>
            )}

            {element.type === 'rating' && (
                <>
                    <TextField
                        label="Max stars"
                        type="number"
                        value={element.max ?? 5}
                        onChange={numericSetter('max', 5)}
                        fullWidth
                        inputProps={{ min: 1, max: 10 }}
                    />
                    <FormControl fullWidth>
                        <InputLabel>Precision</InputLabel>
                        <Select
                            value={element.precision ?? 0.5}
                            label="Precision"
                            onChange={(e) => set('precision', Number(e.target.value))}
                        >
                            <MenuItem value={1}>1</MenuItem>
                            <MenuItem value={0.5}>0.5</MenuItem>
                            <MenuItem value={0.25}>0.25</MenuItem>
                        </Select>
                    </FormControl>
                </>
            )}

            {element.type === 'slider' && (
                <Stack direction="row" spacing={1}>
                    <TextField
                        label="Min"
                        type="number"
                        value={element.min ?? 0}
                        onChange={numericSetter('min', 0)}
                        fullWidth
                    />
                    <TextField
                        label="Max"
                        type="number"
                        value={element.max ?? 100}
                        onChange={numericSetter('max', 100)}
                        fullWidth
                    />
                    <TextField
                        label="Step"
                        type="number"
                        value={element.step ?? 1}
                        onChange={numericSetter('step', 1)}
                        fullWidth
                        inputProps={{ min: 0.01, step: 0.01 }}
                    />
                </Stack>
            )}

            {element.type === 'toggle' && (
                <>
                    <TextField
                        label="On Label"
                        value={element.onLabel || ''}
                        onChange={(e) => set('onLabel', e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Off Label"
                        value={element.offLabel || ''}
                        onChange={(e) => set('offLabel', e.target.value)}
                        fullWidth
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!element.checked}
                                onChange={(_, v) => set('checked', v)}
                            />
                        }
                        label="Default to On"
                    />
                </>
            )}

            {element.type === 'file' && (
                <>
                    <TextField
                        label="Accept"
                        value={element.accept || ''}
                        onChange={(e) => set('accept', e.target.value)}
                        helperText="MIME types or extensions, comma-separated"
                        fullWidth
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!element.multiple}
                                onChange={(_, v) => set('multiple', v)}
                            />
                        }
                        label="Allow multiple files"
                    />
                </>
            )}

            {element.type === 'divider' && (
                <TextField
                    label="Divider Label"
                    value={element.label || ''}
                    onChange={(e) => set('label', e.target.value)}
                    fullWidth
                />
            )}

            {element.type === 'button' && <ButtonContent element={element} set={set} />}
        </Stack>
    );
}

function ButtonContent({ element, set }) {
    const numericSetter = (key, fallback) => (e) =>
        set(key, e.target.value ? Number(e.target.value) : fallback);

    return (
        <>
            <TextField
                label="Button Label"
                value={element.label || ''}
                onChange={(e) => set('label', e.target.value)}
                fullWidth
            />
            <Stack direction="row" spacing={1}>
                <FormControl fullWidth>
                    <InputLabel>Variant</InputLabel>
                    <Select
                        value={element.variant}
                        label="Variant"
                        onChange={(e) => set('variant', e.target.value)}
                    >
                        <MenuItem value="text">Text</MenuItem>
                        <MenuItem value="contained">Contained</MenuItem>
                        <MenuItem value="outlined">Outlined</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Color</InputLabel>
                    <Select value={element.color} label="Color" onChange={(e) => set('color', e.target.value)}>
                        <MenuItem value="primary">Primary</MenuItem>
                        <MenuItem value="secondary">Secondary</MenuItem>
                        <MenuItem value="success">Success</MenuItem>
                        <MenuItem value="error">Error</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
            <Stack direction="row" spacing={1}>
                <FormControl fullWidth>
                    <InputLabel>Size</InputLabel>
                    <Select
                        value={element.size || 'medium'}
                        label="Size"
                        onChange={(e) => set('size', e.target.value)}
                    >
                        <MenuItem value="small">Small</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="large">Large</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={element.typeAttr || 'button'}
                        label="Type"
                        onChange={(e) => set('typeAttr', e.target.value)}
                    >
                        <MenuItem value="button">Button</MenuItem>
                        <MenuItem value="submit">Submit</MenuItem>
                        <MenuItem value="reset">Reset</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
            <Stack direction="row" spacing={1}>
                <FormControl fullWidth>
                    <InputLabel>Start icon</InputLabel>
                    <Select
                        value={element.startIcon || 'none'}
                        label="Start icon"
                        onChange={(e) => set('startIcon', e.target.value)}
                    >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="save">Save</MenuItem>
                        <MenuItem value="send">Send</MenuItem>
                        <MenuItem value="add">Add</MenuItem>
                        <MenuItem value="delete">Delete</MenuItem>
                        <MenuItem value="check">Check</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel>End icon</InputLabel>
                    <Select
                        value={element.endIcon || 'none'}
                        label="End icon"
                        onChange={(e) => set('endIcon', e.target.value)}
                    >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="save">Save</MenuItem>
                        <MenuItem value="send">Send</MenuItem>
                        <MenuItem value="add">Add</MenuItem>
                        <MenuItem value="delete">Delete</MenuItem>
                        <MenuItem value="check">Check</MenuItem>
                    </Select>
                </FormControl>
            </Stack>
            <TextField
                label="Border radius (px)"
                type="number"
                value={element.borderRadius ?? 8}
                onChange={numericSetter('borderRadius', 0)}
                fullWidth
                inputProps={{ min: 0, max: 32, step: 1 }}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
                <FormControlLabel
                    control={
                        <Switch checked={!!element.fullWidth} onChange={(_, v) => set('fullWidth', v)} />
                    }
                    label="Full width"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={!!element.disableElevation}
                            onChange={(_, v) => set('disableElevation', v)}
                        />
                    }
                    label="Flat"
                />
                <FormControlLabel
                    control={<Switch checked={!!element.loading} onChange={(_, v) => set('loading', v)} />}
                    label="Loading"
                />
            </Stack>
        </>
    );
}

/* --------------------------------------------------------------------------
 * Layout-specific content (column row containers)
 * ----------------------------------------------------------------------- */

function LayoutContent({ element, set }) {
    const updateSelected = useBuilderStore((s) => s.updateSelected);
    const columnCount = getColumnCount(element.type) || 0;
    const ratios =
        Array.isArray(element.columnRatios) && element.columnRatios.length === columnCount
            ? element.columnRatios
            : Array.from({ length: columnCount }, () => 1);

    const setRatio = (index, value) => {
        const next = ratios.slice();
        next[index] = Math.max(0.1, Number(value) || 1);
        updateSelected('columnRatios', next);
    };

    const resetRatios = () =>
        updateSelected('columnRatios', Array.from({ length: columnCount }, () => 1));

    return (
        <>
            <Section title="Spacing & alignment">
                <TextField
                    label="Column gap (px)"
                    type="number"
                    value={Number.isFinite(element.gap) ? element.gap : 16}
                    onChange={(e) => set('gap', Number(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ min: 0, max: 64, step: 1 }}
                />
                <TextField
                    label="Row padding (px)"
                    type="number"
                    value={Number.isFinite(element.padding) ? element.padding : 12}
                    onChange={(e) => set('padding', Number(e.target.value) || 0)}
                    fullWidth
                    inputProps={{ min: 0, max: 48, step: 1 }}
                />
                <FormControl fullWidth>
                    <Typography variant="caption" sx={{ mb: 0.5 }} color="text.secondary">
                        Vertical alignment
                    </Typography>
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={element.verticalAlign || 'stretch'}
                        onChange={(_, value) => value && set('verticalAlign', value)}
                        aria-label="Vertical alignment"
                        fullWidth
                    >
                        <ToggleButton value="start">Top</ToggleButton>
                        <ToggleButton value="center">Center</ToggleButton>
                        <ToggleButton value="end">Bottom</ToggleButton>
                        <ToggleButton value="stretch">Stretch</ToggleButton>
                    </ToggleButtonGroup>
                </FormControl>
                <FormControlLabel
                    control={
                        <Switch
                            checked={element.stackOnMobile !== false}
                            onChange={(_, v) => set('stackOnMobile', v)}
                        />
                    }
                    label="Stack columns on mobile"
                />
            </Section>

            <Section title="Column widths">
                <Typography variant="caption" color="text.secondary">
                    Relative weights — e.g. 1 / 2 means the second column is twice as wide.
                </Typography>
                <Stack direction="row" spacing={1}>
                    {ratios.map((value, index) => (
                        <TextField
                            key={index}
                            label={`Col ${index + 1}`}
                            type="number"
                            value={value}
                            onChange={(e) => setRatio(index, e.target.value)}
                            fullWidth
                            size="small"
                            inputProps={{ min: 0.1, step: 0.1 }}
                        />
                    ))}
                </Stack>
                <Button onClick={resetRatios} size="small" variant="outlined">
                    Reset to equal widths
                </Button>
            </Section>

            <Section title="Appearance">
                <FormControl fullWidth size="small">
                    <InputLabel>Background</InputLabel>
                    <Select
                        value={element.background || 'muted'}
                        label="Background"
                        onChange={(e) => set('background', e.target.value)}
                    >
                        <MenuItem value="none">None (transparent)</MenuItem>
                        <MenuItem value="muted">Muted</MenuItem>
                        <MenuItem value="accent">Accent tint</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                    <InputLabel>Border</InputLabel>
                    <Select
                        value={element.border || 'dashed'}
                        label="Border"
                        onChange={(e) => set('border', e.target.value)}
                    >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="dashed">Dashed</MenuItem>
                        <MenuItem value="solid">Solid</MenuItem>
                    </Select>
                </FormControl>
            </Section>
        </>
    );
}

/* --------------------------------------------------------------------------
 * Validation tab
 * ----------------------------------------------------------------------- */

function ValidationTab({ element, set }) {
    const numericSetter = (key) => (e) => set(key, e.target.value ? Number(e.target.value) : '');

    return (
        <Stack spacing={1.5} sx={{ pt: 1 }}>
            <FormControlLabel
                control={
                    <Switch checked={!!element.required} onChange={(_, v) => set('required', v)} />
                }
                label="Required"
            />
            <TextField
                label="Helper text"
                value={element.helperText || ''}
                onChange={(e) => set('helperText', e.target.value)}
                fullWidth
                multiline
                minRows={2}
                helperText="Shown beneath the field to guide the user."
            />

            {element.type === 'number' && (
                <Stack direction="row" spacing={1}>
                    <TextField
                        label="Min"
                        type="number"
                        value={element.min ?? ''}
                        onChange={numericSetter('min')}
                        fullWidth
                    />
                    <TextField
                        label="Max"
                        type="number"
                        value={element.max ?? ''}
                        onChange={numericSetter('max')}
                        fullWidth
                    />
                    <TextField
                        label="Step"
                        type="number"
                        value={element.step ?? 1}
                        onChange={numericSetter('step')}
                        fullWidth
                    />
                </Stack>
            )}

            {element.type === 'phone' && (
                <TextField
                    label="Pattern (regex)"
                    value={element.pattern || ''}
                    onChange={(e) => set('pattern', e.target.value)}
                    fullWidth
                    helperText="Optional regex; leave blank to skip pattern validation."
                />
            )}

            {element.type === 'date' && (
                <Stack spacing={1.5}>
                    <TextField
                        label="Default value"
                        type="date"
                        value={element.defaultDate || ''}
                        onChange={(e) => set('defaultDate', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                    />
                    <Stack direction="row" spacing={1}>
                        <TextField
                            label="Min date"
                            type="date"
                            value={element.minDate || ''}
                            onChange={(e) => set('minDate', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            label="Max date"
                            type="date"
                            value={element.maxDate || ''}
                            onChange={(e) => set('maxDate', e.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                </Stack>
            )}

            {element.type === 'file' && (
                <Typography variant="caption" color="text.secondary">
                    Set Accept and Multiple in the Content tab.
                </Typography>
            )}
        </Stack>
    );
}

/* --------------------------------------------------------------------------
 * Advanced tab
 * ----------------------------------------------------------------------- */

function AdvancedTab({ element, set }) {
    const isLayout = isLayoutType(element.type);

    return (
        <Stack spacing={1.5} sx={{ pt: 1 }}>
            {!isLayout && (
                <FormControl fullWidth>
                    <Typography variant="caption" sx={{ mb: 0.5 }} color="text.secondary">
                        Width
                    </Typography>
                    <ToggleButtonGroup
                        size="small"
                        exclusive
                        value={element.width || 'full'}
                        onChange={(_, value) => value && set('width', value)}
                        aria-label="Field width"
                        fullWidth
                    >
                        <ToggleButton value="third">⅓</ToggleButton>
                        <ToggleButton value="half">½</ToggleButton>
                        <ToggleButton value="twoThirds">⅔</ToggleButton>
                        <ToggleButton value="full">Full</ToggleButton>
                    </ToggleButtonGroup>
                </FormControl>
            )}

            <TextField
                label="Element ID (read-only)"
                value={String(element.id)}
                fullWidth
                inputProps={{ readOnly: true }}
                helperText="Used for codegen output names."
            />

            <Section title="Danger zone" tone="danger">
                <Typography variant="caption" color="text.secondary">
                    Deleting an element cannot be undone via this panel — use ⌘Z to recover.
                </Typography>
            </Section>
        </Stack>
    );
}

/* --------------------------------------------------------------------------
 * Section helper
 * ----------------------------------------------------------------------- */

function Section({ title, children, tone }) {
    return (
        <div className={`edit-sidebar__section ${tone === 'danger' ? 'edit-sidebar__section--danger' : ''}`}>
            <h4>{title}</h4>
            <Stack spacing={1}>{children}</Stack>
        </div>
    );
}

