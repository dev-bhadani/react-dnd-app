import React, { useEffect, useState } from 'react';
import { Stack, Tooltip, Typography } from '@mui/material';
import CloudDoneIcon from '@mui/icons-material/CloudDone';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import CloudOffIcon from '@mui/icons-material/CloudOff';
import CircleIcon from '@mui/icons-material/Circle';
import { useBuilderStore } from '../state/builderStore';
import { countFields } from '../utils/elementOps';

const formatRelative = (timestamp) => {
    if (!timestamp) return null;
    const diff = Math.max(0, Date.now() - timestamp);
    if (diff < 5000) return 'just now';
    if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    return `${Math.floor(diff / 3_600_000)}h ago`;
};

/**
 * Bottom-of-canvas status strip — counts, save state, last edit time, and
 * the active breakpoint. Rerenders every 15s so the relative time stays
 * fresh.
 */
export default function StatusBar({ isAutoSaving, isOnline }) {
    const formElements = useBuilderStore((s) => s.formElements);
    const isDirty = useBuilderStore((s) => s.isDirty);
    const lastSavedAt = useBuilderStore((s) => s.lastSavedAt);
    const lastEditedAt = useBuilderStore((s) => s.lastEditedAt);
    const breakpoint = useBuilderStore((s) => s.breakpoint);

    // Re-render every 15s so "3m ago" labels stay accurate
    const [, tick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => tick((n) => n + 1), 15_000);
        return () => clearInterval(id);
    }, []);

    const fieldCount = countFields(formElements);
    const blockCount = formElements.length;

    let saveLabel;
    let SaveIcon;
    let saveColor = 'text.secondary';
    if (!isOnline) {
        saveLabel = 'Offline · changes saved locally';
        SaveIcon = CloudOffIcon;
        saveColor = 'warning.main';
    } else if (isAutoSaving) {
        saveLabel = 'Saving draft…';
        SaveIcon = CloudSyncIcon;
    } else if (isDirty) {
        saveLabel = `Unsaved changes${lastEditedAt ? ` · edited ${formatRelative(lastEditedAt)}` : ''}`;
        SaveIcon = CircleIcon;
        saveColor = 'warning.main';
    } else if (lastSavedAt) {
        saveLabel = `All changes saved · ${formatRelative(lastSavedAt)}`;
        SaveIcon = CloudDoneIcon;
        saveColor = 'success.main';
    } else {
        saveLabel = 'No changes yet';
        SaveIcon = CircleIcon;
    }

    return (
        <footer className="status-bar" role="status" aria-live="polite">
            <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
                <Tooltip title={`${blockCount} block${blockCount === 1 ? '' : 's'} · ${fieldCount} field${fieldCount === 1 ? '' : 's'}`}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                        <CircleIcon sx={{ fontSize: 8, color: 'primary.main' }} />
                        <Typography variant="caption" color="text.secondary">
                            {fieldCount} field{fieldCount === 1 ? '' : 's'}
                            {blockCount !== fieldCount ? ` · ${blockCount} block${blockCount === 1 ? '' : 's'}` : ''}
                        </Typography>
                    </Stack>
                </Tooltip>
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <SaveIcon sx={{ fontSize: 14, color: saveColor }} />
                    <Typography variant="caption" sx={{ color: saveColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {saveLabel}
                    </Typography>
                </Stack>
            </Stack>
            <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                    {breakpoint} preview
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Press <kbd className="status-bar__kbd">?</kbd> for shortcuts
                </Typography>
            </Stack>
        </footer>
    );
}

