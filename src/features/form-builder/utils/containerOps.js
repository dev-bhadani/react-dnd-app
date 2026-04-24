import { getColumnCount } from './layout';

/**
 * Drag-and-drop container math.
 *
 * Containers are addressed with stable string IDs:
 *   - `'root'`              → the canvas root
 *   - `'<rowId>-column-<i>'` → column `i` of the layout-row with `rowId`
 *
 * These pure functions keep the DnD reducer easy to reason about.
 */

export const parseColumnContainerId = (containerId) => {
    if (!containerId || containerId === 'root') return { type: 'root' };
    const match = String(containerId).match(/^(\d+)-column-(\d+)$/);
    if (!match) return null;
    return { type: 'column', rowId: Number(match[1]), columnIndex: Number(match[2]) };
};

export const getContainerItems = (elements, containerId) => {
    const parsed = parseColumnContainerId(containerId);
    if (!parsed || parsed.type === 'root') return elements;
    const { rowId, columnIndex } = parsed;
    const row = elements.find((el) => el.id === rowId);
    if (!row) return [];
    const columns = Array.from(
        { length: getColumnCount(row.type) },
        (_, idx) => row.columns?.[idx] || []
    );
    return columns[columnIndex] || [];
};

export const removeElementFromContainer = (elements, containerId, elementId) => {
    const parsed = parseColumnContainerId(containerId);
    if (!parsed) return { elements, removed: null };

    if (parsed.type === 'root') {
        const idx = elements.findIndex((el) => el.id === elementId);
        if (idx === -1) return { elements, removed: null };
        const removed = elements[idx];
        const next = [...elements];
        next.splice(idx, 1);
        return { elements: next, removed };
    }

    let removed = null;
    const { rowId, columnIndex } = parsed;
    const next = elements.map((el) => {
        if (el.id !== rowId) return el;
        const columns = Array.from(
            { length: getColumnCount(el.type) },
            (_, idx) => el.columns?.[idx] || []
        );
        const columnItems = columns[columnIndex] || [];
        const idx = columnItems.findIndex((item) => item.id === elementId);
        if (idx === -1) return el;
        removed = columnItems[idx];
        const updatedColumn = [...columnItems];
        updatedColumn.splice(idx, 1);
        const nextColumns = columns.map((col, i) => (i === columnIndex ? updatedColumn : col));
        return { ...el, columns: nextColumns };
    });

    return { elements: next, removed };
};

export const insertElementIntoContainer = (elements, containerId, element, index) => {
    const parsed = parseColumnContainerId(containerId);
    if (!parsed) return elements;

    if (parsed.type === 'root') {
        const next = [...elements];
        const targetIndex = Math.max(0, Math.min(index ?? next.length, next.length));
        next.splice(targetIndex, 0, element);
        return next;
    }

    const { rowId, columnIndex } = parsed;
    return elements.map((el) => {
        if (el.id !== rowId) return el;
        const columns = Array.from(
            { length: getColumnCount(el.type) },
            (_, idx) => el.columns?.[idx] || []
        );
        const targetColumn = columns[columnIndex] || [];
        const targetIndex = Math.max(0, Math.min(index ?? targetColumn.length, targetColumn.length));
        const updatedColumn = [...targetColumn];
        updatedColumn.splice(targetIndex, 0, element);
        const nextColumns = columns.map((col, i) => (i === columnIndex ? updatedColumn : col));
        return { ...el, columns: nextColumns };
    });
};

