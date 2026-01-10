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
    Collapse,
    IconButton,
    Tooltip,
    TextField,
    DialogContentText,
    List,
    ListItemButton,
    ListItemText,
    CircularProgress,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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
        case 'rating':
            element.max = 5;
            element.precision = 0.5;
            element.defaultValue = 2.5;
            break;
        case 'slider':
            element.min = 0;
            element.max = 100;
            element.step = 1;
            element.defaultValue = 50;
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
            element.size = 'medium';
            element.fullWidth = false;
            element.typeAttr = 'button';
            element.href = '';
            element.target = '_self';
            element.startIcon = 'none';
            element.endIcon = 'none';
            element.borderRadius = 8;
            element.disableElevation = false;
            element.loading = false;
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

    if (element.type === 'text') {
        field.placeholder = element.placeholder || '';
    }

    if (element.type === 'phone') {
        field.placeholder = element.placeholder || '';
        field.pattern = element.pattern || '';
    }

    if (element.type === 'date') {
        field.defaultDate = element.defaultDate || '';
        field.minDate = element.minDate || '';
        field.maxDate = element.maxDate || '';
        field.dateFormat = element.dateFormat || '';
    }

    if (element.type === 'button') {
        field.variant = element.variant || 'contained';
        field.color = element.color || 'primary';
        field.disabled = !!element.disabled;
        field.size = element.size || 'medium';
        field.fullWidth = !!element.fullWidth;
        field.typeAttr = element.typeAttr || 'button';
        field.href = element.href || '';
        field.target = element.target || '_self';
        field.startIcon = element.startIcon || 'none';
        field.endIcon = element.endIcon || 'none';
        field.borderRadius = element.borderRadius ?? 8;
        field.disableElevation = !!element.disableElevation;
        field.loading = !!element.loading;
    }

    if (element.type === 'rating') {
        field.max = element.max ?? 5;
        field.precision = element.precision ?? 0.5;
        field.defaultValue = element.defaultValue ?? 0;
    }

    if (element.type === 'slider') {
        field.min = element.min ?? 0;
        field.max = element.max ?? 100;
        field.step = element.step ?? 1;
        field.defaultValue = element.defaultValue ?? element.min ?? 0;
    }

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

        if (field.type === 'text') {
            return { ...base, id: idSeed, name, placeholder: field.placeholder ?? base.placeholder };
        }

        if (field.type === 'phone') {
            return {
                ...base,
                id: idSeed,
                name,
                placeholder: field.placeholder ?? base.placeholder,
                pattern: field.pattern ?? base.pattern,
            };
        }

        if (field.type === 'date') {
            return {
                ...base,
                id: idSeed,
                name,
                defaultDate: field.defaultDate ?? base.defaultDate,
                minDate: field.minDate ?? base.minDate,
                maxDate: field.maxDate ?? base.maxDate,
                dateFormat: field.dateFormat ?? base.dateFormat,
            };
        }

        if (field.type === 'rating') {
            return {
                ...base,
                id: idSeed,
                name,
                max: field.max ?? base.max,
                precision: field.precision ?? base.precision,
                defaultValue: field.defaultValue ?? base.defaultValue,
            };
        }

        if (field.type === 'slider') {
            return {
                ...base,
                id: idSeed,
                name,
                min: field.min ?? base.min,
                max: field.max ?? base.max,
                step: field.step ?? base.step,
                defaultValue: field.defaultValue ?? base.defaultValue ?? (field.min ?? base.min),
            };
        }

        if (field.type === 'button') {
            return {
                ...base,
                id: idSeed,
                name,
                variant: field.variant ?? base.variant,
                color: field.color ?? base.color,
                disabled: field.disabled ?? base.disabled,
                size: field.size ?? base.size,
                fullWidth: field.fullWidth ?? base.fullWidth,
                typeAttr: field.typeAttr ?? base.typeAttr,
                href: field.href ?? base.href,
                target: field.target ?? base.target,
                startIcon: field.startIcon ?? base.startIcon,
                endIcon: field.endIcon ?? base.endIcon,
                borderRadius: field.borderRadius ?? base.borderRadius,
                disableElevation: field.disableElevation ?? base.disableElevation,
                loading: field.loading ?? base.loading,
            };
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

const formatDateValue = (dateStr, format) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [yyyy, mm, dd] = parts;
    switch (format) {
        case 'MM/DD/YYYY':
            return `${mm}/${dd}/${yyyy}`;
        case 'DD/MM/YYYY':
            return `${dd}/${mm}/${yyyy}`;
        case 'DD.MM.YYYY':
            return `${dd}.${mm}.${yyyy}`;
        default:
            return dateStr;
    }
};

const dateFormatPattern = (format) => {
    switch (format) {
        case 'MM/DD/YYYY':
        case 'DD/MM/YYYY':
            return '^\\d{2}/\\d{2}/\\d{4}$';
        case 'DD.MM.YYYY':
            return '^\\d{2}\\.\\d{2}\\.\\d{4}$';
        default:
            return '^\\d{4}-\\d{2}-\\d{2}$';
    }
};

