import React, { useState, useEffect, useRef } from 'react';
import { DndContext } from '@dnd-kit/core';
import Sidebar from './components/Sidebar';
import EditSidebar from './components/EditSidebar';
import DroppableArea from './components/DroppableArea';
import FormPreview from './components/FormPreview';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import './App.css';

const layoutTypes = new Set(['twoColumnRow', 'threeColumnRow', 'fourColumnRow']);

const getColumnCount = (type) => {
    if (type === 'twoColumnRow') return 2;
    if (type === 'threeColumnRow') return 3;
    if (type === 'fourColumnRow') return 4;
    return 0;
};

const createElement = (type) => {
    const element = { type, id: Date.now(), name: '' };

    switch (type) {
        case 'radio':
        case 'select':
            element.options = ['Option 1', 'Option 2'];
            break;
        case 'checkbox':
            element.checkboxOptions = [
                { label: 'Option 1', checked: false },
                { label: 'Option 2', checked: false },
            ];
            break;
        case 'button':
            element.label = 'Button';
            element.variant = 'contained';
            element.color = 'primary';
            element.disabled = false;
            break;
        case 'text':
            element.placeholder = 'Enter text';
            break;
        case 'textarea':
            element.placeholder = 'Enter details';
            element.rows = 4;
            break;
        case 'number':
            element.placeholder = 'Enter a value';
            element.min = 0;
            element.max = 100;
            element.step = 1;
            break;
        case 'email':
            element.placeholder = 'name@example.com';
            break;
        case 'phone':
            element.placeholder = '(555) 123-4567';
            element.pattern = '';
            break;
        case 'toggle':
            element.onLabel = 'Enabled';
            element.offLabel = 'Disabled';
            element.checked = false;
            break;
        case 'file':
            element.accept = '';
            element.multiple = false;
            break;
        case 'divider':
            element.label = 'Section divider';
            break;
        default:
            break;
    }

    if (layoutTypes.has(type)) {
        element.columns = Array.from({ length: getColumnCount(type) }, () => []);
    }

    return element;
};

const findElementById = (elements, id) => {
    for (const element of elements) {
        if (element.id === id) {
            return element;
        }

        if (Array.isArray(element.columns)) {
            for (const column of element.columns) {
                if (!Array.isArray(column)) {
                    continue;
                }
                const match = findElementById(column, id);
                if (match) {
                    return match;
                }
            }
        }
    }

    return null;
};

const updateElementsById = (elements, id, updater) => {
    let didChange = false;

    const updatedElements = elements.map((element) => {
        if (element.id === id) {
            didChange = true;
            return updater(element);
        }

        if (Array.isArray(element.columns) && element.columns.length > 0) {
            let columnsChanged = false;
            const nextColumns = element.columns.map((column) => {
                if (!Array.isArray(column) || column.length === 0) {
                    return column;
                }
                const updatedColumn = updateElementsById(column, id, updater);
                if (updatedColumn !== column) {
                    columnsChanged = true;
                }
                return updatedColumn;
            });

            if (columnsChanged) {
                didChange = true;
                return {
                    ...element,
                    columns: nextColumns,
                };
            }
        }

        return element;
    });

    return didChange ? updatedElements : elements;
};

const removeElementById = (elements, id) => {
    let didChange = false;

    const filtered = elements
        .map((element) => {
            if (element.id === id) {
                didChange = true;
                return null;
            }

            if (Array.isArray(element.columns) && element.columns.length > 0) {
                const nextColumns = element.columns.map((column) => {
                    if (!Array.isArray(column) || column.length === 0) {
                        return column;
                    }
                    const result = removeElementById(column, id);
                    if (result !== column) {
                        didChange = true;
                    }
                    return result;
                });

                if (didChange) {
                    return {
                        ...element,
                        columns: nextColumns,
                    };
                }
            }

            return element;
        })
        .filter(Boolean);

    return didChange ? filtered : elements;
};

