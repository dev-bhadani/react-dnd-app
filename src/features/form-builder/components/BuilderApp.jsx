import React, { Suspense, lazy, useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DndContext } from '@dnd-kit/core';
import { Alert, CircularProgress, Snackbar } from '@mui/material';

import Sidebar from './Sidebar';
import DroppableArea from './DroppableArea';
import EditSidebar from './EditSidebar';
import BuilderHeader from './BuilderHeader';

import { useBuilderStore, useSelectedElement } from '../state/builderStore';
import { flattenElementsToFields } from '../utils/fieldMapping';
import { listForms, getForm, createForm, updateForm, deleteForm } from '../../../shared/api/forms';

// Heavy + rarely-used UI is code-split.
const FormPreview = lazy(() => import('./FormPreview'));
const CodeDialog = lazy(() => import('../dialogs/CodeDialog'));
const ExportDialog = lazy(() => import('../dialogs/ExportDialog'));
const ImportDialog = lazy(() => import('../dialogs/ImportDialog'));
const LoadFormDialog = lazy(() => import('../dialogs/LoadFormDialog'));

/**
 * The composed builder page. Owns the React-Router + REST side-effects and
 * coordinates the dialogs. Everything stateful for the *canvas itself* lives
 * in the Zustand store, so this file stays small.
 */
export default function BuilderApp() {
    const navigate = useNavigate();
    const location = useLocation();

    // Store wiring
    const handleDragEnd = useBuilderStore((s) => s.handleDragEnd);
    const formName = useBuilderStore((s) => s.formName);
    const formElements = useBuilderStore((s) => s.formElements);
    const currentFormId = useBuilderStore((s) => s.currentFormId);
    const setCurrentFormId = useBuilderStore((s) => s.setCurrentFormId);
    const isPropertiesPanelOpen = useBuilderStore((s) => s.isPropertiesPanelOpen);
    const loadFormFromBackend = useBuilderStore((s) => s.loadFormFromBackend);
    const clearCanvas = useBuilderStore((s) => s.clearCanvas);
    const selectedElement = useSelectedElement();

    // Local UI / async state (kept here, not in the canvas store)
    const [savedForms, setSavedForms] = useState([]);
    const [apiError, setApiError] = useState('');
    const [isLoadingForms, setIsLoadingForms] = useState(false);
    const [isSavingForm, setIsSavingForm] = useState(false);
    const [isDeletingForm, setIsDeletingForm] = useState(false);

    // Dialog open flags
    const [isPreviewOpen, setPreviewOpen] = useState(false);
    const [isCodeOpen, setCodeOpen] = useState(false);
    const [isExportOpen, setExportOpen] = useState(false);
    const [isImportOpen, setImportOpen] = useState(false);
    const [isLoadOpen, setLoadOpen] = useState(false);

    const refreshFormsList = useCallback(async () => {
        setApiError('');
        setIsLoadingForms(true);
        try {
            const data = await listForms();
            setSavedForms(Array.isArray(data) ? data : []);
        } catch (err) {
            setApiError(err.message || 'Failed to load forms');
        } finally {
            setIsLoadingForms(false);
        }
    }, []);

    const handleLoadForm = useCallback(
        async (id) => {
            if (!id) return;
            setApiError('');
            setIsLoadingForms(true);
            try {
                const form = await getForm(id);
                loadFormFromBackend({ id: form.id || id, name: form.name, fields: form.fields });
                setLoadOpen(false);
            } catch (err) {
                setApiError(err.message || 'Failed to load form');
            } finally {
                setIsLoadingForms(false);
            }
        },
        [loadFormFromBackend]
    );

    useEffect(() => {
        refreshFormsList();
    }, [refreshFormsList]);

    // Allow `?formId=…` deep links from the FormsPage
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const formIdParam = params.get('formId');
        if (formIdParam && formIdParam !== currentFormId) {
            handleLoadForm(formIdParam);
        }
    }, [location.search, currentFormId, handleLoadForm]);

    const handleSaveForm = async () => {
        setApiError('');
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
            await refreshFormsList();
        } catch (err) {
            setApiError(err.message || 'Failed to save form');
        } finally {
            setIsSavingForm(false);
        }
    };

    const handleDeleteCurrentForm = async () => {
        if (!currentFormId) return;
        if (!window.confirm('Delete this form from the backend?')) return;
        setApiError('');
        setIsDeletingForm(true);
        try {
            await deleteForm(currentFormId);
            clearCanvas();
            navigate('/', { replace: true });
            await refreshFormsList();
        } catch (err) {
            setApiError(err.message || 'Failed to delete form');
        } finally {
            setIsDeletingForm(false);
        }
    };

    const hasSelectedElement = Boolean(selectedElement);
    const layoutClass = `builder-layout ${
        hasSelectedElement && isPropertiesPanelOpen ? '' : 'builder-layout--no-properties'
    }`;

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="app-shell">
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
                    onClear={() => {
                        clearCanvas();
                        navigate('/', { replace: true });
                    }}
                    onPreview={() => setPreviewOpen(true)}
                    onImport={() => setImportOpen(true)}
                    onExport={() => setExportOpen(true)}
                    onCode={() => setCodeOpen(true)}
                />

                <main className={layoutClass}>
                    <Sidebar />
                    <section className="workspace" aria-label="Form canvas">
                        <DroppableArea />
                    </section>
                    {hasSelectedElement && isPropertiesPanelOpen && (
                        <aside className="properties-panel" aria-label="Properties">
                            <EditSidebar />
                        </aside>
                    )}
                </main>

                <footer className="main-footer">
                    <div className="main-footer__content">
                        <p className="main-footer__brand">FormCraft</p>
                        <p className="main-footer__motto">
                            Design. Drag. Deploy. Build elegant forms in minutes.
                        </p>
                    </div>
                </footer>
            </div>

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
                    <ImportDialog open={isImportOpen} onClose={() => setImportOpen(false)} />
                )}
                {isLoadOpen && (
                    <LoadFormDialog
                        open={isLoadOpen}
                        onClose={() => setLoadOpen(false)}
                        forms={savedForms}
                        isLoading={isLoadingForms}
                        error={apiError}
                        onLoad={handleLoadForm}
                    />
                )}
            </Suspense>

            <Snackbar
                open={Boolean(apiError) && !isLoadOpen}
                autoHideDuration={5000}
                onClose={() => setApiError('')}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Alert severity="error" onClose={() => setApiError('')} variant="filled">
                    {apiError}
                </Alert>
            </Snackbar>
        </DndContext>
    );
}

/** Tiny Suspense fallback so we don't render a giant spinner over a dialog. */
function DialogFallback() {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'grid',
                placeItems: 'center',
                pointerEvents: 'none',
            }}
        >
            <CircularProgress size={28} />
        </div>
    );
}