const renderElementCode = (element, imports, level = 2, iconImports = new Set()) => {
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
                        .map((child) => renderElementCode(child, imports, level + 2, iconImports))
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
            const phonePattern = element.pattern
                ? ` inputProps={{ pattern: "${escapePropValue(element.pattern)}" }}`
                : '';
            return wrap(
                `${indent(level + 1)}<TextField fullWidth type="tel" label="${label || 'Phone'}" placeholder="${escapePropValue(
                    element.placeholder || '(555) 123-4567'
                )}"${phonePattern} />`
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
            const format = element.dateFormat || 'YYYY-MM-DD';
            const isIso = format === 'YYYY-MM-DD';
            const minDate = isIso && element.minDate ? ` min: "${escapePropValue(element.minDate)}"` : '';
            const maxDate = isIso && element.maxDate ? ` max: "${escapePropValue(element.maxDate)}"` : '';
            const pattern = dateFormatPattern(format);
            const patternProp = pattern ? ` pattern: "${pattern}"` : '';
            const formattedMin = !isIso && element.minDate ? formatDateValue(element.minDate, format) : '';
            const formattedMax = !isIso && element.maxDate ? formatDateValue(element.maxDate, format) : '';
            const dataMin = formattedMin ? ` 'data-min': "${escapePropValue(formattedMin)}"` : '';
            const dataMax = formattedMax ? ` 'data-max': "${escapePropValue(formattedMax)}"` : '';
            const inputPropsEntries = [minDate, maxDate, patternProp, dataMin, dataMax].filter(Boolean);
            const inputProps = inputPropsEntries.length ? ` inputProps={{${inputPropsEntries.join(', ')}}}` : '';
            const defaultDateValue = isIso
                ? element.defaultDate
                : formatDateValue(element.defaultDate, format);
            const defaultDate = defaultDateValue ? ` defaultValue="${escapePropValue(defaultDateValue)}"` : '';
            const typeProp = isIso ? 'date' : 'text';
            const placeholder = format ? ` placeholder="${escapePropValue(format)}"` : '';
            const rangeHint = [
                formattedMin ? `Min ${escapePropValue(formattedMin)}` : '',
                formattedMax ? `Max ${escapePropValue(formattedMax)}` : '',
            ].filter(Boolean).join(' · ');
            const helper = rangeHint ? ` helperText="${rangeHint}"` : '';
            return wrap(
                `${indent(level + 1)}<TextField fullWidth type="${typeProp}" label="${label || 'Date'}"${placeholder}${defaultDate}${inputProps}${helper} InputLabelProps={{ shrink: true }} />`
            );
        case 'rating':
            imports.add('Rating');
            imports.add('Box');
            const ratingPrecision = element.precision ?? 0.5;
            const ratingMax = element.max ?? 5;
            const ratingDefault = element.defaultValue ?? 0;
            return wrap(`${indent(level + 1)}<Rating name="rating-${element.id}" defaultValue={${ratingDefault}} precision={${ratingPrecision}} max={${ratingMax}} />`);
        case 'slider':
            imports.add('Slider');
            imports.add('Box');
            const sliderMin = element.min ?? 0;
            const sliderMax = element.max ?? 100;
            const sliderStep = element.step ?? 1;
            const sliderDefault = element.defaultValue ?? sliderMin;
            return wrap(
                `${indent(level + 1)}<Slider defaultValue={${sliderDefault}} min={${sliderMin}} max={${sliderMax}} step={${sliderStep}} aria-label="${label || 'Slider'}" />`
            );
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
            const buttonProps = [];
            buttonProps.push(`variant="${element.variant || 'contained'}"`);
            buttonProps.push(`color="${element.color || 'primary'}"`);
            if (element.size && element.size !== 'medium') buttonProps.push(`size="${element.size}"`);
            if (element.fullWidth) buttonProps.push('fullWidth');
            if (element.typeAttr && element.typeAttr !== 'button') buttonProps.push(`type="${element.typeAttr}"`);
            if (element.href) buttonProps.push(`href="${escapePropValue(element.href)}"`);
            if (element.target) buttonProps.push(`target="${escapePropValue(element.target)}"`);
            if (element.disableElevation) buttonProps.push('disableElevation');

            const shouldDisable = element.disabled || element.loading;
            if (element.disabled) buttonProps.push('disabled');

            const radius = element.borderRadius ?? 8;
            const sxProp = Number.isFinite(radius) ? ` sx={{ borderRadius: ${radius} }}` : '';

            const iconNameMap = {
                save: 'Save',
                send: 'Send',
                add: 'Add',
                delete: 'Delete',
                check: 'Check',
            };

            const startIconName = iconNameMap[element.startIcon];
            const endIconName = iconNameMap[element.endIcon];

            if (startIconName) iconImports.add(startIconName);
            if (endIconName) iconImports.add(endIconName);
            if (element.loading) {
                imports.add('CircularProgress');
            }

            const startIconProp = element.loading
                ? ' startIcon={<CircularProgress size={16} color="inherit" />}'
                : startIconName
                    ? ` startIcon={<${startIconName} fontSize="small" />}`
                    : '';

            const endIconProp = element.loading
                ? ''
                : endIconName
                    ? ` endIcon={<${endIconName} fontSize="small" />}`
                    : '';

            const disabledProp = shouldDisable ? ' disabled' : '';
            const sizeProps = buttonProps.length ? ` ${buttonProps.join(' ')}` : '';

            return wrap(
                `${indent(level + 1)}<Button${sizeProps}${startIconProp}${endIconProp}${sxProp}${disabledProp}>${escapePropValue(
                    element.label || 'Button'
                )}</Button>`
            );
        default:
            return '';
    }
};

