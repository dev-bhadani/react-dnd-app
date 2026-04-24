import { create } from 'zustand';
import {
    findElementById,
    locateElement,
    removeElementById,
    updateElementsById,
} from '../utils/treeOps';
import {
    getContainerItems,
    insertElementIntoContainer,
    removeElementFromContainer,
} from '../utils/containerOps';
import { createElement } from '../utils/elementFactory';
import { fieldsToElements, normalizeImportedElements } from '../utils/fieldMapping';
import { cloneElement } from '../utils/elementOps';

const HISTORY_LIMIT = 50;
const DRAFT_STORAGE_KEY = 'formcraft.draft.v1';

/**
 * Single source of truth for the form-builder.
 *
 * History model: every mutation routes through `withHistory`, which snapshots
 * the previous tree onto `past` and clears `future`. `undo` / `redo` shuffle
 * snapshots between the two stacks. The history is capped at HISTORY_LIMIT.
 */
export const useBuilderStore = create((set, get) => {
    const withHistory = (updater) => {
        set((state) => {
            const prev = state.formElements;
            const next = typeof updater === 'function' ? updater(state) : updater;
            if (!next) return {};
            if (next.formElements === undefined || next.formElements === prev) return next;
            const past = state.past.concat([prev]).slice(-HISTORY_LIMIT);
            return { ...next, past, future: [] };
        });
    };

    return {
        // ---------- canvas state ----------
        formElements: [],
        past: [],
        future: [],
        selectedElementId: null,
        isPropertiesPanelOpen: true,

        // ---------- form metadata ----------
        currentFormId: null,
        formName: '',
        lastSavedAt: null,
        lastEditedAt: null,
        isDirty: false,

        // ---------- ui prefs ----------
        themeMode:
            typeof window !== 'undefined' && localStorage.getItem('formcraft.theme') === 'dark'
                ? 'dark'
                : 'light',
        breakpoint: 'desktop', // 'desktop' | 'tablet' | 'mobile'

        // ---------- generic setters ----------
        setFormName: (name) => set({ formName: name, isDirty: true, lastEditedAt: Date.now() }),
        setCurrentFormId: (id) => set({ currentFormId: id }),
        closeProperties: () => set({ isPropertiesPanelOpen: false }),
        markSaved: () => set({ lastSavedAt: Date.now(), isDirty: false }),
        setBreakpoint: (bp) => set({ breakpoint: bp }),
        setThemeMode: (mode) => {
            if (typeof window !== 'undefined') localStorage.setItem('formcraft.theme', mode);
            set({ themeMode: mode });
        },

        // ---------- selection ----------
        selectElement: (id) =>
            set((state) => {
                const normalized = id ? findElementById(state.formElements, id)?.id || null : null;
                return {
                    selectedElementId: normalized,
                    isPropertiesPanelOpen: normalized ? true : state.isPropertiesPanelOpen,
                };
            }),
        deselect: () => set({ selectedElementId: null, isPropertiesPanelOpen: false }),

        // ---------- mutations ----------
        deleteElement: (id) =>
            withHistory((state) => {
                const next = removeElementById(state.formElements, id);
                if (next === state.formElements) return null;
                const nextSelected = state.selectedElementId
                    ? findElementById(next, state.selectedElementId)?.id || null
                    : null;
                return {
                    formElements: next,
                    selectedElementId: nextSelected,
                    lastEditedAt: Date.now(),
                    isDirty: true,
                };
            }),

        duplicateElement: (id) => {
            const state = get();
            const element = findElementById(state.formElements, id);
            if (!element) return;
            const location = locateElement(state.formElements, id);
            if (!location) return;
            const clone = cloneElement(element);
            withHistory((s) => ({
                formElements: insertElementIntoContainer(
                    s.formElements,
                    location.containerId,
                    clone,
                    location.index + 1
                ),
                selectedElementId: clone.id,
                isPropertiesPanelOpen: true,
                lastEditedAt: Date.now(),
                isDirty: true,
            }));
        },

        updateElement: (id, updater) =>
            withHistory((state) => {
                if (!id) return null;
                const next = updateElementsById(state.formElements, id, updater);
                if (next === state.formElements) return null;
                return { formElements: next, lastEditedAt: Date.now(), isDirty: true };
            }),

        updateSelected: (key, value) => {
            const id = get().selectedElementId;
            if (!id) return;
            get().updateElement(id, (element) => ({ ...element, [key]: value }));
        },

        // ---------- options helpers ----------
        setOption: (index, value) =>
            get().updateElement(get().selectedElementId, (element) => {
                if (value === null) {
                    return { ...element, options: element.options.filter((_, i) => i !== index) };
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
                    checkboxOptions: [
                        ...opts,
                        { label: `Option ${opts.length + 1}`, checked: false },
                    ],
                };
            }),
        deleteCheckboxOption: (index) =>
            get().updateElement(get().selectedElementId, (element) => ({
                ...element,
                checkboxOptions: element.checkboxOptions.filter((_, i) => i !== index),
            })),

        // ---------- drag-and-drop ----------
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

            if (activeData.source === 'palette') {
                const newElement = createElement(active.id);
                withHistory((state) => {
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
                        lastEditedAt: Date.now(),
                        isDirty: true,
                    };
                });
                return;
            }

            if (activeData.source === 'canvas') {
                const fromContainerId = activeData.containerId || 'root';
                const activeIndex = activeData.index;
                const targetIndexRaw = overData.index;

                withHistory((state) => {
                    const { elements: withoutActive, removed } = removeElementFromContainer(
                        state.formElements,
                        fromContainerId,
                        active.id
                    );
                    if (!removed) return null;

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
                    return { formElements: next, lastEditedAt: Date.now(), isDirty: true };
                });
            }
        },

        // ---------- bulk loaders ----------
        loadFormFromBackend: ({ id, name, fields }) =>
            set({
                currentFormId: id,
                formName: name || '',
                formElements: fieldsToElements(fields || []),
                selectedElementId: null,
                isPropertiesPanelOpen: false,
                past: [],
                future: [],
                isDirty: false,
                lastSavedAt: Date.now(),
                lastEditedAt: Date.now(),
            }),

        loadElementsFromImport: (parsedJson) => {
            if (!Array.isArray(parsedJson)) {
                throw new Error('Root JSON must be an array of elements');
            }
            withHistory(() => ({
                formElements: normalizeImportedElements(parsedJson),
                selectedElementId: null,
                isPropertiesPanelOpen: false,
                lastEditedAt: Date.now(),
                isDirty: true,
            }));
        },

        loadTemplate: (template) =>
            withHistory((state) => ({
                formElements: template.elements || [],
                selectedElementId: null,
                isPropertiesPanelOpen: false,
                formName: state.formName || template.name,
                currentFormId: null,
                lastEditedAt: Date.now(),
                isDirty: true,
            })),

        clearCanvas: () =>
            withHistory(() => ({
                formElements: [],
                selectedElementId: null,
                isPropertiesPanelOpen: false,
                currentFormId: null,
                formName: '',
                lastEditedAt: Date.now(),
                isDirty: false,
            })),

        // ---------- history ----------
        undo: () =>
            set((state) => {
                if (state.past.length === 0) return {};
                const previous = state.past[state.past.length - 1];
                const past = state.past.slice(0, -1);
                const future = [state.formElements, ...state.future].slice(0, HISTORY_LIMIT);
                return {
                    formElements: previous,
                    past,
                    future,
                    selectedElementId: state.selectedElementId
                        ? findElementById(previous, state.selectedElementId)?.id || null
                        : null,
                    isDirty: true,
                    lastEditedAt: Date.now(),
                };
            }),
        redo: () =>
            set((state) => {
                if (state.future.length === 0) return {};
                const [next, ...rest] = state.future;
                const past = state.past.concat([state.formElements]).slice(-HISTORY_LIMIT);
                return {
                    formElements: next,
                    past,
                    future: rest,
                    selectedElementId: state.selectedElementId
                        ? findElementById(next, state.selectedElementId)?.id || null
                        : null,
                    isDirty: true,
                    lastEditedAt: Date.now(),
                };
            }),

        // ---------- draft persistence ----------
        loadDraft: () => {
            if (typeof window === 'undefined') return null;
            try {
                const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
                if (!raw) return null;
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed.formElements)) return null;
                return parsed;
            } catch {
                return null;
            }
        },
        applyDraft: (draft) =>
            set({
                formElements: draft.formElements || [],
                formName: draft.formName || '',
                currentFormId: draft.currentFormId || null,
                selectedElementId: null,
                isPropertiesPanelOpen: false,
                past: [],
                future: [],
                isDirty: !!draft.isDirty,
                lastEditedAt: draft.lastEditedAt || null,
                lastSavedAt: draft.lastSavedAt || null,
            }),
        clearDraft: () => {
            if (typeof window !== 'undefined') localStorage.removeItem(DRAFT_STORAGE_KEY);
        },
        persistDraft: () => {
            if (typeof window === 'undefined') return;
            const { formElements, formName, currentFormId, isDirty, lastEditedAt, lastSavedAt } = get();
            try {
                localStorage.setItem(
                    DRAFT_STORAGE_KEY,
                    JSON.stringify({
                        formElements,
                        formName,
                        currentFormId,
                        isDirty,
                        lastEditedAt,
                        lastSavedAt,
                    })
                );
            } catch {
                /* quota exceeded — ignore */
            }
        },
    };
});

/** Convenience selector — derives the live selected element from the tree. */
export const useSelectedElement = () =>
    useBuilderStore((state) =>
        state.selectedElementId ? findElementById(state.formElements, state.selectedElementId) : null
    );

