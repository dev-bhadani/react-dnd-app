import React, { useState, useEffect, useRef } from 'react';
import { DndContext } from '@dnd-kit/core';
import Sidebar from './components/Sidebar';
import EditSidebar from './components/EditSidebar';
import DroppableArea from './components/DroppableArea';
import FormPreview from './components/FormPreview';

function App() {
    const [formElements, setFormElements] = useState([]);
    const editSidebarRef = useRef(null);
    const [selectedElement, setSelectedElement] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleDrop = (event) => {
        const { active, over } = event;
        if (over) {
            const overId = over.id;
            const newElement = {
                type: active.id,
                id: Date.now(),
                name: '',
                columns: [],
                options: active.id === 'radio' || active.id === 'select' ? ['Option 1', 'Option 2'] : [],
                variant: active.id === 'button' ? 'contained' : undefined,
                color: active.id === 'button' ? 'primary' : active.id === 'checkbox' ? 'default' : undefined,
                label: active.id === 'button' ? 'Button' : active.id === 'checkbox' ? 'Checkbox' : '',
                checked: active.id === 'checkbox' ? false : undefined,
                disabled: active.id === 'checkbox' ? false : undefined,
                checkboxOptions: active.id === 'checkbox' ? [{ label: 'Option 1', checked: false, disabled: false }] : [],
            };

            if (overId.includes('column')) {
                const [rowId, columnIndex] = overId.split('-column-');
                setFormElements((prev) =>
                    prev.map((element) => {
                        if (element.id === parseInt(rowId)) {
                            const updatedColumns = [...element.columns];
                            updatedColumns[columnIndex] = [...(updatedColumns[columnIndex] || []), newElement];
                            return {
                                ...element,
                                columns: updatedColumns,
                            };
                        }
                        return element;
                    })
                );
            } else {
                setFormElements((prev) => [...prev, newElement]);
            }
        }
    };

    const handleDeleteElement = (id) => {
        setFormElements((prev) => prev.filter((element) => element.id !== id));
    };

    const handleNameChange = (id, newName) => {
        setFormElements((prev) =>
            prev.map((element) => (element.id === id ? { ...element, name: newName } : element))
        );
    };

    const handleOptionsChange = (elementId, optionIndex, newOption) => {
        setFormElements((prev) =>
            prev.map((element) => {
                if (element.id === elementId) {
                    let updatedOptions = [...element.options];
                    if (newOption === null) {
                        updatedOptions.splice(optionIndex, 1);
                    } else if (optionIndex < updatedOptions.length) {
                        updatedOptions[optionIndex] = newOption;
                    } else {
                        updatedOptions.push(newOption);
                    }
                    return { ...element, options: updatedOptions };
                }
                return element;
            })
        );
    };

    const handleButtonPropertyChange = (elementId, property, value) => {
        setFormElements((prev) =>
            prev.map((element) =>
                element.id === elementId
                    ? { ...element, [property]: value }
                    : element
            )
        );
    };

    const handleCheckboxOptionChange = (elementId, optionIndex, property, value) => {
        setFormElements((prev) =>
            prev.map((element) => {
                if (element.id === elementId) {
                    const updatedCheckboxOptions = [...element.checkboxOptions];
                    updatedCheckboxOptions[optionIndex] = {
                        ...updatedCheckboxOptions[optionIndex],
                        [property]: value,
                    };
                    return { ...element, checkboxOptions: updatedCheckboxOptions };
                }
                return element;
            })
        );
    };

    const addCheckboxOption = (elementId) => {
        setFormElements((prev) =>
            prev.map((element) => {
                if (element.id === elementId) {
                    const updatedCheckboxOptions = [
                        ...element.checkboxOptions,
                        { label: `Option ${element.checkboxOptions.length + 1}`, checked: false, disabled: false },
                    ];
                    return { ...element, checkboxOptions: updatedCheckboxOptions };
                }
                return element;
            })
        );
    };

    const deleteCheckboxOption = (elementId, optionIndex) => {
        setFormElements((prev) =>
            prev.map((element) => {
                if (element.id === elementId) {
                    const updatedCheckboxOptions = element.checkboxOptions.filter((_, index) => index !== optionIndex);
                    return { ...element, checkboxOptions: updatedCheckboxOptions };
                }
                return element;
            })
        );
    };

    const handleSelectElement = (id) => {
        const element = formElements.find((el) => el.id === id);
        setSelectedElement(element);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editSidebarRef.current && !editSidebarRef.current.contains(event.target)) {
                setSelectedElement(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedElement]);

    return (
        <DndContext onDragEnd={handleDrop}>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '20px',
                    padding: '40px',
                    marginTop: '20px',
                    fontFamily: 'Arial, sans-serif',
                }}
            >
                <Sidebar />
                <div style={{ flex: 1, marginRight: '20px' }}>
                    <DroppableArea
                        formElements={formElements}
                        onDelete={handleDeleteElement}
                        onSelect={handleSelectElement}
                    />
                </div>
                {selectedElement && (
                    <div ref={editSidebarRef}>
                        <EditSidebar
                            className="edit-sidebar"
                            selectedElement={selectedElement}
                            onNameChange={(newName) => {
                                handleNameChange(selectedElement.id, newName);
                                setSelectedElement((prev) => ({ ...prev, name: newName }));
                            }}
                            onOptionsChange={(optionIndex, newOption) => {
                                handleOptionsChange(selectedElement.id, optionIndex, newOption);
                                setSelectedElement((prev) => ({
                                    ...prev,
                                    options:
                                        newOption === null
                                            ? prev.options.filter((_, i) => i !== optionIndex)
                                            : optionIndex < prev.options.length
                                                ? prev.options.map((opt, i) => (i === optionIndex ? newOption : opt))
                                                : [...prev.options, newOption],
                                }));
                            }}
                            onCheckboxOptionChange={(optionIndex, property, value) => {
                                handleCheckboxOptionChange(selectedElement.id, optionIndex, property, value);
                                setSelectedElement((prev) => {
                                    const updatedCheckboxOptions = [...prev.checkboxOptions];
                                    updatedCheckboxOptions[optionIndex] = {
                                        ...updatedCheckboxOptions[optionIndex],
                                        [property]: value,
                                    };
                                    return { ...prev, checkboxOptions: updatedCheckboxOptions };
                                });
                            }}
                            onButtonPropertyChange={(property, value) => {
                                handleButtonPropertyChange(selectedElement.id, property, value);
                                setSelectedElement((prev) => ({
                                    ...prev,
                                    [property]: value,
                                }));
                            }}
                            addCheckboxOption={() => addCheckboxOption(selectedElement.id)}
                            deleteCheckboxOption={(optionIndex) => deleteCheckboxOption(selectedElement.id, optionIndex)}
                        />
                    </div>
                )}
            </div>
            <button onClick={() => setIsPreviewOpen(true)} style={{
                margin: '20px',
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '5px'
            }}>Preview Form
            </button>
            {isPreviewOpen && (
                <FormPreview formElements={formElements} onClose={() => setIsPreviewOpen(false)} />
            )}
        </DndContext>
    );
}

export default App;