const generateReactCode = (elements, formName, isTS = false) => {
    const imports = new Set(['Box']);
    const iconImports = new Set();
    const componentName = toComponentName(formName || 'Generated Form');
    const body = (elements || [])
        .map((el) => renderElementCode(el, imports, 2, iconImports))
        .filter(Boolean)
        .join('\n');

    const importList = Array.from(imports).sort();
    const iconImportList = Array.from(iconImports).sort();
    const reactImport = isTS ? "import React, { FC } from 'react';" : "import React from 'react';";
    const componentSignature = isTS ? `const ${componentName}: FC = () => (` : `const ${componentName} = () => (`;

    const iconImportLine = iconImportList.length ? `import { ${iconImportList.join(', ')} } from '@mui/icons-material';\n` : '';

    const code = `${reactImport}\nimport { ${importList.join(', ')} } from '@mui/material';\n${iconImportLine}\n${componentSignature}\n  <Box component="form" noValidate autoComplete="off" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>\n${
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
    const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false);
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

    const handleButtonPropertyChange = (key, value) => {
        if (!selectedElement || selectedElement.type !== 'button') return;
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

    const headerActions = (
        <>
            <Tooltip title="Name your form" arrow>
                <TextField
                    size="small"
                    variant="outlined"
                    label="Form name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    sx={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '6px' }}
                />
            </Tooltip>
            <Tooltip title="Open all saved forms" arrow>
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => navigate('/forms')}
                >
                    Forms
                </Button>
            </Tooltip>
            <Tooltip title="Save or update this form" arrow>
                <span>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveForm}
                        disabled={isSavingForm}
                    >
                        {isSavingForm ? 'Saving...' : currentFormId ? 'Update' : 'Save'}
                    </Button>
                </span>
            </Tooltip>
            <Tooltip title="Load a form from history" arrow>
                <span>
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
                </span>
            </Tooltip>
            <Tooltip title="Delete the current form" arrow>
                <span>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteForm}
                        disabled={!currentFormId || isDeletingForm}
                    >
                        {isDeletingForm ? 'Deleting...' : 'Delete'}
                    </Button>
                </span>
            </Tooltip>
            <Tooltip title="Clear all fields from the canvas" arrow>
                <span>
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
                </span>
            </Tooltip>
            <Tooltip title="Generate code for this form" arrow>
                <span>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleOpenCodeDialog}
                        disabled={isCodeGenerating}
                    >
                        {isCodeGenerating ? 'Generating...' : 'Code'}
                    </Button>
                </span>
            </Tooltip>
            <Tooltip title="Import a form definition" arrow>
                <Button variant="outlined" color="inherit" onClick={handleImport}>Import</Button>
            </Tooltip>
            <Tooltip title="Preview the rendered form" arrow>
                <Button variant="outlined" color="inherit" onClick={() => setIsPreviewOpen(true)}>Preview</Button>
            </Tooltip>
            <Tooltip title="Export this form as a file" arrow>
                <Button variant="contained" color="primary" className="export-button" onClick={handleExport}>Export</Button>
            </Tooltip>
        </>
    );

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
                    <div className="main-header__toggle">
                        <IconButton
                            color="inherit"
                            aria-label="Toggle actions menu"
                            onClick={() => setIsMobileActionsOpen((open) => !open)}
                            className="main-header__menu-toggle"
                            size="large"
                        >
                            {isMobileActionsOpen ? <CloseIcon /> : <MenuIcon />}
                        </IconButton>
                    </div>
                    <div className="main-header__actions main-header__actions--desktop">
                        {headerActions}
                    </div>
                </header>
                <Collapse in={isMobileActionsOpen} timeout="auto" unmountOnExit>
                    <div className="main-header__actions main-header__actions--mobile">
                        {headerActions}
                    </div>
                </Collapse>

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
                                onButtonPropertyChange={handleButtonPropertyChange}
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
                        <p className="main-footer__brand">FormCraft</p>
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
                                {forms.map((form) => {
                                    const formId = form.id || form._id;
                                    return (
                                        <Tooltip key={formId} title="Load this saved form" arrow placement="right">
                                            <ListItemButton onClick={() => handleLoadForm(formId)}>
                                                <ListItemText
                                                    primary={form.name || 'Untitled Form'}
                                                    secondary={form.fields?.length ? `${form.fields.length} fields` : '0 fields'}
                                                />
                                            </ListItemButton>
                                        </Tooltip>
                                    );
                                })}
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
