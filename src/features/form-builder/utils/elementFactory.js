import { getColumnCount, layoutTypes } from './layout';

/**
 * Factory for new form elements. Encapsulates per-type defaults so the rest of
 * the codebase never has to remember which props belong to which type.
 */
export const createElement = (type) => {
    const element = { type, id: Date.now(), name: '' };

    switch (type) {
        case 'radio':
        case 'select':
            element.options = ['Option 1', 'Option 2'];
            if (type === 'radio') element.radioLayout = 'vertical';
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
            Object.assign(element, {
                label: 'Button',
                variant: 'contained',
                color: 'primary',
                disabled: false,
                size: 'medium',
                fullWidth: false,
                typeAttr: 'button',
                href: '',
                target: '_self',
                startIcon: 'none',
                endIcon: 'none',
                borderRadius: 8,
                disableElevation: false,
                loading: false,
            });
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
        const count = getColumnCount(type);
        element.columns = Array.from({ length: count }, () => []);
        // Layout-level visual properties – kept in sync with the schema rendered
        // in EditSidebar's "Layout" sections and consumed by ColumnRow + codegen.
        element.gap = 16;                                  // px between columns
        element.verticalAlign = 'stretch';                 // start | center | end | stretch
        element.columnRatios = Array.from({ length: count }, () => 1); // equal weights
        element.stackOnMobile = true;
        element.padding = 12;                              // inner padding of the row
        element.background = 'muted';                      // none | muted | accent
        element.border = 'dashed';                         // none | dashed | solid
    }

    return element;
};

