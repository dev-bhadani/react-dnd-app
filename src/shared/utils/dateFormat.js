/**
 * Date-format helpers shared by canvas, preview, codegen, and the forms-list
 * page. Single source of truth so adding a new format only touches one file.
 */

export const formatDateValue = (dateStr, format) => {
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

export const dateFormatPattern = (format) => {
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

