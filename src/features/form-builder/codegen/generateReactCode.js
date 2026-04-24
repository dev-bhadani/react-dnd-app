import { getColumnCount } from '../utils/layout';
import { formatDateValue, dateFormatPattern } from '../../../shared/utils/dateFormat';

const escapePropValue = (value) => {
    if (value === undefined || value === null) return '';
    return String(value).replace(/"/g, '\\"');
};

const indent = (level) => '  '.repeat(level);

/**
 * Render one form element to its MUI/JSX equivalent string.
 * Mutates `imports`, `iconImports`, and `gridImports` Sets so the caller knows
 * which packages to add to the final import block.
 */
export const renderElementCode = (
    element,
    imports,
    level = 2,
    iconImports = new Set(),
    gridImports = new Set()
) => {
    if (!element) return '';

    const label = escapePropValue(element.name || element.label || 'Field');
    const wrap = (content) => `${indent(level)}<Box mb={2}>\n${content}\n${indent(level)}</Box>`;

    switch (element.type) {
        case 'twoColumnRow':
        case 'threeColumnRow':
        case 'fourColumnRow': {
            gridImports.add('Grid');
            const columnCount = getColumnCount(element.type) || 1;
            const normalizedColumns = Array.from(
                { length: columnCount },
                (_, idx) => element.columns?.[idx] || []
            );

            // Convert custom column ratios → 12-column MUI spans. Falls back to
            // equal spans when ratios aren't provided or don't match the count.
            const ratios =
                Array.isArray(element.columnRatios) && element.columnRatios.length === columnCount
                    ? element.columnRatios.map((r) => Math.max(0.1, Number(r) || 1))
                    : Array.from({ length: columnCount }, () => 1);
            const ratioSum = ratios.reduce((sum, r) => sum + r, 0) || columnCount;
            const spans = ratios.map((r) => Math.max(1, Math.round((r / ratioSum) * 12)));

            // Translate px gap → MUI spacing units (8px scale). Default 16px → 2.
            const gapPx = Number.isFinite(element.gap) ? element.gap : 16;
            const spacing = Math.max(0, Math.round(gapPx / 8));

            const alignMap = {
                start: 'flex-start',
                center: 'center',
                end: 'flex-end',
                stretch: 'stretch',
            };
            const alignItems = alignMap[element.verticalAlign] || 'stretch';
            const alignProp =
                alignItems !== 'stretch' ? ` alignItems="${alignItems}"` : '';

            const childrenCode = normalizedColumns
                .map((col, colIdx) => {
                    const inner = (col || [])
                        .map((child) => renderElementCode(child, imports, level + 2, iconImports))
                        .filter(Boolean)
                        .join('\n');
                    const body = inner || `${indent(level + 3)}{/* Add a field here */}`;
                    const mdSpan = spans[colIdx] || Math.max(1, Math.floor(12 / columnCount));
                    return (
                        `${indent(level + 1)}<Grid xs={12} md={${mdSpan}}>` +
                        `\n${body}\n${indent(level + 1)}</Grid>`
                    );
                })
                .join('\n');

            return `${indent(level)}<Grid container spacing={${spacing}}${alignProp}>\n${childrenCode}\n${indent(level)}</Grid>`;
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
        case 'phone': {
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
        }
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
                `${indent(level + 1)}<FormGroup row={${element.checkboxLayout === 'horizontal' ? 'true' : 'false'}}>\n${rows}\n${indent(level + 1)}</FormGroup>`
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
                .map(
                    (opt, idx) =>
                        `${indent(level + 2)}<MenuItem value="${escapePropValue(opt)}">${escapePropValue(opt || `Option ${idx + 1}`)}</MenuItem>`
                )
                .join('\n');
            return wrap(
                `${indent(level + 1)}<TextField select fullWidth label="${label || 'Select'}" defaultValue="${escapePropValue(
                    options[0] || ''
                )}">\n${menuItems}\n${indent(level + 1)}</TextField>`
            );
        }
        case 'date': {
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
            const defaultDateValue = isIso ? element.defaultDate : formatDateValue(element.defaultDate, format);
            const defaultDate = defaultDateValue ? ` defaultValue="${escapePropValue(defaultDateValue)}"` : '';
            const typeProp = isIso ? 'date' : 'text';
            const placeholder = format ? ` placeholder="${escapePropValue(format)}"` : '';
            const rangeHint = [
                formattedMin ? `Min ${escapePropValue(formattedMin)}` : '',
                formattedMax ? `Max ${escapePropValue(formattedMax)}` : '',
            ]
                .filter(Boolean)
                .join(' · ');
            const helper = rangeHint ? ` helperText="${rangeHint}"` : '';
            return wrap(
                `${indent(level + 1)}<TextField fullWidth type="${typeProp}" label="${label || 'Date'}"${placeholder}${defaultDate}${inputProps}${helper} InputLabelProps={{ shrink: true }} />`
            );
        }
        case 'rating': {
            imports.add('Rating');
            imports.add('Box');
            const ratingPrecision = element.precision ?? 0.5;
            const ratingMax = element.max ?? 5;
            const ratingDefault = element.defaultValue ?? 0;
            return wrap(
                `${indent(level + 1)}<Rating name="rating-${element.id}" defaultValue={${ratingDefault}} precision={${ratingPrecision}} max={${ratingMax}} />`
            );
        }
        case 'slider': {
            imports.add('Slider');
            imports.add('Box');
            const sliderMin = element.min ?? 0;
            const sliderMax = element.max ?? 100;
            const sliderStep = element.step ?? 1;
            const sliderDefault = element.defaultValue ?? sliderMin;
            return wrap(
                `${indent(level + 1)}<Slider defaultValue={${sliderDefault}} min={${sliderMin}} max={${sliderMax}} step={${sliderStep}} aria-label="${label || 'Slider'}" />`
            );
        }
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
                return wrap(
                    `${indent(level + 1)}<Divider textAlign="left">${escapePropValue(element.label)}</Divider>`
                );
            }
            return wrap(`${indent(level + 1)}<Divider />`);
        case 'button': {
            imports.add('Button');
            imports.add('Box');
            const buttonProps = [];
            buttonProps.push(`variant="${element.variant || 'contained'}"`);
            buttonProps.push(`color="${element.color || 'primary'}"`);
            if (element.size && element.size !== 'medium') buttonProps.push(`size="${element.size}"`);
            if (element.fullWidth) buttonProps.push('fullWidth');
            if (element.typeAttr && element.typeAttr !== 'button')
                buttonProps.push(`type="${element.typeAttr}"`);
            if (element.href) {
                buttonProps.push(`href="${escapePropValue(element.href)}"`);
                if (element.target) buttonProps.push(`target="${escapePropValue(element.target)}"`);
            }
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
            if (element.loading) imports.add('CircularProgress');

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
        }
        default:
            return '';
    }
};

