import React, { useState } from 'react';
import { Button, Checkbox, FormControlLabel, Radio, RadioGroup, Select, MenuItem, TextField, Rating, Switch } from '@mui/material';
import { Scrollbars } from 'react-custom-scrollbars-2';

function FormPreview({ formElements, onClose }) {
    const [radioValues, setRadioValues] = useState({});
    const [checkboxValues, setCheckboxValues] = useState({});
    const [selectValues, setSelectValues] = useState({});
    const [ratingValues, setRatingValues] = useState({});
    const [toggleValues, setToggleValues] = useState({});

    const handleCheckboxChange = (elementId, index) => {
        setCheckboxValues((prev) => ({
            ...prev,
            [elementId]: {
                ...prev[elementId],
                [index]: !prev[elementId]?.[index],
            },
        }));
    };

    const handleRadioChange = (elementId, value) => {
        setRadioValues((prev) => ({
            ...prev,
            [elementId]: value,
        }));
    };

    const handleSelectChange = (elementId, value) => {
        setSelectValues((prev) => ({
            ...prev,
            [elementId]: value,
        }));
    };

    const handleRatingChange = (elementId, value) => {
        setRatingValues((prev) => ({
            ...prev,
            [elementId]: value,
        }));
    };

    const handleToggleChange = (elementId) => {
        setToggleValues((prev) => ({
            ...prev,
            [elementId]: !prev[elementId],
        }));
    };

    const style = {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '80%',
        maxWidth: '600px',
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: 'white',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
        zIndex: '1000',
        fontFamily: 'Arial, sans-serif',
    };

    const overlayStyle = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: '999',
    };

    return (
        <>
            <div style={overlayStyle} onClick={onClose} />
            <div style={style}>
                <h3 style={{ textAlign: 'center', fontWeight: 'bold', color: '#333' }}>Form Preview</h3>
                <Scrollbars
                    autoHeight
                    autoHeightMax="70vh"
                    autoHide
                    autoHideTimeout={1000}
                    autoHideDuration={200}
                >
                    <div>
                        {formElements.map((element) => {
                            return (
                                <div
                                    key={element.id}
                                    style={{
                                        padding: '10px',
                                        borderRadius: '8px',
                                        backgroundColor: '#fafafa',
                                        marginBottom: '10px',
                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    }}
                                >
                                    {renderPreviewElement(
                                        element,
                                        radioValues,
                                        checkboxValues,
                                        selectValues,
                                        ratingValues,
                                        handleCheckboxChange,
                                        handleRadioChange,
                                        handleSelectChange,
                                        handleRatingChange,
                                        handleToggleChange,
                                        toggleValues
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Scrollbars>
                <button
                    onClick={onClose}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Close
                </button>
            </div>
        </>
    );
}

function renderPreviewElement(
    element,
    radioValues,
    checkboxValues,
    selectValues,
    ratingValues,
    handleCheckboxChange,
    handleRadioChange,
    handleSelectChange,
    handleRatingChange,
    handleToggleChange,
    toggleValues
) {
    switch (element.type) {
        case 'text':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        {element.name || 'Text Field'}
                    </label>
                    <TextField
                        placeholder="Enter text"
                        variant="outlined"
                        fullWidth
                    />
                </div>
            );
        case 'checkbox':
            return (
                <div>
                    <h4 style={{ marginBottom: '10px' }}>{element.name || 'Checkbox Group'}</h4>
                    {element.checkboxOptions.map((option, index) => (
                        <FormControlLabel
                            key={index}
                            control={
                                <Checkbox
                                    checked={checkboxValues[element.id]?.[index] || false}
                                    onChange={() => handleCheckboxChange(element.id, index)}
                                    disabled={option.disabled}
                                />
                            }
                            label={option.label}
                        />
                    ))}
                </div>
            );
        case 'radio':
            return (
                <div>
                    <h4 style={{ marginBottom: '10px' }}>{element.name || 'Radio Group'}</h4>
                    <RadioGroup
                        value={radioValues[element.id] || ''}
                        onChange={(e) => handleRadioChange(element.id, e.target.value)}
                    >
                        {element.options.map((option, index) => (
                            <FormControlLabel
                                key={index}
                                value={option}
                                control={<Radio />}
                                label={option}
                            />
                        ))}
                    </RadioGroup>
                </div>
            );
        case 'select':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        {element.name || 'Dropdown'}
                    </label>
                    <Select
                        fullWidth
                        variant="outlined"
                        value={selectValues[element.id] || ''}
                        onChange={(e) => handleSelectChange(element.id, e.target.value)}
                    >
                        {element.options.map((option, index) => (
                            <MenuItem key={index} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
            );
        case 'date':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        {element.name || 'Date Picker'}
                    </label>
                    <TextField type="date" fullWidth variant="outlined" />
                </div>
            );
        case 'button':
            return (
                <Button
                    variant={element.variant}
                    color={element.color}
                    disabled={element.disabled || false}
                    href={element.href || null}
                >
                    {element.label || 'Button'}
                </Button>
            );
        case 'slider':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{element.name || 'Slider'}</label>
                    <input type="range" min="0" max="100" style={{ width: '100%' }} />
                </div>
            );
        case 'rating':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{element.name || 'Rating'}</label>
                    <Rating
                        value={ratingValues[element.id] || 0}
                        precision={0.5}
                        onChange={(e, value) => handleRatingChange(element.id, value)}
                    />
                </div>
            );
        case 'textarea':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        {element.name || 'Long Answer'}
                    </label>
                    <TextField multiline minRows={element.rows || 4} fullWidth placeholder={element.placeholder} />
                </div>
            );
        case 'number':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        {element.name || 'Number Input'}
                    </label>
                    <TextField type="number" fullWidth inputProps={{ min: element.min, max: element.max, step: element.step }} placeholder={element.placeholder} />
                </div>
            );
        case 'email':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        {element.name || 'Email'}
                    </label>
                    <TextField type="email" fullWidth placeholder={element.placeholder} />
                </div>
            );
        case 'phone':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        {element.name || 'Phone'}
                    </label>
                    <TextField type="tel" fullWidth placeholder={element.placeholder} />
                </div>
            );
        case 'toggle':
            return (
                <FormControlLabel
                    control={<Switch checked={toggleValues[element.id] ?? element.checked} onChange={() => handleToggleChange(element.id)} />}
                    label={(toggleValues[element.id] ?? element.checked) ? element.onLabel : element.offLabel}
                />
            );
        case 'file':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        {element.name || 'File Upload'}
                    </label>
                    <input type="file" accept={element.accept} multiple={element.multiple} />
                </div>
            );
        case 'divider':
            return (
                <div>
                    <hr />
                    <p style={{ fontSize: '14px', color: '#94a3b8' }}>{element.label}</p>
                </div>
            );
        case 'twoColumnRow':
        case 'threeColumnRow':
        case 'fourColumnRow':
            const columns = element.type === 'twoColumnRow' ? 2 : element.type === 'threeColumnRow' ? 3 : 4;

            return (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    {[...Array(columns)].map((_, index) => (
                        <div
                            key={index}
                            style={{
                                flex: 1,
                                minHeight: '50px',
                                border: '1px dashed #e2e8f0',
                                padding: '12px',
                                borderRadius: '10px',
                                backgroundColor: '#ffffff',
                            }}
                        >
                            {element.columns[index]?.map((el) =>
                                <div key={el.id} style={{ marginBottom: '12px' }}>
                                    {renderPreviewElement(
                                        el,
                                        radioValues,
                                        checkboxValues,
                                        selectValues,
                                        ratingValues,
                                        handleCheckboxChange,
                                        handleRadioChange,
                                        handleSelectChange,
                                        handleRatingChange,
                                        handleToggleChange,
                                        toggleValues
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        default:
            return null;
    }
}

export default FormPreview;

