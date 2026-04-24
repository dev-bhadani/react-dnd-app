import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Box, Button, CircularProgress, Snackbar } from '@mui/material';

import Sidebar from './Sidebar';
import DroppableArea from './DroppableArea';
import EditSidebar from './EditSidebar';
import BuilderHeader from './BuilderHeader';
import StatusBar from './StatusBar';
import CanvasElementPreview from './CanvasElementPreview';

import { useBuilderStore, useSelectedElement } from '../state/builderStore';
import { findElementById } from '../utils/treeOps';
import { flattenElementsToFields } from '../utils/fieldMapping';
import { listForms, getForm, createForm, updateForm, deleteForm } from '../../../shared/api/forms';
import { useToasts } from '../../../shared/ui/Toasts';
import { useKeyboardShortcuts } from '../../../shared/hooks/useKeyboardShortcuts';
import { useAutoSave } from '../../../shared/hooks/useAutoSave';

// Heavy + rarely-used UI is code-split.
const FormPreview = lazy(() => import('./FormPreview'));
const CodeDialog = lazy(() => import('../dialogs/CodeDialog'));
const ExportDialog = lazy(() => import('../dialogs/ExportDialog'));
const ImportDialog = lazy(() => import('../dialogs/ImportDialog'));
const LoadFormDialog = lazy(() => import('../dialogs/LoadFormDialog'));
const TemplatesDialog = lazy(() => import('../dialogs/TemplatesDialog'));
const ShortcutsDialog = lazy(() => import('../dialogs/ShortcutsDialog'));

const BREAKPOINT_PX = { desktop: null, tablet: 768, mobile: 420 };

/**
 * The composed builder page. Owns: routing side-effects, REST calls, toasts,
 * keyboard shortcuts, auto-save, draft persistence, and dialog orchestration.
 *
 * The canvas itself is fully driven by the Zustand store, so this file stays
 * focused on coordination instead of presentation.
 */
