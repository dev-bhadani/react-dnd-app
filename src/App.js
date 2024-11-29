
import React, { useState, useEffect, useRef } from 'react';
import { DndContext } from '@dnd-kit/core';
import Sidebar from './components/Sidebar';
import EditSidebar from './components/EditSidebar';
import DroppableArea from './components/DroppableArea';
import FormPreview from './components/FormPreview';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

function App() {
    const [formElements, setFormElements] = useState([]);
    const editSidebarRef = useRef(null);
    const [selectedElement, setSelectedElement] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    const handleDrop = (event) => {
        const { active, over } = event;
        if (over) {
            const overId = over.id;

            let newElement = {
                type: active.id,
                id: Date.now(),
                name: '',
                columns: [],
            };

            // Initialize additional properties for specific elements
            if (active.id === 'radio' || active.id === 'select') {
                newElement.options = ['Option 1', 'Option 2'];
            }

            if (active.id === 'checkbox') {
                newElement.checkboxOptions = [{ label: 'Option 1', checked: false }, { label: 'Option 2', checked: false }];
            }

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

    const handleSelectElement = (id) => {
        const element = formElements.find((el) => el.id === id);
        setSelectedElement(element);
    };

    const handleNameChange = (id, newName) => {
        setFormElements((prev) =>
            prev.map((element) => (element.id === id ? { ...element, name: newName } : element))
        );
        setSelectedElement((prev) => (prev && prev.id === id ? { ...prev, name: newName } : prev));
    };

    const onOptionsChange = (index, newValue) => {
        setFormElements((prev) =>
            prev.map((element) => {
                if (element.id === selectedElement.id) {
                    const updatedOptions = element.options.map((option, optionIndex) =>
                        optionIndex === index ? newValue : option
                    );
                    return { ...element, options: updatedOptions };
                }
                return element;
            })
        );

        setSelectedElement((prev) => {
            if (prev) {
                const updatedOptions = prev.options.map((option, optionIndex) =>
                    optionIndex === index ? newValue : option
                );
                return { ...prev, options: updatedOptions };
            }
            return prev;
        });
    };

    const addOption = () => {
        setFormElements((prev) =>
            prev.map((element) => {
                if (element.id === selectedElement.id) {
                    const updatedOptions = [...element.options, `Option ${element.options.length + 1}`];
                    return { ...element, options: updatedOptions };
                }
                return element;
            })
        );

        setSelectedElement((prev) => {
            if (prev) {
                const updatedOptions = [...prev.options, `Option ${prev.options.length + 1}`];
                return { ...prev, options: updatedOptions };
            }
            return prev;
        });
    };

    const deleteOption = (index) => {
        setFormElements((prev) =>
            prev.map((element) => {
                if (element.id === selectedElement.id) {
                    const updatedOptions = element.options.filter((_, optionIndex) => optionIndex !== index);
                    return { ...element, options: updatedOptions };
                }
                return element;
            })
        );

        setSelectedElement((prev) => {
            if (prev) {
                const updatedOptions = prev.options.filter((_, optionIndex) => optionIndex !== index);
                return { ...prev, options: updatedOptions };
            }
            return prev;
        });
    };

    const onCheckboxOptionChange = (index, key, value) => {
        setFormElements((prev) =>
            prev.map((element) => {
                if (element.id === selectedElement.id) {
                    const updatedCheckboxOptions = element.checkboxOptions.map((option, optionIndex) =>
                        optionIndex === index ? { ...option, [key]: value } : option
                    );
                    return { ...element, checkboxOptions: updatedCheckboxOptions };
                }
                return element;
            })
        );

        setSelectedElement((prev) => {
            if (prev) {
                const updatedCheckboxOptions = prev.checkboxOptions.map((option, optionIndex) =>
                    optionIndex === index ? { ...option, [key]: value } : option
                );
                return { ...prev, checkboxOptions: updatedCheckboxOptions };
            }
            return prev;
        });
    };

    const addCheckboxOption = () => {
        setFormElements((prev) =>
            prev.map((element) => {
                if (element.id === selectedElement.id) {
                    const updatedCheckboxOptions = [
                        ...element.checkboxOptions,
                        { label: `Option ${element.checkboxOptions.length + 1}`, checked: false },
                    ];
                    return { ...element, checkboxOptions: updatedCheckboxOptions };
                }
                return element;
            })
        );

        setSelectedElement((prev) => {
            if (prev) {
                const updatedCheckboxOptions = [
                    ...prev.checkboxOptions,
                    { label: `Option ${prev.checkboxOptions.length + 1}`, checked: false },
                ];
                return { ...prev, checkboxOptions: updatedCheckboxOptions };
            }
            return prev;
        });
    };

    const deleteCheckboxOption = (index) => {
        setFormElements((prev) =>
            prev.map((element) => {
                if (element.id === selectedElement.id) {
                    const updatedCheckboxOptions = element.checkboxOptions.filter(
                        (_, optionIndex) => optionIndex !== index
                    );
                    return { ...element, checkboxOptions: updatedCheckboxOptions };
                }
                return element;
            })
        );

        setSelectedElement((prev) => {
            if (prev) {
                const updatedCheckboxOptions = prev.checkboxOptions.filter(
                    (_, optionIndex) => optionIndex !== index
                );
                return { ...prev, checkboxOptions: updatedCheckboxOptions };
            }
            return prev;
        });
    };

    const handleExport = () => {
        setIsExportOpen(true);
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
                            onOptionsChange={onOptionsChange}
                            addOption={addOption}
                            deleteOption={deleteOption}
                            onCheckboxOptionChange={onCheckboxOptionChange}
                            addCheckboxOption={addCheckboxOption}
                            deleteCheckboxOption={deleteCheckboxOption}
                        />
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setIsPreviewOpen(true)}
                >
                    Preview Form
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleExport}
                >
                    Export Form
                </Button>
            </div>

            {isPreviewOpen && (
                <FormPreview formElements={formElements} onClose={() => setIsPreviewOpen(false)} />
            )}

            {isExportOpen && (
                <Dialog open={isExportOpen} onClose={() => setIsExportOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Exported Form JSON</DialogTitle>
                    <DialogContent>
                        <pre
                            style={{
                                backgroundColor: '#f5f5f5',
                                padding: '15px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                overflow: 'auto',
                            }}
                        >
                            {JSON.stringify(formElements, null, 2)}
                        </pre>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsExportOpen(false)} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </DndContext>
    );
}

export default App;
