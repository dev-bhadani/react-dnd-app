import { create } from 'zustand';
import { findElementById, removeElementById, updateElementsById } from '../utils/treeOps';
import {
    getContainerItems,
    insertElementIntoContainer,
    removeElementFromContainer,
} from '../utils/containerOps';
import { createElement } from '../utils/elementFactory';
import { fieldsToElements, normalizeImportedElements } from '../utils/fieldMapping';

/**
 * Single source of truth for the form-builder.
 *
 * Components subscribe to *narrow* slices via selectors so unrelated state
 * changes don't cause re-renders. Anything that previously lived as
 * `useState` / `useCallback` plumbing in `App.js` lives here now.
 */
export const useBuilderStore = create((set, get) => ({
    // --- canvas state ---
    formElements: [],
    selectedElementId: null,
    isPropertiesPanelOpen: true,

    // --- form metadata ---
    currentFormId: null,
    formName: '',

    // --- generic setters ---
    setFormName: (name) => set({ formName: name }),
    setCurrentFormId: (id) => set({ currentFormId: id }),
    closeProperties: () => set({ isPropertiesPanelOpen: false }),

    // --- selection ---
    selectElement: (id) =>
        set((state) => {
            const normalized = id ? findElementById(state.formElements, id)?.id || null : null;
            return {
                selectedElementId: normalized,
                isPropertiesPanelOpen: normalized ? true : state.isPropertiesPanelOpen,
            };
        }),
    deselect: () => set({ selectedElementId: null, isPropertiesPanelOpen: false }),

    // --- mutations ---
    deleteElement: (id) =>
        set((state) => {
            const next = removeElementById(state.formElements, id);
            const nextSelected = state.selectedElementId
                ? findElementById(next, state.selectedElementId)?.id || null
                : null;
            return { formElements: next, selectedElementId: nextSelected };
        }),

    updateElement: (id, updater) =>
        set((state) => {
            if (!id) return {};
            const next = updateElementsById(state.formElements, id, updater);
            return { formElements: next };
        }),

    /** Update a property on the currently-selected element. */
    updateSelected: (key, value) => {
        const id = get().selectedElementId;
        if (!id) return;
        get().updateElement(id, (element) => ({ ...element, [key]: value }));
    },

    // --- options helpers (for radio / select) ---
    setOption: (index, value) =>
        get().updateElement(get().selectedElementId, (element) => {
            if (value === null) {
                return {
                    ...element,
                    options: element.options.filter((_, i) => i !== index),
                };
            }
            const options = [...(element.options || [])];
            options[index] = value;
            return { ...element, options };
        }),
    addOption: () =>
        get().updateElement(get().selectedElementId, (element) => {
            const options = element.options || [];
            return { ...element, options: [...options, `Option ${options.length + 1}`] };
        }),
    deleteOption: (index) =>
        get().updateElement(get().selectedElementId, (element) => ({
            ...element,
            options: element.options.filter((_, i) => i !== index),
        })),

    // --- checkbox helpers ---
    setCheckboxOption: (index, key, value) =>
        get().updateElement(get().selectedElementId, (element) => ({
            ...element,
            checkboxOptions: element.checkboxOptions.map((opt, i) =>
                i === index ? { ...opt, [key]: value } : opt
            ),
        })),
    addCheckboxOption: () =>
        get().updateElement(get().selectedElementId, (element) => {
            const opts = element.checkboxOptions || [];
            return {
                ...element,
                checkboxOptions: [...opts, { label: `Option ${opts.length + 1}`, checked: false }],
            };
        }),
    deleteCheckboxOption: (index) =>
        get().updateElement(get().selectedElementId, (element) => ({
            ...element,
            checkboxOptions: element.checkboxOptions.filter((_, i) => i !== index),
        })),

    // --- drag-and-drop ---
    handleDragEnd: (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeData = active.data?.current || {};
        const overData = over.data?.current || {};
        const targetContainerId =
            overData.containerId ||
            (typeof over.id === 'string' && over.id.includes('column')
                ? over.id
                : over.id === 'form-canvas'
                  ? 'root'
                  : 'root');

        // Palette → insert new element
        if (activeData.source === 'palette') {
            const newElement = createElement(active.id);
            set((state) => {
                const targetItems = getContainerItems(state.formElements, targetContainerId);
                const insertIndex = overData.index ?? targetItems.length;
                const next = insertElementIntoContainer(
                    state.formElements,
                    targetContainerId,
                    newElement,
                    insertIndex
                );
                return {
                    formElements: next,
                    selectedElementId: newElement.id,
                    isPropertiesPanelOpen: true,
                };
            });
            return;
        }

        // Existing element reorder/move
        if (activeData.source === 'canvas') {
            const fromContainerId = activeData.containerId || 'root';
            const activeIndex = activeData.index;
            const targetIndexRaw = overData.index;

            set((state) => {
                const { elements: withoutActive, removed } = removeElementFromContainer(
                    state.formElements,
                    fromContainerId,
                    active.id
                );
                if (!removed) return {};

                let insertIndex = targetIndexRaw;
                if (insertIndex === undefined) {
                    const targetItems = getContainerItems(withoutActive, targetContainerId);
                    insertIndex = targetItems.length;
                } else if (
                    fromContainerId === targetContainerId &&
                    activeIndex < targetIndexRaw
                ) {
                    insertIndex = Math.max(0, targetIndexRaw - 1);
                }

                const next = insertElementIntoContainer(
                    withoutActive,
                    targetContainerId,
                    removed,
                    insertIndex
                );
                return { formElements: next };
            });
        }
    },

    // --- bulk loaders ---
    loadFormFromBackend: ({ id, name, fields }) =>
        set({
            currentFormId: id,
            formName: name || '',
            formElements: fieldsToElements(fields || []),
            selectedElementId: null,
            isPropertiesPanelOpen: false,
        }),

    loadElementsFromImport: (parsedJson) => {
        if (!Array.isArray(parsedJson)) {
            throw new Error('Root JSON must be an array of elements');
        }
        set({
            formElements: normalizeImportedElements(parsedJson),
            selectedElementId: null,
            isPropertiesPanelOpen: false,
        });
    },

    clearCanvas: () =>
        set({
            formElements: [],
            selectedElementId: null,
            isPropertiesPanelOpen: false,
            currentFormId: null,
            formName: '',
        }),
}));

/** Convenience selector — derives the live selected element from the tree. */
export const useSelectedElement = () =>
    useBuilderStore((state) =>
        state.selectedElementId ? findElementById(state.formElements, state.selectedElementId) : null
    );