const toComponentName = (value) => {
    const cleaned = (value || 'Generated Form').replace(/[^a-zA-Z0-9]+/g, ' ');
    const parts = cleaned
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1));
    const name = parts.join('') || 'GeneratedForm';
    return /^[A-Za-z]/.test(name) ? name : `Form${name}`;
};

export const generateReactCode = (elements, formName, isTS = false) => {
    const imports = new Set(['Box']);
    const iconImports = new Set();
    const gridImports = new Set();
    const componentName = toComponentName(formName || 'Generated Form');

    const body = (elements || [])
        .map((el) => renderElementCode(el, imports, 2, iconImports, gridImports))
        .filter(Boolean)
        .join('\n');

    const importList = Array.from(imports).sort().filter((item) => item !== 'Grid');
    const iconImportList = Array.from(iconImports).sort();
    const gridImportList = Array.from(gridImports).sort();
    const reactImport = isTS ? "import React, { FC } from 'react';" : "import React from 'react';";
    const componentSignature = isTS
        ? `const ${componentName}: FC = () => (`
        : `const ${componentName} = () => (`;

    const iconImportLine = iconImportList.length
        ? `${iconImportList.map((name) => `import ${name} from '@mui/icons-material/${name}';`).join('\n')}\n`
        : '';
    const gridImportLine = gridImportList.length ? `import Grid from '@mui/material/Grid2';\n` : '';

    const code =
        `${reactImport}\n` +
        `import { ${importList.join(', ')} } from '@mui/material';\n` +
        `${gridImportLine}${iconImportLine}\n` +
        `${componentSignature}\n` +
        `  <Box component="form" noValidate autoComplete="off" sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>\n` +
        `${body ? `${body}\n` : '    {/* Add form fields here */}\n'}` +
        `  </Box>\n` +
        `);\n\n` +
        `export default ${componentName};\n`;

    return { code, componentName };
};

