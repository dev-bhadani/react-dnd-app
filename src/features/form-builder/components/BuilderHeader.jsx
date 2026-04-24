import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Divider,
    IconButton,
    InputBase,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography,
} from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LayersIcon from '@mui/icons-material/Layers';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeIcon from '@mui/icons-material/Code';
import IosShareIcon from '@mui/icons-material/IosShare';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SaveIcon from '@mui/icons-material/Save';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CircleIcon from '@mui/icons-material/Circle';
import { useBuilderStore } from '../state/builderStore';

/**
 * Top app bar — production-style single-row toolbar.
 *
 * Layout (left → right on desktop):
 *
 *   [Brand]  │  [Title + status pill]  │  [Breakpoint] [Undo/Redo]  │
 *   [File] [Tools] [Danger] [Utility]
 *
 * Most secondary actions are icon-only inside grouped "pill" containers to
 * keep visual noise low. Save remains the only filled, labelled CTA.
 *
 * Below 960px the right-hand action rail collapses into a sheet under a
 * hamburger toggle; the brand + title row stays compact and always visible.
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
    onTemplates,
    onShortcuts,
    isSaving,
    isLoading,
    isDeleting,
}) {
    const navigate = useNavigate();
    const formName = useBuilderStore((s) => s.formName);
    const setFormName = useBuilderStore((s) => s.setFormName);
    const currentFormId = useBuilderStore((s) => s.currentFormId);
    const isDirty = useBuilderStore((s) => s.isDirty);
    const lastSavedAt = useBuilderStore((s) => s.lastSavedAt);

    const undo = useBuilderStore((s) => s.undo);
    const redo = useBuilderStore((s) => s.redo);
    const canUndo = useBuilderStore((s) => s.past.length > 0);
    const canRedo = useBuilderStore((s) => s.future.length > 0);

    const themeMode = useBuilderStore((s) => s.themeMode);
    const setThemeMode = useBuilderStore((s) => s.setThemeMode);
    const breakpoint = useBuilderStore((s) => s.breakpoint);
    const setBreakpoint = useBuilderStore((s) => s.setBreakpoint);

    const [mobileOpen, setMobileOpen] = useState(false);
    useEffect(() => {
        const onResize = () => {
            if (window.innerWidth >= 960) setMobileOpen(false);
        };
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Tiny status pill summarising save state next to the title.
    const status = useMemo(() => {
        if (isSaving) return { label: 'Saving…', tone: 'progress' };
        if (isDirty) return { label: 'Unsaved', tone: 'warning' };
        if (lastSavedAt) return { label: 'Saved', tone: 'success' };
        return { label: 'Draft', tone: 'muted' };
    }, [isSaving, isDirty, lastSavedAt]);

    /* ------------------------------ action groups ------------------------------ */

    const fileActions = (
        <div className="toolbar-group" role="group" aria-label="File">
            <Tooltip title="Pick a starter template">
                <IconButton size="small" onClick={onTemplates} aria-label="Templates">
                    <LayersIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Browse saved forms">
                <span>
                    <IconButton
                        size="small"
                        onClick={onLoad}
                        disabled={isLoading}
                        aria-label="Open"
                    >
                        <FolderOpenIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />
            <Tooltip title={currentFormId ? 'Update saved form (⌘S)' : 'Save new form (⌘S)'}>
                <span>
                    <Button
                        startIcon={<SaveIcon />}
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={onSave}
                        disabled={isSaving}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            borderRadius: 999,
                            px: 1.75,
                            ml: 0.25,
                            boxShadow: '0 1px 2px rgba(79,70,229,0.25)',
                        }}
                    >
                        {isSaving ? 'Saving…' : currentFormId ? 'Update' : 'Save'}
                    </Button>
                </span>
            </Tooltip>
        </div>
    );

    const toolsActions = (
        <div className="toolbar-group" role="group" aria-label="Tools">
            <Tooltip title="Live preview (⌘P)">
                <IconButton size="small" onClick={onPreview} aria-label="Preview">
                    <VisibilityIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Generate JSX/TSX">
                <IconButton size="small" onClick={onCode} aria-label="Code">
                    <CodeIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Import JSON definition">
                <IconButton size="small" onClick={onImport} aria-label="Import">
                    <IosShareIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                </IconButton>
            </Tooltip>
            <Tooltip title="Export as JSON (⌘E)">
                <IconButton size="small" onClick={onExport} aria-label="Export">
                    <FileDownloadIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        </div>
    );

    const dangerActions = (
        <div className="toolbar-group" role="group" aria-label="Reset and delete">
            <Tooltip title="Reset canvas">
                <IconButton size="small" onClick={onClear} aria-label="Clear">
                    <RestartAltIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title={currentFormId ? 'Delete saved form' : 'Save the form first to enable delete'}>
                <span>
                    <IconButton
                        size="small"
                        onClick={onDelete}
                        disabled={!currentFormId || isDeleting}
                        aria-label="Delete"
                        color="error"
                    >
                        <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                </span>
            </Tooltip>
        </div>
    );

    const utilityActions = (
        <div className="toolbar-group" role="group" aria-label="Utility">
            <Tooltip title={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}>
                <IconButton
                    size="small"
                    onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
                    aria-label="Toggle theme"
                >
                    {themeMode === 'dark' ? (
                        <LightModeIcon fontSize="small" />
                    ) : (
                        <DarkModeIcon fontSize="small" />
                    )}
                </IconButton>
            </Tooltip>
            <Tooltip title="Keyboard shortcuts (?)">
                <IconButton size="small" onClick={onShortcuts} aria-label="Keyboard shortcuts">
                    <HelpOutlineIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.25, my: 0.5 }} />
            <Tooltip title="Open all saved forms">
                <Button
                    size="small"
                    variant="text"
                    color="inherit"
                    onClick={() => navigate('/forms')}
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 1,
                        borderRadius: 999,
                    }}
                >
                    All forms
                </Button>
            </Tooltip>
        </div>
    );

    /* ------------------------------ render ------------------------------ */

    return (
        <header className="main-header" role="banner">
            {/* Brand */}
            <div className="main-header__brand">
                <div className="main-header__logo" aria-hidden="true">
                    FC
                </div>
                <div className="main-header__brand-meta">
                    <p className="main-header__eyebrow">FORM STUDIO</p>
                    <h1 className="main-header__heading">FormCraft</h1>
                </div>
                <span className="main-header__version" aria-label="Version">
                    v1.0
                </span>
            </div>

            {/* Title + status */}
            <div className="main-header__title">
                <InputBase
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Untitled form"
                    inputProps={{ 'aria-label': 'Form name' }}
                    className="main-header__title-input"
                />
                <span className={`main-header__status main-header__status--${status.tone}`}>
                    <CircleIcon sx={{ fontSize: 8 }} />
                    {status.label}
                </span>
            </div>

            {/* Workspace controls (breakpoint + history) */}
            <div className="main-header__workspace">
                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={breakpoint}
                    onChange={(_, v) => v && setBreakpoint(v)}
                    aria-label="Preview breakpoint"
                    className="toolbar-segmented"
                >
                    <ToggleButton value="desktop" aria-label="Desktop">
                        <DesktopWindowsIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="tablet" aria-label="Tablet">
                        <TabletMacIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="mobile" aria-label="Mobile">
                        <SmartphoneIcon fontSize="small" />
                    </ToggleButton>
                </ToggleButtonGroup>

                <div className="toolbar-group" role="group" aria-label="History">
                    <Tooltip title="Undo (⌘Z)">
                        <span>
                            <IconButton
                                size="small"
                                onClick={undo}
                                disabled={!canUndo}
                                aria-label="Undo"
                            >
                                <UndoIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Redo (⌘⇧Z)">
                        <span>
                            <IconButton
                                size="small"
                                onClick={redo}
                                disabled={!canRedo}
                                aria-label="Redo"
                            >
                                <RedoIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </Tooltip>
                </div>
            </div>

            {/* Mobile toggle */}
            <div className="main-header__toggle">
                <IconButton
                    color="inherit"
                    aria-label={mobileOpen ? 'Close actions menu' : 'Open actions menu'}
                    aria-expanded={mobileOpen}
                    onClick={() => setMobileOpen((v) => !v)}
                    size="medium"
                >
                    {mobileOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
            </div>

            {/* Desktop actions */}
            <div className="main-header__actions main-header__actions--desktop">
                {fileActions}
                {toolsActions}
                {dangerActions}
                {utilityActions}
            </div>

            {/* Mobile actions sheet */}
            {mobileOpen && (
                <Box className="main-header__actions--mobile" role="region" aria-label="Builder actions">
                    <Stack spacing={1.25}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {fileActions}
                            {toolsActions}
                        </Stack>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                            {dangerActions}
                            {utilityActions}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                            Tip · press <kbd>?</kbd> for keyboard shortcuts.
                        </Typography>
                    </Stack>
                </Box>
            )}
        </header>
    );
}
