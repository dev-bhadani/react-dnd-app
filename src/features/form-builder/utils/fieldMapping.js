import { createElement } from './elementFactory';
import { layoutTypes } from './layout';

/**
 * Conversions between the rich element-tree used by the builder and the
 * flat `field[]` payload stored in the backend. Layout containers are
 * flattened on save (their children become siblings), and rebuilt on load.
 */

export const elementToField = (element) => {
    if (!element || layoutTypes.has(element.type)) return null;

    const label = element.name || element.label || '';
    const field = { type: element.type, label };

    if (element.type === 'text' || element.type === 'email') {
        field.placeholder = element.placeholder || '';
    }

    if (element.type === 'phone') {
        field.placeholder = element.placeholder || '';
        field.pattern = element.pattern || '';
    }

    if (element.type === 'textarea') {
        field.placeholder = element.placeholder || '';
        field.rows = element.rows ?? 4;
    }

    if (element.type === 'number') {
        field.placeholder = element.placeholder || '';
        field.min = element.min ?? 0;
        field.max = element.max ?? 100;
        field.step = element.step ?? 1;
    }

    if (element.type === 'toggle') {
        field.onLabel = element.onLabel || '';
        field.offLabel = element.offLabel || '';
        field.checked = !!element.checked;
    }

    if (element.type === 'file') {
        field.accept = element.accept || '';
        field.multiple = !!element.multiple;
    }

    if (element.type === 'divider') {
        field.label = element.label || element.name || '';
    }

    if (element.type === 'date') {
        field.defaultDate = element.defaultDate || '';
        field.minDate = element.minDate || '';
        field.maxDate = element.maxDate || '';
        field.dateFormat = element.dateFormat || '';
    }

    if (element.type === 'button') {
        Object.assign(field, {
            variant: element.variant || 'contained',
            color: element.color || 'primary',
            disabled: !!element.disabled,
            size: element.size || 'medium',
            fullWidth: !!element.fullWidth,
            typeAttr: element.typeAttr || 'button',
            href: element.href || '',
            target: element.target || '_self',
            startIcon: element.startIcon || 'none',
            endIcon: element.endIcon || 'none',
            borderRadius: element.borderRadius ?? 8,
            disableElevation: !!element.disableElevation,
            loading: !!element.loading,
        });
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
        if (element.type === 'radio') field.radioLayout = element.radioLayout || 'vertical';
    }

    if (element.type === 'checkbox') {
        field.options = (element.checkboxOptions || []).map((opt) => opt.label);
        field.checkboxLayout = element.checkboxLayout || 'vertical';
    }

    return field;
};

export const flattenElementsToFields = (elements) => {
    const fields = [];
    const walk = (nodes) => {
        nodes.forEach((node) => {
            if (layoutTypes.has(node.type) && Array.isArray(node.columns)) {
                node.columns.forEach((col) => walk(col || []));
                return;
            }
            const field = elementToField(node);
            if (field) fields.push(field);
        });
    };
    walk(elements || []);
    return fields;
};

export const fieldsToElements = (fields) => {
    if (!Array.isArray(fields)) return [];

    return fields.map((field, index) => {
        const base = createElement(field.type);
        const idSeed = Date.now() + index;
        const name = field.label || field.name || '';
        const options = Array.isArray(field.options) ? field.options : [];

        if (field.type === 'select' || field.type === 'radio') {
            const rebuilt = {
                ...base,
                id: idSeed,
                name,
                options: options.length ? options : base.options || [],
            };
            if (field.type === 'radio') rebuilt.radioLayout = field.radioLayout ?? base.radioLayout;
            return rebuilt;
        }
        if (field.type === 'checkbox') {
            const checkboxOptions = options.length
                ? options.map((label) => ({ label, checked: false }))
                : base.checkboxOptions || [];
            return {
                ...base,
                id: idSeed,
                name,
                checkboxOptions,
                checkboxLayout: field.checkboxLayout ?? base.checkboxLayout,
            };
        }
        if (field.type === 'text' || field.type === 'email') {
            return { ...base, id: idSeed, name, placeholder: field.placeholder ?? base.placeholder };
        }
        if (field.type === 'textarea') {
            return {
                ...base,
                id: idSeed,
                name,
                placeholder: field.placeholder ?? base.placeholder,
                rows: field.rows ?? base.rows,
            };
        }
        if (field.type === 'number') {
            return {
                ...base,
                id: idSeed,
                name,
                placeholder: field.placeholder ?? base.placeholder,
                min: field.min ?? base.min,
                max: field.max ?? base.max,
                step: field.step ?? base.step,
            };
        }
        if (field.type === 'toggle') {
            return {
                ...base,
                id: idSeed,
                name,
                onLabel: field.onLabel || base.onLabel,
                offLabel: field.offLabel || base.offLabel,
                checked: field.checked ?? base.checked,
            };
        }
        if (field.type === 'file') {
            return {
                ...base,
                id: idSeed,
                name,
                accept: field.accept ?? base.accept,
                multiple: field.multiple ?? base.multiple,
            };
        }
        if (field.type === 'divider') {
            return { ...base, id: idSeed, name, label: field.label || base.label };
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

/** Used when importing user-pasted JSON: ensures column shape is normalized. */
export const normalizeImportedElements = (elements) => {
    const normalize = (element) => {
        if (layoutTypes.has(element.type)) {
            const columns = Array.from(
                { length: (element.columns || []).length || 0 },
                (_, idx) => {
                    const existing = element.columns?.[idx];
                    return Array.isArray(existing) ? existing.map(normalize) : [];
                }
            );
            return { ...element, columns };
        }
        return element;
    };
    return (elements || []).map(normalize);
};