export default function BuilderApp() {
    const navigate = useNavigate();
    const location = useLocation();
    const toasts = useToasts();

    // Store wiring
    const handleDragEnd = useBuilderStore((s) => s.handleDragEnd);
    const formName = useBuilderStore((s) => s.formName);
    const formElements = useBuilderStore((s) => s.formElements);
    const currentFormId = useBuilderStore((s) => s.currentFormId);
    const setCurrentFormId = useBuilderStore((s) => s.setCurrentFormId);
    const isPropertiesPanelOpen = useBuilderStore((s) => s.isPropertiesPanelOpen);
    const loadFormFromBackend = useBuilderStore((s) => s.loadFormFromBackend);
    const loadTemplate = useBuilderStore((s) => s.loadTemplate);
    const clearCanvas = useBuilderStore((s) => s.clearCanvas);
    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const deleteElement = useBuilderStore((s) => s.deleteElement);
    const duplicateElement = useBuilderStore((s) => s.duplicateElement);
    const deselect = useBuilderStore((s) => s.deselect);
    const markSaved = useBuilderStore((s) => s.markSaved);
    const breakpoint = useBuilderStore((s) => s.breakpoint);
    const isDirty = useBuilderStore((s) => s.isDirty);
    const lastEditedAt = useBuilderStore((s) => s.lastEditedAt);
    const persistDraft = useBuilderStore((s) => s.persistDraft);
    const loadDraft = useBuilderStore((s) => s.loadDraft);
    const applyDraft = useBuilderStore((s) => s.applyDraft);
    const clearDraft = useBuilderStore((s) => s.clearDraft);
    const selectedElement = useSelectedElement();

    // Local UI / async state
    const [savedForms, setSavedForms] = useState([]);
    const [isLoadingForms, setIsLoadingForms] = useState(false);
    const [isSavingForm, setIsSavingForm] = useState(false);
    const [isDeletingForm, setIsDeletingForm] = useState(false);
    const [isAutoSaving, setIsAutoSaving] = useState(false);
    const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
    const [activeDragId, setActiveDragId] = useState(null);
    const [restoreSnack, setRestoreSnack] = useState(null);

    // Dialog open flags
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [isCodeOpen, setCodeOpen] = useState(false);
    const [isExportOpen, setExportOpen] = useState(false);
    const [isImportOpen, setImportOpen] = useState(false);
    const [isLoadOpen, setLoadOpen] = useState(false);
    const [isTemplatesOpen, setTemplatesOpen] = useState(false);
    const [isShortcutsOpen, setShortcutsOpen] = useState(false);

    /* ---------------------------------------------------------------- DnD */

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const activeDragElement = useMemo(() => {
        if (activeDragId === null) return null;
        return findElementById(formElements, activeDragId);
    }, [activeDragId, formElements]);

    const handleDndEnd = (event) => {
        setActiveDragId(null);
        handleDragEnd(event);
    };

    /* ----------------------------------------------------- Online status */

    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    /* ---------------------------------------------------- Forms list API */

    const refreshFormsList = useCallback(async () => {
        setIsLoadingForms(true);
        try {
            const data = await listForms();
            setSavedForms(Array.isArray(data) ? data : []);
        } catch (err) {
            toasts.error(err.message || 'Failed to load forms');
        } finally {
            setIsLoadingForms(false);
        }
    }, [toasts]);

    const handleLoadForm = useCallback(
        async (id) => {
            if (!id) return;
            setIsLoadingForms(true);
            try {
                const form = await getForm(id);
                loadFormFromBackend({ id: form.id || id, name: form.name, fields: form.fields });
                setLoadOpen(false);
                toasts.success(`Loaded “${form.name || 'form'}”`);
            } catch (err) {
                toasts.error(err.message || 'Failed to load form');
            } finally {
                setIsLoadingForms(false);
            }
        },
        [loadFormFromBackend, toasts]
    );

    useEffect(() => {
        refreshFormsList();
    }, [refreshFormsList]);

    // `?formId=…` deep links from FormsPage
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const formIdParam = params.get('formId');
        if (formIdParam && formIdParam !== currentFormId) {
            handleLoadForm(formIdParam);
        }
    }, [location.search, currentFormId, handleLoadForm]);

    /* -------------------------------------------------- Draft restore once */

    useEffect(() => {
        const draft = loadDraft();
        if (draft && Array.isArray(draft.formElements) && draft.formElements.length > 0 && draft.isDirty) {
            setRestoreSnack(draft);
        }
    }, [loadDraft]);

    /* -------------------------------------------------- Auto-save → local */

    useAutoSave(
        () => {
            setIsAutoSaving(true);
            persistDraft();
            // Visual flash so users notice the indicator change
            setTimeout(() => setIsAutoSaving(false), 250);
        },
        [formElements, formName, currentFormId, isDirty, lastEditedAt],
        { delay: 800, enabled: true }
    );

    /* --------------------------------------------------------- Save / del */

    const handleSaveForm = useCallback(async () => {
        const payload = {
            name: formName || 'Untitled Form',
            fields: flattenElementsToFields(formElements),
        };
        setIsSavingForm(true);
        try {
            if (currentFormId) {
                const updated = await updateForm(currentFormId, payload);
                setCurrentFormId(updated.id || currentFormId);
            } else {
                const created = await createForm(payload);
                setCurrentFormId(created.id || created._id || null);
            }
            markSaved();
            toasts.success(`Saved “${payload.name}”`);
            await refreshFormsList();
        } catch (err) {
            toasts.error(err.message || 'Failed to save form');
        } finally {
            setIsSavingForm(false);
        }
    }, [formName, formElements, currentFormId, setCurrentFormId, markSaved, refreshFormsList, toasts]);

    const handleDeleteCurrentForm = useCallback(async () => {
        if (!currentFormId) return;
        if (!window.confirm('Delete this form from the backend?')) return;
        setIsDeletingForm(true);
        try {
            await deleteForm(currentFormId);
            clearCanvas();
            navigate('/', { replace: true });
            toasts.success('Form deleted');
            await refreshFormsList();
        } catch (err) {
            toasts.error(err.message || 'Failed to delete form');
        } finally {
            setIsDeletingForm(false);
        }
    }, [currentFormId, clearCanvas, navigate, refreshFormsList, toasts]);

    const handleClearCanvas = useCallback(() => {
        if (formElements.length === 0) return;
        const snapshot = { formElements, formName, currentFormId };
        clearCanvas();
        navigate('/', { replace: true });
        toasts.info('Canvas cleared', {
            action: {
                label: 'Undo',
                onClick: () => {
                    applyDraft({ ...snapshot, isDirty: true, lastEditedAt: Date.now() });
                },
            },
        });
    }, [formElements, formName, currentFormId, clearCanvas, navigate, toasts, applyDraft]);

    /* ----------------------------------------------- Keyboard shortcuts */

    useKeyboardShortcuts(
        {
            'mod+s': (event) => {
                event.preventDefault();
                handleSaveForm();
            },
            'mod+z': (event) => {
                event.preventDefault();
                undo();
            },
            'mod+shift+z': (event) => {
                event.preventDefault();
                redo();
            },
            'mod+d': (event) => {
                if (!selectedElement) return;
                event.preventDefault();
                duplicateElement(selectedElement.id);
            },
            'mod+p': (event) => {
                event.preventDefault();
                setPreviewOpen(true);
            },
            'mod+e': (event) => {
                event.preventDefault();
                setExportOpen(true);
            },
            delete: (event) => {
                if (!selectedElement) return;
                event.preventDefault();
                deleteElement(selectedElement.id);
            },
            backspace: (event) => {
                if (!selectedElement) return;
                event.preventDefault();
                deleteElement(selectedElement.id);
            },
            escape: () => {
                deselect();
            },
            '?': (event) => {
                event.preventDefault();
                setShortcutsOpen(true);
            },
        },
        { enabled: true }
    );

    /* ----------------------------------------- Beforeunload "unsaved" guard */
    useEffect(() => {
        const onBeforeUnload = (event) => {
            if (!isDirty) return undefined;
            event.preventDefault();
            event.returnValue = '';
            return '';
        };
        window.addEventListener('beforeunload', onBeforeUnload);
        return () => window.removeEventListener('beforeunload', onBeforeUnload);
    }, [isDirty]);

    /* -------------------------------------------------------------- Render */

    const hasSelectedElement = Boolean(selectedElement);
    const layoutClass = `builder-layout ${
        hasSelectedElement && isPropertiesPanelOpen ? '' : 'builder-layout--no-properties'
    }`;
    const breakpointWidth = BREAKPOINT_PX[breakpoint];

    return (
        <DndContext
            sensors={sensors}
            onDragStart={(event) => setActiveDragId(event.active.id)}
            onDragCancel={() => setActiveDragId(null)}
            onDragEnd={handleDndEnd}
        >
            <div className={`app-shell app-shell--${breakpoint}`}>
                <BuilderHeader
                    isSaving={isSavingForm}
                    isLoading={isLoadingForms}
                    isDeleting={isDeletingForm}
                    onSave={handleSaveForm}
                    onLoad={() => {
                        setLoadOpen(true);
                        refreshFormsList();
                    }}
                    onDelete={handleDeleteCurrentForm}
                    onClear={handleClearCanvas}
                    onPreview={() => setPreviewOpen(true)}
                    onImport={() => setImportOpen(true)}
                    onExport={() => setExportOpen(true)}
                    onCode={() => setCodeOpen(true)}
                    onTemplates={() => setTemplatesOpen(true)}
                    onShortcuts={() => setShortcutsOpen(true)}
                />

                <main className={layoutClass}>
                    <Sidebar />
                    <section className="workspace" aria-label="Form canvas">
                        <div
                            className={`workspace__frame workspace__frame--${breakpoint}`}
                            style={breakpointWidth ? { maxWidth: breakpointWidth } : undefined}
                        >
                            <DroppableArea />
                        </div>
                    </section>
                    {hasSelectedElement && isPropertiesPanelOpen && (
                        <aside className="properties-panel" aria-label="Properties">
                            <EditSidebar />
                        </aside>
                    )}
                </main>

                <StatusBar isAutoSaving={isAutoSaving} isOnline={isOnline} />
            </div>

            <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {activeDragElement ? (
                    <div className="drag-overlay">
                        <div className="drag-overlay__type">{activeDragElement.type}</div>
                        <div className="drag-overlay__label">
                            {activeDragElement.name || activeDragElement.label || 'Element'}
                        </div>
                        <div className="drag-overlay__preview">
                            <CanvasElementPreview element={activeDragElement} />
                        </div>
                    </div>
                ) : null}
            </DragOverlay>

            <Suspense fallback={<DialogFallback />}>
                {isPreviewOpen && (
                    <FormPreview
                        open={isPreviewOpen}
                        formElements={formElements}
                        onClose={() => setPreviewOpen(false)}
                    />
                )}
                {isCodeOpen && <CodeDialog open={isCodeOpen} onClose={() => setCodeOpen(false)} />}
                {isExportOpen && (
                    <ExportDialog open={isExportOpen} onClose={() => setExportOpen(false)} />
                )}
                {isImportOpen && (
                    <ImportDialog
                        open={isImportOpen}
                        onClose={() => setImportOpen(false)}
                        onImported={() => toasts.success('Form imported')}
                    />
                )}
                {isLoadOpen && (
                    <LoadFormDialog
                        open={isLoadOpen}
                        onClose={() => setLoadOpen(false)}
                        forms={savedForms}
                        isLoading={isLoadingForms}
                        onLoad={handleLoadForm}
                    />
                )}
                {isTemplatesOpen && (
                    <TemplatesDialog
                        open={isTemplatesOpen}
                        onClose={() => setTemplatesOpen(false)}
                        onPick={(template) => {
                            loadTemplate(template);
                            toasts.success(`Loaded “${template.name}” template`);
                        }}
                    />
                )}
                {isShortcutsOpen && (
                    <ShortcutsDialog open={isShortcutsOpen} onClose={() => setShortcutsOpen(false)} />
                )}
            </Suspense>

            <Snackbar
                open={Boolean(restoreSnack)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                onClose={() => setRestoreSnack(null)}
                message="We found an unsaved draft from your last session."
                action={
                    <>
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => {
                                applyDraft(restoreSnack);
                                setRestoreSnack(null);
                                toasts.success('Draft restored');
                            }}
                        >
                            Restore
                        </Button>
                        <Button
                            color="inherit"
                            size="small"
                            onClick={() => {
                                clearDraft();
                                setRestoreSnack(null);
                            }}
                        >
                            Discard
                        </Button>
                    </>
                }
            />
        </DndContext>
    );
}

function DialogFallback() {
    return (
        <Box
            sx={{
                position: 'fixed',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none',
                zIndex: 1500,
            }}
        >
            <CircularProgress size={28} />
        </Box>
    );
}

