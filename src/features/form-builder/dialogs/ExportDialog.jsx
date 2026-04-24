import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useBuilderStore } from '../state/builderStore';

/** JSON snapshot of the current canvas — read-only. */
export default function ExportDialog({ open, onClose }) {
    const formElements = useBuilderStore((s) => s.formElements);
    const json = JSON.stringify(formElements, null, 2);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Exported Form JSON</DialogTitle>
            <DialogContent>
                <Box
                    component="pre"
                    sx={{
                        backgroundColor: 'grey.100',
                        p: 2,
                        borderRadius: 2,
                        fontSize: 14,
                        overflow: 'auto',
                        m: 0,
                    }}
                >
                    {json}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => navigator.clipboard?.writeText(json)} color="inherit">
                    Copy
                </Button>
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

