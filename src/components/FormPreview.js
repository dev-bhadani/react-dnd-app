import React from 'react';

function FormPreview({ formElements, onClose }) {
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
                <div>
                    {formElements.map((element) => {
                        if (element.type === 'twoColumnRow' || element.type === 'threeColumnRow' || element.type === 'fourColumnRow') {
                            return (
                                <div
                                    key={element.id}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: '10px',
                                        marginBottom: '20px',
                                        padding: '10px',
                                        border: '1px dashed #ccc',
                                        borderRadius: '10px',
                                        backgroundColor: '#f9f9f9',
                                    }}
                                >
                                    {[...Array(element.columns.length)].map((_, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                flex: 1,
                                                minHeight: '100px',
                                                border: '1px dashed #ccc',
                                                padding: '10px',
                                                borderRadius: '8px',
                                            }}
                                        >
                                            {element.columns[index]?.map((el) => (
                                                <div
                                                    key={el.id}
                                                    style={{
                                                        padding: '10px',
                                                        borderRadius: '8px',
                                                        backgroundColor: '#fafafa',
                                                        marginBottom: '10px',
                                                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                                    }}
                                                >
                                                    {renderPreviewElement(el)}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            );
                        }
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
                                {renderPreviewElement(element)}
                            </div>
                        );
                    })}
                </div>
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

function renderPreviewElement(element) {
    switch (element.type) {
        case 'text':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                        {element.name || 'Text Field'}
                    </label>
                    <input type="text" placeholder="Enter text" style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                </div>
            );
        case 'checkbox':
            return (
                <div>
                    <input type="checkbox" />
                    <label style={{ marginLeft: '10px' }}>{element.name || 'Checkbox'}</label>
                </div>
            );
        case 'radio':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{element.name || 'Radio Button'}</label>
                    <div>
                        <input type="radio" name={element.id} />
                        <label style={{ marginLeft: '10px' }}>Option 1</label>
                    </div>
                    <div>
                        <input type="radio" name={element.id} />
                        <label style={{ marginLeft: '10px' }}>Option 2</label>
                    </div>
                </div>
            );
        case 'select':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{element.name || 'Dropdown'}</label>
                    <select style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}>
                        <option>Select an option</option>
                        <option>Option 1</option>
                        <option>Option 2</option>
                    </select>
                </div>
            );
        case 'date':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{element.name || 'Date Picker'}</label>
                    <input type="date" style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }} />
                </div>
            );
        case 'slider':
            return (
                <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>{element.name || 'Slider'}</label>
                    <input type="range" min="0" max="100" style={{ width: '100%' }} />
                </div>
            );
        case 'button':
            return (
                <button style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
                    {element.name || 'Button'}
                </button>
            );
        default:
            return null;
    }
}

export default FormPreview;
