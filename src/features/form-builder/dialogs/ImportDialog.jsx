import React, { useEffect, useRef, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useBuilderStore } from '../state/builderStore';

/**
 * Paste-or-upload JSON to seed the canvas. Validates structure before applying.
 */
export default function ImportDialog({ open, onClose }) {
    const formElements = useBuilderStore((s) => s.formElements);
    const loadElementsFromImport = useBuilderStore((s) => s.loadElementsFromImport);

    const [text, setText] = useState('');
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (open) {
            setText(JSON.stringify(formElements, null, 2) || '[]');
            setError('');
        }
    }, [open, formElements]);

    const apply = (raw) => {
        try {
            const parsed = JSON.parse(raw || '[]');
            loadElementsFromImport(parsed);
            onClose();
        } catch (err) {
            setError(err.message || 'Invalid JSON. Please check the format.');
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const value = typeof e.target?.result === 'string' ? e.target.result : '';
            setText(value);
            apply(value);
        };
        reader.onerror = () => setError('Failed to read the file. Please try again.');
        reader.readAsText(file);
        if (event.target) event.target.value = '';
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Import Form JSON</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Paste a form JSON array (from Export) to load it into the builder.
                </DialogContentText>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<UploadFileIcon />}
                        size="small"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Upload JSON file
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json,.json"
                        style={{ display: 'none' }}
                        onChange={handleFileChange}
                    />
                </Stack>
                <TextField
                    multiline
                    minRows={10}
                    fullWidth
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={'[\n  { "type": "text", "id": 1, "name": "My field" }\n]'}
                    inputProps={{ 'aria-label': 'Form JSON' }}
                />
                {error && (
                    <DialogContentText color="error" sx={{ mt: 1 }}>
                        {error}
                    </DialogContentText>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={() => apply(text)} variant="contained">
                    Import
                </Button>
            </DialogActions>
        </Dialog>
    );
}

