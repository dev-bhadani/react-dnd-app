import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Collapse, IconButton, TextField, Tooltip } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useBuilderStore } from '../state/builderStore';

/**
 * The fixed top header. All actions other than form-name editing get routed
 * through callbacks the parent supplies — keeping side-effects with their
 * data (api calls live in `BuilderApp`).
 */
export default function BuilderHeader({
    onSave,
    onLoad,
    onDelete,
    onClear,
    onPreview,
    onImport,
    onExport,
    onCode,
    isSaving,
    isLoading,
    isDeleting,
    isCodeGenerating,
}) {
    const navigate = useNavigate();
    const formName = useBuilderStore((s) => s.formName);
    const setFormName = useBuilderStore((s) => s.setFormName);
    const currentFormId = useBuilderStore((s) => s.currentFormId);
    const formElementsCount = useBuilderStore((s) => s.formElements.length);

    const [mobileOpen, setMobileOpen] = useState(false);

    const actions = (
        <>
            <Tooltip title="Name your form">
                <TextField
                    size="small"
                    variant="outlined"
                    label="Form name"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    sx={{ minWidth: 180 }}
                />
            </Tooltip>
            <Tooltip title="Open all saved forms">
                <Button variant="outlined" color="inherit" onClick={() => navigate('/forms')}>
                    Forms
                </Button>
            </Tooltip>
            <Tooltip title="Save or update this form">
                <span>
                    <Button variant="contained" color="primary" onClick={onSave} disabled={isSaving}>
                        {isSaving ? 'Saving…' : currentFormId ? 'Update' : 'Save'}
                    </Button>
                </span>
            </Tooltip>
            <Tooltip title="Load a form from history">
                <span>
                    <Button variant="outlined" color="inherit" onClick={onLoad} disabled={isLoading}>
                        Load
                    </Button>
                </span>
            </Tooltip>
            <Tooltip title="Delete the current form">
                <span>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={onDelete}
                        disabled={!currentFormId || isDeleting}
                    >
                        {isDeleting ? 'Deleting…' : 'Delete'}
                    </Button>
                </span>
            </Tooltip>
            <Tooltip title="Clear all fields from the canvas">
                <span>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={onClear}
                        disabled={formElementsCount === 0}
                    >
                        Clear
                    </Button>
                </span>
            </Tooltip>
            <Tooltip title="Generate code for this form">
                <span>
                    <Button variant="outlined" color="inherit" onClick={onCode} disabled={isCodeGenerating}>
                        {isCodeGenerating ? 'Generating…' : 'Code'}
                    </Button>
                </span>
            </Tooltip>
            <Tooltip title="Import a form definition">
                <Button variant="outlined" color="inherit" onClick={onImport}>
                    Import
                </Button>
            </Tooltip>
            <Tooltip title="Preview the rendered form">
                <Button variant="outlined" color="inherit" onClick={onPreview}>
                    Preview
                </Button>
            </Tooltip>
            <Tooltip title="Export this form as JSON">
                <Button variant="contained" color="primary" onClick={onExport}>
                    Export
                </Button>
            </Tooltip>
        </>
    );

    return (
        <header className="main-header">
            <div className="main-header__brand">
                <div className="main-header__logo" aria-hidden="true">
                    FC
                </div>
                <div>
                    <p className="main-header__eyebrow">Form studio</p>
                    <h1 className="main-header__heading">FormCraft</h1>
                </div>
            </div>
            <div className="main-header__toggle">
                <IconButton
                    color="inherit"
                    aria-label={mobileOpen ? 'Close actions menu' : 'Open actions menu'}
                    aria-expanded={mobileOpen}
                    onClick={() => setMobileOpen((v) => !v)}
                    size="large"
                >
                    {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
            </div>
            <div className="main-header__actions main-header__actions--desktop">{actions}</div>
            <Collapse in={mobileOpen} timeout="auto" unmountOnExit sx={{ gridColumn: '1 / -1' }}>
                <div className="main-header__actions main-header__actions--mobile">{actions}</div>
            </Collapse>
        </header>
    );
}