function App() {
    const [formElements, setFormElements] = useState([]);
    const builderRef = useRef(null);
    const editSidebarRef = useRef(null);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
    const selectedElement = selectedElementId ? findElementById(formElements, selectedElementId) : null;

    const handleDrop = (event) => {
        const { active, over } = event;
        if (!over) return;

        const newElement = createElement(active.id);
        const overId = over.id;

        if (typeof overId === 'string' && overId.includes('column')) {
            const [rowId, columnIndex] = overId.split('-column-');
            const targetRowId = Number(rowId);
            const targetColumnIndex = Number(columnIndex);

            setFormElements((prev) => {
                const newElements = prev.map((element) => {
                    if (element.id !== targetRowId) {
                        return element;
                    }
                    const normalizedColumns = Array.from(
                        { length: getColumnCount(element.type) },
                        (_, idx) => element.columns?.[idx] || []
                    );
                    const updatedColumns = normalizedColumns.map((columnElements, idx) =>
                        idx === targetColumnIndex ? [...columnElements, newElement] : columnElements
                    );
                    return { ...element, columns: updatedColumns };
                });
                setSelectedElementId(newElement.id);
                return newElements;
            });
        } else {
            setFormElements((prev) => {
                const newElements = [...prev, newElement];
                setSelectedElementId(newElement.id);
                return newElements;
            });
        }
    };

    const applyElementUpdateById = (id, updater) => {
        if (!id) return;
        setFormElements((prev) => {
            const updated = updateElementsById(prev, id, updater);
            setSelectedElementId(findElementById(updated, id)?.id);
            return updated;
        });
    };

    const handleDeleteElement = (id) => {
        setFormElements((prev) => {
            const updated = removeElementById(prev, id);
            setSelectedElementId((current) => {
                if (!current) return null;
                return findElementById(updated, current.id)?.id;
            });
            return updated;
        });
    };

    const handleSelectElement = (id) => {
        const normalizedId = findElementById(formElements, id)?.id || null;
        setSelectedElementId(normalizedId);
        if (normalizedId) {
            setIsPropertiesPanelOpen(true);
        }
    };

    const handleNameChange = (id, newName) => {
        applyElementUpdateById(id, (element) => ({ ...element, name: newName }));
    };

    const handleElementPropertyChange = (key, value) => {
        if (!selectedElement) return;
        applyElementUpdateById(selectedElement.id, (element) => ({ ...element, [key]: value }));
    };

    const onOptionsChange = (index, value) => {
        if (!selectedElement) return;
        const selectedId = selectedElement.id;
        if (value === null) {
            applyElementUpdateById(selectedId, (element) => ({
                ...element,
                options: element.options.filter((_, optionIndex) => optionIndex !== index),
            }));
            return;
        }
        applyElementUpdateById(selectedId, (element) => {
            const options = [...(element.options || [])];
            options[index] = value;
            return { ...element, options };
        });
    };

    const addOption = () => {
        if (!selectedElement) return;
        applyElementUpdateById(selectedElement.id, (element) => {
            const options = element.options || [];
            return {
                ...element,
                options: [...options, `Option ${options.length + 1}`],
            };
        });
    };

    const deleteOption = (index) => {
        if (!selectedElement) return;
        applyElementUpdateById(selectedElement.id, (element) => ({
            ...element,
            options: element.options.filter((_, optionIndex) => optionIndex !== index),
        }));
    };

    const onCheckboxOptionChange = (index, key, value) => {
        if (!selectedElement) return;
        applyElementUpdateById(selectedElement.id, (element) => ({
            ...element,
            checkboxOptions: element.checkboxOptions.map((option, optionIndex) =>
                optionIndex === index ? { ...option, [key]: value } : option
            ),
        }));
    };

    const addCheckboxOption = () => {
        if (!selectedElement) return;
        applyElementUpdateById(selectedElement.id, (element) => {
            const checkboxOptions = element.checkboxOptions || [];
            return {
                ...element,
                checkboxOptions: [
                    ...checkboxOptions,
                    { label: `Option ${checkboxOptions.length + 1}`, checked: false },
                ],
            };
        });
    };

    const deleteCheckboxOption = (index) => {
        if (!selectedElement) return;
        applyElementUpdateById(selectedElement.id, (element) => ({
            ...element,
            checkboxOptions: element.checkboxOptions.filter((_, optionIndex) => optionIndex !== index),
        }));
    };

    const handleButtonPropertyChange = (key, value) => {
        if (!selectedElement) return;
        applyElementUpdateById(selectedElement.id, (element) => ({ ...element, [key]: value }));
    };

    const handleExport = () => {
        setIsExportOpen(true);
    };

    const handleClearCanvas = () => {
        setFormElements([]);
        setSelectedElementId(null);
        setIsPropertiesPanelOpen(false);
    };

    const hasSelectedElement = Boolean(selectedElement);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!builderRef.current) {
                return;
            }
            if (builderRef.current.contains(event.target)) {
                return;
            }
            setSelectedElementId(null);
            setIsPropertiesPanelOpen(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <DndContext onDragEnd={handleDrop}>
            <div ref={builderRef} className="app-shell">
                <header className="main-header">
                    <div className="main-header__brand">
                        <div className="main-header__logo" aria-hidden="true">FC</div>
                        <div>
                            <p className="main-header__eyebrow">Form studio</p>
                            <h1 className="main-header__heading">FormCraft</h1>
                        </div>
                    </div>
                    <nav className="main-header__nav" aria-label="Primary">
                        <button type="button" className="main-header__link main-header__link--active">Builder</button>
                        <button type="button" className="main-header__link" onClick={() => setIsPreviewOpen(true)}>Preview</button>
                        <button type="button" className="main-header__link" onClick={handleExport}>Export</button>
                    </nav>
                    <div className="main-header__actions">
                        <Button variant="outlined" color="inherit" onClick={() => setIsPreviewOpen(true)}>Preview</Button>
                        <Button variant="contained" color="primary" onClick={handleExport}>Export</Button>
                    </div>
                </header>

                <div className={`builder-layout ${hasSelectedElement && isPropertiesPanelOpen ? '' : 'builder-layout--no-properties'}`}>
                    <Sidebar />

                    <section className="workspace">
                        <header className="workspace__header">
                            <div>
                                <p className="workspace__eyebrow">Build mode</p>
                                <h2 className="workspace__title">Assemble your form</h2>
                                <p className="workspace__subtitle">
                                    Drag items from the left, drop them into the canvas, then fine-tune their properties.
                                </p>
                            </div>
                            <Button
                                variant="text"
                                color="primary"
                                onClick={handleClearCanvas}
                                disabled={formElements.length === 0}
                            >
                                Clear canvas
                            </Button>
                        </header>

                        {!hasSelectedElement && (
                            <div className="properties-hint" role="status">
                                <h3>Editing tips</h3>
                                <p>Drop a field onto the canvas, then click it to unlock its settings panel.</p>
                                <p className="properties-hint__tip">Double-click any element to jump straight into edit mode.</p>
                            </div>
                        )}

                        <DroppableArea
                            formElements={formElements}
                            onDelete={handleDeleteElement}
                            onSelect={handleSelectElement}
                            selectedElementId={selectedElement?.id || null}
                        />
                    </section>

                    {hasSelectedElement && isPropertiesPanelOpen && (
                        <aside ref={editSidebarRef} className="properties-panel">
                            <EditSidebar
                                className="edit-sidebar"
                                selectedElement={selectedElement}
                                onNameChange={(newName) => handleNameChange(selectedElement.id, newName)}
                                onOptionsChange={onOptionsChange}
                                addOption={addOption}
                                deleteOption={deleteOption}
                                onCheckboxOptionChange={onCheckboxOptionChange}
                                addCheckboxOption={addCheckboxOption}
                                deleteCheckboxOption={deleteCheckboxOption}
                                onElementPropertyChange={handleElementPropertyChange}
                                onCloseProperties={() => setIsPropertiesPanelOpen(false)}
                            />
                        </aside>
                    )}
                </div>

                <footer className="main-footer">
                    <div className="main-footer__content">
                        <p className="main-footer__brand">FormCraft © {new Date().getFullYear()}</p>
                        <p className="main-footer__motto">Design. Drag. Deploy. Build elegant forms in minutes.</p>
                    </div>
                </footer>
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
