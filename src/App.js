import React, { useState, useEffect, useRef, useCallback } from 'react';
import { compressToBase64 } from 'lz-string';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import Sidebar from './components/Sidebar';
import EditSidebar from './components/EditSidebar';
import DroppableArea from './components/DroppableArea';
import FormPreview from './components/FormPreview';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    DialogContentText,
    List,
    ListItemButton,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import { listForms, getForm, createForm, updateForm, deleteForm } from './api/forms';
import FormsPage from './pages/FormsPage';
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
            if (type === 'radio') {
                element.radioLayout = 'vertical';
            }
            break;
        case 'checkbox':
            element.checkboxOptions = [
                { label: 'Option 1', checked: false },
                { label: 'Option 2', checked: false },
            ];
            element.checkboxLayout = 'vertical';
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

const elementToField = (element) => {
    if (!element || layoutTypes.has(element.type)) {
        return null;
    }

    const label = element.name || element.label || '';
    const field = { type: element.type, label };

    if (element.type === 'select' || element.type === 'radio') {
        field.options = element.options || [];
    }

    if (element.type === 'checkbox') {
        field.options = (element.checkboxOptions || []).map((opt) => opt.label);
    }

    return field;
};

const flattenElementsToFields = (elements) => {
    const fields = [];

    const walk = (nodes) => {
        nodes.forEach((node) => {
            if (layoutTypes.has(node.type) && Array.isArray(node.columns)) {
                node.columns.forEach((col) => walk(col || []));
                return;
            }

            const field = elementToField(node);
            if (field) {
                fields.push(field);
            }
        });
    };

    walk(elements || []);
    return fields;
};

const fieldsToElements = (fields) => {
    if (!Array.isArray(fields)) return [];

    return fields.map((field, index) => {
        const base = createElement(field.type);
        const idSeed = Date.now() + index;

        const name = field.label || field.name || '';
        const options = Array.isArray(field.options) ? field.options : [];

        if (field.type === 'select' || field.type === 'radio') {
            return { ...base, id: idSeed, name, options: options.length ? options : base.options || [] };
        }

        if (field.type === 'checkbox') {
            const checkboxOptions = options.length
                ? options.map((label) => ({ label, checked: false }))
                : base.checkboxOptions || [];
            return { ...base, id: idSeed, name, checkboxOptions };
        }

        return { ...base, id: idSeed, name };
    });
};

const toComponentName = (value) => {
    const cleaned = (value || 'Generated Form').replace(/[^a-zA-Z0-9]+/g, ' ');
    const parts = cleaned
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
    const name = parts.join('') || 'GeneratedForm';
    if (/^[A-Za-z]/.test(name)) {
        return name;
    }
    return `Form${name}`;
};

