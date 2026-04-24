import React, { useState } from 'react';
import {
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Radio,
    RadioGroup,
    Select,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Rating,
    Typography,
} from '@mui/material';
import { iconForName } from '../../../shared/utils/iconForName';
import { dateFormatPattern, formatDateValue } from '../../../shared/utils/dateFormat';

/**
 * Live, interactive preview of the form. Uses a real MUI Dialog (focus trap,
 * ESC handling, scroll lock — all free) instead of the custom overlay we
 * had before.
 */
export default function FormPreview({ open, formElements, onClose }) {
    const [radioValues, setRadioValues] = useState({});
    const [checkboxValues, setCheckboxValues] = useState({});
    const [selectValues, setSelectValues] = useState({});
    const [ratingValues, setRatingValues] = useState({});
    const [toggleValues, setToggleValues] = useState({});

    const handlers = {
        onCheckbox: (id, idx) =>
            setCheckboxValues((prev) => ({
                ...prev,
                [id]: { ...prev[id], [idx]: !prev[id]?.[idx] },
            })),
        onRadio: (id, value) => setRadioValues((prev) => ({ ...prev, [id]: value })),
        onSelect: (id, value) => setSelectValues((prev) => ({ ...prev, [id]: value })),
        onRating: (id, value) => setRatingValues((prev) => ({ ...prev, [id]: value })),
        onToggle: (id) => setToggleValues((prev) => ({ ...prev, [id]: !prev[id] })),
    };

    const values = { radioValues, checkboxValues, selectValues, ratingValues, toggleValues };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
            <DialogTitle>Form Preview</DialogTitle>
            <DialogContent dividers>
                <Stack spacing={2}>
                    {formElements.length === 0 && (
                        <Typography color="text.secondary">No fields to preview yet.</Typography>
                    )}
                    {formElements.map((element) => (
                        <PreviewField key={element.id} element={element} values={values} handlers={handlers} />
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function PreviewField({ element, values, handlers }) {
    const { radioValues, checkboxValues, selectValues, ratingValues, toggleValues } = values;
    switch (element.type) {
        case 'text':
            return (
                <TextField
                    fullWidth
                    label={element.name || 'Text Field'}
                    placeholder={element.placeholder || 'Enter text'}
                />
            );
        case 'textarea':
            return (
                <TextField
                    fullWidth
                    multiline
                    minRows={element.rows || 4}
                    label={element.name || 'Long Answer'}
                    placeholder={element.placeholder}
                />
            );
        case 'number':
            return (
                <TextField
                    fullWidth
                    type="number"
                    label={element.name || 'Number'}
                    placeholder={element.placeholder}
                    inputProps={{ min: element.min, max: element.max, step: element.step }}
                />
            );
        case 'email':
            return (
                <TextField
                    fullWidth
                    type="email"
                    label={element.name || 'Email'}
                    placeholder={element.placeholder}
                />
            );
        case 'phone':
            return (
                <TextField
                    fullWidth
                    type="tel"
                    label={element.name || 'Phone'}
                    placeholder={element.placeholder}
                    inputProps={{ pattern: element.pattern || undefined }}
                />
            );
        case 'checkbox':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {element.name || 'Checkbox Group'}
                    </Typography>
                    <Stack
                        direction={element.checkboxLayout === 'horizontal' ? 'row' : 'column'}
                        spacing={1}
                        flexWrap="wrap"
                    >
                        {element.checkboxOptions.map((option, index) => (
                            <FormControlLabel
                                key={index}
                                control={
                                    <Checkbox
                                        checked={checkboxValues[element.id]?.[index] || false}
                                        onChange={() => handlers.onCheckbox(element.id, index)}
                                        disabled={option.disabled}
                                    />
                                }
                                label={option.label}
                            />
                        ))}
                    </Stack>
                </div>
            );
        case 'radio':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {element.name || 'Radio Group'}
                    </Typography>
                    <RadioGroup
                        value={radioValues[element.id] || ''}
                        onChange={(e) => handlers.onRadio(element.id, e.target.value)}
                        row={element.radioLayout === 'horizontal'}
                    >
                        {element.options.map((option, index) => (
                            <FormControlLabel key={index} value={option} control={<Radio />} label={option} />
                        ))}
                    </RadioGroup>
                </div>
            );
        case 'select':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {element.name || 'Dropdown'}
                    </Typography>
                    <Select
                        fullWidth
                        value={selectValues[element.id] || ''}
                        onChange={(e) => handlers.onSelect(element.id, e.target.value)}
                        displayEmpty
                    >
                        <MenuItem value="" disabled>
                            Select…
                        </MenuItem>
                        {element.options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
            );
        case 'date': {
            const format = element.dateFormat || 'YYYY-MM-DD';
            const isIso = format === 'YYYY-MM-DD';
            const pattern = dateFormatPattern(format);
            const formattedDefault = isIso ? element.defaultDate || '' : formatDateValue(element.defaultDate, format);
            const formattedMin = isIso ? element.minDate || '' : formatDateValue(element.minDate, format);
            const formattedMax = isIso ? element.maxDate || '' : formatDateValue(element.maxDate, format);
            const rangeHint =
                [formattedMin && `Min ${formattedMin}`, formattedMax && `Max ${formattedMax}`]
                    .filter(Boolean)
                    .join(' · ') || undefined;
            return (
                <TextField
                    type={isIso ? 'date' : 'text'}
                    fullWidth
                    label={element.name || 'Date Picker'}
                    defaultValue={formattedDefault}
                    placeholder={format}
                    inputProps={{
                        min: isIso ? element.minDate || undefined : undefined,
                        max: isIso ? element.maxDate || undefined : undefined,
                        'data-min': !isIso && formattedMin ? formattedMin : undefined,
                        'data-max': !isIso && formattedMax ? formattedMax : undefined,
                        'data-format': format,
                        pattern,
                    }}
                    helperText={rangeHint}
                    InputLabelProps={{ shrink: true }}
                />
            );
        }
        case 'button':
            return (
                <Button
                    variant={element.variant}
                    color={element.color}
                    size={element.size || 'medium'}
                    fullWidth={!!element.fullWidth}
                    type={element.typeAttr || 'button'}
                    disableElevation={!!element.disableElevation}
                    disabled={!!element.disabled || !!element.loading}
                    href={element.href || null}
                    target={element.target || '_self'}
                    startIcon={
                        element.loading ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            iconForName(element.startIcon)
                        )
                    }
                    endIcon={element.loading ? null : iconForName(element.endIcon)}
                    sx={{ borderRadius: element.borderRadius ?? 8 }}
                >
                    {element.label || 'Button'}
                </Button>
            );
        case 'slider':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {element.name || 'Slider'}
                    </Typography>
                    <input
                        type="range"
                        min={element.min ?? 0}
                        max={element.max ?? 100}
                        step={element.step ?? 1}
                        defaultValue={element.defaultValue ?? element.min ?? 0}
                        style={{ width: '100%', accentColor: '#4f46e5' }}
                        aria-label={element.name || 'Slider'}
                    />
                </div>
            );
        case 'rating':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {element.name || 'Rating'}
                    </Typography>
                    <Rating
                        value={ratingValues[element.id] ?? element.defaultValue ?? 0}
                        precision={element.precision ?? 0.5}
                        max={element.max ?? 5}
                        onChange={(_, value) => handlers.onRating(element.id, value)}
                    />
                </div>
            );
        case 'toggle':
            return (
                <FormControlLabel
                    control={
                        <Switch
                            checked={toggleValues[element.id] ?? element.checked}
                            onChange={() => handlers.onToggle(element.id)}
                        />
                    }
                    label={
                        (toggleValues[element.id] ?? element.checked) ? element.onLabel : element.offLabel
                    }
                />
            );
        case 'file':
            return (
                <div>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {element.name || 'File Upload'}
                    </Typography>
                    <input type="file" accept={element.accept} multiple={element.multiple} />
                </div>
            );
        case 'divider':
            return (
                <div>
                    <hr style={{ border: 0, borderTop: '1px solid var(--fc-border)' }} />
                    {element.label && (
                        <Typography variant="caption" color="text.secondary">
                            {element.label}
                        </Typography>
                    )}
                </div>
            );
        case 'twoColumnRow':
        case 'threeColumnRow':
        case 'fourColumnRow': {
            const cols = element.type === 'twoColumnRow' ? 2 : element.type === 'threeColumnRow' ? 3 : 4;
            return (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                        gap: 12,
                    }}
                >
                    {Array.from({ length: cols }, (_, i) => (
                        <div
                            key={i}
                            style={{
                                minHeight: 60,
                                border: '1px dashed var(--fc-border)',
                                padding: 12,
                                borderRadius: 12,
                                background: '#fff',
                            }}
                        >
                            <Stack spacing={1}>
                                {(element.columns?.[i] || []).map((child) => (
                                    <PreviewField
                                        key={child.id}
                                        element={child}
                                        values={values}
                                        handlers={handlers}
                                    />
                                ))}
                            </Stack>
                        </div>
                    ))}
                </div>
            );
        }
        default:
            return null;
    }
}

