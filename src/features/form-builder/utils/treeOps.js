/**
 * Recursive tree operations on the form-builder element tree.
 *
 * The tree is `Element[]`, where layout-type elements may contain
 * `columns: Element[][]`. Every helper here returns a *new* tree when changes
 * occur (structural sharing for unchanged branches) so React/Zustand can do
 * cheap reference-equality re-render checks.
 */

export const findElementById = (elements, id) => {
    for (const element of elements) {
        if (element.id === id) return element;

        if (Array.isArray(element.columns)) {
            for (const column of element.columns) {
                if (!Array.isArray(column)) continue;
                const match = findElementById(column, id);
                if (match) return match;
            }
        }
    }
    return null;
};

export const updateElementsById = (elements, id, updater) => {
    let didChange = false;

    const updated = elements.map((element) => {
        if (element.id === id) {
            didChange = true;
            return updater(element);
        }

        if (Array.isArray(element.columns) && element.columns.length > 0) {
            let columnsChanged = false;
            const nextColumns = element.columns.map((column) => {
                if (!Array.isArray(column) || column.length === 0) return column;
                const updatedColumn = updateElementsById(column, id, updater);
                if (updatedColumn !== column) columnsChanged = true;
                return updatedColumn;
            });

            if (columnsChanged) {
                didChange = true;
                return { ...element, columns: nextColumns };
            }
        }

        return element;
    });

    return didChange ? updated : elements;
};

export const removeElementById = (elements, id) => {
    let didChange = false;

    const filtered = elements
        .map((element) => {
            if (element.id === id) {
                didChange = true;
                return null;
            }

            if (Array.isArray(element.columns) && element.columns.length > 0) {
                const nextColumns = element.columns.map((column) => {
                    if (!Array.isArray(column) || column.length === 0) return column;
                    const result = removeElementById(column, id);
                    if (result !== column) didChange = true;
                    return result;
                });

                if (didChange) return { ...element, columns: nextColumns };
            }

            return element;
        })
        .filter(Boolean);

    return didChange ? filtered : elements;
};