const escapePropValue = (value) => {
    if (value === undefined || value === null) return '';
    return String(value).replace(/"/g, '\\"');
};

const indent = (level) => '  '.repeat(level);

const renderElementCode = (element, imports, level = 2) => {
    if (!element) return '';

    const label = escapePropValue(element.name || element.label || 'Field');
    const wrap = (content) => `${indent(level)}<Box mb={2}>\n${content}\n${indent(level)}</Box>`;

    switch (element.type) {
        case 'twoColumnRow':
        case 'threeColumnRow':
        case 'fourColumnRow': {
            imports.add('Grid');
            const columnCount = getColumnCount(element.type) || 1;
            const itemSpan = Math.max(1, Math.floor(12 / columnCount));
            const normalizedColumns = Array.from({ length: columnCount }, (_, idx) => element.columns?.[idx] || []);

            const childrenCode = normalizedColumns
                .map((col, idx) => {
                    const inner = (col || [])
                        .map((child) => renderElementCode(child, imports, level + 2))
                        .filter(Boolean)
                        .join('\n');
                    const body = inner || `${indent(level + 3)}{/* Add a field here */}`;
                    return `${indent(level + 1)}<Grid item xs={12} md={${itemSpan}}>` +
                        `\n${body}\n${indent(level + 1)}</Grid>`;
                })
                .join('\n');

            return `${indent(level)}<Grid container spacing={2}>\n${childrenCode}\n${indent(level)}</Grid>`;
        }
        case 'text':
            imports.add('TextField');
            imports.add('Box');
            return wrap(
                `${indent(level + 1)}<TextField fullWidth label="${label || 'Text'}" placeholder="${escapePropValue(
                    element.placeholder || ''
                )}" variant="outlined" />`
            );
        case 'textarea':
            imports.add('TextField');
            imports.add('Box');
            return wrap(
                `${indent(level + 1)}<TextField fullWidth multiline rows={${element.rows || 4}} label="${label || 'Long answer'}" placeholder="${escapePropValue(
                    element.placeholder || ''
                )}" />`
            );
        case 'number':
            imports.add('TextField');
            imports.add('Box');
            return wrap(
                `${indent(level + 1)}<TextField fullWidth type="number" label="${label || 'Number'}" placeholder="${escapePropValue(
                    element.placeholder || ''
                )}" inputProps={{ min: ${element.min ?? 0}, max: ${element.max ?? 100}, step: ${element.step ?? 1} }} />`
            );
        case 'email':
            imports.add('TextField');
            imports.add('Box');
            return wrap(
                `${indent(level + 1)}<TextField fullWidth type="email" label="${label || 'Email'}" placeholder="${escapePropValue(
                    element.placeholder || 'name@example.com'
                )}" />`
            );
        case 'phone':
            imports.add('TextField');
            imports.add('Box');
            return wrap(
                `${indent(level + 1)}<TextField fullWidth type="tel" label="${label || 'Phone'}" placeholder="${escapePropValue(
                    element.placeholder || '(555) 123-4567'
                )}" />`
            );
        case 'checkbox': {
            imports.add('FormGroup');
            imports.add('FormControlLabel');
            imports.add('Checkbox');
            imports.add('Box');
            const options = (element.checkboxOptions || []).length
                ? element.checkboxOptions
                : [
                      { label: 'Option 1', checked: false },
                      { label: 'Option 2', checked: false },
                  ];

            const rows = options
                .map(
                    (opt, idx) =>
                        `${indent(level + 2)}<FormControlLabel control={<Checkbox defaultChecked={${opt.checked ? 'true' : 'false'}} />} label="${escapePropValue(
                            opt.label || `Option ${idx + 1}`
                        )}" />`
                )
                .join('\n');

            return wrap(
                `${indent(level + 1)}<FormGroup row={${element.checkboxLayout === 'horizontal' ? 'true' : 'false'}}>\n${rows}\n${indent(
                    level + 1
                )}</FormGroup>`
            );
        }
        case 'radio': {
            imports.add('FormControl');
            imports.add('FormLabel');
            imports.add('RadioGroup');
            imports.add('FormControlLabel');
            imports.add('Radio');
            imports.add('Box');
            const options = (element.options || []).length ? element.options : ['Option 1', 'Option 2'];

            const radios = options
                .map(
                    (opt, idx) =>
                        `${indent(level + 3)}<FormControlLabel value="${escapePropValue(opt || `Option ${idx + 1}`)}" control={<Radio />} label="${escapePropValue(
                            opt || `Option ${idx + 1}`
                        )}" />`
                )
                .join('\n');

            return wrap(
                `${indent(level + 1)}<FormControl component="fieldset">\n${indent(level + 2)}<FormLabel component="legend">${label || 'Radio'}</FormLabel>\n${indent(
                    level + 2
                )}<RadioGroup row={${element.radioLayout === 'horizontal' ? 'true' : 'false'}} name="radio-${element.id}">\n${radios}\n${indent(
                    level + 2
                )}</RadioGroup>\n${indent(level + 1)}</FormControl>`
            );
        }
        case 'select': {
            imports.add('TextField');
            imports.add('MenuItem');
            imports.add('Box');
            const options = (element.options || []).length ? element.options : ['Option 1', 'Option 2'];
            const menuItems = options
                .map((opt, idx) => `${indent(level + 2)}<MenuItem value="${escapePropValue(opt)}">${escapePropValue(opt || `Option ${idx + 1}`)}</MenuItem>`)
                .join('\n');

            return wrap(
                `${indent(level + 1)}<TextField select fullWidth label="${label || 'Select'}" defaultValue="${escapePropValue(
                    options[0] || ''
                )}">\n${menuItems}\n${indent(level + 1)}</TextField>`
            );
        }
        case 'date':
            imports.add('TextField');
            imports.add('Box');
            return wrap(
                `${indent(level + 1)}<TextField fullWidth type="date" label="${label || 'Date'}" InputLabelProps={{ shrink: true }} />`
            );
        case 'rating':
            imports.add('Rating');
            imports.add('Box');
            return wrap(`${indent(level + 1)}<Rating name="rating-${element.id}" defaultValue={2.5} precision={0.5} />`);
        case 'slider':
            imports.add('Slider');
            imports.add('Box');
            return wrap(`${indent(level + 1)}<Slider defaultValue={30} aria-label="${label || 'Slider'}" />`);
        case 'toggle':
            imports.add('FormControlLabel');
            imports.add('Switch');
            imports.add('Box');
            return wrap(
                `${indent(level + 1)}<FormControlLabel control={<Switch defaultChecked={${element.checked ? 'true' : 'false'}} />} label="${escapePropValue(
                    element.checked ? element.onLabel || label : element.offLabel || label
                )}" />`
            );
        case 'file':
            imports.add('TextField');
            imports.add('Box');
            return wrap(
                `${indent(level + 1)}<TextField fullWidth type="file" label="${label || 'File'}" inputProps={{ accept: "${escapePropValue(
                    element.accept || ''
                )}", multiple: ${element.multiple ? 'true' : 'false'} }} />`
            );
        case 'divider':
            imports.add('Divider');
            imports.add('Box');
            if (element.label) {
                return wrap(`${indent(level + 1)}<Divider textAlign="left">${escapePropValue(element.label)}</Divider>`);
            }
            return wrap(`${indent(level + 1)}<Divider />`);
        case 'button':
            imports.add('Button');
            imports.add('Box');
            return wrap(
                `${indent(level + 1)}<Button variant="${element.variant || 'contained'}" color="${element.color || 'primary'}" ${
                    element.disabled ? 'disabled ' : ''
                }>${escapePropValue(element.label || 'Button')}</Button>`
            );
        default:
            return '';
    }
};

const generateReactCode = (elements, formName, isTS = false) => {
    const imports = new Set(['Box']);
    const componentName = toComponentName(formName || 'Generated Form');
    const body = (elements || [])
        .map((el) => renderElementCode(el, imports, 2))
        .filter(Boolean)
        .join('\n');

    const importList = Array.from(imports).sort();
    const reactImport = isTS ? "import React, { FC } from 'react';" : "import React from 'react';";
    const componentSignature = isTS ? `const ${componentName}: FC = () => (` : `const ${componentName} = () => (`;

    const code = `${reactImport}\nimport { ${importList.join(', ')} } from '@mui/material';\n\n${componentSignature}\n  <Box component="form" noValidate autoComplete="off" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>\n${
        body ? `${body}\n` : '    {/* Add form fields here */}\n'
    }  </Box>\n);\n\nexport default ${componentName};\n`;

    return { code, componentName };
};

const buildCodeSandboxParameters = ({ codeString, componentName, isTS = false }) => {
    const fileExt = isTS ? 'tsx' : 'js';
    const indexExt = isTS ? 'tsx' : 'js';
    const pkg = {
        name: 'formcraft-export',
        version: '1.0.0',
        main: `src/index.${indexExt}`,
        dependencies: {
            react: '^18.3.1',
            'react-dom': '^18.3.1',
            '@mui/material': '^6.1.6',
            '@emotion/react': '^11.13.3',
            '@emotion/styled': '^11.13.0',
        },
    };

    if (isTS) {
        pkg.devDependencies = {
            typescript: '^5.3.3',
            '@types/react': '^18.2.48',
            '@types/react-dom': '^18.2.18',
        };
    }

    const files = {
        'package.json': {
            content: JSON.stringify(pkg, null, 2),
        },
        'public/index.html': {
            content: `<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>Form Export</title>\n  </head>\n  <body>\n    <div id="root"></div>\n  </body>\n</html>`,
        },
        [`src/index.${indexExt}`]: {
            content: isTS
                ? `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\n\nconst container = document.getElementById('root') as HTMLElement;\nconst root = createRoot(container);\nroot.render(<App />);\n`
                : `import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\n\nconst root = createRoot(document.getElementById('root'));\nroot.render(<App />);\n`,
        },
        [`src/App.${fileExt}`]: {
            content: isTS
                ? `import React, { FC } from 'react';\nimport GeneratedForm from './GeneratedForm';\nimport { CssBaseline, Container } from '@mui/material';\n\nconst App: FC = () => (\n  <React.Fragment>\n    <CssBaseline />\n    <Container maxWidth="md">\n      <GeneratedForm />\n    </Container>\n  </React.Fragment>\n);\n\nexport default App;\n`
                : `import React from 'react';\nimport GeneratedForm from './GeneratedForm';\nimport { CssBaseline, Container } from '@mui/material';\n\nconst App = () => (\n  <React.Fragment>\n    <CssBaseline />\n    <Container maxWidth="md">\n      <GeneratedForm />\n    </Container>\n  </React.Fragment>\n);\n\nexport default App;\n`,
        },
        [`src/GeneratedForm.${fileExt}`]: {
            content: codeString,
        },
    };

    if (isTS) {
        files['tsconfig.json'] = {
            content: JSON.stringify(
                {
                    compilerOptions: {
                        target: 'ES2017',
                        module: 'ESNext',
                        jsx: 'react-jsx',
                        moduleResolution: 'Node',
                        esModuleInterop: true,
                        strict: true,
                        skipLibCheck: true,
                    },
                },
                null,
                2
            ),
        };
    }

    const payload = { files };
    const encoded = compressToBase64(JSON.stringify(payload))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

    return { parameters: encoded, componentName };
};

function BuilderApp() {
    const [formElements, setFormElements] = useState([]);
    const builderRef = useRef(null);
    const editSidebarRef = useRef(null);
    const importFileInputRef = useRef(null);
    const [selectedElementId, setSelectedElementId] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [importText, setImportText] = useState('');
    const [importError, setImportError] = useState('');
    const [isPropertiesPanelOpen, setIsPropertiesPanelOpen] = useState(true);
    const [forms, setForms] = useState([]);
    const [currentFormId, setCurrentFormId] = useState(null);
    const [formName, setFormName] = useState('');
    const [isFormsDialogOpen, setIsFormsDialogOpen] = useState(false);
    const [isLoadingForms, setIsLoadingForms] = useState(false);
    const [isSavingForm, setIsSavingForm] = useState(false);
    const [isDeletingForm, setIsDeletingForm] = useState(false);
    const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
    const [codeText, setCodeText] = useState('');
    const [codeComponentName, setCodeComponentName] = useState('GeneratedForm');
    const [codeLanguage, setCodeLanguage] = useState('jsx');
    const [isCodeGenerating, setIsCodeGenerating] = useState(false);
    const [isSandboxing, setIsSandboxing] = useState(false);
    const [codeError, setCodeError] = useState('');
    const [apiError, setApiError] = useState('');
    const selectedElement = selectedElementId ? findElementById(formElements, selectedElementId) : null;
    const navigate = useNavigate();
    const location = useLocation();

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

    const generateAndSetCode = (language = codeLanguage) => {
        const isTS = language === 'tsx';
        const { code, componentName } = generateReactCode(formElements, formName, isTS);
        setCodeText(code);
        setCodeComponentName(componentName);
    };

    const handleOpenCodeDialog = () => {
        setCodeError('');
        setIsCodeGenerating(true);
        try {
            generateAndSetCode(codeLanguage);
            setIsCodeDialogOpen(true);
        } catch (error) {
            setCodeError(error.message || 'Failed to generate code');
            setIsCodeDialogOpen(true);
        } finally {
            setIsCodeGenerating(false);
        }
    };

    const handleSwitchLanguage = (language) => {
        setCodeLanguage(language);
        setIsCodeGenerating(true);
        setCodeError('');
        try {
            generateAndSetCode(language);
        } catch (error) {
            setCodeError(error.message || 'Failed to generate code');
        } finally {
            setIsCodeGenerating(false);
        }
    };

    const handleCopyCode = async () => {
        if (!codeText) return;
        try {
            await navigator.clipboard.writeText(codeText);
        } catch (error) {
            setCodeError(error.message || 'Could not copy code to clipboard');
        }
    };

    const handleOpenSandbox = async () => {
        if (!codeText) return;
        setIsSandboxing(true);
        try {
            const { parameters } = buildCodeSandboxParameters({
                codeString: codeText,
                componentName: codeComponentName,
                isTS: codeLanguage === 'tsx',
            });
            const url = `https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`;
            window.open(url, '_blank', 'noopener');
        } catch (error) {
            setCodeError(error.message || 'Failed to open CodeSandbox');
        } finally {
            setIsSandboxing(false);
        }
    };

    const refreshFormsList = useCallback(async () => {
        setApiError('');
        setIsLoadingForms(true);
        try {
            const data = await listForms();
            setForms(Array.isArray(data) ? data : []);
        } catch (error) {
            setApiError(error.message || 'Failed to load forms');
        } finally {
            setIsLoadingForms(false);
        }
    }, []);

    const handleLoadForm = useCallback(async (id) => {
        if (!id) return;
        setApiError('');
        setIsLoadingForms(true);
        try {
            const form = await getForm(id);
            setCurrentFormId(form.id || id);
            setFormName(form.name || '');
            setFormElements(fieldsToElements(form.fields || []));
            setSelectedElementId(null);
            setIsPropertiesPanelOpen(false);
        } catch (error) {
            setApiError(error.message || 'Failed to load form');
        } finally {
            setIsLoadingForms(false);
            setIsFormsDialogOpen(false);
        }
    }, []);

    useEffect(() => {
        refreshFormsList();
    }, [refreshFormsList]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const formIdParam = params.get('formId');
        if (formIdParam && formIdParam !== currentFormId) {
            handleLoadForm(formIdParam);
        }
    }, [location.search, currentFormId, handleLoadForm]);

    const handleSaveForm = async () => {
        setApiError('');
        const payload = {
            name: formName || 'Untitled Form',
            fields: flattenElementsToFields(formElements),
        };

        setIsSavingForm(true);
        try {
            if (currentFormId) {
                const updated = await updateForm(currentFormId, payload);
                setCurrentFormId(updated.id || currentFormId);
            } else {
                const created = await createForm(payload);
                setCurrentFormId(created.id || created._id || null);
            }
            await refreshFormsList();
        } catch (error) {
            setApiError(error.message || 'Failed to save form');
        } finally {
            setIsSavingForm(false);
        }
    };

    const handleDeleteForm = async () => {
        if (!currentFormId) return;
        if (!window.confirm('Delete this form from the backend?')) return;

        setApiError('');
        setIsDeletingForm(true);
        try {
            await deleteForm(currentFormId);
            setCurrentFormId(null);
            setFormName('');
            setFormElements([]);
            setSelectedElementId(null);
            navigate('/', { replace: true });
            await refreshFormsList();
        } catch (error) {
            setApiError(error.message || 'Failed to delete form');
        } finally {
            setIsDeletingForm(false);
        }
    };

    const normalizeImportedElements = (elements) => {
        const normalize = (element) => {
            if (layoutTypes.has(element.type)) {
                const columns = Array.from({ length: getColumnCount(element.type) }, (_, idx) => {
                    const existing = element.columns?.[idx];
                    if (Array.isArray(existing)) {
                        return existing.map(normalize);
                    }
                    return [];
                });
                return { ...element, columns };
            }
            return element;
        };

        return elements.map((el) => normalize(el));
    };

    const loadImportedElements = (jsonText) => {
        const parsed = JSON.parse(jsonText || '[]');
        if (!Array.isArray(parsed)) {
            throw new Error('Root JSON must be an array of elements');
        }
        const normalized = normalizeImportedElements(parsed);
        setFormElements(normalized);
        setSelectedElementId(null);
        setIsPropertiesPanelOpen(false);
    };

    const handleImport = () => {
        setImportError('');
        setImportText(JSON.stringify(formElements, null, 2) || '[]');
        setIsImportOpen(true);
    };

    const handleImportSubmit = () => {
        try {
            loadImportedElements(importText);
            setIsImportOpen(false);
            setImportError('');
        } catch (error) {
            setImportError(error.message || 'Invalid JSON. Please check the format.');
        }
    };

    const handleImportFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const text = typeof e.target?.result === 'string' ? e.target.result : '';
                setImportText(text);
                loadImportedElements(text);
                setIsImportOpen(false);
                setImportError('');
            } catch (error) {
                setImportError(error.message || 'Invalid JSON. Please check the format.');
            } finally {
                if (event.target) {
                    event.target.value = '';
                }
            }
        };

        reader.onerror = () => {
            setImportError('Failed to read the file. Please try again.');
            if (event.target) {
                event.target.value = '';
            }
        };

        reader.readAsText(file);
    };

    const handleClearCanvas = () => {
        setFormElements([]);
        setSelectedElementId(null);
        setIsPropertiesPanelOpen(false);
        setCurrentFormId(null);
        setFormName('');
        navigate('/', { replace: true });
    };

    const hasSelectedElement = Boolean(selectedElement);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!builderRef.current) {
                return;
            }
            const isInsideBuilder = builderRef.current.contains(event.target);
            const isInsideMuiOverlay =
                event.target.closest('.MuiPopover-root') ||
                event.target.closest('.MuiModal-root') ||
                event.target.closest('.MuiDialog-root');

            if (isInsideBuilder || isInsideMuiOverlay) {
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
                    <div className="main-header__actions">
                        <TextField
                            size="small"
                            variant="outlined"
                            label="Form name"
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            sx={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}
                        />
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => navigate('/forms')}
                        >
                            Forms
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveForm}
                            disabled={isSavingForm}
                        >
                            {isSavingForm ? 'Saving...' : currentFormId ? 'Update' : 'Save'}
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={() => {
                                setIsFormsDialogOpen(true);
                                refreshFormsList();
                            }}
                            disabled={isLoadingForms}
                        >
                            Load
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleDeleteForm}
                            disabled={!currentFormId || isDeletingForm}
                        >
                            {isDeletingForm ? 'Deleting...' : 'Delete'}
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleClearCanvas}
                            disabled={formElements.length === 0}
                            sx={{
                                '&.MuiButton-outlined': {
                                    borderColor: 'rgba(255,255,255,0.6)'
                                },
                                '&.Mui-disabled': {
                                    color: '#e2e8f0',
                                    borderColor: 'rgba(255,255,255,0.35)',
                                    opacity: 1,
                                },
                            }}
                        >
                            Clear
                        </Button>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleOpenCodeDialog}
                            disabled={isCodeGenerating}
                        >
                            {isCodeGenerating ? 'Generating...' : 'Code'}
                        </Button>
                        <Button variant="outlined" color="inherit" onClick={handleImport}>Import</Button>
                        <Button variant="outlined" color="inherit" onClick={() => setIsPreviewOpen(true)}>Preview</Button>
                        <Button variant="contained" color="primary" className="export-button" onClick={handleExport}>Export</Button>
                    </div>
                </header>

                <div className={`builder-layout ${hasSelectedElement && isPropertiesPanelOpen ? '' : 'builder-layout--no-properties'}`}>
                    <Sidebar />

                    <section className="workspace">
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

            {isCodeDialogOpen && (
                <Dialog open={isCodeDialogOpen} onClose={() => setIsCodeDialogOpen(false)} fullWidth maxWidth="md">
                    <DialogTitle>Export code</DialogTitle>
                    <DialogContent>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                            <Button
                                size="small"
                                variant={codeLanguage === 'jsx' ? 'contained' : 'outlined'}
                                onClick={() => handleSwitchLanguage('jsx')}
                                disabled={isCodeGenerating}
                            >
                                JSX
                            </Button>
                            <Button
                                size="small"
                                variant={codeLanguage === 'tsx' ? 'contained' : 'outlined'}
                                onClick={() => handleSwitchLanguage('tsx')}
                                disabled={isCodeGenerating}
                            >
                                TSX
                            </Button>
                        </div>
                        {codeError && (
                            <DialogContentText color="error" sx={{ mb: 1 }}>
                                {codeError}
                            </DialogContentText>
                        )}
                        <pre
                            style={{
                                backgroundColor: '#0f172a',
                                color: '#e2e8f0',
                                padding: '16px',
                                borderRadius: '10px',
                                fontSize: '13px',
                                overflow: 'auto',
                                lineHeight: 1.5,
                            }}
                        >
                            {codeText || '// Add some fields to generate code'}
                        </pre>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCopyCode} disabled={!codeText} color="inherit">
                            Copy {codeLanguage.toUpperCase()}
                        </Button>
                        <Button onClick={handleOpenSandbox} disabled={!codeText || isSandboxing} color="inherit">
                            {isSandboxing ? 'Opening...' : `Open ${codeLanguage.toUpperCase()} in CodeSandbox`}
                        </Button>
                        <Button onClick={() => setIsCodeDialogOpen(false)} color="primary">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
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

            {isImportOpen && (
                <Dialog open={isImportOpen} onClose={() => setIsImportOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Import Form JSON</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Paste a form JSON array (from Export) to load it into the builder.
                        </DialogContentText>
                        <Button
                            variant="outlined"
                            color="inherit"
                            size="small"
                            onClick={() => importFileInputRef.current?.click()}
                            sx={{ mb: 2 }}
                        >
                            Upload JSON file
                        </Button>
                        <input
                            ref={importFileInputRef}
                            type="file"
                            accept="application/json,.json"
                            style={{ display: 'none' }}
                            onChange={handleImportFileChange}
                        />
                        <TextField
                            multiline
                            minRows={10}
                            fullWidth
                            value={importText}
                            onChange={(e) => setImportText(e.target.value)}
                                                        placeholder={`[
    { "type": "text", "id": 1, "name": "My field" }
]`}
                        />
                        {importError && (
                            <DialogContentText color="error" sx={{ mt: 1 }}>
                                {importError}
                            </DialogContentText>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsImportOpen(false)} color="inherit">
                            Cancel
                        </Button>
                        <Button onClick={handleImportSubmit} variant="contained" color="primary">
                            Import
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {isFormsDialogOpen && (
                <Dialog open={isFormsDialogOpen} onClose={() => setIsFormsDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Load a saved form</DialogTitle>
                    <DialogContent>
                        {isLoadingForms ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' }}>
                                <CircularProgress size={20} />
                                <DialogContentText>Loading forms...</DialogContentText>
                            </div>
                        ) : forms.length === 0 ? (
                            <DialogContentText>No saved forms available.</DialogContentText>
                        ) : (
                            <List>
                                {forms.map((form) => (
                                    <ListItemButton
                                        key={form.id || form._id}
                                        onClick={() => handleLoadForm(form.id || form._id)}
                                    >
                                        <ListItemText
                                            primary={form.name || 'Untitled Form'}
                                            secondary={form.fields?.length ? `${form.fields.length} fields` : '0 fields'}
                                        />
                                    </ListItemButton>
                                ))}
                            </List>
                        )}
                        {apiError && (
                            <DialogContentText color="error" sx={{ mt: 1 }}>
                                {apiError}
                            </DialogContentText>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsFormsDialogOpen(false)} color="inherit">
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </DndContext>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<BuilderApp />} />
                <Route path="/forms" element={<FormsPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
