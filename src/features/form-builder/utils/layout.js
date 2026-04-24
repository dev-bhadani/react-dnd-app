/**
 * Layout primitives shared across the form-builder.
 *
 * `layoutTypes` are container elements that hold child fields inside columns.
 * Keeping them in one place prevents the magic strings from drifting across
 * codegen, preview, drag-and-drop, and validation logic.
 */
export const layoutTypes = new Set(['twoColumnRow', 'threeColumnRow', 'fourColumnRow']);

export const getColumnCount = (type) => {
    if (type === 'twoColumnRow') return 2;
    if (type === 'threeColumnRow') return 3;
    if (type === 'fourColumnRow') return 4;
    return 0;
};

export const isLayoutType = (type) => layoutTypes.has(type);

