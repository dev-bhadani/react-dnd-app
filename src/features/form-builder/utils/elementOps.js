import { layoutTypes } from './layout';

/**
 * Recursively count every non-layout (i.e. real input/widget) element in the
 * tree. Used in the status bar.
 */
export const countFields = (elements) => {
    let count = 0;
    const walk = (nodes) => {
        nodes.forEach((node) => {
            if (layoutTypes.has(node.type)) {
                (node.columns || []).forEach((col) => walk(col || []));
            } else {
                count += 1;
            }
        });
    };
    walk(elements || []);
    return count;
};

/**
 * Deep-clone an element subtree, re-issuing fresh IDs so that pasting/
 * duplicating never collides with the original.
 */
export const cloneElement = (element, idCounter = { v: Date.now() }) => {
    const next = { ...element, id: ++idCounter.v };
    if (Array.isArray(element.columns)) {
        next.columns = element.columns.map((col) =>
            (col || []).map((child) => cloneElement(child, idCounter))
        );
    }
    if (Array.isArray(element.options)) next.options = [...element.options];
    if (Array.isArray(element.checkboxOptions)) {
        next.checkboxOptions = element.checkboxOptions.map((opt) => ({ ...opt }));
    }
    return next;
};

