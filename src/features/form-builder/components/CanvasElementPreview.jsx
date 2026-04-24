import React from 'react';
import { Button, Checkbox, CircularProgress, FormControlLabel, Rating, Switch, TextField } from '@mui/material';
import { iconForName } from '../../../shared/utils/iconForName';
import { dateFormatPattern, formatDateValue } from '../../../shared/utils/dateFormat';

/**
 * Renders a non-interactive (or lightly interactive) preview of a single
 * element as it should appear inside the canvas. Pulled out of DroppableArea
 * so both `DroppableArea` and `ColumnRow` can share it.
 */
export function CanvasElementPreview({ element }) {
    switch (element.type) {
        case 'text':
            return <TextField fullWidth placeholder={element.placeholder || 'Enter text'} />;
        case 'textarea':
            return (
                <TextField
                    fullWidth
                    multiline
                    minRows={element.rows || 4}
                    placeholder={element.placeholder || 'Long answer'}
                />
            );
        case 'number':
            return (
                <TextField
                    fullWidth
                    type="number"
                    placeholder={element.placeholder || 'Enter number'}
                    inputProps={{ min: element.min, max: element.max, step: element.step }}
                />
            );
        case 'email':
            return <TextField fullWidth type="email" placeholder={element.placeholder || 'name@example.com'} />;
        case 'phone':
            return (
                <TextField
                    fullWidth
                    type="tel"
                    placeholder={element.placeholder || '(555) 123-4567'}
                    inputProps={{ pattern: element.pattern || undefined }}
                />
            );
        case 'checkbox':
            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: element.checkboxLayout === 'horizontal' ? 'row' : 'column',
                        gap: 8,
                        flexWrap: 'wrap',
                    }}
                >
                    {(element.checkboxOptions || []).map((option, index) => (
                        <FormControlLabel
                            key={index}
                            control={<Checkbox checked={option.checked} disabled={option.disabled} />}
                            label={option.label}
                        />
                    ))}
                </div>
            );
        case 'radio':
            return (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: element.radioLayout === 'horizontal' ? 'row' : 'column',
                        gap: 10,
                        flexWrap: 'wrap',
                    }}
                >
                    {(element.options || []).map((option, index) => (
                        <label key={index} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="radio" name={element.id} disabled /> {option}
                        </label>
                    ))}
                </div>
            );
        case 'select':
            return (
                <select
                    disabled
                    style={{
                        width: '100%',
                        padding: 12,
                        borderRadius: 10,
                        border: '1px solid var(--fc-border)',
                        fontSize: 15,
                    }}
                >
                    {(element.options || []).map((option, index) => (
                        <option key={index}>{option}</option>
                    ))}
                </select>
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
        case 'rating':
            return (
                <Rating
                    name={`rating-${element.id}`}
                    defaultValue={element.defaultValue ?? 0}
                    precision={element.precision ?? 0.5}
                    max={element.max ?? 5}
                />
            );
        case 'slider':
            return (
                <input
                    type="range"
                    min={element.min ?? 0}
                    max={element.max ?? 100}
                    step={element.step ?? 1}
                    defaultValue={element.defaultValue ?? element.min ?? 0}
                    style={{ width: '100%', accentColor: '#4f46e5' }}
                    aria-label={element.name || 'Slider'}
                />
            );
        case 'toggle':
            return (
                <FormControlLabel
                    control={<Switch checked={element.checked} />}
                    label={element.checked ? element.onLabel : element.offLabel}
                />
            );
        case 'file':
            return (
                <TextField
                    type="file"
                    fullWidth
                    inputProps={{ accept: element.accept, multiple: element.multiple }}
                />
            );
        case 'divider':
            return (
                <div style={{ width: '100%' }}>
                    <hr style={{ border: 0, borderTop: '1px solid var(--fc-border)' }} />
                    {element.label && (
                        <p style={{ marginTop: 8, color: 'var(--fc-text-muted)', fontSize: 14 }}>
                            {element.label}
                        </p>
                    )}
                </div>
            );
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
        default:
            return null;
    }
}

export default React.memo(CanvasElementPreview);

