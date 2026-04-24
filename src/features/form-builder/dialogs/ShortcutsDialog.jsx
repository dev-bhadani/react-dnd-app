import React from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from '@mui/material';
import { shortcutLabel } from '../../../shared/hooks/useKeyboardShortcuts';

const SHORTCUTS = [
    { combo: 'mod+s', label: 'Save form' },
    { combo: 'mod+z', label: 'Undo' },
    { combo: 'mod+shift+z', label: 'Redo' },
    { combo: 'mod+d', label: 'Duplicate selected element' },
    { combo: 'delete', label: 'Delete selected element' },
    { combo: 'escape', label: 'Deselect / close panel' },
    { combo: 'mod+p', label: 'Open preview' },
    { combo: 'mod+e', label: 'Export JSON' },
    { combo: '?', label: 'Show this help' },
];

/**
 * A discoverable cheat-sheet for power users. Bound to `?` (Shift+/).
 */
export default function ShortcutsDialog({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogContent>
                <Stack spacing={1.25}>
                    {SHORTCUTS.map(({ combo, label }) => (
                        <Stack
                            key={combo}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Typography variant="body2">{label}</Typography>
                            <Box
                                component="kbd"
                                sx={{
                                    fontFamily:
                                        "'JetBrains Mono', 'SF Mono', Menlo, monospace",
                                    fontSize: 12,
                                    bgcolor: 'action.hover',
                                    color: 'text.primary',
                                    px: 1,
                                    py: 0.25,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                {shortcutLabel(combo)}
                            </Box>
                        </Stack>
                    ))}
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Got it
                </Button>
            </DialogActions>
        </Dialog>
    );
}

